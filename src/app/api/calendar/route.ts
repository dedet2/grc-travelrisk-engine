/**
 * Calendar & Scheduling API Routes
 * POST: Create a calendar event
 * GET: List calendar events
 */

import { createCalendarSchedulingAgent, type CalendarEvent } from '@/lib/agents/calendar-scheduling-agent';
import { inMemoryStore } from '@/lib/store/in-memory-store';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/calendar
 * Create a calendar event
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { title, startTime, endTime, attendeeIds, agenda, location } = body;

    if (!title || !startTime || !endTime || !attendeeIds) {
      return Response.json(
        {
          success: false,
          error: 'Missing required fields: title, startTime, endTime, attendeeIds',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const agent = createCalendarSchedulingAgent();
    const event = await agent.createEvent(
      title,
      new Date(startTime),
      new Date(endTime),
      attendeeIds,
      agenda
    );

    return Response.json(
      {
        success: true,
        data: event,
        timestamp: new Date(),
      } as ApiResponse<CalendarEvent>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create calendar event',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * GET /api/calendar
 * List calendar events with optional filtering
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const upcoming = url.searchParams.get('upcoming') === 'true';
    const attendeeId = url.searchParams.get('attendeeId');

    const agent = createCalendarSchedulingAgent();
    let events = upcoming ? agent.getUpcomingEvents() : agent.getEvents();

    if (attendeeId) {
      events = agent.getEventsByAttendee(attendeeId);
    }

    // Run agent to get scheduling metrics
    const result = await agent.run();
    const metrics = inMemoryStore.getSchedulingMetrics();

    return Response.json(
      {
        success: true,
        data: {
          events,
          metrics,
          count: events.length,
          agentExecutionTime: result.latencyMs,
        },
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch calendar events',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
