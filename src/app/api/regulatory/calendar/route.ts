/**
 * Regulatory Calendar API Routes
 * GET: Retrieve compliance events and deadlines
 * POST: Create new regulatory event
 * PATCH: Update event status
 */

import { NextRequest, NextResponse } from 'next/server';
import { regulatoryCalendar, type FrameworkType, type RegulatoryEventType, type EventPriority } from '@/lib/regulatory/regulatory-calendar';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/regulatory/calendar
 * Retrieve compliance events
 * Query parameters:
 *   - type: all | upcoming | overdue | summary | framework
 *   - framework?: NIST | ISO | SOC2 | GDPR | CCPA | HIPAA
 *   - days?: number of days ahead for upcoming (default: 30)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'all';
    const framework = searchParams.get('framework');
    const daysAhead = parseInt(searchParams.get('days') || '30', 10);

    let data: any = null;
    let description = '';

    switch (type) {
      case 'all':
        data = regulatoryCalendar.getEvents();
        description = 'All regulatory calendar events';
        break;

      case 'upcoming':
        data = regulatoryCalendar.getUpcomingEvents(daysAhead);
        description = `Upcoming events in next ${daysAhead} days`;
        break;

      case 'overdue':
        data = regulatoryCalendar.getOverdueEvents();
        description = 'Overdue compliance events';
        break;

      case 'summary':
        data = regulatoryCalendar.getCalendarSummary();
        description = 'Regulatory calendar summary';
        break;

      case 'framework':
        if (!framework) {
          return NextResponse.json(
            {
              success: false,
              error: 'Framework parameter required for framework query',
            } as ApiResponse<null>,
            { status: 400 }
          );
        }
        data = {
          status: regulatoryCalendar.getFrameworkStatus(framework as FrameworkType),
          events: regulatoryCalendar.getEventsByFramework(framework as FrameworkType),
        };
        description = `${framework} framework compliance status and events`;
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid query type',
          } as ApiResponse<null>,
          { status: 400 }
        );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          type,
          description,
          result: data,
        },
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching regulatory calendar:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch calendar',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * POST /api/regulatory/calendar
 * Create new regulatory event
 * Body: {
 *   title, description, framework, eventType, dueDate,
 *   priority, relatedControls?, estimatedHours?
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const {
      title,
      description,
      framework,
      eventType,
      dueDate,
      priority,
      relatedControls,
      estimatedHours,
    } = body;

    if (
      !title ||
      !description ||
      !framework ||
      !eventType ||
      !dueDate ||
      !priority
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const event = regulatoryCalendar.createEvent(
      title,
      description,
      framework as FrameworkType,
      eventType as RegulatoryEventType,
      new Date(dueDate),
      priority as EventPriority,
      relatedControls || [],
      estimatedHours || 0
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          eventId: event.id,
          title: event.title,
          dueDate: event.dueDate,
          framework: event.framework,
          status: event.status,
        },
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating regulatory event:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create event',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/regulatory/calendar
 * Update event status or details
 * Body: { eventId, action: 'complete' | 'update', ...updates }
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { eventId, action, ...updates } = body;

    if (!eventId || !action) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: eventId, action',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const event = regulatoryCalendar.getEvent(eventId);
    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error: 'Event not found',
        } as ApiResponse<null>,
        { status: 404 }
      );
    }

    let success = false;

    if (action === 'complete') {
      success = regulatoryCalendar.completeEvent(eventId);
    } else if (action === 'update') {
      success = regulatoryCalendar.updateEvent(eventId, updates);
    }

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update event',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const updatedEvent = regulatoryCalendar.getEvent(eventId);

    return NextResponse.json(
      {
        success: true,
        data: {
          eventId,
          action,
          status: updatedEvent?.status,
          completionPercentage: updatedEvent?.completionPercentage,
          updatedAt: updatedEvent?.updatedAt,
        },
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating regulatory event:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update event',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
