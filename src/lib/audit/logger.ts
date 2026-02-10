import { createServiceRoleClient } from '../supabase/server';
import type { AuditLog } from '@/types';

/**
 * Log an action to the audit trail
 */
export async function logAction(params: {
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}): Promise<void> {
  try {
    const supabase = await createServiceRoleClient();

    const auditLog = {
      user_id: params.userId,
      action: params.action,
      resource_type: params.resourceType,
      resource_id: params.resourceId,
      details: params.details || null,
      ip_address: params.ipAddress || null,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('audit_logs').insert([auditLog]);

    if (error) {
      console.error('Audit logging error:', error);
      // Don't throw - audit failure shouldn't break the application
    }
  } catch (error) {
    console.error('Failed to log audit action:', error);
  }
}

/**
 * Log assessment action
 */
export async function logAssessmentAction(
  userId: string,
  action: 'created' | 'updated' | 'completed' | 'deleted',
  assessmentId: string,
  details?: Record<string, unknown>
): Promise<void> {
  await logAction({
    userId,
    action: `assessment_${action}`,
    resourceType: 'assessment',
    resourceId: assessmentId,
    details,
  });
}

/**
 * Log control response action
 */
export async function logControlResponseAction(
  userId: string,
  action: 'created' | 'updated' | 'deleted',
  responseId: string,
  controlId: string,
  assessmentId: string
): Promise<void> {
  await logAction({
    userId,
    action: `control_response_${action}`,
    resourceType: 'assessment_response',
    resourceId: responseId,
    details: {
      controlId,
      assessmentId,
    },
  });
}

/**
 * Log framework action
 */
export async function logFrameworkAction(
  userId: string,
  action: 'created' | 'updated' | 'published' | 'archived' | 'deleted',
  frameworkId: string,
  frameworkName?: string
): Promise<void> {
  await logAction({
    userId,
    action: `framework_${action}`,
    resourceType: 'framework',
    resourceId: frameworkId,
    details: {
      frameworkName,
    },
  });
}

/**
 * Log report generation
 */
export async function logReportGeneration(
  userId: string,
  reportType: string,
  resourceId: string
): Promise<void> {
  await logAction({
    userId,
    action: 'report_generated',
    resourceType: 'report',
    resourceId,
    details: {
      reportType,
    },
  });
}

/**
 * Log API call (for rate limiting and monitoring)
 */
export async function logApiCall(
  userId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTime: number
): Promise<void> {
  await logAction({
    userId,
    action: 'api_call',
    resourceType: 'api',
    resourceId: endpoint,
    details: {
      method,
      statusCode,
      responseTimeMs: responseTime,
    },
  });
}

/**
 * Log security event
 */
export async function logSecurityEvent(
  userId: string,
  eventType: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  details: Record<string, unknown>
): Promise<void> {
  await logAction({
    userId,
    action: `security_event_${eventType}`,
    resourceType: 'security',
    resourceId: eventType,
    details: {
      severity,
      ...details,
    },
  });
}

/**
 * Retrieve audit logs for a resource
 */
export async function getAuditLogs(
  resourceType: string,
  resourceId: string,
  limit = 50
): Promise<AuditLog[]> {
  try {
    const supabase = await createServiceRoleClient();

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('resource_type', resourceType)
      .eq('resource_id', resourceId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error retrieving audit logs:', error);
      return [];
    }

    return (data || []).map((log) => ({
      id: log.id,
      userId: log.user_id,
      action: log.action,
      resourceType: log.resource_type,
      resourceId: log.resource_id,
      details: log.details,
      ipAddress: log.ip_address,
      createdAt: new Date(log.created_at),
    }));
  } catch (error) {
    console.error('Failed to retrieve audit logs:', error);
    return [];
  }
}

/**
 * Retrieve user activity logs
 */
export async function getUserActivityLogs(
  userId: string,
  limit = 100
): Promise<AuditLog[]> {
  try {
    const supabase = await createServiceRoleClient();

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error retrieving user activity:', error);
      return [];
    }

    return (data || []).map((log) => ({
      id: log.id,
      userId: log.user_id,
      action: log.action,
      resourceType: log.resource_type,
      resourceId: log.resource_id,
      details: log.details,
      ipAddress: log.ip_address,
      createdAt: new Date(log.created_at),
    }));
  } catch (error) {
    console.error('Failed to retrieve user activity:', error);
    return [];
  }
}
