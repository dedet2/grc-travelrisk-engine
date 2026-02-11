/**
 * Calendar & Scheduling Agent (B-02)
 * Manages meeting scheduling, availability tracking, and agenda generation
 * Lifecycle: collectData → processData → updateDashboard
 */

import { BaseAgent, type AgentConfig } from './base-agent';
import { inMemoryStore } from '@/lib/store/in-memory-store';

export interface Attendee {
  id: string;
  name: string;
  email: string;
  availability: 'available' | 'busy' | 'tentative';
}

export interface CalendarEvent {
  eventId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees: Attendee[];
  agenda?: string;
  notes?: string;
  status: 'scheduled' | 'cancelled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface AvailabilityWindow {
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isAvailable: boolean;
}

export interface SchedulingRawData {
  events: CalendarEvent[];
  availabilityWindows: AvailabilityWindow[];
  attendees: Attendee[];
}

export interface SchedulingSuggestion {
  suggestedTime: Date;
  duration: number;
  attendeeCount: number;
  confidence: number;
  reason: string;
}

export interface SchedulingProcessedData {
  upcomingEvents: CalendarEvent[];
  schedulingSuggestions: SchedulingSuggestion[];
  totalScheduledHours: number;
  utilizationRate: number;
  timestamp: Date;
}

/**
 * Calendar & Scheduling Agent
 * Handles meeting scheduling and availability management
 */
export class CalendarSchedulingAgent extends BaseAgent<SchedulingRawData, SchedulingProcessedData> {
  private mockEvents: CalendarEvent[] = [];
  private mockAvailability: AvailabilityWindow[] = [];
  private mockAttendees: Attendee[] = [];

  constructor(config?: Partial<AgentConfig>) {
    super({
      name: 'Calendar & Scheduling Agent (B-02)',
      description: 'Manages meeting scheduling and availability tracking',
      maxRetries: 2,
      timeoutMs: 30000,
      enabled: true,
      ...config,
    });

    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Initialize attendees
    this.mockAttendees = [
      { id: 'att-001', name: 'John Smith', email: 'john@company.com', availability: 'available' },
      {
        id: 'att-002',
        name: 'Sarah Johnson',
        email: 'sarah@company.com',
        availability: 'available',
      },
      { id: 'att-003', name: 'Mike Davis', email: 'mike@company.com', availability: 'busy' },
      { id: 'att-004', name: 'Emily Brown', email: 'emily@company.com', availability: 'available' },
    ];

    // Initialize availability windows
    this.mockAvailability = [
      { dayOfWeek: 'Monday', startTime: '09:00', endTime: '12:00', isAvailable: true },
      { dayOfWeek: 'Monday', startTime: '14:00', endTime: '18:00', isAvailable: true },
      { dayOfWeek: 'Tuesday', startTime: '09:00', endTime: '11:00', isAvailable: true },
      { dayOfWeek: 'Tuesday', startTime: '14:00', endTime: '18:00', isAvailable: true },
      { dayOfWeek: 'Wednesday', startTime: '10:00', endTime: '12:00', isAvailable: true },
      { dayOfWeek: 'Wednesday', startTime: '15:00', endTime: '18:00', isAvailable: true },
      { dayOfWeek: 'Thursday', startTime: '09:00', endTime: '18:00', isAvailable: true },
      { dayOfWeek: 'Friday', startTime: '09:00', endTime: '12:00', isAvailable: true },
    ];

    // Initialize events
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    this.mockEvents = [
      {
        eventId: 'evt-001',
        title: 'Weekly Team Standup',
        description: 'Regular team sync meeting',
        startTime: tomorrow,
        endTime: new Date(tomorrow.getTime() + 30 * 60 * 1000),
        location: 'Conference Room A',
        attendees: this.mockAttendees.slice(0, 3),
        agenda: 'Review progress, discuss blockers',
        status: 'scheduled',
        createdAt: now,
        updatedAt: now,
      },
      {
        eventId: 'evt-002',
        title: 'Project Review',
        description: 'Quarterly project review',
        startTime: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000),
        endTime: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        location: 'Virtual - Zoom',
        attendees: this.mockAttendees,
        agenda:
          'Review deliverables, discuss roadmap, address risks\n1. Previous sprint review\n2. Current sprint progress\n3. Upcoming priorities',
        status: 'scheduled',
        createdAt: now,
        updatedAt: now,
      },
      {
        eventId: 'evt-003',
        title: 'Client Meeting',
        description: 'Quarterly business review with client',
        startTime: new Date(nextWeek.getTime() + 5 * 24 * 60 * 60 * 1000),
        endTime: new Date(nextWeek.getTime() + 5 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
        location: 'Client Office',
        attendees: [this.mockAttendees[0], this.mockAttendees[1]],
        agenda: 'Discuss performance metrics, review SLA compliance',
        status: 'scheduled',
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  /**
   * Collect calendar and scheduling data
   */
  async collectData(): Promise<SchedulingRawData> {
    // Simulate data collection delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      events: this.mockEvents,
      availabilityWindows: this.mockAvailability,
      attendees: this.mockAttendees,
    };
  }

  /**
   * Process data to generate scheduling suggestions
   */
  async processData(rawData: SchedulingRawData): Promise<SchedulingProcessedData> {
    const { events, availabilityWindows } = rawData;

    // Filter upcoming events
    const now = new Date();
    const upcomingEvents = events
      .filter(
        (evt) => evt.startTime > now && evt.status === 'scheduled'
      )
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    // Generate scheduling suggestions
    const suggestions = this.generateSchedulingSuggestions(availabilityWindows);

    // Calculate total scheduled hours
    const totalScheduledHours = events.reduce((sum, evt) => {
      const durationMs = evt.endTime.getTime() - evt.startTime.getTime();
      return sum + durationMs / (1000 * 60 * 60);
    }, 0);

    // Calculate utilization rate (scheduled hours / available hours)
    const totalAvailableHours = availabilityWindows.length * 4; // 4 hours per window average
    const utilizationRate =
      totalAvailableHours > 0 ? Math.round((totalScheduledHours / totalAvailableHours) * 100) : 0;

    return {
      upcomingEvents,
      schedulingSuggestions: suggestions,
      totalScheduledHours: Math.round(totalScheduledHours * 100) / 100,
      utilizationRate: Math.min(utilizationRate, 100),
      timestamp: new Date(),
    };
  }

  /**
   * Store processed data in the data store
   */
  async updateDashboard(processedData: SchedulingProcessedData): Promise<void> {
    // Store calendar events and scheduling data
    inMemoryStore.storeCalendarEvents(this.mockEvents);
    inMemoryStore.storeSchedulingMetrics(processedData);

    // Simulate dashboard update delay
    await new Promise((resolve) => setTimeout(resolve, 50));

    console.log('[CalendarSchedulingAgent] Dashboard updated with scheduling metrics');
  }

  /**
   * Generate scheduling suggestions
   */
  private generateSchedulingSuggestions(
    availabilityWindows: AvailabilityWindow[]
  ): SchedulingSuggestion[] {
    const suggestions: SchedulingSuggestion[] = [];

    const availableWindows = availabilityWindows.filter((w) => w.isAvailable);

    // Generate a suggestion for each available window
    for (const window of availableWindows.slice(0, 3)) {
      const daysFromNow = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].indexOf(
        window.dayOfWeek
      );
      const suggestedDate = new Date();
      suggestedDate.setDate(suggestedDate.getDate() + (daysFromNow - suggestedDate.getDay() + 7) % 7);
      const [startHour, startMin] = window.startTime.split(':').map(Number);
      suggestedDate.setHours(startHour, startMin, 0, 0);

      suggestions.push({
        suggestedTime: suggestedDate,
        duration: 60,
        attendeeCount: 3,
        confidence: 0.85,
        reason: `${window.dayOfWeek} ${window.startTime}-${window.endTime} is available`,
      });
    }

    return suggestions;
  }

  /**
   * Create a calendar event
   */
  async createEvent(
    title: string,
    startTime: Date,
    endTime: Date,
    attendeeIds: string[],
    agenda?: string
  ): Promise<CalendarEvent> {
    const attendees = this.mockAttendees.filter((a) => attendeeIds.includes(a.id));
    const now = new Date();
    const eventId = `evt-${String(this.mockEvents.length + 1).padStart(3, '0')}`;

    const event: CalendarEvent = {
      eventId,
      title,
      startTime,
      endTime,
      attendees,
      agenda,
      status: 'scheduled',
      createdAt: now,
      updatedAt: now,
    };

    this.mockEvents.push(event);
    inMemoryStore.storeCalendarEvents(this.mockEvents);

    return event;
  }

  /**
   * Update an event
   */
  async updateEvent(
    eventId: string,
    updates: Partial<CalendarEvent>
  ): Promise<CalendarEvent | null> {
    const event = this.mockEvents.find((e) => e.eventId === eventId);
    if (!event) {
      return null;
    }

    Object.assign(event, updates, { updatedAt: new Date() });
    inMemoryStore.storeCalendarEvents(this.mockEvents);

    return event;
  }

  /**
   * Cancel an event
   */
  async cancelEvent(eventId: string): Promise<CalendarEvent | null> {
    return this.updateEvent(eventId, { status: 'cancelled' });
  }

  /**
   * Get all events
   */
  getEvents(): CalendarEvent[] {
    return [...this.mockEvents];
  }

  /**
   * Get upcoming events
   */
  getUpcomingEvents(): CalendarEvent[] {
    const now = new Date();
    return this.mockEvents
      .filter((e) => e.startTime > now && e.status === 'scheduled')
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  /**
   * Get events for an attendee
   */
  getEventsByAttendee(attendeeId: string): CalendarEvent[] {
    return this.mockEvents.filter((e) => e.attendees.some((a) => a.id === attendeeId));
  }

  /**
   * Get available time slots
   */
  getAvailableTimeSlots(): AvailabilityWindow[] {
    return [...this.mockAvailability.filter((w) => w.isAvailable)];
  }

  /**
   * Generate meeting agenda
   */
  generateMeetingAgenda(context: string): string {
    return `Meeting Agenda
================

Context: ${context}

1. Opening & Objectives (5 min)
2. Status Updates (10 min)
3. Key Discussion Points (20 min)
4. Action Items & Next Steps (10 min)
5. Closing Remarks (5 min)

Note: Please come prepared with relevant updates and documentation.`;
  }
}

/**
 * Factory function to create a CalendarSchedulingAgent instance
 */
export function createCalendarSchedulingAgent(
  config?: Partial<AgentConfig>
): CalendarSchedulingAgent {
  return new CalendarSchedulingAgent(config);
}
