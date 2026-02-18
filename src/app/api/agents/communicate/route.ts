/**
 * Agent Communication API Routes
 * GET: Communication status, active channels, message queue stats
 * POST: Send message or initiate handoff
 */

import { NextResponse } from 'next/server';
import { agentCommunicationBus } from '@/lib/agents/agent-communication';
import type { ApiResponse } from '@/types';
import type { MessagePriority, HandoffType } from '@/lib/agents/agent-communication';

export const dynamic = 'force-dynamic';

interface SendMessagePayload {
  action: 'message' | 'broadcast' | 'handoff';
  fromAgent: string;
  toAgent?: string;
  channel?: 'compliance' | 'risk' | 'travel' | 'crm' | 'infrastructure' | 'reporting' | 'escalation';
  message: string;
  priority?: MessagePriority;
  context?: Record<string, unknown>;
  handoffType?: HandoffType;
  reason?: string;
}

export async function GET(): Promise<Response> {
  try {
    const bus = agentCommunicationBus;
    const recentHandoffs = bus.getRecentHandoffs(5);
    const channelCounts = {
      compliance: bus.getChannelSubscriberCount('compliance'),
      risk: bus.getChannelSubscriberCount('risk'),
      travel: bus.getChannelSubscriberCount('travel'),
      crm: bus.getChannelSubscriberCount('crm'),
      infrastructure: bus.getChannelSubscriberCount('infrastructure'),
      reporting: bus.getChannelSubscriberCount('reporting'),
      escalation: bus.getChannelSubscriberCount('escalation'),
    };
    const messageQueueStats = bus.getMessageQueueStats();

    return NextResponse.json(
      {
        success: true,
        data: {
          status: 'operational',
          activeChannels: Object.keys(channelCounts).filter(
            (ch) => channelCounts[ch as keyof typeof channelCounts] > 0
          ),
          channels: channelCounts,
          messageQueueStats,
          recentHandoffs: recentHandoffs.map((h) => ({
            id: h.id,
            fromAgent: h.fromAgentId,
            toAgent: h.toAgentId,
            type: h.type,
            status: h.status,
            reason: h.reason,
            initiatedAt: h.initiatedAt.toISOString(),
            completedAt: h.completedAt?.toISOString(),
          })),
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date(),
      } as ApiResponse<Record<string, unknown>>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Agent communication GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch communication status',
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as SendMessagePayload;
    const { action, fromAgent, toAgent, channel, message, priority, context, handoffType, reason } = body;

    if (!action || !fromAgent || !message) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing required fields: action, fromAgent, message',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const bus = agentCommunicationBus;
    const msgPriority: MessagePriority = priority || 'normal';

    if (action === 'message') {
      if (!toAgent) {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing required field for message action: toAgent',
            timestamp: new Date(),
          } as ApiResponse<null>,
          { status: 400 }
        );
      }

      const msg = bus.sendMessage(fromAgent, toAgent, message, msgPriority);

      return NextResponse.json(
        {
          success: true,
          data: {
            messageId: msg.id,
            fromAgent: msg.fromAgentId,
            toAgent: msg.toAgentId,
            message: msg.message,
            priority: msg.priority,
            timestamp: msg.timestamp.toISOString(),
          },
          timestamp: new Date(),
        } as ApiResponse<Record<string, unknown>>,
        { status: 201 }
      );
    }

    if (action === 'broadcast') {
      if (!channel) {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing required field for broadcast action: channel',
            timestamp: new Date(),
          } as ApiResponse<null>,
          { status: 400 }
        );
      }

      const msg = bus.broadcast(
        fromAgent,
        channel as 'compliance' | 'risk' | 'travel' | 'crm' | 'infrastructure' | 'reporting' | 'escalation',
        message,
        msgPriority
      );

      const subscriberCount = bus.getChannelSubscriberCount(
        channel as 'compliance' | 'risk' | 'travel' | 'crm' | 'infrastructure' | 'reporting' | 'escalation'
      );

      return NextResponse.json(
        {
          success: true,
          data: {
            messageId: msg.id,
            fromAgent: msg.fromAgentId,
            channel: msg.channel,
            message: msg.message,
            priority: msg.priority,
            subscribersNotified: subscriberCount,
            timestamp: msg.timestamp.toISOString(),
          },
          timestamp: new Date(),
        } as ApiResponse<Record<string, unknown>>,
        { status: 201 }
      );
    }

    if (action === 'handoff') {
      if (!toAgent || !context) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Missing required fields for handoff action: toAgent, context',
            timestamp: new Date(),
          } as ApiResponse<null>,
          { status: 400 }
        );
      }

      const handoff = bus.requestHandoff(
        fromAgent,
        toAgent,
        context,
        reason,
        handoffType || 'task_completion'
      );

      return NextResponse.json(
        {
          success: true,
          data: {
            handoffId: handoff.id,
            fromAgent: handoff.fromAgentId,
            toAgent: handoff.toAgentId,
            type: handoff.type,
            status: handoff.status,
            reason: handoff.reason,
            initiatedAt: handoff.initiatedAt.toISOString(),
          },
          timestamp: new Date(),
        } as ApiResponse<Record<string, unknown>>,
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid action - must be message, broadcast, or handoff',
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 400 }
    );
  } catch (error) {
    console.error('Agent communication POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process agent communication request',
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
