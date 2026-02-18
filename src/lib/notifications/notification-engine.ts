import { Notification, NotificationFilter, NotificationStats, NotificationType, Severity } from '@/types/notifications';

class NotificationEngine {
  private notifications: Map<string, Notification> = new Map();
  private nextId: number = 1;

  constructor() {
    this.seedNotifications();
  }

  private seedNotifications(): void {
    const seedData: Array<Omit<Notification, 'id'>> = [
      {
        userId: 'user_1',
        orgId: 'org_1',
        type: 'compliance_alert',
        title: 'NIST Control Gap Detected',
        message: 'Control AC-2.1 (User Registration) shows 65% compliance status',
        severity: 'critical',
        actionUrl: '/dashboard/compliance/controls/AC-2.1',
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        metadata: { controlId: 'AC-2.1', compliance: 0.65 }
      },
      {
        userId: 'user_1',
        orgId: 'org_1',
        type: 'risk_change',
        title: 'Travel Risk Score Updated',
        message: 'Risk score for destination Singapore changed from 32 to 38 due to new weather advisory',
        severity: 'warning',
        actionUrl: '/dashboard/travel-risk/singapore',
        read: false,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        metadata: { destination: 'Singapore', oldScore: 32, newScore: 38 }
      },
      {
        userId: 'user_1',
        orgId: 'org_1',
        type: 'incident_created',
        title: 'Critical Incident Registered',
        message: 'New incident: Data breach attempt detected in authentication module',
        severity: 'urgent',
        actionUrl: '/dashboard/incidents/critical_2024_01',
        read: false,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        metadata: { incidentId: 'critical_2024_01', module: 'auth' }
      },
      {
        userId: 'user_1',
        orgId: 'org_1',
        type: 'agent_completed',
        title: 'Risk Scoring Agent Completed',
        message: 'Risk assessment for Q1 2024 completed in 2.3 seconds with 98.5% confidence',
        severity: 'info',
        actionUrl: '/dashboard/agents/risk-scorer',
        read: true,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
        readAt: new Date(Date.now() - 7 * 60 * 60 * 1000),
        metadata: { agentId: 'risk-scorer', latency: 2300, confidence: 0.985 }
      },
      {
        userId: 'user_1',
        orgId: 'org_1',
        type: 'assessment_due',
        title: 'ISO 27001 Assessment Due Soon',
        message: 'Annual ISO 27001 assessment due in 7 days',
        severity: 'warning',
        actionUrl: '/dashboard/assessments/iso-27001',
        read: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        metadata: { framework: 'ISO 27001', daysRemaining: 7 }
      },
      {
        userId: 'user_1',
        orgId: 'org_1',
        type: 'vendor_risk',
        title: 'Vendor Risk Escalation',
        message: 'Risk score for vendor CloudData Inc increased to critical (89/100)',
        severity: 'critical',
        actionUrl: '/dashboard/vendors/clouddata-inc',
        read: false,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        metadata: { vendorId: 'clouddata-inc', riskScore: 89 }
      },
      {
        userId: 'user_1',
        orgId: 'org_1',
        type: 'travel_advisory',
        title: 'Travel Advisory Update: Japan',
        message: 'Level 2 advisory issued for Tokyo region due to transportation disruptions',
        severity: 'warning',
        actionUrl: '/dashboard/travel-risk/japan',
        read: false,
        createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
        metadata: { country: 'Japan', region: 'Tokyo', level: 2 }
      },
      {
        userId: 'user_1',
        orgId: 'org_1',
        type: 'system_update',
        title: 'Platform Update Available',
        message: 'GRC TravelRisk Engine v2.4.1 available - includes performance improvements',
        severity: 'info',
        actionUrl: '/settings/platform-updates',
        read: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        readAt: new Date(Date.now() - 22 * 60 * 60 * 1000),
        metadata: { version: '2.4.1', improvements: ['performance', 'ui', 'security'] }
      },
      {
        userId: 'user_2',
        orgId: 'org_1',
        type: 'compliance_alert',
        title: 'GDPR Control Missing Documentation',
        message: 'Article 32 (Security of Processing) missing implementation evidence',
        severity: 'critical',
        actionUrl: '/dashboard/compliance/controls/GDPR-32',
        read: false,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        metadata: { controlId: 'GDPR-32', framework: 'GDPR' }
      },
      {
        userId: 'user_2',
        orgId: 'org_1',
        type: 'incident_created',
        title: 'Incident: API Rate Limit Exceeded',
        message: 'External API rate limit exceeded 3 times in last hour - possible DDoS activity',
        severity: 'warning',
        actionUrl: '/dashboard/incidents/api_2024_02',
        read: false,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        metadata: { incidentId: 'api_2024_02', occurrences: 3 }
      },
      {
        userId: 'user_2',
        orgId: 'org_1',
        type: 'agent_completed',
        title: 'Compliance Audit Agent Finished',
        message: 'Automated audit of 542 controls completed successfully',
        severity: 'info',
        actionUrl: '/dashboard/agents/compliance-auditor',
        read: false,
        createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000),
        metadata: { agentId: 'compliance-auditor', controlsAudited: 542 }
      },
      {
        userId: 'user_2',
        orgId: 'org_1',
        type: 'vendor_risk',
        title: 'New Vendor Added to High-Risk List',
        message: 'Vendor DataFlow Solutions classified as high-risk due to security concerns',
        severity: 'warning',
        actionUrl: '/dashboard/vendors/dataflow-solutions',
        read: false,
        createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
        metadata: { vendorId: 'dataflow-solutions', riskCategory: 'security' }
      },
      {
        userId: 'user_2',
        orgId: 'org_1',
        type: 'travel_advisory',
        title: 'Travel Warning: Mexico City',
        message: 'Level 3 travel advisory issued for Mexico City - avoid travel',
        severity: 'critical',
        actionUrl: '/dashboard/travel-risk/mexico',
        read: false,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        metadata: { country: 'Mexico', region: 'Mexico City', level: 3 }
      },
      {
        userId: 'user_2',
        orgId: 'org_1',
        type: 'assessment_due',
        title: 'SOC 2 Type II Annual Assessment',
        message: 'SOC 2 Type II assessment scheduled for March 15, 2024',
        severity: 'info',
        actionUrl: '/dashboard/assessments/soc2-type2',
        read: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        metadata: { framework: 'SOC 2 Type II', date: '2024-03-15' }
      },
      {
        userId: 'user_3',
        orgId: 'org_1',
        type: 'risk_change',
        title: 'Overall Compliance Score Improved',
        message: 'Organization compliance score increased from 72% to 78% this month',
        severity: 'info',
        actionUrl: '/dashboard/compliance/overview',
        read: false,
        createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
        metadata: { previousScore: 0.72, newScore: 0.78 }
      },
      {
        userId: 'user_3',
        orgId: 'org_1',
        type: 'system_update',
        title: 'Scheduled Maintenance Window',
        message: 'Scheduled maintenance on February 20, 2024 from 2-4 AM UTC',
        severity: 'warning',
        actionUrl: '/settings/maintenance-schedule',
        read: false,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        metadata: { date: '2024-02-20', duration: '2 hours' }
      }
    ];

    seedData.forEach((notif) => {
      const id = `notif_${this.nextId}`;
      this.nextId++;
      this.notifications.set(id, { ...notif, id });
    });
  }

  sendNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    severity: Severity,
    actionUrl?: string,
    metadata?: Record<string, unknown>
  ): Notification {
    const id = `notif_${this.nextId}`;
    this.nextId++;

    const notification: Notification = {
      id,
      userId,
      type,
      title,
      message,
      severity,
      actionUrl,
      read: false,
      createdAt: new Date(),
      metadata
    };

    this.notifications.set(id, notification);
    return notification;
  }

  broadcastToOrg(
    orgId: string,
    type: NotificationType,
    title: string,
    message: string,
    severity: Severity,
    actionUrl?: string,
    metadata?: Record<string, unknown>
  ): Notification[] {
    const orgNotifications: Notification[] = [];
    const orgUsers = Array.from(this.notifications.values())
      .filter((n) => n.orgId === orgId)
      .map((n) => n.userId)
      .filter((value, index, self) => self.indexOf(value) === index);

    orgUsers.forEach((userId) => {
      const notif = this.sendNotification(userId, type, title, message, severity, actionUrl, metadata);
      orgNotifications.push(notif);
    });

    return orgNotifications;
  }

  getUnreadCount(userId: string): number {
    return Array.from(this.notifications.values()).filter(
      (n) => n.userId === userId && !n.read
    ).length;
  }

  markAsRead(notificationId: string): Notification | null {
    const notif = this.notifications.get(notificationId);
    if (notif) {
      notif.read = true;
      notif.readAt = new Date();
      this.notifications.set(notificationId, notif);
      return notif;
    }
    return null;
  }

  markAllRead(userId: string): number {
    let count = 0;
    Array.from(this.notifications.values()).forEach((notif) => {
      if (notif.userId === userId && !notif.read) {
        notif.read = true;
        notif.readAt = new Date();
        this.notifications.set(notif.id, notif);
        count++;
      }
    });
    return count;
  }

  getNotificationHistory(userId: string, filters?: NotificationFilter): Notification[] {
    let result = Array.from(this.notifications.values()).filter((n) => n.userId === userId);

    if (filters?.type) {
      result = result.filter((n) => n.type === filters.type);
    }
    if (filters?.severity) {
      result = result.filter((n) => n.severity === filters.severity);
    }
    if (filters?.read !== undefined) {
      result = result.filter((n) => n.read === filters.read);
    }

    result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    return result.slice(offset, offset + limit);
  }

  getNotificationStats(userId: string): NotificationStats {
    const userNotifications = Array.from(this.notifications.values()).filter(
      (n) => n.userId === userId
    );

    const stats: NotificationStats = {
      unreadCount: 0,
      totalCount: userNotifications.length,
      bySeverity: { info: 0, warning: 0, critical: 0, urgent: 0 },
      byType: {
        compliance_alert: 0,
        risk_change: 0,
        incident_created: 0,
        agent_completed: 0,
        assessment_due: 0,
        vendor_risk: 0,
        travel_advisory: 0,
        system_update: 0
      }
    };

    userNotifications.forEach((notif) => {
      if (!notif.read) stats.unreadCount++;
      stats.bySeverity[notif.severity]++;
      stats.byType[notif.type]++;
    });

    return stats;
  }

  getUserNotifications(userId: string, limit: number = 20, offset: number = 0): Notification[] {
    const userNotifications = Array.from(this.notifications.values())
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return userNotifications.slice(offset, offset + limit);
  }

  clearNotifications(userId: string): number {
    const initialSize = this.notifications.size;
    const idsToDelete: string[] = [];

    this.notifications.forEach((notif, id) => {
      if (notif.userId === userId) {
        idsToDelete.push(id);
      }
    });

    idsToDelete.forEach((id) => this.notifications.delete(id));
    return initialSize - this.notifications.size;
  }
}

export const notificationEngine = new NotificationEngine();
