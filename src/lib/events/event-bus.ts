/**
 * Event Bus - Real-time Event System for Cross-Agent Communication
 *
 * Features:
 * - Pub/sub pattern for event-driven architecture
 * - 8 event types with typed payloads
 * - Built-in audit logging via AuditLogger
 * - Event history replay (max 50 events)
 * - Singleton pattern for global access
 * - TypeScript type safety
 */

import { AuditLogger } from '@/lib/audit-logger';

/**
 * Event types for the system
 */
export type EventType = 'agent.completed' | 'agent.failed' | 'risk.threshold' | 'compliance.change' | 'travel.alert' | 'crm.update' | 'assessment.due' | 'framework.updated';

/**
 * Event payloads for each event type
 */
export interface EventPayloads {
  'agent.completed': {
    agentId: string;
    agentName: string;
    executionId: string;
    durationMs: number;
    resultSummary: Record<string, any>;
  };
  'agent.failed': {
    agentId: string;
    agentName: string;
    executionId: string;
    error: string;
    durationMs: number;
  };
  'risk.threshold': {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    previousLevel: 'low' | 'medium' | 'high' | 'critical';
    riskScore: number;
    category: string;
    triggeredBy: string;
    metadata: Record<string, any>;
  };
  'compliance.change': {
    frameworkId: string;
    frameworkName: string;
    changeType: 'status' | 'control_update' | 'assessment_complete';
    controlsAffected?: number;
    newStatus?: string;
    metadata: Record<string, any>;
  };
  'travel.alert': {
    destinationCountry: string;
    destinationCode: string;
    alertType: 'advisory_change' | 'risk_escalation' | 'health_alert';
    previousLevel?: 1 | 2 | 3 | 4;
    newLevel: 1 | 2 | 3 | 4;
    description: string;
    affectedTravelers?: number;
  };
  'crm.update': {
    crmId: string;
    recordType: 'prospect' | 'lead' | 'opportunity' | 'account';
    action: 'created' | 'updated' | 'deleted';
    recordName: string;
    updatedFields: string[];
    metadata: Record<string, any>;
  };
  'assessment.due': {
    assessmentId: string;
    assessmentName: string;
    frameworkId: string;
    daysUntilDue: number;
    dueDate: Date;
    responsibleUser?: string;
  };
  'framework.updated': {
    frameworkId: string;
    frameworkName: string;
    version: string;
    updateType: 'new_controls' | 'control_removal' | 'category_change' | 'version_bump';
    controlsAdded?: number;
    controlsRemoved?: number;
  };
}

/**
 * Event object with metadata
 */
export interface Event<T extends EventType = EventType> {
  id: string;
  type: T;
  payload: EventPayloads[T];
  timestamp: Date;
  source: 'agent' | 'api' | 'webhook' | 'automation' | 'system';
  userId?: string;
}

/**
 * Event handler function type
 */
export type EventHandler<T extends EventType = EventType> = (event: Event<T>) => Promise<void> | void;

/**
 * EventBus singleton class
 */
class EventBus {
  private handlers: Map<EventType, EventHandler[]> = new Map();
  private eventHistory: Event[] = [];
  private maxHistorySize = 50;

  constructor() {
    // Initialize handlers map
    const eventTypes: EventType[] = ['agent.completed', 'agent.failed', 'risk.threshold', 'compliance.change', 'travel.alert', 'crm.update', 'assessment.due', 'framework.updated'];
    eventTypes.forEach((type) => {
      this.handlers.set(type, []);
    });
  }

  /**
   * Subscribe to an event type
   */
  subscribe<T extends EventType>(eventType: T, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }

    const handlersArray = this.handlers.get(eventType)!;
    handlersArray.push(handler as EventHandler);

    // Return unsubscribe function
    return () => {
      const index = handlersArray.indexOf(handler as EventHandler);
      if (index > -1) {
        handlersArray.splice(index, 1);
      }
    };
  }

  /**
   * Publish an event to all subscribers
   */
  async publish<T extends EventType>(
    eventType: T,
    payload: EventPayloads[T],
    options?: {
      source?: Event['source'];
      userId?: string;
    }
  ): Promise<Event<T>> {
    const event: Event<T> = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      type: eventType,
      payload,
      timestamp: new Date(),
      source: options?.source || 'system',
      userId: options?.userId,
    };

    // Store in history
    this.addToHistory(event);

    // Log to audit logger
    try {
      await this.logEventToAudit(event);
    } catch (error) {
      console.warn('[EventBus] Failed to log event to audit:', error);
    }

    // Call all subscribers
    const eventHandlers = this.handlers.get(eventType) || [];
    const promises = eventHandlers.map((handler) => {
      try {
        return Promise.resolve(handler(event));
      } catch (error) {
        console.error(`[EventBus] Error in handler for ${eventType}:`, error);
        return Promise.resolve();
      }
    });

    await Promise.all(promises);

    return event;
  }

  /**
   * Get event history with optional filtering
   */
  getHistory(filter?: { eventType?: EventType; limit?: number; since?: Date }): Event[] {
    let history = [...this.eventHistory];

    if (filter?.eventType) {
      history = history.filter((e) => e.type === filter.eventType);
    }

    if (filter?.since) {
      history = history.filter((e) => e.timestamp >= filter.since!);
    }

    if (filter?.limit) {
      history = history.slice(-filter.limit);
    }

    return history;
  }

  /**
   * Get a single event by ID
   */
  getEventById(eventId: string): Event | undefined {
    return this.eventHistory.find((e) => e.id === eventId);
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Get event statistics
   */
  getStatistics(): {
    totalEvents: number;
    byType: Record<EventType, number>;
    bySource: Record<string, number>;
    oldestEvent?: Date;
    newestEvent?: Date;
  } {
    const stats = {
      totalEvents: this.eventHistory.length,
      byType: {} as Record<EventType, number>,
      bySource: {} as Record<string, number>,
      oldestEvent: this.eventHistory[this.eventHistory.length - 1]?.timestamp,
      newestEvent: this.eventHistory[0]?.timestamp,
    };

    // Count by type
    const eventTypes: EventType[] = ['agent.completed', 'agent.failed', 'risk.threshold', 'compliance.change', 'travel.alert', 'crm.update', 'assessment.due', 'framework.updated'];
    eventTypes.forEach((type) => {
      stats.byType[type] = this.eventHistory.filter((e) => e.type === type).length;
    });

    // Count by source
    this.eventHistory.forEach((event) => {
      const source = event.source;
      stats.bySource[source] = (stats.bySource[source] || 0) + 1;
    });

    return stats;
  }

  /**
   * Subscribe to multiple event types
   */
  subscribeMultiple<T extends EventType>(eventTypes: T[], handler: EventHandler<T>): () => void {
    const unsubscribers = eventTypes.map((type) => this.subscribe(type, handler));

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }

  /**
   * Add event to history with size management
   */
  private addToHistory<T extends EventType>(event: Event<T>): void {
    // Add to beginning (newest first)
    this.eventHistory.unshift(event);

    // Keep only max size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(0, this.maxHistorySize);
    }
  }

  /**
   * Log event to AuditLogger
   */
  private async logEventToAudit(event: Event): Promise<void> {
    const descriptions: Record<EventType, string> = {
      'agent.completed': 'Agent execution completed',
      'agent.failed': 'Agent execution failed',
      'risk.threshold': 'Risk threshold triggered',
      'compliance.change': 'Compliance status changed',
      'travel.alert': 'Travel alert issued',
      'crm.update': 'CRM record updated',
      'assessment.due': 'Assessment due reminder',
      'framework.updated': 'Framework updated',
    };

    await AuditLogger.log({
      userId: event.userId || 'system',
      action: event.type,
      category: this.getAuditCategory(event.type),
      severity: this.getEventSeverity(event.type),
      entityType: event.type.split('.')[0],
      description: descriptions[event.type as EventType],
      metadata: {
        eventId: event.id,
        eventSource: event.source,
        ...event.payload,
      },
      source: event.source === 'webhook' ? 'api' : (event.source as any),
    });
  }

  /**
   * Map event type to audit category
   */
  private getAuditCategory(eventType: EventType): 'agent' | 'compliance' | 'advisory' | 'crm' | 'system' {
    switch (eventType) {
      case 'agent.completed':
      case 'agent.failed':
        return 'agent';
      case 'compliance.change':
      case 'framework.updated':
      case 'assessment.due':
        return 'compliance';
      case 'risk.threshold':
      case 'travel.alert':
        return 'advisory';
      case 'crm.update':
        return 'crm';
      default:
        return 'system';
    }
  }

  /**
   * Get severity level for event type
   */
  private getEventSeverity(eventType: EventType): 'info' | 'warning' | 'error' | 'critical' {
    switch (eventType) {
      case 'agent.failed':
      case 'risk.threshold':
        return 'warning';
      case 'travel.alert':
        return 'critical';
      default:
        return 'info';
    }
  }
}

// Global singleton instance
let globalEventBus: EventBus | null = null;

/**
 * Get or create the global EventBus instance
 */
export function getEventBus(): EventBus {
  if (!globalEventBus) {
    globalEventBus = new EventBus();
  }
  return globalEventBus;
}

/**
 * Reset the global EventBus (useful for testing)
 */
export function resetEventBus(): void {
  globalEventBus = null;
}

export default EventBus;
