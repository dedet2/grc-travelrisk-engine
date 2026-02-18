/**
 * Regulatory Calendar
 * Track compliance deadlines across multiple frameworks and regulations
 *
 * Covers:
 * - NIST (National Institute of Standards and Technology)
 * - ISO (International Organization for Standardization)
 * - SOC 2 (Service Organization Control)
 * - GDPR (General Data Protection Regulation)
 * - CCPA (California Consumer Privacy Act)
 * - HIPAA (Health Insurance Portability and Accountability Act)
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Regulatory event type
 */
export type RegulatoryEventType =
  | 'assessment'
  | 'audit'
  | 'certification'
  | 'renewal'
  | 'filing'
  | 'notification'
  | 'training'
  | 'policy-update';

/**
 * Framework identifier
 */
export type FrameworkType = 'NIST' | 'ISO' | 'SOC2' | 'GDPR' | 'CCPA' | 'HIPAA';

/**
 * Priority level
 */
export type EventPriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * Regulatory event
 */
export interface RegulatoryEvent {
  id: string;
  title: string;
  description: string;
  framework: FrameworkType;
  eventType: RegulatoryEventType;
  dueDate: Date;
  notificationDate: Date;
  priority: EventPriority;
  status: 'upcoming' | 'in-progress' | 'completed' | 'overdue';
  assignedTo?: string;
  relatedControls: string[];
  estimatedHours: number;
  completionPercentage: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Regulatory Calendar Manager
 */
class RegulatoryCalendar {
  private static instance: RegulatoryCalendar;
  private events: Map<string, RegulatoryEvent> = new Map();

  private constructor() {
    this.initializeDefaultEvents();
  }

  static getInstance(): RegulatoryCalendar {
    if (!RegulatoryCalendar.instance) {
      RegulatoryCalendar.instance = new RegulatoryCalendar();
    }
    return RegulatoryCalendar.instance;
  }

  /**
   * Initialize 15+ regulatory events
   */
  private initializeDefaultEvents(): void {
    const now = new Date();

    const defaultEvents: RegulatoryEvent[] = [
      {
        id: 'evt-001',
        title: 'NIST CSF Annual Assessment',
        description: 'Annual assessment of NIST Cybersecurity Framework implementation',
        framework: 'NIST',
        eventType: 'assessment',
        dueDate: new Date(now.getFullYear(), 2, 31),
        notificationDate: new Date(now.getFullYear(), 2, 3),
        priority: 'high',
        status: 'upcoming',
        assignedTo: 'Security Team',
        relatedControls: ['ID.AM-1', 'ID.AM-2', 'ID.RA-1'],
        estimatedHours: 120,
        completionPercentage: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'evt-002',
        title: 'ISO 27001 Certification Audit',
        description: 'Annual ISO 27001:2022 certification audit',
        framework: 'ISO',
        eventType: 'audit',
        dueDate: new Date(now.getFullYear(), 4, 15),
        notificationDate: new Date(now.getFullYear(), 3, 15),
        priority: 'critical',
        status: 'upcoming',
        assignedTo: 'Compliance Officer',
        relatedControls: ['A.5.1', 'A.6.1', 'A.7.1', 'A.8.1'],
        estimatedHours: 200,
        completionPercentage: 15,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'evt-003',
        title: 'SOC 2 Type II Audit',
        description: 'Annual SOC 2 Type II audit for security and availability',
        framework: 'SOC2',
        eventType: 'audit',
        dueDate: new Date(now.getFullYear(), 5, 30),
        notificationDate: new Date(now.getFullYear(), 4, 1),
        priority: 'critical',
        status: 'in-progress',
        assignedTo: 'External Auditors',
        relatedControls: ['CC6.1', 'CC7.1', 'CC7.2', 'A1.1'],
        estimatedHours: 160,
        completionPercentage: 45,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'evt-004',
        title: 'GDPR Data Processing Agreement Review',
        description: 'Annual review and update of Data Processing Agreements',
        framework: 'GDPR',
        eventType: 'policy-update',
        dueDate: new Date(now.getFullYear(), 0, 31),
        notificationDate: new Date(now.getFullYear() - 1, 11, 1),
        priority: 'high',
        status: 'in-progress',
        assignedTo: 'Legal & Compliance',
        relatedControls: ['Article 28', 'Article 32'],
        estimatedHours: 40,
        completionPercentage: 80,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'evt-005',
        title: 'GDPR Annual Privacy Impact Assessment',
        description: 'Update and assess data processing activities for GDPR compliance',
        framework: 'GDPR',
        eventType: 'assessment',
        dueDate: new Date(now.getFullYear(), 3, 30),
        notificationDate: new Date(now.getFullYear(), 2, 1),
        priority: 'high',
        status: 'upcoming',
        assignedTo: 'DPO Team',
        relatedControls: ['Article 35', 'Article 32'],
        estimatedHours: 80,
        completionPercentage: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'evt-006',
        title: 'CCPA Compliance Verification',
        description: 'Verify compliance with CCPA requirements and update privacy policies',
        framework: 'CCPA',
        eventType: 'assessment',
        dueDate: new Date(now.getFullYear(), 6, 15),
        notificationDate: new Date(now.getFullYear(), 5, 1),
        priority: 'high',
        status: 'upcoming',
        assignedTo: 'Privacy Officer',
        relatedControls: ['1798.100', '1798.120'],
        estimatedHours: 60,
        completionPercentage: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'evt-007',
        title: 'CCPA Annual Report Filing',
        description: 'File annual CCPA enforcement statistics report',
        framework: 'CCPA',
        eventType: 'filing',
        dueDate: new Date(now.getFullYear(), 0, 31),
        notificationDate: new Date(now.getFullYear() - 1, 11, 15),
        priority: 'critical',
        status: 'upcoming',
        assignedTo: 'Legal Team',
        relatedControls: ['1798.150'],
        estimatedHours: 20,
        completionPercentage: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'evt-008',
        title: 'HIPAA Security Risk Assessment',
        description: 'Annual HIPAA security risk assessment and remediation plan',
        framework: 'HIPAA',
        eventType: 'assessment',
        dueDate: new Date(now.getFullYear(), 8, 30),
        notificationDate: new Date(now.getFullYear(), 7, 1),
        priority: 'critical',
        status: 'upcoming',
        assignedTo: 'Security Officer',
        relatedControls: ['§164.308(a)(1)', '§164.308(a)(3)'],
        estimatedHours: 100,
        completionPercentage: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'evt-009',
        title: 'HIPAA Breach Notification Readiness',
        description: 'Test and validate breach notification procedures',
        framework: 'HIPAA',
        eventType: 'training',
        dueDate: new Date(now.getFullYear(), 9, 31),
        notificationDate: new Date(now.getFullYear(), 8, 1),
        priority: 'high',
        status: 'upcoming',
        assignedTo: 'Privacy Officer',
        relatedControls: ['§164.400', '§164.404'],
        estimatedHours: 30,
        completionPercentage: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'evt-010',
        title: 'NIST SP 800-53 Control Review',
        description: 'Review and update NIST SP 800-53 control implementations',
        framework: 'NIST',
        eventType: 'assessment',
        dueDate: new Date(now.getFullYear(), 5, 15),
        notificationDate: new Date(now.getFullYear(), 4, 1),
        priority: 'high',
        status: 'upcoming',
        assignedTo: 'Security Team',
        relatedControls: ['AC-2', 'AC-3', 'AU-2'],
        estimatedHours: 150,
        completionPercentage: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'evt-011',
        title: 'ISO 27001 Internal Audit',
        description: 'Quarterly internal audit of ISO 27001 compliance',
        framework: 'ISO',
        eventType: 'audit',
        dueDate: new Date(now.getFullYear(), 2, 31),
        notificationDate: new Date(now.getFullYear(), 2, 10),
        priority: 'high',
        status: 'upcoming',
        assignedTo: 'Internal Audit',
        relatedControls: ['A.16.1', 'A.17.1'],
        estimatedHours: 40,
        completionPercentage: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'evt-012',
        title: 'SOC 2 Type II Remediation',
        description: 'Address SOC 2 audit findings and implement remediation',
        framework: 'SOC2',
        eventType: 'assessment',
        dueDate: new Date(now.getFullYear(), 8, 30),
        notificationDate: new Date(now.getFullYear(), 7, 1),
        priority: 'high',
        status: 'upcoming',
        assignedTo: 'Operations Team',
        relatedControls: ['CC6.1', 'CC6.2', 'CC7.1'],
        estimatedHours: 120,
        completionPercentage: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'evt-013',
        title: 'GDPR Vendor Compliance Review',
        description: 'Review and assess third-party vendors for GDPR compliance',
        framework: 'GDPR',
        eventType: 'assessment',
        dueDate: new Date(now.getFullYear(), 10, 30),
        notificationDate: new Date(now.getFullYear(), 9, 1),
        priority: 'medium',
        status: 'upcoming',
        assignedTo: 'Vendor Management',
        relatedControls: ['Article 28', 'Article 32'],
        estimatedHours: 60,
        completionPercentage: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'evt-014',
        title: 'Annual Security Training',
        description: 'Mandatory security and compliance training for all employees',
        framework: 'NIST',
        eventType: 'training',
        dueDate: new Date(now.getFullYear(), 11, 31),
        notificationDate: new Date(now.getFullYear(), 11, 1),
        priority: 'high',
        status: 'upcoming',
        assignedTo: 'HR & Training',
        relatedControls: ['AT-1', 'AT-2'],
        estimatedHours: 400,
        completionPercentage: 25,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'evt-015',
        title: 'Data Classification Update',
        description: 'Review and update data classification standards and policies',
        framework: 'ISO',
        eventType: 'policy-update',
        dueDate: new Date(now.getFullYear(), 7, 31),
        notificationDate: new Date(now.getFullYear(), 6, 1),
        priority: 'medium',
        status: 'upcoming',
        assignedTo: 'Information Security',
        relatedControls: ['A.8.2', 'A.2.1'],
        estimatedHours: 50,
        completionPercentage: 0,
        createdAt: now,
        updatedAt: now,
      },
    ];

    defaultEvents.forEach((event) => {
      this.events.set(event.id, event);
    });
  }

  /**
   * Get all regulatory events
   */
  getEvents(): RegulatoryEvent[] {
    return Array.from(this.events.values());
  }

  /**
   * Get events by framework
   */
  getEventsByFramework(framework: FrameworkType): RegulatoryEvent[] {
    return Array.from(this.events.values()).filter((e) => e.framework === framework);
  }

  /**
   * Get upcoming events within X days
   */
  getUpcomingEvents(daysAhead: number = 30): RegulatoryEvent[] {
    const now = new Date();
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    return Array.from(this.events.values())
      .filter((e) => e.dueDate <= futureDate && e.dueDate >= now)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }

  /**
   * Get overdue events
   */
  getOverdueEvents(): RegulatoryEvent[] {
    const now = new Date();
    return Array.from(this.events.values()).filter(
      (e) => e.dueDate < now && e.status !== 'completed'
    );
  }

  /**
   * Get event by ID
   */
  getEvent(eventId: string): RegulatoryEvent | undefined {
    return this.events.get(eventId);
  }

  /**
   * Create new regulatory event
   */
  createEvent(
    title: string,
    description: string,
    framework: FrameworkType,
    eventType: RegulatoryEventType,
    dueDate: Date,
    priority: EventPriority,
    relatedControls: string[] = [],
    estimatedHours: number = 0
  ): RegulatoryEvent {
    const id = uuidv4();
    const notificationDate = new Date(dueDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    const now = new Date();

    const event: RegulatoryEvent = {
      id,
      title,
      description,
      framework,
      eventType,
      dueDate,
      notificationDate,
      priority,
      status: dueDate < now ? 'overdue' : 'upcoming',
      relatedControls,
      estimatedHours,
      completionPercentage: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.events.set(id, event);
    return event;
  }

  /**
   * Update event
   */
  updateEvent(eventId: string, updates: Partial<RegulatoryEvent>): boolean {
    const event = this.events.get(eventId);
    if (!event) return false;

    Object.assign(event, updates, { updatedAt: new Date() });
    return true;
  }

  /**
   * Mark event as completed
   */
  completeEvent(eventId: string): boolean {
    const event = this.events.get(eventId);
    if (!event) return false;

    event.status = 'completed';
    event.completionPercentage = 100;
    event.updatedAt = new Date();
    return true;
  }

  /**
   * Get calendar summary
   */
  getCalendarSummary(): {
    total: number;
    upcoming: number;
    overdue: number;
    inProgress: number;
    completed: number;
    byFramework: Record<FrameworkType, number>;
    nextEvent: RegulatoryEvent | null;
  } {
    const events = Array.from(this.events.values());

    const byFramework: Record<FrameworkType, number> = {
      NIST: 0,
      ISO: 0,
      SOC2: 0,
      GDPR: 0,
      CCPA: 0,
      HIPAA: 0,
    };

    events.forEach((e) => {
      byFramework[e.framework]++;
    });

    const upcoming = this.getUpcomingEvents();

    return {
      total: events.length,
      upcoming: upcoming.length,
      overdue: this.getOverdueEvents().length,
      inProgress: events.filter((e) => e.status === 'in-progress').length,
      completed: events.filter((e) => e.status === 'completed').length,
      byFramework,
      nextEvent: upcoming.length > 0 ? upcoming[0] : null,
    };
  }

  /**
   * Get framework compliance status
   */
  getFrameworkStatus(framework: FrameworkType): {
    framework: FrameworkType;
    total: number;
    completed: number;
    inProgress: number;
    upcoming: number;
    overdue: number;
    completionPercentage: number;
  } {
    const events = this.getEventsByFramework(framework);
    const completed = events.filter((e) => e.status === 'completed').length;
    const inProgress = events.filter((e) => e.status === 'in-progress').length;
    const upcoming = events.filter((e) => e.status === 'upcoming').length;
    const overdue = events.filter((e) => e.status === 'overdue').length;

    const completionPercentage = events.length > 0 ? (completed / events.length) * 100 : 0;

    return {
      framework,
      total: events.length,
      completed,
      inProgress,
      upcoming,
      overdue,
      completionPercentage,
    };
  }
}

export const regulatoryCalendar = RegulatoryCalendar.getInstance();
