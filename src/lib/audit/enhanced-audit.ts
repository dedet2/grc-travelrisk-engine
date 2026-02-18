/**
 * Enhanced Audit Trail with Evidence Collection
 * For SOC 2 Type II and regulatory compliance
 *
 * Features:
 * - Multiple evidence types (screenshot, document, attestation, automated-check)
 * - Chain of custody tracking
 * - Cryptographic evidence hashing
 * - Export capabilities for auditors
 */

import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

/**
 * Evidence types for audit trail
 */
export type EvidenceType = 'screenshot' | 'document' | 'attestation' | 'automated-check';

/**
 * Evidence classification
 */
export type EvidenceClassification = 'public' | 'confidential' | 'restricted' | 'internal';

/**
 * Chain of custody entry
 */
export interface ChainOfCustodyEntry {
  id: string;
  timestamp: Date;
  action: 'created' | 'accessed' | 'modified' | 'exported' | 'archived';
  userId: string;
  userEmail?: string;
  ipAddress?: string;
  details?: string;
}

/**
 * Evidence item for audit trail
 */
export interface AuditEvidence {
  id: string;
  evidenceType: EvidenceType;
  classification: EvidenceClassification;
  title: string;
  description?: string;
  contentHash: string;
  contentHashAlgorithm: string;
  fileSize?: number;
  fileName?: string;
  mimeType?: string;
  collectedAt: Date;
  collectedBy: string;
  collectedByEmail?: string;
  relatedControl?: string;
  relatedFramework?: string;
  tags: string[];
  chainOfCustody: ChainOfCustodyEntry[];
  expiresAt?: Date;
  archived: boolean;
  archivedAt?: Date;
}

/**
 * Attestation for manual evidence
 */
export interface ManualAttestation {
  id: string;
  statementText: string;
  attestedBy: string;
  attestedByEmail: string;
  position: string;
  department: string;
  attestationDate: Date;
  confirmsControl: string;
  confirmsFramework: string;
  signatureHash?: string;
  witnessEmail?: string;
}

/**
 * Enhanced audit log entry with evidence
 */
export interface EnhancedAuditEntry {
  id: string;
  timestamp: Date;
  action: string;
  userId: string;
  userEmail?: string;
  ipAddress?: string;
  resourceType: string;
  resourceId: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  evidenceIds: string[];
  changesSummary?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  complianceRelevant: boolean;
  relatedRegulations?: string[];
}

/**
 * Export format for auditors
 */
export interface AuditExportPackage {
  id: string;
  generatedAt: Date;
  generatedBy: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  organization: string;
  framework: string;
  auditEntries: EnhancedAuditEntry[];
  evidence: AuditEvidence[];
  summary: {
    totalEntries: number;
    totalEvidence: number;
    criticalEvents: number;
    controlsCovered: string[];
  };
  integrityHash: string;
}

/**
 * Enhanced Audit Trail Manager
 */
class EnhancedAuditTrail {
  private static instance: EnhancedAuditTrail;
  private auditEntries: Map<string, EnhancedAuditEntry> = new Map();
  private evidence: Map<string, AuditEvidence> = new Map();
  private attestations: Map<string, ManualAttestation> = new Map();

  private constructor() {}

  static getInstance(): EnhancedAuditTrail {
    if (!EnhancedAuditTrail.instance) {
      EnhancedAuditTrail.instance = new EnhancedAuditTrail();
    }
    return EnhancedAuditTrail.instance;
  }

  /**
   * Create or update audit evidence
   */
  createEvidence(
    evidenceType: EvidenceType,
    title: string,
    content: string | Buffer,
    userId: string,
    options?: {
      description?: string;
      fileName?: string;
      mimeType?: string;
      classification?: EvidenceClassification;
      relatedControl?: string;
      relatedFramework?: string;
      tags?: string[];
      expiresAt?: Date;
    }
  ): AuditEvidence {
    const id = uuidv4();
    const contentBuffer = typeof content === 'string' ? Buffer.from(content, 'utf-8') : content;
    const contentHash = crypto
      .createHash('sha256')
      .update(contentBuffer)
      .digest('hex');

    const evidence: AuditEvidence = {
      id,
      evidenceType,
      classification: options?.classification || 'internal',
      title,
      description: options?.description,
      contentHash,
      contentHashAlgorithm: 'SHA-256',
      fileSize: contentBuffer.length,
      fileName: options?.fileName,
      mimeType: options?.mimeType,
      collectedAt: new Date(),
      collectedBy: userId,
      collectedByEmail: options?.collectedByEmail,
      relatedControl: options?.relatedControl,
      relatedFramework: options?.relatedFramework,
      tags: options?.tags || [],
      chainOfCustody: [
        {
          id: uuidv4(),
          timestamp: new Date(),
          action: 'created',
          userId,
          details: `Evidence created for control ${options?.relatedControl || 'unspecified'}`,
        },
      ],
      expiresAt: options?.expiresAt,
      archived: false,
    };

    this.evidence.set(id, evidence);
    return evidence;
  }

  /**
   * Record manual attestation
   */
  recordAttestation(
    statementText: string,
    attestedBy: string,
    attestedByEmail: string,
    position: string,
    department: string,
    confirmsControl: string,
    confirmsFramework: string,
    witnessEmail?: string
  ): ManualAttestation {
    const id = uuidv4();
    const signatureHash = crypto
      .createHash('sha256')
      .update(`${attestedBy}${attestedByEmail}${Date.now()}`)
      .digest('hex');

    const attestation: ManualAttestation = {
      id,
      statementText,
      attestedBy,
      attestedByEmail,
      position,
      department,
      attestationDate: new Date(),
      confirmsControl,
      confirmsFramework,
      signatureHash,
      witnessEmail,
    };

    this.attestations.set(id, attestation);

    this.createEvidence(
      'attestation',
      `Attestation: ${confirmsControl}`,
      statementText,
      attestedBy,
      {
        description: `Manual attestation by ${position}`,
        relatedControl: confirmsControl,
        relatedFramework: confirmsFramework,
        classification: 'confidential',
        tags: ['attestation', 'manual-evidence'],
      }
    );

    return attestation;
  }

  /**
   * Log audit entry with evidence
   */
  logAuditEntry(
    action: string,
    userId: string,
    resourceType: string,
    resourceId: string,
    description: string,
    options?: {
      userEmail?: string;
      ipAddress?: string;
      severity?: 'info' | 'warning' | 'error' | 'critical';
      evidenceIds?: string[];
      changesSummary?: {
        before?: Record<string, any>;
        after?: Record<string, any>;
      };
      complianceRelevant?: boolean;
      relatedRegulations?: string[];
    }
  ): EnhancedAuditEntry {
    const id = uuidv4();

    const entry: EnhancedAuditEntry = {
      id,
      timestamp: new Date(),
      action,
      userId,
      userEmail: options?.userEmail,
      ipAddress: options?.ipAddress,
      resourceType,
      resourceId,
      description,
      severity: options?.severity || 'info',
      evidenceIds: options?.evidenceIds || [],
      changesSummary: options?.changesSummary,
      complianceRelevant: options?.complianceRelevant || false,
      relatedRegulations: options?.relatedRegulations,
    };

    this.auditEntries.set(id, entry);

    options?.evidenceIds?.forEach((evidenceId) => {
      const evidence = this.evidence.get(evidenceId);
      if (evidence) {
        evidence.chainOfCustody.push({
          id: uuidv4(),
          timestamp: new Date(),
          action: 'accessed',
          userId,
          userEmail: options?.userEmail,
          ipAddress: options?.ipAddress,
          details: `Referenced in audit entry: ${action}`,
        });
      }
    });

    return entry;
  }

  /**
   * Update chain of custody
   */
  updateChainOfCustody(
    evidenceId: string,
    action: ChainOfCustodyEntry['action'],
    userId: string,
    options?: {
      userEmail?: string;
      ipAddress?: string;
      details?: string;
    }
  ): boolean {
    const evidence = this.evidence.get(evidenceId);
    if (!evidence) return false;

    evidence.chainOfCustody.push({
      id: uuidv4(),
      timestamp: new Date(),
      action,
      userId,
      userEmail: options?.userEmail,
      ipAddress: options?.ipAddress,
      details: options?.details,
    });

    return true;
  }

  /**
   * Get audit entry
   */
  getAuditEntry(entryId: string): EnhancedAuditEntry | undefined {
    return this.auditEntries.get(entryId);
  }

  /**
   * Get evidence
   */
  getEvidence(evidenceId: string): AuditEvidence | undefined {
    return this.evidence.get(evidenceId);
  }

  /**
   * Get attestation
   */
  getAttestation(attestationId: string): ManualAttestation | undefined {
    return this.attestations.get(attestationId);
  }

  /**
   * Get audit entries by date range
   */
  getAuditEntriesByDateRange(startDate: Date, endDate: Date): EnhancedAuditEntry[] {
    return Array.from(this.auditEntries.values()).filter(
      (entry) => entry.timestamp >= startDate && entry.timestamp <= endDate
    );
  }

  /**
   * Get evidence by framework
   */
  getEvidenceByFramework(framework: string): AuditEvidence[] {
    return Array.from(this.evidence.values()).filter((e) => e.relatedFramework === framework);
  }

  /**
   * Get evidence by control
   */
  getEvidenceByControl(control: string): AuditEvidence[] {
    return Array.from(this.evidence.values()).filter((e) => e.relatedControl === control);
  }

  /**
   * Generate export package for auditors
   */
  generateExportPackage(
    framework: string,
    startDate: Date,
    endDate: Date,
    generatedBy: string,
    organization: string
  ): AuditExportPackage {
    const entries = this.getAuditEntriesByDateRange(startDate, endDate).filter(
      (e) => e.complianceRelevant
    );
    const evidence = this.getEvidenceByFramework(framework).filter(
      (e) => !e.archived && e.collectedAt >= startDate && e.collectedAt <= endDate
    );

    const controlsCovered = Array.from(new Set(evidence.map((e) => e.relatedControl).filter(Boolean)));
    const criticalEvents = entries.filter((e) => e.severity === 'critical').length;

    const exportData: AuditExportPackage = {
      id: uuidv4(),
      generatedAt: new Date(),
      generatedBy,
      period: { startDate, endDate },
      organization,
      framework,
      auditEntries: entries,
      evidence,
      summary: {
        totalEntries: entries.length,
        totalEvidence: evidence.length,
        criticalEvents,
        controlsCovered,
      },
      integrityHash: '',
    };

    exportData.integrityHash = this.computeExportHash(exportData);

    return exportData;
  }

  /**
   * Compute integrity hash for export package
   */
  private computeExportHash(exportPackage: Omit<AuditExportPackage, 'integrityHash'>): string {
    const data = JSON.stringify({
      totalEntries: exportPackage.summary.totalEntries,
      totalEvidence: exportPackage.summary.totalEvidence,
      timestamp: exportPackage.generatedAt,
      period: exportPackage.period,
    });

    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex');
  }

  /**
   * Archive evidence
   */
  archiveEvidence(evidenceId: string): boolean {
    const evidence = this.evidence.get(evidenceId);
    if (!evidence) return false;

    evidence.archived = true;
    evidence.archivedAt = new Date();

    this.updateChainOfCustody(evidenceId, 'archived', 'system', {
      details: 'Evidence archived',
    });

    return true;
  }

  /**
   * Verify evidence integrity
   */
  verifyEvidenceIntegrity(evidenceId: string, contentHash: string): boolean {
    const evidence = this.evidence.get(evidenceId);
    if (!evidence) return false;

    return evidence.contentHash === contentHash;
  }

  /**
   * Get all audit entries
   */
  getAllAuditEntries(): EnhancedAuditEntry[] {
    return Array.from(this.auditEntries.values());
  }

  /**
   * Get all evidence
   */
  getAllEvidence(): AuditEvidence[] {
    return Array.from(this.evidence.values());
  }
}

export const enhancedAuditTrail = EnhancedAuditTrail.getInstance();
