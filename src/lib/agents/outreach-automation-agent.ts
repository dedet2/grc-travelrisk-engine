/**
 * Outreach Automation Agent (C-02)
 * Generates personalized outreach sequences
 * Tracks email open/response rates
 * Lifecycle: collectData → processData → updateDashboard
 */

import { BaseAgent, type AgentConfig } from './base-agent';
import { inMemoryStore } from '@/lib/store/in-memory-store';

export interface OutreachEmail {
  emailId: string;
  sequenceId: string;
  leadId: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
  stepNumber: number;
  sentAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  repliedAt?: Date;
  status: 'draft' | 'scheduled' | 'sent' | 'opened' | 'replied' | 'bounced';
  createdAt: Date;
  updatedAt: Date;
}

export interface OutreachSequence {
  sequenceId: string;
  leadId: string;
  companyName: string;
  sequenceName: string;
  templateUsed: string;
  emailCount: number;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'paused' | 'completed';
  emails: OutreachEmail[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OutreachMetrics {
  totalSequences: number;
  activeSequences: number;
  completedSequences: number;
  totalEmailsSent: number;
  totalEmailsOpened: number;
  totalReplies: number;
  openRate: number;
  replyRate: number;
  responseRate: number;
  bouncedEmails: number;
  avgEmailsPerSequence: number;
  avgDaysToReply: number;
  timestamp: Date;
}

export interface OutreachRawData {
  sequences: OutreachSequence[];
}

/**
 * Outreach Automation Agent
 * Generates personalized outreach sequences and tracks engagement
 */
export class OutreachAutomationAgent extends BaseAgent<OutreachRawData, OutreachMetrics> {
  private sequences: Map<string, OutreachSequence> = new Map();
  private emailTemplates = [
    {
      name: 'Initial Interest',
      subject: 'Quick question about {companyName}',
      body: 'Hi {name},\n\nI noticed {companyName} in the {industry} space. Would love to chat about how we help companies like yours with compliance.\n\nBest,\nSales Team',
    },
    {
      name: 'Value Prop',
      subject: 'Helping {industry} companies reduce risk',
      body: 'Hi {name},\n\nOur GRC solution has helped {industry} leaders streamline compliance by 60%.\n\nWould you be open to a quick call?\n\nBest,\nSales Team',
    },
    {
      name: 'Social Proof',
      subject: 'How {industry} leaders are managing risk',
      body: 'Hi {name},\n\nCheck out how similar companies in {industry} reduced their risk exposure.\n\nLink: [case-study]\n\nBest,\nSales Team',
    },
  ];

  constructor(config?: Partial<AgentConfig>) {
    super({
      name: 'Outreach Automation Agent (C-02)',
      description: 'Generates personalized outreach sequences and tracks email metrics',
      maxRetries: 2,
      timeoutMs: 30000,
      enabled: true,
      ...config,
    });

    this.initializeMockData();
  }

  private initializeMockData(): void {
    const now = new Date();
    const mockSequences: OutreachSequence[] = [
      {
        sequenceId: 'seq-001',
        leadId: 'lead-001',
        companyName: 'CloudTech Solutions',
        sequenceName: 'CloudTech Outreach - Jan 2024',
        templateUsed: 'Initial Interest',
        emailCount: 3,
        startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        status: 'completed',
        emails: [
          {
            emailId: 'email-001-1',
            sequenceId: 'seq-001',
            leadId: 'lead-001',
            recipientEmail: 'sales@cloudtech.io',
            recipientName: 'John Smith',
            subject: 'Quick question about CloudTech Solutions',
            body: 'Hi John,\n\nI noticed CloudTech Solutions in the Technology space. Would love to chat about how we help companies like yours with compliance.\n\nBest,\nSales Team',
            stepNumber: 1,
            sentAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
            openedAt: new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000),
            clickedAt: new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000),
            status: 'opened',
            createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000),
          },
          {
            emailId: 'email-001-2',
            sequenceId: 'seq-001',
            leadId: 'lead-001',
            recipientEmail: 'sales@cloudtech.io',
            recipientName: 'John Smith',
            subject: 'Helping Technology companies reduce risk',
            body: 'Hi John,\n\nOur GRC solution has helped Technology leaders streamline compliance by 60%.\n\nWould you be open to a quick call?\n\nBest,\nSales Team',
            stepNumber: 2,
            sentAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
            openedAt: new Date(now.getTime() - 24 * 24 * 60 * 60 * 1000),
            status: 'opened',
            createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(now.getTime() - 24 * 24 * 60 * 60 * 1000),
          },
          {
            emailId: 'email-001-3',
            sequenceId: 'seq-001',
            leadId: 'lead-001',
            recipientEmail: 'sales@cloudtech.io',
            recipientName: 'John Smith',
            subject: 'How Technology leaders are managing risk',
            body: 'Hi John,\n\nCheck out how similar companies in Technology reduced their risk exposure.\n\nLink: [case-study]\n\nBest,\nSales Team',
            stepNumber: 3,
            sentAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
            openedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
            repliedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
            status: 'replied',
            createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
          },
        ],
        createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        sequenceId: 'seq-002',
        leadId: 'lead-002',
        companyName: 'FinServ Corp',
        sequenceName: 'FinServ Outreach - Jan 2024',
        templateUsed: 'Value Prop',
        emailCount: 2,
        startDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        status: 'active',
        emails: [
          {
            emailId: 'email-002-1',
            sequenceId: 'seq-002',
            leadId: 'lead-002',
            recipientEmail: 'contact@finserv.com',
            recipientName: 'Sarah Johnson',
            subject: 'Helping Finance companies reduce risk',
            body: 'Hi Sarah,\n\nOur GRC solution has helped Finance leaders streamline compliance by 60%.\n\nWould you be open to a quick call?\n\nBest,\nSales Team',
            stepNumber: 1,
            sentAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
            openedAt: new Date(now.getTime() - 19 * 24 * 60 * 60 * 1000),
            status: 'opened',
            createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(now.getTime() - 19 * 24 * 60 * 60 * 1000),
          },
          {
            emailId: 'email-002-2',
            sequenceId: 'seq-002',
            leadId: 'lead-002',
            recipientEmail: 'contact@finserv.com',
            recipientName: 'Sarah Johnson',
            subject: 'How Finance leaders are managing risk',
            body: 'Hi Sarah,\n\nCheck out how similar companies in Finance reduced their risk exposure.\n\nLink: [case-study]\n\nBest,\nSales Team',
            stepNumber: 2,
            sentAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
            status: 'sent',
            createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
          },
        ],
        createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const seq of mockSequences) {
      this.sequences.set(seq.sequenceId, seq);
    }
  }

  /**
   * Collect outreach sequence data
   */
  async collectData(): Promise<OutreachRawData> {
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      sequences: Array.from(this.sequences.values()),
    };
  }

  /**
   * Process data to calculate outreach metrics
   */
  async processData(rawData: OutreachRawData): Promise<OutreachMetrics> {
    const sequences = rawData.sequences;

    const activeSequences = sequences.filter((s) => s.status === 'active').length;
    const completedSequences = sequences.filter((s) => s.status === 'completed').length;

    let totalEmailsSent = 0;
    let totalEmailsOpened = 0;
    let totalReplies = 0;
    let bouncedEmails = 0;
    const replyTimes: number[] = [];

    for (const seq of sequences) {
      totalEmailsSent += seq.emails.length;

      for (const email of seq.emails) {
        if (email.status === 'bounced') {
          bouncedEmails++;
        } else if (email.status === 'opened' || email.status === 'replied') {
          totalEmailsOpened++;
        }

        if (email.status === 'replied' && email.repliedAt && email.sentAt) {
          const daysDiff = Math.floor(
            (email.repliedAt.getTime() - email.sentAt.getTime()) / (1000 * 60 * 60 * 24)
          );
          replyTimes.push(daysDiff);
          totalReplies++;
        }
      }
    }

    const openRate = totalEmailsSent > 0 ? Math.round((totalEmailsOpened / totalEmailsSent) * 100) : 0;
    const replyRate = totalEmailsSent > 0 ? Math.round((totalReplies / totalEmailsSent) * 100) : 0;
    const responseRate = totalEmailsSent > 0 ? openRate : 0;
    const avgEmailsPerSequence =
      sequences.length > 0 ? Math.round(totalEmailsSent / sequences.length) : 0;
    const avgDaysToReply =
      replyTimes.length > 0 ? Math.round(replyTimes.reduce((a, b) => a + b, 0) / replyTimes.length) : 0;

    return {
      totalSequences: sequences.length,
      activeSequences,
      completedSequences,
      totalEmailsSent,
      totalEmailsOpened,
      totalReplies,
      openRate,
      replyRate,
      responseRate,
      bouncedEmails,
      avgEmailsPerSequence,
      avgDaysToReply,
      timestamp: new Date(),
    };
  }

  /**
   * Store processed metrics in the data store
   */
  async updateDashboard(processedData: OutreachMetrics): Promise<void> {
    inMemoryStore.storeOutreachSequences(Array.from(this.sequences.values()));
    inMemoryStore.storeOutreachMetrics(processedData);

    await new Promise((resolve) => setTimeout(resolve, 50));

    console.log('[OutreachAutomationAgent] Dashboard updated with outreach metrics');
  }

  /**
   * Create a new outreach sequence
   */
  async createSequence(
    leadId: string,
    companyName: string,
    templateName: string,
    recipientEmail: string,
    recipientName: string,
    industry: string
  ): Promise<OutreachSequence> {
    const template = this.emailTemplates.find((t) => t.name === templateName) || this.emailTemplates[0];
    const now = new Date();
    const sequenceId = `seq-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const emails: OutreachEmail[] = [
      {
        emailId: `email-${sequenceId}-1`,
        sequenceId,
        leadId,
        recipientEmail,
        recipientName,
        subject: template.subject
          .replace('{companyName}', companyName)
          .replace('{industry}', industry),
        body: template.body
          .replace('{name}', recipientName)
          .replace('{companyName}', companyName)
          .replace('{industry}', industry),
        stepNumber: 1,
        status: 'draft',
        createdAt: now,
        updatedAt: now,
      },
    ];

    const sequence: OutreachSequence = {
      sequenceId,
      leadId,
      companyName,
      sequenceName: `${companyName} Outreach - ${new Date().toLocaleDateString()}`,
      templateUsed: templateName,
      emailCount: emails.length,
      startDate: now,
      status: 'active',
      emails,
      createdAt: now,
      updatedAt: now,
    };

    this.sequences.set(sequenceId, sequence);
    inMemoryStore.storeOutreachSequences(Array.from(this.sequences.values()));

    return sequence;
  }

  /**
   * Add email to sequence
   */
  async addEmailToSequence(
    sequenceId: string,
    subject: string,
    body: string
  ): Promise<OutreachSequence | null> {
    const sequence = this.sequences.get(sequenceId);
    if (!sequence) {
      return null;
    }

    const now = new Date();
    const email: OutreachEmail = {
      emailId: `email-${sequenceId}-${sequence.emails.length + 1}`,
      sequenceId,
      leadId: sequence.leadId,
      recipientEmail: sequence.emails[0].recipientEmail,
      recipientName: sequence.emails[0].recipientName,
      subject,
      body,
      stepNumber: sequence.emails.length + 1,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };

    sequence.emails.push(email);
    sequence.emailCount = sequence.emails.length;
    sequence.updatedAt = now;

    this.sequences.set(sequenceId, sequence);
    inMemoryStore.storeOutreachSequences(Array.from(this.sequences.values()));

    return sequence;
  }

  /**
   * Mark email as sent
   */
  async markEmailAsSent(sequenceId: string, emailId: string): Promise<OutreachEmail | null> {
    const sequence = this.sequences.get(sequenceId);
    if (!sequence) {
      return null;
    }

    const email = sequence.emails.find((e) => e.emailId === emailId);
    if (!email) {
      return null;
    }

    email.status = 'sent';
    email.sentAt = new Date();
    email.updatedAt = new Date();

    sequence.updatedAt = new Date();
    this.sequences.set(sequenceId, sequence);
    inMemoryStore.storeOutreachSequences(Array.from(this.sequences.values()));

    return email;
  }

  /**
   * Mark email as opened
   */
  async markEmailAsOpened(sequenceId: string, emailId: string): Promise<OutreachEmail | null> {
    const sequence = this.sequences.get(sequenceId);
    if (!sequence) {
      return null;
    }

    const email = sequence.emails.find((e) => e.emailId === emailId);
    if (!email) {
      return null;
    }

    email.status = 'opened';
    email.openedAt = new Date();
    email.updatedAt = new Date();

    sequence.updatedAt = new Date();
    this.sequences.set(sequenceId, sequence);
    inMemoryStore.storeOutreachSequences(Array.from(this.sequences.values()));

    return email;
  }

  /**
   * Mark email as replied
   */
  async markEmailAsReplied(sequenceId: string, emailId: string): Promise<OutreachEmail | null> {
    const sequence = this.sequences.get(sequenceId);
    if (!sequence) {
      return null;
    }

    const email = sequence.emails.find((e) => e.emailId === emailId);
    if (!email) {
      return null;
    }

    email.status = 'replied';
    email.repliedAt = new Date();
    email.updatedAt = new Date();

    // Mark sequence as active if it was just replied
    if (sequence.status === 'paused') {
      sequence.status = 'active';
    }

    sequence.updatedAt = new Date();
    this.sequences.set(sequenceId, sequence);
    inMemoryStore.storeOutreachSequences(Array.from(this.sequences.values()));

    return email;
  }

  /**
   * Get all sequences
   */
  getSequences(): OutreachSequence[] {
    return Array.from(this.sequences.values());
  }

  /**
   * Get sequences by status
   */
  getSequencesByStatus(status: 'active' | 'paused' | 'completed'): OutreachSequence[] {
    return Array.from(this.sequences.values()).filter((seq) => seq.status === status);
  }

  /**
   * Get a single sequence
   */
  getSequence(sequenceId: string): OutreachSequence | null {
    return this.sequences.get(sequenceId) || null;
  }

  /**
   * Get sequences by lead
   */
  getSequencesByLead(leadId: string): OutreachSequence[] {
    return Array.from(this.sequences.values()).filter((seq) => seq.leadId === leadId);
  }
}

/**
 * Factory function to create an OutreachAutomationAgent instance
 */
export function createOutreachAutomationAgent(config?: Partial<AgentConfig>): OutreachAutomationAgent {
  return new OutreachAutomationAgent(config);
}
