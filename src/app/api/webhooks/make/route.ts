/**
 * Make.com Webhook Receiver
 * Handles automation triggers and agent updates
 */

import { NextRequest } from 'next/server';
import { getRawRequestBody, verifyMakeSignature } from '@/lib/webhook-verify';
import { notifyAgentUpdate, notifyError } from '@/lib/slack-notify';

export const dynamic = 'force-dynamic';

// In-memory store for agent state (fallback when no database)
// In production, this would be persisted to a database
const agentStore = new Map<
  string,
  {
    id: string;
    status: string;
    roi: number;
    tasksCompleted: number;
    qualityScore: number;
    lastUpdated: Date;
  }
>();

interface MakeWebhookPayload {
  type?: string;
  id?: string;
  status?: string;
  roi?: number;
  tasksCompleted?: number;
  qualityScore?: number;
  [key: string]: unknown;
}

/**
 * Get agent from store
 */
export function getAgent(agentId: string) {
  return agentStore.get(agentId);
}

/**
 * Update agent in store
 */
export function updateAgent(
  agentId: string,
  updates: Partial<Omit<MakeWebhookPayload, 'type'>>
): boolean {
  const existing = agentStore.get(agentId);

  if (!existing) {
    // Create new agent entry
    agentStore.set(agentId, {
      id: agentId,
      status: (updates.status as string) || 'unknown',
      roi: (updates.roi as number) || 0,
      tasksCompleted: (updates.tasksCompleted as number) || 0,
      qualityScore: (updates.qualityScore as number) || 0,
      lastUpdated: new Date(),
    });
    return true;
  }

  // Update existing agent
  const updated = {
    ...existing,
    status: updates.status !== undefined ? (updates.status as string) : existing.status,
    roi: updates.roi !== undefined ? (updates.roi as number) : existing.roi,
    tasksCompleted:
      updates.tasksCompleted !== undefined ? (updates.tasksCompleted as number) : existing.tasksCompleted,
    qualityScore:
      updates.qualityScore !== undefined ? (updates.qualityScore as number) : existing.qualityScore,
    lastUpdated: new Date(),
  };

  agentStore.set(agentId, updated);
  return true;
}

/**
 * Get all agents
 */
export function getAllAgents() {
  return Array.from(agentStore.values());
}

export async function POST(req: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await getRawRequestBody(req);
    const signature = req.headers.get('X-Make-Signature');

    // Verify signature
    if (!verifyMakeSignature(rawBody, signature || undefined)) {
      console.warn('Invalid Make signature');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse payload
    let payload: MakeWebhookPayload;
    try {
      payload = JSON.parse(rawBody);
    } catch (error) {
      console.error('Failed to parse Make payload:', error);
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Handle agent.update events
    if (payload.type === 'agent.update' && payload.id) {
      const agentId = payload.id as string;

      // Update agent in memory store
      const updated = updateAgent(agentId, {
        status: payload.status,
        roi: payload.roi,
        tasksCompleted: payload.tasksCompleted,
        qualityScore: payload.qualityScore,
      });

      if (updated) {
        // Notify Slack
        const updates: Record<string, unknown> = {};
        if (payload.status !== undefined) updates.status = payload.status;
        if (payload.roi !== undefined) updates.roi = payload.roi;
        if (payload.tasksCompleted !== undefined) updates.tasksCompleted = payload.tasksCompleted;
        if (payload.qualityScore !== undefined) updates.qualityScore = payload.qualityScore;

        await notifyAgentUpdate(agentId, updates);

        return new Response(
          JSON.stringify({
            ok: true,
            message: `Agent ${agentId} updated`,
            agent: getAgent(agentId),
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Handle other webhook types here
    console.log('Make webhook received:', payload.type);

    return new Response(
      JSON.stringify({
        ok: true,
        message: 'Webhook processed',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Make webhook error:', error);
    await notifyError('Make Webhook', String(error));

    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
