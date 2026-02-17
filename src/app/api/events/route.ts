/**
 * Events API Endpoint
 * GET: Retrieve recent events with optional filtering
 * POST: Publish a new event to the event bus
 */

import { NextRequest, NextResponse } from 'next/server';
import { getEventBus, Event, EventType } from '@/lib/events/event-bus';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/events
 * Retrieve recent events with optional filtering
 * Query params:
 *   ?type=agent.completed|agent.failed|risk.threshold|compliance.change|travel.alert|crm.update|assessment.due|framework.updated
 *   ?source=agent|api|webhook|automation|system
 *   ?limit=20 (default 50)
 *   ?since=2025-02-17T00:00:00Z (ISO date string)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as EventType | null;
    const source = searchParams.get('source');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const sinceParam = searchParams.get('since');

    const eventBus = getEventBus();
    const since = sinceParam ? new Date(sinceParam) : undefined;

    let events = eventBus.getHistory({
      eventType: type || undefined,
      limit: Math.min(limit, 100),
      since,
    });

    // Filter by source if specified
    if (source) {
      events = events.filter((e) => e.source === source);
    }

    // Get statistics
    const stats = eventBus.getStatistics();

    const responseData = {
      events,
      total: events.length,
      filters: {
        type: type || 'all',
        source: source || 'all',
        since: sinceParam || 'none',
        limit,
      },
      statistics: stats,
    };

    return NextResponse.json(
      {
        success: true,
        data: responseData,
        timestamp: new Date(),
      } as ApiResponse<typeof responseData>,
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[Events API] Error retrieving events:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: `Failed to retrieve events: ${errorMessage}`,
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * POST /api/events
 * Publish a new event to the event bus
 *
 * Request body:
 * {
 *   "type": "agent.completed|agent.failed|risk.threshold|compliance.change|travel.alert|crm.update|assessment.due|framework.updated",
 *   "payload": { /* event-specific payload */ },
 *   "source": "agent|api|webhook|automation|system" (optional, defaults to "api"),
 *   "userId": "string" (optional)
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { type, payload, source = 'api', userId } = body;

    if (!type) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: type',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    if (!payload || typeof payload !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid required field: payload',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const validEventTypes: EventType[] = ['agent.completed', 'agent.failed', 'risk.threshold', 'compliance.change', 'travel.alert', 'crm.update', 'assessment.due', 'framework.updated'];

    if (!validEventTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid event type: ${type}. Must be one of: ${validEventTypes.join(', ')}`,
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const eventBus = getEventBus();
    const event = await eventBus.publish(type, payload, {
      source: source as any,
      userId,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          eventId: event.id,
          eventType: event.type,
          timestamp: event.timestamp,
          source: event.source,
        },
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: 201 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[Events API] Error publishing event:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: `Failed to publish event: ${errorMessage}`,
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * Sample event data for reference and testing
 */
export const SAMPLE_EVENTS = [
  {
    type: 'agent.completed',
    payload: {
      agentId: 'risk-scoring-a02',
      agentName: 'Risk Scoring (A-02)',
      executionId: 'exec-1708169400000-abc123',
      durationMs: 2345,
      resultSummary: {
        overall: 42,
        categories: { compliance: 35, operational: 48, technical: 42 },
        riskLevel: 'medium',
      },
    },
  },
  {
    type: 'agent.failed',
    payload: {
      agentId: 'travel-risk-a03',
      agentName: 'Travel Risk Assessment (A-03)',
      executionId: 'exec-1708169400000-def456',
      error: 'Failed to fetch destination data from API',
      durationMs: 5000,
    },
  },
  {
    type: 'risk.threshold',
    payload: {
      riskLevel: 'high',
      previousLevel: 'medium',
      riskScore: 78,
      category: 'travel',
      triggeredBy: 'destination_advisory_change',
      metadata: { countries: ['SY', 'YE'], reason: 'Travel advisories escalated' },
    },
  },
  {
    type: 'compliance.change',
    payload: {
      frameworkId: 'nist-csf-2.0',
      frameworkName: 'NIST Cybersecurity Framework 2.0',
      changeType: 'assessment_complete',
      controlsAffected: 23,
      newStatus: 'completed',
      metadata: { assessmentId: 'assess-12345', completedDate: new Date().toISOString() },
    },
  },
  {
    type: 'travel.alert',
    payload: {
      destinationCountry: 'Mexico',
      destinationCode: 'MX',
      alertType: 'advisory_change',
      previousLevel: 1,
      newLevel: 2,
      description: 'Travel advisory level increased due to security concerns in northern border region',
      affectedTravelers: 3,
    },
  },
  {
    type: 'crm.update',
    payload: {
      crmId: 'lead-67890',
      recordType: 'lead',
      action: 'updated',
      recordName: 'Acme Corporation',
      updatedFields: ['stage', 'expected_close_date', 'opportunity_amount'],
      metadata: { stageBefore: 'prospecting', stageAfter: 'qualification', source: 'webhook_inbound' },
    },
  },
  {
    type: 'assessment.due',
    payload: {
      assessmentId: 'soc2-annual-2025',
      assessmentName: 'SOC 2 Type II Annual Review',
      frameworkId: 'soc2-type2',
      daysUntilDue: 7,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      responsibleUser: 'compliance-lead@company.com',
    },
  },
  {
    type: 'framework.updated',
    payload: {
      frameworkId: 'iso27001-2024',
      frameworkName: 'ISO/IEC 27001:2024',
      version: '2024.1',
      updateType: 'new_controls',
      controlsAdded: 5,
      controlsRemoved: 0,
    },
  },
  {
    type: 'agent.completed',
    payload: {
      agentId: 'continuous-monitoring-a04',
      agentName: 'Continuous Monitoring (A-04)',
      executionId: 'exec-1708169400000-ghi789',
      durationMs: 1234,
      resultSummary: {
        policiesMonitored: 45,
        complianceScore: 92,
        alertsGenerated: 2,
      },
    },
  },
  {
    type: 'risk.threshold',
    payload: {
      riskLevel: 'critical',
      previousLevel: 'high',
      riskScore: 95,
      category: 'security',
      triggeredBy: 'policy_violation_detected',
      metadata: { violations: ['MFA_not_enforced', 'password_policy_weakened'], severity: 'critical' },
    },
  },
];
