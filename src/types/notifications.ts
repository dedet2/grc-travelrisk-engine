export type NotificationType =
  | 'compliance_alert'
  | 'risk_change'
  | 'incident_created'
  | 'agent_completed'
  | 'assessment_due'
  | 'vendor_risk'
  | 'travel_advisory'
  | 'system_update';

export type Severity = 'info' | 'warning' | 'critical' | 'urgent';

export interface Notification {
  id: string;
  userId: string;
  orgId?: string;
  type: NotificationType;
  title: string;
  message: string;
  severity: Severity;
  actionUrl?: string;
  read: boolean;
  createdAt: Date;
  readAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface NotificationFilter {
  type?: NotificationType;
  severity?: Severity;
  read?: boolean;
  limit?: number;
  offset?: number;
}

export interface NotificationStats {
  unreadCount: number;
  totalCount: number;
  bySeverity: Record<Severity, number>;
  byType: Record<NotificationType, number>;
}
