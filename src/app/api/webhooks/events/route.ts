/**
 * Incoming Webhook Receiver
 * POST /api/webhooks/events
 *
 * Accepts external webhook payloads from various sources:
 * - Airtable webhooks
 * - Slack events
 * - Generic JSON webhooks
 *
 * Routes to appropriate event bus channels
 * Supports optional HMAC signature verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { getEventBus, EventType } from '@/lib/events/event-bus';
import type { ApiResponse } from '@/types';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * Verify HMAC signature
 * Supports: Airtable, Slack, generic secret-based verification
 */
function verifySignature(
  request: NextRequest,
  body: string,
  sourceType: string,
  secret?: string
): boolean {
  // If no secret configured, skip verification (warning logged)
  if (!secret) {
    console.warn('[Webhook] No secret configured for signature verification - skipping');
    return true;
  }

  const timestamp = request.headers.get('x-airtable-timestamp') || request.headers.get('x-slack-request-timestamp') || request.headers.get('x-timestamp');
  const signature = request.headers.get('x-airtable-content-mac') || request.headers.get('x-slack-signature') || request.headers.get('x-signature');

  if (!signature) {
    console.warn('[Webhook] Missing signature header');
    return false;
  }

  let expectedSignature = '';

  if (sourceType === 'airtable') {
    // Airtable: HMAC-SHA256 of request body
    expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('base64');
  } else if (sourceType === 'slack') {
    // Slack: HMAC-SHA256 of "v0:timestamp:body"
    if (!timestamp) {
      return false;
    }
    const signatureBaseString = `v0:${timestamp}:${body}`;
    expectedSignature = 'v0=' + crypto
      .createHmac('sha256', secret)
      .update(signatureBaseString)
      .digest('hex');
  } else {
    // Generic: HMAC-SHA256 of request body
    expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
  }

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

/**
 * Parse Airtable webhook payload
 */
function parseAirtablePayload(payload: any): { eventType: EventType; eventPayload: any } | null {
  try {
    const { actionMetadata, createdTablesById, changedTablesById } = payload;

    // Detect change type and route accordingly
    if (payload.timestamp) {
      // Airtable base change
      if (changedTablesById) {
        // Table/record was updated
        const firstTableId = Object.keys(changedTablesById)[0];
        const tableChanges = changedTablesById[firstTableId];

        return {
          eventType: 'compliance.change',
          eventPayload: {
            frameworkId: firstTableId,
            frameworkName: `Airtable Table: ${firstTableId}`,
            changeType: 'control_update' as const,
            controlsAffected: tableChanges?.createdRecordsById ? Object.keys(tableChanges.createdRecordsById).length : 0,
            metadata: {
              airtableSource: true,
              tableId: firstTableId,
              changes: tableChanges,
            },
          },
        };
      }
    }

    return null;
  } catch (error) {
    console.error('[Webhook] Error parsing Airtable payload:', error);
    return null;
  }
}

/**
 * Parse Slack webhook payload
 */
function parseSlackPayload(payload: any): { eventType: EventType; eventPayload: any } | null {
  try {
    // Handle Slack Events API
    if (payload.event) {
      const { type, user, text, channel } = payload.event;

      // Map Slack events to our event types
      if (type === 'app_mention' || type === 'message') {
        // Could be a CRM update notification or alert
        if (text && (text.includes('crm') || text.includes('lead') || text.includes('opportunity'))) {
          return {
            eventType: 'crm.update',
            eventPayload: {
              crmId: `slack-${channel}-${user}`,
              recordType: 'lead' as const,
              action: 'updated' as const,
              recordName: text.substring(0, 100),
              updatedFields: ['slack_mention'],
              metadata: {
                slackChannel: channel,
                slackUser: user,
                slackText: text,
              },
            },
          };
        }

        // Could be a risk alert
        if (text && (text.includes('alert') || text.includes('risk') || text.includes('critical'))) {
          return {
            eventType: 'risk.threshold',
            eventPayload: {
              riskLevel: text.toLowerCase().includes('critical') ? 'critical' : 'high',
              previousLevel: 'medium' as const,
              riskScore: text.toLowerCase().includes('critical') ? 90 : 70,
              category: 'slack_alert',
              triggeredBy: 'slack_notification',
              metadata: {
                slackChannel: channel,
                slackUser: user,
                slackText: text,
              },
            },
          };
        }
      }
    }

    return null;
  } catch (error) {
    console.error('[Webhook] Error parsing Slack payload:', error);
    return null;
  }
}

/**
 * Parse generic webhook payload with event type mapping
 */
function parseGenericPayload(payload: any): { eventType: EventType; eventPayload: any } | null {
  try {
    const { eventType, data, metadata } = payload;

    // Direct event type specification
    if (eventType && data) {
      const validEventTypes: EventType[] = ['agent.completed', 'agent.failed', 'risk.threshold', 'compliance.change', 'travel.alert', 'crm.update', 'assessment.due', 'framework.updated'];

      if (validEventTypes.includes(eventType)) {
        return {
          eventType,
          eventPayload: {
            ...data,
            metadata: metadata || {},
          },
        };
      }
    }

    return null;
  } catch (error) {
    console.error('[Webhook] Error parsing generic payload:', error);
    return null;
  }
}

/**
 * POST /api/webhooks/events
 * Accept webhook payloads from external services
 *
 * Headers:
 *   X-Webhook-Source: "airtable" | "slack" | "generic" (default: "generic")
 *   X-Webhook-Secret: shared secret for HMAC verification (optional)
 *   X-Airtable-Timestamp: Airtable timestamp (for Airtable signature verification)
 *   X-Airtable-Content-MAC: Airtable HMAC signature
 *   X-Slack-Request-Timestamp: Slack request timestamp
 *   X-Slack-Signature: Slack signature
 *   X-Signature: Generic signature
 *   X-User-Id: User ID associated with webhook trigger (optional)
 *
 * Request body:
 * Depends on source type. See parseAirtablePayload, parseSlackPayload, parseGenericPayload
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Read request body
    const bodyText = await request.text();
    let body: any;

    try {
      body = JSON.parse(bodyText);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Get source type from header
    const sourceType = (request.headers.get('x-webhook-source') || 'generic').toLowerCase();
    const secret = request.headers.get('x-webhook-secret') || undefined;
    const userId = request.headers.get('x-user-id') || undefined;

    // Verify signature if secret is provided
    if (secret) {
      const isValid = verifySignature(request, bodyText, sourceType, secret);
      if (!isValid) {
        console.warn('[Webhook] Signature verification failed');
        return NextResponse.json(
          {
            success: false,
            error: 'Signature verification failed',
            timestamp: new Date(),
          } as ApiResponse<null>,
          { status: 401 }
        );
      }
    }

    // Parse payload based on source type
    let parsedEvent: { eventType: EventType; eventPayload: any } | null = null;

    if (sourceType === 'airtable') {
      parsedEvent = parseAirtablePayload(body);
    } else if (sourceType === 'slack') {
      // Handle Slack URL verification challenge
      if (body.type === 'url_verification') {
        return NextResponse.json(
          { challenge: body.challenge },
          { status: 200 }
        );
      }
      parsedEvent = parseSlackPayload(body);
    } else {
      // Generic or unknown source
      parsedEvent = parseGenericPayload(body);
    }

    // If parsing failed, return appropriate error
    if (!parsedEvent) {
      console.warn('[Webhook] Unable to parse payload for source:', sourceType);
      return NextResponse.json(
        {
          success: false,
          error: `Unable to parse payload for source type: ${sourceType}`,
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 422 }
      );
    }

    // Publish event to event bus
    const eventBus = getEventBus();
    const event = await eventBus.publish(parsedEvent.eventType, parsedEvent.eventPayload, {
      source: 'webhook',
      userId: userId || undefined,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          eventId: event.id,
          eventType: event.type,
          source: sourceType,
          timestamp: event.timestamp,
        },
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[Webhook] Error processing webhook:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: `Failed to process webhook: ${errorMessage}`,
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * Example webhook payloads for testing
 */
export const WEBHOOK_EXAMPLES = {
  airtable: {
    timestamp: new Date().toISOString(),
    actionMetadata: {
      sourceMetadata: {
        user: { id: 'usr123', email: 'user@example.com', name: 'Test User' },
        sourceModifiedApiBranding: null,
      },
      destinationMetadata: null,
      timestamp: Math.floor(Date.now() / 1000),
      willBeNotifiedOfDestinationsByCurrentRequest: false,
    },
    createdTablesById: {},
    changedTablesById: {
      'tbl123': {
        createdRecordsById: {},
        changedRecordsById: {
          'rec456': {
            changedMetadata: {},
            changedFieldsByFieldId: {
              'fld789': ['value_before', 'value_after'],
            },
          },
        },
        changedMetadata: { name: 'Compliance Controls' },
        destroyedFieldIds: [],
        changedFieldIds: ['fld789'],
      },
    },
    destroyedTableIds: [],
  },
  slack: {
    token: 'token_value',
    team_id: 'T123456',
    event: {
      type: 'app_mention',
      user: 'U123456',
      text: '<@U789> Alert: Critical risk detected in travel policies',
      ts: '1708169400.000100',
      channel: 'C123456',
      event_ts: '1708169400.000100',
    },
    type: 'event_callback',
    event_id: 'Ev123456',
    event_time: 1708169400,
  },
  generic: {
    eventType: 'risk.threshold',
    data: {
      riskLevel: 'critical',
      previousLevel: 'high',
      riskScore: 92,
      category: 'compliance',
      triggeredBy: 'external_webhook',
      metadata: { source: 'third_party_system' },
    },
    metadata: { requestId: 'req-123456' },
  },
};
