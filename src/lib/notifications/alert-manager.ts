/**
 * Alert Manager - Singleton pattern for managing system-wide alerts and notifications
 * Supports alert creation, dismissal, filtering, and priority-based retrieval
 */

export type AlertType = 'risk_change' | 'compliance_breach' | 'travel_advisory' | 'agent_failure' | 'opportunity_found';
export type AlertPriority = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface Alert {
  id: string;
  type: AlertType;
  priority: AlertPriority;
  title: string;
  message: string;
  timestamp: Date;
  dismissed: boolean;
  actionUrl?: string;
  relatedEntity?: {
    type: string;
    id: string;
    name?: string;
  };
}

class AlertManagerClass {
  private alerts: Map<string, Alert> = new Map();
  private alertHistory: Alert[] = [];
  private maxHistorySize = 1000;

  constructor() {
    this.initializeDemoAlerts();
  }

  /**
   * Create a new alert
   */
  createAlert(
    type: AlertType,
    priority: AlertPriority,
    title: string,
    message: string,
    actionUrl?: string
  ): Alert {
    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      priority,
      title,
      message,
      timestamp: new Date(),
      dismissed: false,
      actionUrl,
    };

    this.alerts.set(alert.id, alert);
    this.alertHistory.push(alert);

    // Keep history size manageable
    if (this.alertHistory.length > this.maxHistorySize) {
      this.alertHistory = this.alertHistory.slice(-this.maxHistorySize);
    }

    return alert;
  }

  /**
   * Dismiss an alert
   */
  dismissAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.dismissed = true;
      return true;
    }
    return false;
  }

  /**
   * Dismiss all alerts of a specific priority
   */
  dismissAlertsByPriority(priority: AlertPriority): number {
    let count = 0;
    for (const alert of this.alerts.values()) {
      if (alert.priority === priority) {
        alert.dismissed = true;
        count++;
      }
    }
    return count;
  }

  /**
   * Get all active (non-dismissed) alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values())
      .filter((a) => !a.dismissed)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get alerts by priority
   */
  getAlertsByPriority(priority: AlertPriority): Alert[] {
    return this.getActiveAlerts().filter((a) => a.priority === priority);
  }

  /**
   * Get alerts by type
   */
  getAlertsByType(type: AlertType): Alert[] {
    return this.getActiveAlerts().filter((a) => a.type === type);
  }

  /**
   * Get all dismissed alerts
   */
  getDismissedAlerts(): Alert[] {
    return Array.from(this.alerts.values())
      .filter((a) => a.dismissed)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get alert by ID
   */
  getAlert(alertId: string): Alert | undefined {
    return this.alerts.get(alertId);
  }

  /**
   * Get all alerts (active and dismissed)
   */
  getAllAlerts(): Alert[] {
    return Array.from(this.alerts.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  /**
   * Get alert statistics
   */
  getStats() {
    const allAlerts = this.getActiveAlerts();
    return {
      total: allAlerts.length,
      critical: allAlerts.filter((a) => a.priority === 'critical').length,
      high: allAlerts.filter((a) => a.priority === 'high').length,
      medium: allAlerts.filter((a) => a.priority === 'medium').length,
      low: allAlerts.filter((a) => a.priority === 'low').length,
      info: allAlerts.filter((a) => a.priority === 'info').length,
    };
  }

  /**
   * Clear all dismissed alerts
   */
  clearDismissedAlerts(): number {
    let count = 0;
    const toDelete: string[] = [];

    for (const [id, alert] of this.alerts.entries()) {
      if (alert.dismissed) {
        toDelete.push(id);
        count++;
      }
    }

    toDelete.forEach((id) => this.alerts.delete(id));
    return count;
  }

  /**
   * Clear a specific alert
   */
  clearAlert(alertId: string): boolean {
    return this.alerts.delete(alertId);
  }

  /**
   * Clear all alerts
   */
  clearAllAlerts(): void {
    this.alerts.clear();
  }

  /**
   * Initialize with demo alerts for demo purposes
   */
  private initializeDemoAlerts(): void {
    // Critical alerts
    this.createAlert(
      'compliance_breach',
      'critical',
      'Compliance Breach Detected',
      'ISO 27001 control A.5.1.1 has not been implemented. Immediate action required.',
      '/dashboard/assessments'
    );

    this.createAlert(
      'travel_advisory',
      'critical',
      'High-Risk Travel Destination',
      'US State Department issued Level 4 (Do Not Travel) advisory for destination: Pakistan',
      '/dashboard/travel-risk'
    );

    // High priority alerts
    this.createAlert(
      'risk_change',
      'high',
      'Risk Score Increase',
      'Overall GRC risk score increased from 45 to 58 in the past 24 hours',
      '/dashboard'
    );

    this.createAlert(
      'agent_failure',
      'high',
      'Agent Execution Failed',
      'The Risk Scoring Agent failed to complete after 3 retries. Last error: Timeout',
      '/dashboard/agents'
    );

    // Medium priority alerts
    this.createAlert(
      'compliance_breach',
      'medium',
      'Upcoming Compliance Deadline',
      'Annual security training certification expires in 7 days for 3 employees',
      '/dashboard/assessments'
    );

    this.createAlert(
      'travel_advisory',
      'medium',
      'Travel Advisory Updated',
      'US State Department issued Level 2 (Exercise Increased Caution) advisory for destination: Mexico',
      '/dashboard/travel-risk'
    );

    // Low priority and info
    this.createAlert(
      'opportunity_found',
      'low',
      'Optimization Opportunity',
      'Cost savings of $2,400/month available by consolidating cloud infrastructure',
      '/dashboard'
    );

    this.createAlert(
      'risk_change',
      'info',
      'Routine Agent Run Completed',
      'Analytics Dashboard Agent run completed successfully in 1,245ms',
      '/dashboard/agents'
    );
  }
}

/**
 * Singleton instance of AlertManager
 */
export const alertManager = new AlertManagerClass();

// Also export the class for testing purposes
export { AlertManagerClass };
