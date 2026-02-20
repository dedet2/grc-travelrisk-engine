/**
 * Document Management Agent (B-04)
 * Organizes documents, tracks versions, manages expiry, and generates summaries
 * Lifecycle: collectData → processData → updateDashboard
 */

import { BaseAgent, type AgentConfig } from './base-agent';
import { supabaseStore } from '@/lib/store'; // Uses Supabase with in-memory fallback

export interface DocumentTag {
  name: string;
  category: 'compliance' | 'operational' | 'financial' | 'security' | 'hr' | 'general';
  value?: string;
}

export interface DocumentVersion {
  versionId: string;
  versionNumber: number;
  createdBy: string;
  createdAt: Date;
  changes: string;
}

export interface ComplianceDocument {
  documentId: string;
  title: string;
  description: string;
  content: string;
  fileType: string;
  fileSize: number;
  tags: DocumentTag[];
  owner: string;
  expiryDate?: Date;
  isExpired: boolean;
  daysUntilExpiry?: number;
  currentVersion: number;
  versions: DocumentVersion[];
  status: 'draft' | 'approved' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentRawData {
  documents: ComplianceDocument[];
}

export interface DocumentSummary {
  documentId: string;
  title: string;
  category: string;
  summary: string;
  keyPoints: string[];
  owner: string;
}

export interface DocumentMetrics {
  totalDocuments: number;
  draftDocuments: number;
  approvedDocuments: number;
  archivedDocuments: number;
  expiringDocumentsCount: number;
  expiredDocumentsCount: number;
  documentsByCategory: Record<string, number>;
  documentSummaries: DocumentSummary[];
  timestamp: Date;
}

/**
 * Document Management Agent
 * Handles document organization, versioning, and expiry tracking
 */
export class DocumentManagementAgent extends BaseAgent<DocumentRawData, DocumentMetrics> {
  private documents: Map<string, ComplianceDocument> = new Map();

  constructor(config?: Partial<AgentConfig>) {
    super({
      name: 'Document Management Agent (B-04)',
      description: 'Organizes and manages compliance documents with versioning and expiry tracking',
      maxRetries: 2,
      timeoutMs: 30000,
      enabled: true,
      ...config,
    });

    this.initializeMockData();
  }

  private initializeMockData(): void {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const pastDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

    // Initialize mock documents
    const documents: ComplianceDocument[] = [
      {
        documentId: 'doc-001',
        title: 'Information Security Policy',
        description: 'Company-wide information security policy and procedures',
        content: `# Information Security Policy

## 1. Overview
This policy establishes the information security standards for the organization.

## 2. Scope
This policy applies to all employees, contractors, and partners.

## 3. Key Principles
- Confidentiality
- Integrity
- Availability

## 4. Implementation
All systems must comply with these standards.`,
        fileType: 'markdown',
        fileSize: 4096,
        tags: [
          { name: 'ISO 27001', category: 'compliance' },
          { name: 'Security', category: 'security' },
        ],
        owner: 'Security Team',
        expiryDate: sixtyDaysFromNow,
        isExpired: false,
        daysUntilExpiry: 60,
        currentVersion: 3,
        versions: [
          { versionId: 'v1', versionNumber: 1, createdBy: 'John Doe', createdAt: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000), changes: 'Initial version' },
          { versionId: 'v2', versionNumber: 2, createdBy: 'Jane Smith', createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), changes: 'Updated access control procedures' },
          { versionId: 'v3', versionNumber: 3, createdBy: 'Bob Johnson', createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), changes: 'Added incident reporting requirements' },
        ],
        status: 'approved',
        createdAt: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        documentId: 'doc-002',
        title: 'Data Protection and Privacy Policy',
        description: 'GDPR and data privacy compliance documentation',
        content: `# Data Protection and Privacy Policy

## 1. Personal Data Processing
- Only collect data for specified purposes
- Process data according to GDPR requirements

## 2. Data Rights
- Right to access
- Right to rectification
- Right to erasure
- Right to data portability

## 3. Data Breaches
Notify supervisory authority within 72 hours.`,
        fileType: 'markdown',
        fileSize: 5120,
        tags: [
          { name: 'GDPR', category: 'compliance' },
          { name: 'Privacy', category: 'security' },
        ],
        owner: 'Legal Team',
        expiryDate: pastDate,
        isExpired: true,
        daysUntilExpiry: -10,
        currentVersion: 2,
        versions: [
          { versionId: 'v1', versionNumber: 1, createdBy: 'Alice Brown', createdAt: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000), changes: 'Initial GDPR policy' },
          { versionId: 'v2', versionNumber: 2, createdBy: 'Carol Davis', createdAt: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000), changes: 'Updated consent procedures' },
        ],
        status: 'approved',
        createdAt: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
      },
      {
        documentId: 'doc-003',
        title: 'Business Continuity Plan',
        description: 'Disaster recovery and business continuity procedures',
        content: `# Business Continuity Plan

## 1. Objectives
- Minimize downtime
- Ensure critical operations continue
- Protect employee safety

## 2. Recovery Time Objectives (RTO)
- Tier 1: 1 hour
- Tier 2: 4 hours
- Tier 3: 8 hours

## 3. Recovery Point Objectives (RPO)
- Tier 1: 15 minutes
- Tier 2: 1 hour
- Tier 3: 4 hours`,
        fileType: 'markdown',
        fileSize: 3072,
        tags: [
          { name: 'Business Continuity', category: 'operational' },
          { name: 'Disaster Recovery', category: 'operational' },
        ],
        owner: 'Operations Team',
        expiryDate: thirtyDaysFromNow,
        isExpired: false,
        daysUntilExpiry: 30,
        currentVersion: 1,
        versions: [
          { versionId: 'v1', versionNumber: 1, createdBy: 'David Wilson', createdAt: now, changes: 'Initial plan' },
        ],
        status: 'draft',
        createdAt: now,
        updatedAt: now,
      },
      {
        documentId: 'doc-004',
        title: 'Financial Control Procedures',
        description: 'Internal controls for financial transactions and reporting',
        content: `# Financial Control Procedures

## 1. Segregation of Duties
- Approval authority separate from execution
- Reconciliation by independent party

## 2. Authorization Limits
- < $1,000: Department Manager
- $1,000 - $10,000: Director
- > $10,000: CFO`,
        fileType: 'markdown',
        fileSize: 2048,
        tags: [
          { name: 'SOX', category: 'compliance' },
          { name: 'Financial', category: 'financial' },
        ],
        owner: 'Finance Team',
        expiryDate: new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000),
        isExpired: false,
        daysUntilExpiry: 120,
        currentVersion: 4,
        versions: [
          { versionId: 'v1', versionNumber: 1, createdBy: 'Eva Martin', createdAt: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000), changes: 'Initial controls' },
          { versionId: 'v2', versionNumber: 2, createdBy: 'Frank Lee', createdAt: new Date(now.getTime() - 270 * 24 * 60 * 60 * 1000), changes: 'Updated authorization limits' },
          { versionId: 'v3', versionNumber: 3, createdBy: 'Grace Taylor', createdAt: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000), changes: 'Added SOX compliance' },
          { versionId: 'v4', versionNumber: 4, createdBy: 'Henry Chen', createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), changes: 'Updated reconciliation procedures' },
        ],
        status: 'approved',
        createdAt: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      },
    ];

    // Store documents in map
    for (const doc of documents) {
      this.documents.set(doc.documentId, doc);
    }
  }

  /**
   * Collect document data
   */
  async collectData(): Promise<DocumentRawData> {
    // Simulate data collection delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      documents: Array.from(this.documents.values()),
    };
  }

  /**
   * Process documents to generate metrics and summaries
   */
  async processData(rawData: DocumentRawData): Promise<DocumentMetrics> {
    const { documents } = rawData;

    // Count documents by status
    const draftDocuments = documents.filter((d) => d.status === 'draft').length;
    const approvedDocuments = documents.filter((d) => d.status === 'approved').length;
    const archivedDocuments = documents.filter((d) => d.status === 'archived').length;

    // Count expiring and expired documents
    const expiringDocumentsCount = documents.filter(
      (d) => d.expiryDate && !d.isExpired && d.daysUntilExpiry && d.daysUntilExpiry <= 30
    ).length;
    const expiredDocumentsCount = documents.filter((d) => d.isExpired).length;

    // Count documents by category
    const documentsByCategory: Record<string, number> = {};
    for (const doc of documents) {
      for (const tag of doc.tags) {
        documentsByCategory[tag.category] = (documentsByCategory[tag.category] || 0) + 1;
      }
    }

    // Generate summaries
    const documentSummaries = documents.map((doc) => this.generateDocumentSummary(doc));

    return {
      totalDocuments: documents.length,
      draftDocuments,
      approvedDocuments,
      archivedDocuments,
      expiringDocumentsCount,
      expiredDocumentsCount,
      documentsByCategory,
      documentSummaries,
      timestamp: new Date(),
    };
  }

  /**
   * Store processed data in the data store
   */
  async updateDashboard(processedData: DocumentMetrics): Promise<void> {
    // Store documents and metrics
    supabaseStore.storeDocuments(Array.from(this.documents.values()));
    supabaseStore.storeDocumentMetrics(processedData);

    // Simulate dashboard update delay
    await new Promise((resolve) => setTimeout(resolve, 50));

    console.log('[DocumentManagementAgent] Dashboard updated with document metrics');
  }

  /**
   * Generate a summary for a document
   */
  private generateDocumentSummary(doc: ComplianceDocument): DocumentSummary {
    const lines = doc.content.split('\n');
    const keyPoints = lines
      .filter((line) => line.startsWith('-') || line.startsWith('*'))
      .slice(0, 5)
      .map((line) => line.replace(/^[-*]\s+/, ''));

    const summary = lines
      .filter((line) => !line.startsWith('#') && line.trim())
      .slice(0, 3)
      .join(' ')
      .substring(0, 200);

    return {
      documentId: doc.documentId,
      title: doc.title,
      category: doc.tags.length > 0 ? doc.tags[0].category : 'general',
      summary: summary || doc.description,
      keyPoints: keyPoints.length > 0 ? keyPoints : [doc.description],
      owner: doc.owner,
    };
  }

  /**
   * Create a new document
   */
  async createDocument(
    title: string,
    description: string,
    content: string,
    owner: string,
    tags: DocumentTag[],
    expiryDate?: Date
  ): Promise<ComplianceDocument> {
    const now = new Date();
    const documentId = `doc-${Date.now()}`;

    const document: ComplianceDocument = {
      documentId,
      title,
      description,
      content,
      fileType: 'markdown',
      fileSize: content.length,
      tags,
      owner,
      expiryDate,
      isExpired: expiryDate ? expiryDate < now : false,
      daysUntilExpiry: expiryDate
        ? Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : undefined,
      currentVersion: 1,
      versions: [
        {
          versionId: 'v1',
          versionNumber: 1,
          createdBy: owner,
          createdAt: now,
          changes: 'Initial version',
        },
      ],
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };

    this.documents.set(documentId, document);
    supabaseStore.storeDocuments(Array.from(this.documents.values()));

    return document;
  }

  /**
   * Update document content (creates a new version)
   */
  async updateDocument(
    documentId: string,
    content: string,
    changes: string,
    updatedBy: string
  ): Promise<ComplianceDocument | null> {
    const document = this.documents.get(documentId);
    if (!document) {
      return null;
    }

    const now = new Date();
    const newVersion = document.currentVersion + 1;

    document.content = content;
    document.fileSize = content.length;
    document.versions.push({
      versionId: `v${newVersion}`,
      versionNumber: newVersion,
      createdBy: updatedBy,
      createdAt: now,
      changes,
    });
    document.currentVersion = newVersion;
    document.updatedAt = now;

    this.documents.set(documentId, document);
    supabaseStore.storeDocuments(Array.from(this.documents.values()));

    return document;
  }

  /**
   * Approve a document
   */
  async approveDocument(documentId: string): Promise<ComplianceDocument | null> {
    const document = this.documents.get(documentId);
    if (!document) {
      return null;
    }

    document.status = 'approved';
    document.updatedAt = new Date();

    this.documents.set(documentId, document);
    supabaseStore.storeDocuments(Array.from(this.documents.values()));

    return document;
  }

  /**
   * Archive a document
   */
  async archiveDocument(documentId: string): Promise<ComplianceDocument | null> {
    const document = this.documents.get(documentId);
    if (!document) {
      return null;
    }

    document.status = 'archived';
    document.updatedAt = new Date();

    this.documents.set(documentId, document);
    supabaseStore.storeDocuments(Array.from(this.documents.values()));

    return document;
  }

  /**
   * Get all documents
   */
  getAllDocuments(): ComplianceDocument[] {
    return Array.from(this.documents.values());
  }

  /**
   * Get document by ID
   */
  getDocument(documentId: string): ComplianceDocument | null {
    return this.documents.get(documentId) || null;
  }

  /**
   * Get documents by status
   */
  getDocumentsByStatus(status: ComplianceDocument['status']): ComplianceDocument[] {
    return Array.from(this.documents.values()).filter((d) => d.status === status);
  }

  /**
   * Get documents by tag
   */
  getDocumentsByTag(tagName: string): ComplianceDocument[] {
    return Array.from(this.documents.values()).filter((d) =>
      d.tags.some((t) => t.name === tagName)
    );
  }

  /**
   * Get expiring documents
   */
  getExpiringDocuments(daysThreshold: number = 30): ComplianceDocument[] {
    const now = new Date();
    return Array.from(this.documents.values()).filter((d) => {
      if (!d.expiryDate || d.isExpired) return false;
      const daysUntil = Math.ceil((d.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= daysThreshold;
    });
  }

  /**
   * Get expired documents
   */
  getExpiredDocuments(): ComplianceDocument[] {
    return Array.from(this.documents.values()).filter((d) => d.isExpired);
  }

  /**
   * Add a tag to a document
   */
  async addTag(documentId: string, tag: DocumentTag): Promise<ComplianceDocument | null> {
    const document = this.documents.get(documentId);
    if (!document) {
      return null;
    }

    // Avoid duplicate tags
    if (!document.tags.some((t) => t.name === tag.name && t.category === tag.category)) {
      document.tags.push(tag);
      document.updatedAt = new Date();
      this.documents.set(documentId, document);
      supabaseStore.storeDocuments(Array.from(this.documents.values()));
    }

    return document;
  }

  /**
   * Get document summary
   */
  async generateSummary(documentId: string): Promise<DocumentSummary | null> {
    const document = this.documents.get(documentId);
    if (!document) {
      return null;
    }

    return this.generateDocumentSummary(document);
  }
}

/**
 * Factory function to create a DocumentManagementAgent instance
 */
export function createDocumentManagementAgent(
  config?: Partial<AgentConfig>
): DocumentManagementAgent {
  return new DocumentManagementAgent(config);
}
