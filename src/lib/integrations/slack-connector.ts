export interface SlackMessage {
  channel: string;
  text: string;
  ts?: string;
  threadTs?: string;
}

export interface SlackChannel {
  id: string;
  name: string;
  memberCount: number;
  messageCount: number;
  lastActivity: string;
  purpose: string;
}

export interface AlertTemplate {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  emoji: string;
  color: string;
  prefix: string;
}

export class SlackConnector {
  private apiUrl = 'https://slack.com/api';
  private token: string;

  private preconfiguredChannels: SlackChannel[] = [
    {
      id: 'C001',
      name: 'grc-alerts',
      memberCount: 24,
      messageCount: 2847,
      lastActivity: new Date(Date.now() - 300000).toISOString(),
      purpose: 'Critical GRC alerts and notifications',
    },
    {
      id: 'C002',
      name: 'compliance-updates',
      memberCount: 18,
      messageCount: 1256,
      lastActivity: new Date(Date.now() - 900000).toISOString(),
      purpose: 'Compliance policy changes and updates',
    },
    {
      id: 'C003',
      name: 'risk-notifications',
      memberCount: 22,
      messageCount: 3421,
      lastActivity: new Date(Date.now() - 600000).toISOString(),
      purpose: 'Risk assessment results and notifications',
    },
    {
      id: 'C004',
      name: 'agent-status',
      memberCount: 12,
      messageCount: 5634,
      lastActivity: new Date(Date.now() - 60000).toISOString(),
      purpose: 'AI agent deployment and status updates',
    },
    {
      id: 'C005',
      name: 'incident-response',
      memberCount: 16,
      messageCount: 892,
      lastActivity: new Date(Date.now() - 1800000).toISOString(),
      purpose: 'Security incident response coordination',
    },
    {
      id: 'C006',
      name: 'travel-advisories',
      memberCount: 14,
      messageCount: 654,
      lastActivity: new Date(Date.now() - 3600000).toISOString(),
      purpose: 'Travel risk and advisory updates',
    },
    {
      id: 'C007',
      name: 'sales-pipeline',
      memberCount: 20,
      messageCount: 4128,
      lastActivity: new Date(Date.now() - 450000).toISOString(),
      purpose: 'Sales pipeline and lead tracking',
    },
  ];

  private alertTemplates: Record<string, AlertTemplate> = {
    critical: {
      severity: 'critical',
      emoji: '🚨',
      color: '#FF0000',
      prefix: '[CRITICAL]',
    },
    high: {
      severity: 'high',
      emoji: '⚠️',
      color: '#FF9900',
      prefix: '[HIGH]',
    },
    medium: {
      severity: 'medium',
      emoji: '⚡',
      color: '#FFCC00',
      prefix: '[MEDIUM]',
    },
    low: {
      severity: 'low',
      emoji: 'ℹ️',
      color: '#0099FF',
      prefix: '[LOW]',
    },
    info: {
      severity: 'info',
      emoji: '📢',
      color: '#00AA44',
      prefix: '[INFO]',
    },
  };

  constructor(token: string) {
    this.token = token;
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  async sendMessage(channel: string, message: string): Promise<SlackMessage> {
    try {
      const response = await fetch(`${this.apiUrl}/chat.postMessage`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          channel,
          text: message,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      const data = await response.json() as {
        ts: string;
      };
      return {
        channel,
        text: message,
        ts: data.ts,
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async sendAlert(
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info',
    message: string
  ): Promise<SlackMessage> {
    const template = this.alertTemplates[severity];
    const channel =
      severity === 'critical' ? '#grc-alerts' : '#risk-notifications';

    const formattedMessage = `${template.emoji} ${template.prefix} ${message}`;
    return this.sendMessage(channel, formattedMessage);
  }

  async postToThread(
    channel: string,
    threadTs: string,
    message: string
  ): Promise<SlackMessage> {
    try {
      const response = await fetch(`${this.apiUrl}/chat.postMessage`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          channel,
          text: message,
          thread_ts: threadTs,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to post to thread: ${response.statusText}`);
      }

      const data = await response.json() as {
        ts: string;
      };
      return {
        channel,
        text: message,
        threadTs,
        ts: data.ts,
      };
    } catch (error) {
      console.error('Error posting to thread:', error);
      throw error;
    }
  }

  async createChannel(name: string): Promise<SlackChannel> {
    try {
      const response = await fetch(`${this.apiUrl}/conversations.create`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          name: name.toLowerCase().replace(/\s+/g, '-'),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create channel: ${response.statusText}`);
      }

      const data = await response.json() as {
        channel: {
          id: string;
          name: string;
        };
      };
      return {
        id: data.channel.id,
        name: data.channel.name,
        memberCount: 1,
        messageCount: 0,
        lastActivity: new Date().toISOString(),
        purpose: '',
      };
    } catch (error) {
      console.error('Error creating channel:', error);
      throw error;
    }
  }

  async getChannelHistory(
    channel: string
  ): Promise<Array<{ text: string; ts: string; user: string }>> {
    try {
      const response = await fetch(
        `${this.apiUrl}/conversations.history?channel=${channel}&limit=50`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get channel history: ${response.statusText}`);
      }

      const data = await response.json() as {
        messages: Array<{ text: string; ts: string; user: string }>;
      };
      return data.messages;
    } catch (error) {
      console.error('Error getting channel history:', error);
      throw error;
    }
  }

  async addReaction(
    channel: string,
    timestamp: string,
    emoji: string
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/reactions.add`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          channel,
          timestamp,
          name: emoji,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add reaction: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  }

  getPreconfiguredChannels(): SlackChannel[] {
    return this.preconfiguredChannels;
  }

  getAlertTemplate(severity: string): AlertTemplate | undefined {
    return this.alertTemplates[
      severity as keyof typeof this.alertTemplates
    ];
  }
}
