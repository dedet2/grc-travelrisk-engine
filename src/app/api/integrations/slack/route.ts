import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

interface ChannelInfo {
  id: string;
  name: string;
  memberCount: number;
  messageCount: number;
  lastActivity: string;
}

interface WorkspaceInfo {
  name: string;
  connected: boolean;
  membersCount: number;
  botStatus: 'online' | 'offline' | 'idle';
}

interface SlackStatus extends ApiResponse {
  workspace: WorkspaceInfo;
  channels: ChannelInfo[];
  totalMessages: number;
  connectedChannels: number;
}

export async function GET(): Promise<NextResponse<SlackStatus>> {
  const channels: ChannelInfo[] = [
    {
      id: 'C001',
      name: 'grc-alerts',
      memberCount: 24,
      messageCount: 2847,
      lastActivity: new Date(Date.now() - 300000).toISOString(),
    },
    {
      id: 'C002',
      name: 'compliance-updates',
      memberCount: 18,
      messageCount: 1256,
      lastActivity: new Date(Date.now() - 900000).toISOString(),
    },
    {
      id: 'C003',
      name: 'risk-notifications',
      memberCount: 22,
      messageCount: 3421,
      lastActivity: new Date(Date.now() - 600000).toISOString(),
    },
    {
      id: 'C004',
      name: 'agent-status',
      memberCount: 12,
      messageCount: 5634,
      lastActivity: new Date(Date.now() - 60000).toISOString(),
    },
    {
      id: 'C005',
      name: 'incident-response',
      memberCount: 16,
      messageCount: 892,
      lastActivity: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 'C006',
      name: 'travel-advisories',
      memberCount: 14,
      messageCount: 654,
      lastActivity: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'C007',
      name: 'sales-pipeline',
      memberCount: 20,
      messageCount: 4128,
      lastActivity: new Date(Date.now() - 450000).toISOString(),
    },
  ];

  const totalMessages = channels.reduce(
    (sum, channel) => sum + channel.messageCount,
    0
  );

  const workspace: WorkspaceInfo = {
    name: 'GRC Travel Risk',
    connected: true,
    membersCount: 142,
    botStatus: 'online',
  };

  return NextResponse.json({
    success: true,
    message: 'Slack workspace status retrieved',
    data: {
      workspace,
      channels,
      totalMessages,
      connectedChannels: channels.length,
    },
  });
}

interface MessageRequest {
  channel: string;
  message: string;
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'info';
  threadTs?: string;
}

interface MessageResponse extends ApiResponse {
  messageId: string;
  channel: string;
  timestamp: string;
  severity?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<MessageResponse>> {
  try {
    const body = (await request.json()) as MessageRequest;
    const { channel, message, severity, threadTs } = body;

    if (!channel || !message) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: channel and message',
        },
        { status: 400 }
      );
    }

    const validChannels = [
      'grc-alerts',
      'compliance-updates',
      'risk-notifications',
      'agent-status',
      'incident-response',
      'travel-advisories',
      'sales-pipeline',
    ];

    const channelName = channel.replace(/^#/, '');
    if (!validChannels.includes(channelName)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid channel: ${channelName}`,
        },
        { status: 400 }
      );
    }

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now().toString();

    let formattedMessage = message;
    if (severity) {
      const severityEmojis: Record<string, string> = {
        critical: '🚨',
        high: '⚠️',
        medium: '⚡',
        low: 'ℹ️',
        info: '📢',
      };
      const prefix: Record<string, string> = {
        critical: '[CRITICAL]',
        high: '[HIGH]',
        medium: '[MEDIUM]',
        low: '[LOW]',
        info: '[INFO]',
      };
      formattedMessage =
        `${severityEmojis[severity] || ''} ${prefix[severity] || ''} ${message}`.trim();
    }

    const response: MessageResponse = {
      success: true,
      message: `Message sent to #${channelName}`,
      data: {
        messageId,
        channel: `#${channelName}`,
        timestamp,
        ...(severity && { severity }),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error sending Slack message:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to send message',
      },
      { status: 500 }
    );
  }
}
