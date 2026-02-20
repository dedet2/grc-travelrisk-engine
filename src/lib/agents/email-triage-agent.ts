/**
 * Email Triage Agent (B-03)
 * Categorizes and prioritizes emails, drafts responses, and tracks SLAs
 * Lifecycle: collectData → processData → updateDashboard
 */

import { BaseAgent, type AgentConfig } from './base-agent';
import { supabaseStore } from '@/lib/store'; // Uses Supabase with in-memory fallback

export interface EmailMessage {
  messageId: string;
  from: string;
  to: string[];
  cc?: string[];
  subject: string;
  body: string;
  receivedAt: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface TriagedEmail {
  messageId: string;
  from: string;
  subject: string;
  category:
    | 'billing'
    | 'support'
    | 'compliance'
    | 'operational'
    | 'general'
    | 'spam';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  suggestedResponse?: string;
  status: 'new' | 'in-progress' | 'responded' | 'closed';
  triageScore: number; // 0-100, higher = more urgent
  slaHours: number;
  responseDeadline: Date;
  receivedAt: Date;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResponseTemplate {
  templateId: string;
  name: string;
  category: string;
  subject: string;
  body: string;
  useCount: number;
  createdAt: Date;
}

export interface TriageRawData {
  emails: EmailMessage[];
  templates: ResponseTemplate[];
}

export interface TriageMetrics {
  totalEmails: number;
  newEmails: number;
  inProgressEmails: number;
  respondedEmails: number;
  averageResponseTime: number;
  slaComplianceRate: number;
  urgentEmailCount: number;
  categoryCounts: Record<string, number>;
  timestamp: Date;
}

/**
 * Email Triage Agent
 * Handles email categorization, prioritization, and response management
 */
export class EmailTriageAgent extends BaseAgent<TriageRawData, TriageMetrics> {
  private mockEmails: EmailMessage[] = [];
  private triagedEmails: TriagedEmail[] = [];
  private responseTemplates: ResponseTemplate[] = [];

  constructor(config?: Partial<AgentConfig>) {
    super({
      name: 'Email Triage Agent (B-03)',
      description: 'Categorizes and prioritizes inbound communications',
      maxRetries: 2,
      timeoutMs: 30000,
      enabled: true,
      ...config,
    });

    this.initializeMockData();
  }

  private initializeMockData(): void {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

    // Initialize mock emails
    this.mockEmails = [
      {
        messageId: 'msg-001',
        from: 'billing@client.com',
        to: ['finance@company.com'],
        subject: 'Invoice Payment Query - INV-2024-001',
        body: 'Hi, could you please confirm the payment terms for invoice INV-2024-001? We need to process this in our system.',
        receivedAt: oneHourAgo,
        priority: 'high',
      },
      {
        messageId: 'msg-002',
        from: 'support@thirdparty.com',
        to: ['support@company.com'],
        subject: 'Urgent: System Outage Notification',
        body: 'We are experiencing a critical system outage affecting your services. ETA for resolution is 2 hours.',
        receivedAt: threeHoursAgo,
        priority: 'urgent',
      },
      {
        messageId: 'msg-003',
        from: 'compliance@regulator.gov',
        to: ['legal@company.com'],
        subject: 'Compliance Check - Annual Documentation Review',
        body: 'As part of our annual review, please provide updated documentation for your compliance controls and procedures.',
        receivedAt: sixHoursAgo,
        priority: 'high',
      },
      {
        messageId: 'msg-004',
        from: 'hr@company.com',
        to: ['team@company.com'],
        subject: 'Team Lunch - Next Friday at Noon',
        body: 'Just a reminder that we have our monthly team lunch next Friday at 12 PM. Please let me know if you have dietary restrictions.',
        receivedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
        priority: 'low',
      },
      {
        messageId: 'msg-005',
        from: 'deals@spam.com',
        to: ['info@company.com'],
        subject: 'Click here for amazing deals!',
        body: 'Buy now and save 50%! Limited time offer! Click the link below for details.',
        receivedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        priority: 'low',
      },
    ];

    // Initialize response templates
    this.responseTemplates = [
      {
        templateId: 'tpl-001',
        name: 'Billing Inquiry Response',
        category: 'billing',
        subject: 'RE: Invoice Payment Query',
        body: `Dear {name},

Thank you for reaching out regarding your invoice payment inquiry.

The payment terms for this invoice are Net 30 days from the issue date. We accept payment via:
- Bank transfer
- Credit card
- Check

Please let me know if you need any additional information.

Best regards,
Billing Team`,
        useCount: 5,
        createdAt: new Date(),
      },
      {
        templateId: 'tpl-002',
        name: 'Support Acknowledgment',
        category: 'support',
        subject: 'RE: Support Request - We are on it',
        body: `Hello,

Thank you for contacting our support team. We have received your request and assigned it to our technical team.

We will investigate and get back to you within 4 business hours.

Reference ID: {refId}

Best regards,
Support Team`,
        useCount: 12,
        createdAt: new Date(),
      },
      {
        templateId: 'tpl-003',
        name: 'Compliance Documentation Request',
        category: 'compliance',
        subject: 'RE: Compliance Documentation',
        body: `Dear Compliance Officer,

Thank you for your inquiry. We are committed to compliance and transparency.

Please find attached our current documentation for:
- Access control policies
- Incident response procedures
- Data protection measures

We will provide additional documentation as needed.

Best regards,
Compliance Team`,
        useCount: 3,
        createdAt: new Date(),
      },
    ];

    // Initialize triaged emails from mock emails
    this.triagedEmails = this.mockEmails.map((email) => {
      const triageScore = this.calculateTriageScore(email);
      const slaHours = this.calculateSLAHours(email);
      const responseDeadline = new Date(email.receivedAt.getTime() + slaHours * 60 * 60 * 1000);

      return {
        messageId: email.messageId,
        from: email.from,
        subject: email.subject,
        category: this.categorizeEmail(email),
        priority: email.priority,
        suggestedResponse: this.generateSuggestedResponse(email),
        status: 'new',
        triageScore,
        slaHours,
        responseDeadline,
        receivedAt: email.receivedAt,
        createdAt: now,
        updatedAt: now,
      };
    });
  }

  /**
   * Categorize an email based on content
   */
  private categorizeEmail(email: EmailMessage): TriagedEmail['category'] {
    const subject = email.subject.toLowerCase();
    const body = email.body.toLowerCase();

    if (subject.includes('invoice') || subject.includes('payment') || body.includes('billing')) {
      return 'billing';
    }
    if (subject.includes('urgent') || subject.includes('outage') || subject.includes('critical')) {
      return 'support';
    }
    if (
      subject.includes('compliance') ||
      subject.includes('audit') ||
      subject.includes('documentation')
    ) {
      return 'compliance';
    }
    if (
      subject.includes('team') ||
      subject.includes('meeting') ||
      subject.includes('schedule') ||
      subject.includes('lunch')
    ) {
      return 'operational';
    }
    if (subject.includes('deal') || subject.includes('offer') || subject.includes('click')) {
      return 'spam';
    }

    return 'general';
  }

  /**
   * Calculate triage score (0-100)
   */
  private calculateTriageScore(email: EmailMessage): number {
    let score = 50; // Base score

    // Adjust by priority
    if (email.priority === 'urgent') score += 40;
    else if (email.priority === 'high') score += 25;
    else if (email.priority === 'low') score -= 20;

    // Adjust by category
    if (
      this.categorizeEmail(email) === 'compliance' ||
      this.categorizeEmail(email) === 'support'
    ) {
      score += 15;
    }

    return Math.min(Math.max(score, 0), 100);
  }

  /**
   * Calculate SLA hours based on category and priority
   */
  private calculateSLAHours(email: EmailMessage): number {
    const category = this.categorizeEmail(email);

    if (email.priority === 'urgent') return 1;
    if (email.priority === 'high') {
      if (category === 'compliance' || category === 'support') return 2;
      if (category === 'billing') return 4;
      return 8;
    }
    if (email.priority === 'medium') return 24;
    return 48;
  }

  /**
   * Generate a suggested response
   */
  private generateSuggestedResponse(email: EmailMessage): string {
    const category = this.categorizeEmail(email);
    const template = this.responseTemplates.find((t) => t.category === category);

    if (template) {
      return template.body.replace('{name}', this.extractSenderName(email.from));
    }

    return `Thank you for your email regarding "${email.subject}". We are reviewing your request and will get back to you shortly.`;
  }

  /**
   * Extract name from email address
   */
  private extractSenderName(email: string): string {
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/[._-]/g, ' ');
  }

  /**
   * Collect email and template data
   */
  async collectData(): Promise<TriageRawData> {
    // Simulate data collection delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      emails: this.mockEmails,
      templates: this.responseTemplates,
    };
  }

  /**
   * Process data to generate triage metrics
   */
  async processData(rawData: TriageRawData): Promise<TriageMetrics> {
    const now = new Date();
    const respondedEmails = this.triagedEmails.filter((e) => e.status === 'responded');

    // Calculate average response time
    let totalResponseTime = 0;
    let responseCount = 0;
    for (const email of respondedEmails) {
      if (email.respondedAt) {
        const timeToRespond = email.respondedAt.getTime() - email.receivedAt.getTime();
        totalResponseTime += timeToRespond;
        responseCount++;
      }
    }
    const averageResponseTime = responseCount > 0 ? Math.round(totalResponseTime / responseCount / (1000 * 60 * 60)) : 0;

    // Calculate SLA compliance
    const emailsWithDeadline = this.triagedEmails.length;
    const compliantEmails = this.triagedEmails.filter((e) => {
      const deadline = e.respondedAt || now;
      return deadline <= e.responseDeadline;
    }).length;
    const slaComplianceRate =
      emailsWithDeadline > 0 ? Math.round((compliantEmails / emailsWithDeadline) * 100) : 0;

    // Count emails by status and category
    const categoryCounts: Record<string, number> = {};
    for (const email of this.triagedEmails) {
      categoryCounts[email.category] = (categoryCounts[email.category] || 0) + 1;
    }

    return {
      totalEmails: this.triagedEmails.length,
      newEmails: this.triagedEmails.filter((e) => e.status === 'new').length,
      inProgressEmails: this.triagedEmails.filter((e) => e.status === 'in-progress').length,
      respondedEmails,
      averageResponseTime,
      slaComplianceRate,
      urgentEmailCount: this.triagedEmails.filter((e) => e.priority === 'urgent').length,
      categoryCounts,
      timestamp: new Date(),
    };
  }

  /**
   * Store processed metrics in the data store
   */
  async updateDashboard(processedData: TriageMetrics): Promise<void> {
    // Store triaged emails and metrics
    supabaseStore.storeTriagedEmails(this.triagedEmails);
    supabaseStore.storeTriageMetrics(processedData);

    // Simulate dashboard update delay
    await new Promise((resolve) => setTimeout(resolve, 50));

    console.log('[EmailTriageAgent] Dashboard updated with triage metrics');
  }

  /**
   * Analyze an email
   */
  async analyzeEmail(
    from: string,
    subject: string,
    body: string
  ): Promise<{ category: string; priority: string; suggestedResponse: string }> {
    const email: EmailMessage = {
      messageId: `msg-${Date.now()}`,
      from,
      to: [],
      subject,
      body,
      receivedAt: new Date(),
      priority: 'medium',
    };

    const category = this.categorizeEmail(email);
    const priority = email.priority;
    const suggestedResponse = this.generateSuggestedResponse(email);

    return {
      category,
      priority,
      suggestedResponse,
    };
  }

  /**
   * Update email status
   */
  async updateEmailStatus(
    messageId: string,
    status: TriagedEmail['status']
  ): Promise<TriagedEmail | null> {
    const email = this.triagedEmails.find((e) => e.messageId === messageId);
    if (!email) {
      return null;
    }

    email.status = status;
    if (status === 'responded') {
      email.respondedAt = new Date();
    }
    email.updatedAt = new Date();

    supabaseStore.storeTriagedEmails(this.triagedEmails);

    return email;
  }

  /**
   * Get triage queue
   */
  getTriageQueue(): TriagedEmail[] {
    return this.triagedEmails
      .filter((e) => e.status === 'new' || e.status === 'in-progress')
      .sort((a, b) => b.triageScore - a.triageScore);
  }

  /**
   * Get all triaged emails
   */
  getAllTriagedEmails(): TriagedEmail[] {
    return [...this.triagedEmails];
  }

  /**
   * Get triaged emails by category
   */
  getEmailsByCategory(category: string): TriagedEmail[] {
    return this.triagedEmails.filter((e) => e.category === category);
  }

  /**
   * Get triaged emails by priority
   */
  getEmailsByPriority(priority: TriagedEmail['priority']): TriagedEmail[] {
    return this.triagedEmails.filter((e) => e.priority === priority);
  }

  /**
   * Get SLA violations
   */
  getSLAViolations(): TriagedEmail[] {
    const now = new Date();
    return this.triagedEmails.filter((e) => {
      const deadline = e.respondedAt || now;
      return deadline > e.responseDeadline;
    });
  }

  /**
   * Get response templates
   */
  getResponseTemplates(): ResponseTemplate[] {
    return [...this.responseTemplates];
  }

  /**
   * Add a response template
   */
  addResponseTemplate(
    name: string,
    category: string,
    subject: string,
    body: string
  ): ResponseTemplate {
    const template: ResponseTemplate = {
      templateId: `tpl-${Date.now()}`,
      name,
      category,
      subject,
      body,
      useCount: 0,
      createdAt: new Date(),
    };

    this.responseTemplates.push(template);
    return template;
  }
}

/**
 * Factory function to create an EmailTriageAgent instance
 */
export function createEmailTriageAgent(config?: Partial<AgentConfig>): EmailTriageAgent {
  return new EmailTriageAgent(config);
}
