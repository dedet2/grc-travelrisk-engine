/**
 * Agent Communication & Handoff System
 * Manages inter-agent messaging, broadcasting, and task handoffs
 */

export type MessageChannel =
  | 'compliance'
  | 'risk'
  | 'travel'
  | 'crm'
  | 'infrastructure'
  | 'reporting'
  | 'escalation';

export type MessagePriority = 'critical' | 'high' | 'normal' | 'low';

export type HandoffType =
  | 'task_completion'
  | 'escalation'
  | 'data_dependency'
  | 'approval_required'
  | 'error_recovery';

export type HandoffStatus = 'pending' | 'accepted' | 'completed' | 'rejected';

export interface AgentMessage {
  id: string;
  fromAgentId: string;
  toAgentId?: string;
  channel?: MessageChannel;
  message: string;
  priority: MessagePriority;
  timestamp: Date;
  read: boolean;
}

export interface HandoffRequest {
  id: string;
  fromAgentId: string;
  toAgentId: string;
  type: HandoffType;
  status: HandoffStatus;
  context: Record<string, unknown>;
  reason?: string;
  initiatedAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
  result?: Record<string, unknown>;
}

export interface ChannelSubscription {
  agentId: string;
  channel: MessageChannel;
  callback: (message: AgentMessage) => void;
}

export class AgentCommunicationBus {
  private static instance: AgentCommunicationBus;
  private messageHistory: AgentMessage[] = [];
  private handoffHistory: HandoffRequest[] = [];
  private subscriptions: ChannelSubscription[] = [];
  private readonly maxMessages = 200;

  private constructor() {
    this.initializeSampleData();
  }

  public static getInstance(): AgentCommunicationBus {
    if (!AgentCommunicationBus.instance) {
      AgentCommunicationBus.instance = new AgentCommunicationBus();
    }
    return AgentCommunicationBus.instance;
  }

  private initializeSampleData(): void {
    const now = new Date();

    this.messageHistory = [
      {
        id: 'msg-1',
        fromAgentId: 'risk-scoring-a02',
        toAgentId: 'compliance-checker-a01',
        channel: undefined,
        message: 'Travel risk for John Doe to Japan assessed at 7.5/10',
        priority: 'high',
        timestamp: new Date(now.getTime() - 5 * 60 * 1000),
        read: true,
      },
      {
        id: 'msg-2',
        fromAgentId: 'travel-risk-a02',
        toAgentId: 'notification-agent-c01',
        channel: undefined,
        message: 'Send high-risk alert to traveler for COVID-19 warnings',
        priority: 'critical',
        timestamp: new Date(now.getTime() - 3 * 60 * 1000),
        read: true,
      },
      {
        id: 'msg-3',
        fromAgentId: 'compliance-checker-a01',
        channel: 'escalation',
        message: 'Policy exception needed for contractor access',
        priority: 'high',
        timestamp: new Date(now.getTime() - 2 * 60 * 1000),
        read: false,
      },
      {
        id: 'msg-4',
        fromAgentId: 'reporting-agent-b01',
        toAgentId: 'risk-scoring-a02',
        channel: undefined,
        message: 'Need Q1 risk metrics for board presentation',
        priority: 'normal',
        timestamp: new Date(now.getTime() - 60 * 1000),
        read: false,
      },
      {
        id: 'msg-5',
        fromAgentId: 'notification-agent-c01',
        channel: 'compliance',
        message: 'Batch notifications sent to 42 users',
        priority: 'normal',
        timestamp: now,
        read: false,
      },
    ];

    this.handoffHistory = [
      {
        id: 'ho-1',
        fromAgentId: 'risk-scoring-a02',
        toAgentId: 'compliance-checker-a01',
        type: 'task_completion',
        status: 'completed',
        context: {
          riskScore: 7.5,
          country: 'Japan',
          travelerId: 'emp-2847',
        },
        reason: 'Risk assessment completed, compliance review needed',
        initiatedAt: new Date(now.getTime() - 30 * 60 * 1000),
        acceptedAt: new Date(now.getTime() - 28 * 60 * 1000),
        completedAt: new Date(now.getTime() - 15 * 60 * 1000),
        result: { approved: true, conditions: ['Report daily'] },
      },
      {
        id: 'ho-2',
        fromAgentId: 'compliance-checker-a01',
        toAgentId: 'notification-agent-c01',
        type: 'task_completion',
        status: 'completed',
        context: {
          approvalId: 'appr-2847',
          recipientCount: 1,
        },
        reason: 'Send approval notification to traveler',
        initiatedAt: new Date(now.getTime() - 20 * 60 * 1000),
        acceptedAt: new Date(now.getTime() - 19 * 60 * 1000),
        completedAt: new Date(now.getTime() - 10 * 60 * 1000),
        result: { notificationSent: true, channel: 'email' },
      },
      {
        id: 'ho-3',
        fromAgentId: 'travel-risk-a02',
        toAgentId: 'escalation',
        type: 'escalation',
        status: 'completed',
        context: {
          riskLevel: 'critical',
          country: 'Syria',
          reason: 'Level 4 travel advisory',
        },
        reason: 'Travel to high-risk country requires escalation',
        initiatedAt: new Date(now.getTime() - 45 * 60 * 1000),
        acceptedAt: new Date(now.getTime() - 43 * 60 * 1000),
        completedAt: new Date(now.getTime() - 25 * 60 * 1000),
        result: {
          escalatedTo: 'security-officer',
          decision: 'travel_denied',
        },
      },
      {
        id: 'ho-4',
        fromAgentId: 'reporting-agent-b01',
        toAgentId: 'risk-scoring-a02',
        type: 'data_dependency',
        status: 'completed',
        context: {
          reportId: 'q1-risk-report',
          dataNeeded: 'risk_metrics_by_category',
        },
        reason: 'Risk agent to provide Q1 metrics',
        initiatedAt: new Date(now.getTime() - 60 * 60 * 1000),
        acceptedAt: new Date(now.getTime() - 58 * 60 * 1000),
        completedAt: new Date(now.getTime() - 55 * 60 * 1000),
        result: {
          metricsProvided: true,
          categories: 5,
        },
      },
      {
        id: 'ho-5',
        fromAgentId: 'compliance-checker-a01',
        toAgentId: 'doc-agent-d01',
        type: 'approval_required',
        status: 'completed',
        context: {
          documentType: 'policy_update',
          policyId: 'policy-travel-001',
        },
        reason: 'Policy update requires documentation agent approval',
        initiatedAt: new Date(now.getTime() - 90 * 60 * 1000),
        acceptedAt: new Date(now.getTime() - 88 * 60 * 1000),
        completedAt: new Date(now.getTime() - 70 * 60 * 1000),
        result: { approved: true, documentedAt: new Date() },
      },
      {
        id: 'ho-6',
        fromAgentId: 'notification-agent-c01',
        toAgentId: 'monitoring-agent-e01',
        type: 'error_recovery',
        status: 'completed',
        context: {
          errorCode: 'SMTP_500',
          failedAttempts: 3,
          messageId: 'msg-batch-001',
        },
        reason: 'Email delivery failed, retry with monitoring',
        initiatedAt: new Date(now.getTime() - 120 * 60 * 1000),
        acceptedAt: new Date(now.getTime() - 119 * 60 * 1000),
        completedAt: new Date(now.getTime() - 100 * 60 * 1000),
        result: { retrySuccessful: true, attemptsNeeded: 2 },
      },
      {
        id: 'ho-7',
        fromAgentId: 'risk-scoring-a02',
        toAgentId: 'crm-agent-f01',
        type: 'task_completion',
        status: 'completed',
        context: {
          customerId: 'cust-4521',
          riskScoreDelta: -0.3,
        },
        reason: 'Update CRM with latest customer risk score',
        initiatedAt: new Date(now.getTime() - 150 * 60 * 1000),
        acceptedAt: new Date(now.getTime() - 148 * 60 * 1000),
        completedAt: new Date(now.getTime() - 130 * 60 * 1000),
        result: { crmUpdated: true, recordsUpdated: 1 },
      },
      {
        id: 'ho-8',
        fromAgentId: 'travel-risk-a02',
        toAgentId: 'notification-agent-c01',
        type: 'task_completion',
        status: 'completed',
        context: {
          advisoryLevel: 2,
          affectedTravelers: 8,
          country: 'Mexico',
        },
        reason: 'Send health advisory update to travelers',
        initiatedAt: new Date(now.getTime() - 180 * 60 * 1000),
        acceptedAt: new Date(now.getTime() - 179 * 60 * 1000),
        completedAt: new Date(now.getTime() - 160 * 60 * 1000),
        result: {
          notificationsSent: 8,
          deliveryRate: 1.0,
        },
      },
      {
        id: 'ho-9',
        fromAgentId: 'compliance-checker-a01',
        toAgentId: 'audit-agent-g01',
        type: 'approval_required',
        status: 'accepted',
        context: {
          auditType: 'soc2_type_2',
          controlsToReview: 15,
        },
        reason: 'SOC 2 Type II audit requires control validation',
        initiatedAt: new Date(now.getTime() - 240 * 60 * 1000),
        acceptedAt: new Date(now.getTime() - 238 * 60 * 1000),
        result: undefined,
      },
      {
        id: 'ho-10',
        fromAgentId: 'reporting-agent-b01',
        toAgentId: 'infrastructure-agent-h01',
        type: 'data_dependency',
        status: 'pending',
        context: {
          reportType: 'infrastructure_health',
          metricsNeeded: ['uptime', 'latency', 'error_rate'],
        },
        reason: 'Infrastructure metrics needed for annual report',
        initiatedAt: now,
        acceptedAt: undefined,
        result: undefined,
      },
    ];
  }

  public sendMessage(
    fromAgentId: string,
    toAgentId: string,
    message: string,
    priority: MessagePriority = 'normal'
  ): AgentMessage {
    const newMessage: AgentMessage = {
      id: `msg-${Date.now()}`,
      fromAgentId,
      toAgentId,
      message,
      priority,
      timestamp: new Date(),
      read: false,
    };

    this.messageHistory.push(newMessage);
    this.trimHistory();
    return newMessage;
  }

  public broadcast(
    fromAgentId: string,
    channel: MessageChannel,
    message: string,
    priority: MessagePriority = 'normal'
  ): AgentMessage {
    const newMessage: AgentMessage = {
      id: `msg-${Date.now()}`,
      fromAgentId,
      channel,
      message,
      priority,
      timestamp: new Date(),
      read: false,
    };

    this.messageHistory.push(newMessage);
    this.trimHistory();

    const channelSubs = this.subscriptions.filter(
      (sub) => sub.channel === channel && sub.agentId !== fromAgentId
    );
    channelSubs.forEach((sub) => sub.callback(newMessage));

    return newMessage;
  }

  public requestHandoff(
    fromAgentId: string,
    toAgentId: string,
    context: Record<string, unknown>,
    reason?: string,
    type: HandoffType = 'task_completion'
  ): HandoffRequest {
    const handoff: HandoffRequest = {
      id: `ho-${Date.now()}`,
      fromAgentId,
      toAgentId,
      type,
      status: 'pending',
      context,
      reason,
      initiatedAt: new Date(),
    };

    this.handoffHistory.push(handoff);
    return handoff;
  }

  public acceptHandoff(
    handoffId: string,
    agentId: string
  ): HandoffRequest | null {
    const handoff = this.handoffHistory.find((h) => h.id === handoffId);

    if (!handoff || handoff.toAgentId !== agentId) {
      return null;
    }

    handoff.status = 'accepted';
    handoff.acceptedAt = new Date();
    return handoff;
  }

  public completeHandoff(
    handoffId: string,
    result?: Record<string, unknown>
  ): HandoffRequest | null {
    const handoff = this.handoffHistory.find((h) => h.id === handoffId);

    if (!handoff) {
      return null;
    }

    handoff.status = 'completed';
    handoff.completedAt = new Date();
    handoff.result = result;
    return handoff;
  }

  public rejectHandoff(handoffId: string): HandoffRequest | null {
    const handoff = this.handoffHistory.find((h) => h.id === handoffId);

    if (!handoff) {
      return null;
    }

    handoff.status = 'rejected';
    return handoff;
  }

  public getMessageQueue(agentId: string): AgentMessage[] {
    return this.messageHistory.filter(
      (msg) =>
        (msg.toAgentId === agentId || msg.channel === 'escalation') &&
        !msg.read
    );
  }

  public getHandoffHistory(filters?: {
    type?: HandoffType;
    status?: HandoffStatus;
    agentId?: string;
  }): HandoffRequest[] {
    return this.handoffHistory.filter((handoff) => {
      if (filters?.type && handoff.type !== filters.type) return false;
      if (filters?.status && handoff.status !== filters.status) return false;
      if (
        filters?.agentId &&
        handoff.fromAgentId !== filters.agentId &&
        handoff.toAgentId !== filters.agentId
      )
        return false;
      return true;
    });
  }

  public subscribe(
    agentId: string,
    channel: MessageChannel,
    callback: (message: AgentMessage) => void
  ): void {
    this.subscriptions.push({
      agentId,
      channel,
      callback,
    });
  }

  public unsubscribe(agentId: string, channel: MessageChannel): void {
    this.subscriptions = this.subscriptions.filter(
      (sub) => !(sub.agentId === agentId && sub.channel === channel)
    );
  }

  public getChannelSubscriberCount(channel: MessageChannel): number {
    return new Set(
      this.subscriptions
        .filter((sub) => sub.channel === channel)
        .map((sub) => sub.agentId)
    ).size;
  }

  public getMessageQueueStats(): Record<string, number> {
    const stats: Record<string, number> = {};

    for (const msg of this.messageHistory) {
      if (msg.toAgentId) {
        stats[msg.toAgentId] = (stats[msg.toAgentId] || 0) + (msg.read ? 0 : 1);
      }
    }

    return stats;
  }

  private trimHistory(): void {
    if (this.messageHistory.length > this.maxMessages) {
      this.messageHistory = this.messageHistory.slice(
        this.messageHistory.length - this.maxMessages
      );
    }
  }

  public getRecentMessages(limit: number = 20): AgentMessage[] {
    return this.messageHistory.slice(-limit);
  }

  public getRecentHandoffs(limit: number = 20): HandoffRequest[] {
    return this.handoffHistory.slice(-limit);
  }
}

export const agentCommunicationBus = AgentCommunicationBus.getInstance();
