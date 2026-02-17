/**
 * Audit Logger - Comprehensive Audit Logging System
 *
 * Features:
 * - Static methods for structured audit logging
 * - Support for multiple event categories (auth, agent, compliance, risk)
 * - Stores in both in-memory store and Supabase (with fallback)
 * - TypeScript interfaces for type safety
 * - Severity levels and comprehensive metadata
 */

import { inMemoryStore } from '@/lib/store/in-memory-store';
import { dataService } from '@/lib/supabase/data-service';

/**
 * Severity levels for audit events
 */
export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

/**
 * Action categories for structured auditing
 */
export type AuditActionCategory =
  | 'assessment'
  | 'framework'
  | 'control'
  | 'advisory'
  | 'agent'
  | 'report'
  | 'crm'
  | 'rbac'
  | 'auth'
  | 'system';

/**
 * Represents a structured audit log entry
 */
export interface AuditEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userEmail?: string;
  action: string; // e.g., "assessment.complete", "framework.import"
  category: AuditActionCategory;
  severity: AuditSeverity;
  entityType: string; // e.g., "assessment", "framework", "control"
  entityId?: string;
  entityName?: string;
  description: string;
  changes?: Record<string, { before?: any; after?: any }>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  source?: 'api' | 'ui' | 'agent' | 'automation';
}

/**
 * In-memory store for audit entries
 */
const inMemoryAuditStore: AuditEntry[] = [];
const MAX_IN_MEMORY_ENTRIES = 500;

/**
 * AuditLogger - Static utility class for audit logging
 */
export class AuditLogger {
  /**
   * Log a generic audit event
   */
  static async log(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<AuditEntry> {
    const auditEntry: AuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...entry,
    };

    // Store in memory
    this.storeInMemory(auditEntry);

    // Store in Supabase if available
    if (dataService && typeof dataService.createAuditLog === 'function') {
      try {
        await dataService.createAuditLog({
          userId: entry.userId,
          action: entry.action,
          resourceType: entry.entityType,
          resourceId: entry.entityId || 'N/A',
          details: {
            category: entry.category,
            severity: entry.severity,
            description: entry.description,
            entityName: entry.entityName,
            changes: entry.changes,
            metadata: entry.metadata,
            source: entry.source,
          },
          ipAddress: entry.ipAddress,
        });
      } catch (error) {
        console.warn('Failed to log to Supabase, using in-memory store only', error);
      }
    }

    return auditEntry;
  }

  /**
   * Log authentication events
   */
  static async logAuth(
    userId: string,
    action: 'login' | 'logout' | 'failed_login' | 'password_change' | 'mfa_enabled',
    metadata?: Record<string, any>
  ): Promise<AuditEntry> {
    const actionDescriptions = {
      login: 'User logged in',
      logout: 'User logged out',
      failed_login: 'Failed login attempt',
      password_change: 'User changed password',
      mfa_enabled: 'Multi-factor authentication enabled',
    };

    return this.log({
      userId,
      action: `auth.${action}`,
      category: 'auth',
      severity: action === 'failed_login' ? 'warning' : 'info',
      entityType: 'user',
      entityId: userId,
      description: actionDescriptions[action],
      metadata,
      source: 'ui',
    });
  }

  /**
   * Log agent execution events
   */
  static async logAgent(
    userId: string,
    agentName: string,
    action: 'started' | 'completed' | 'failed',
    metadata?: Record<string, any>
  ): Promise<AuditEntry> {
    const actionDescriptions = {
      started: `Agent ${agentName} execution started`,
      completed: `Agent ${agentName} execution completed`,
      failed: `Agent ${agentName} execution failed`,
    };

    return this.log({
      userId,
      action: `agent.${action}`,
      category: 'agent',
      severity: action === 'failed' ? 'error' : 'info',
      entityType: 'agent',
      entityId: agentName,
      entityName: agentName,
      description: actionDescriptions[action],
      metadata: {
        agentName,
        ...metadata,
      },
      source: 'agent',
    });
  }

  /**
   * Log compliance/assessment events
   */
  static async logCompliance(
    userId: string,
    action: 'assessment.start' | 'assessment.complete' | 'control.update' | 'framework.import',
    entityId: string,
    entityName?: string,
    changes?: Record<string, { before?: any; after?: any }>,
    metadata?: Record<string, any>
  ): Promise<AuditEntry> {
    const actionDescriptions: Record<string, string> = {
      'assessment.start': 'User started SOC 2 assessment',
      'assessment.complete': 'User completed SOC 2 assessment',
      'control.update': 'Control status marked as compliant',
      'framework.import': 'Framework NIST CSF 2.0 imported',
    };

    const [category, subaction] = action.split('.');

    return this.log({
      userId,
      action,
      category: action.startsWith('assessment') ? 'assessment' : 'framework',
      severity: 'info',
      entityType: category,
      entityId,
      entityName,
      description: actionDescriptions[action] || action,
      changes,
      metadata,
      source: 'ui',
    });
  }

  /**
   * Log risk/advisory events
   */
  static async logRisk(
    userId: string,
    action: 'advisory.update' | 'risk.assessed' | 'travel.scored',
    entityId: string,
    entityName?: string,
    severity: AuditSeverity = 'info',
    metadata?: Record<string, any>
  ): Promise<AuditEntry> {
    const actionDescriptions: Record<string, string> = {
      'advisory.update': 'Travel advisory updated',
      'risk.assessed': 'Risk assessment completed',
      'travel.scored': 'Travel risk score calculated',
    };

    return this.log({
      userId,
      action,
      category: 'advisory',
      severity,
      entityType: 'advisory',
      entityId,
      entityName,
      description: actionDescriptions[action] || action,
      metadata,
      source: 'automation',
    });
  }

  /**
   * Log CRM events
   */
  static async logCRM(
    userId: string,
    action: 'create' | 'update' | 'delete',
    entityType: 'prospect' | 'lead' | 'pipeline',
    entityId: string,
    entityName?: string,
    metadata?: Record<string, any>
  ): Promise<AuditEntry> {
    const actionDescriptions = {
      create: `New ${entityType} added to pipeline`,
      update: `${entityType} updated`,
      delete: `${entityType} deleted`,
    };

    return this.log({
      userId,
      action: `crm.${action}`,
      category: 'crm',
      severity: 'info',
      entityType,
      entityId,
      entityName,
      description: actionDescriptions[action],
      metadata,
      source: 'ui',
    });
  }

  /**
   * Log RBAC/permission events
   */
  static async logRBAC(
    userId: string,
    action: 'role.assigned' | 'permission.granted' | 'permission.revoked',
    targetUserId: string,
    changes?: Record<string, { before?: any; after?: any }>,
    metadata?: Record<string, any>
  ): Promise<AuditEntry> {
    const actionDescriptions = {
      'role.assigned': 'Admin changed RBAC permissions',
      'permission.granted': 'Permission granted',
      'permission.revoked': 'Permission revoked',
    };

    return this.log({
      userId,
      action,
      category: 'rbac',
      severity: 'warning', // Elevated severity for permission changes
      entityType: 'user',
      entityId: targetUserId,
      description: actionDescriptions[action],
      changes,
      metadata,
      source: 'ui',
    });
  }

  /**
   * Log report generation events
   */
  static async logReport(
    userId: string,
    action: 'report.export' | 'report.generated' | 'report.shared',
    reportType: string,
    entityId: string,
    metadata?: Record<string, any>
  ): Promise<AuditEntry> {
    const actionDescriptions = {
      'report.export': 'User exported compliance report',
      'report.generated': 'Report generated',
      'report.shared': 'Report shared with stakeholders',
    };

    return this.log({
      userId,
      action,
      category: 'report',
      severity: 'info',
      entityType: 'report',
      entityId,
      entityName: reportType,
      description: actionDescriptions[action],
      metadata: {
        reportType,
        ...metadata,
      },
      source: 'ui',
    });
  }

  /**
   * Store entry in memory with size management
   */
  private static storeInMemory(entry: AuditEntry): void {
    inMemoryAuditStore.unshift(entry);

    // Keep only the most recent entries to avoid memory bloat
    if (inMemoryAuditStore.length > MAX_IN_MEMORY_ENTRIES) {
      inMemoryAuditStore.pop();
    }
  }

  /**
   * Get audit entries from in-memory store with filtering
   */
  static getInMemoryLogs(filters?: {
    userId?: string;
    category?: AuditActionCategory;
    severity?: AuditSeverity;
    sinceTimestamp?: Date;
    limit?: number;
  }): AuditEntry[] {
    let results = [...inMemoryAuditStore];

    if (filters?.userId) {
      results = results.filter((log) => log.userId === filters.userId);
    }

    if (filters?.category) {
      results = results.filter((log) => log.category === filters.category);
    }

    if (filters?.severity) {
      results = results.filter((log) => log.severity === filters.severity);
    }

    if (filters?.sinceTimestamp) {
      results = results.filter((log) => log.timestamp >= filters.sinceTimestamp!);
    }

    const limit = filters?.limit || 100;
    return results.slice(0, limit);
  }

  /**
   * Clear in-memory audit logs (use with caution)
   */
  static clearInMemoryLogs(): void {
    inMemoryAuditStore.length = 0;
  }

  /**
   * Get statistics about audit logs
   */
  static getInMemoryStatistics(): {
    totalEntries: number;
    byCategory: Record<AuditActionCategory, number>;
    bySeverity: Record<AuditSeverity, number>;
    byUser: Record<string, number>;
  } {
    const stats = {
      totalEntries: inMemoryAuditStore.length,
      byCategory: {} as Record<AuditActionCategory, number>,
      bySeverity: {} as Record<AuditSeverity, number>,
      byUser: {} as Record<string, number>,
    };

    for (const log of inMemoryAuditStore) {
      // By category
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;

      // By severity
      stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1;

      // By user
      stats.byUser[log.userId] = (stats.byUser[log.userId] || 0) + 1;
    }

    return stats;
  }
}

export default AuditLogger;
