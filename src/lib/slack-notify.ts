/**
 * Slack Notification Helper
 * Sends messages to Slack via webhook
 */

export interface SlackMessage {
  text?: string;
  blocks?: Array<Record<string, unknown>>;
  attachments?: Array<Record<string, unknown>>;
  thread_ts?: string;
}

/**
 * Check if Slack is configured
 */
export function isSlackConfigured(): boolean {
  return !!process.env.SLACK_WEBHOOK_URL;
}

/**
 * Send a simple text message to Slack
 */
export async function notifySlack(text: string): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('Slack webhook URL not configured');
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      console.error('Slack notification error:', response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending Slack notification:', error);
    return false;
  }
}

/**
 * Send a formatted message to Slack with blocks
 */
export async function notifySlackFormatted(message: SlackMessage): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('Slack webhook URL not configured');
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      console.error('Slack notification error:', response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending Slack notification:', error);
    return false;
  }
}

/**
 * Notify about a webhook event
 */
export async function notifyWebhookEvent(
  source: string,
  eventType: string,
  data: Record<string, unknown>
): Promise<boolean> {
  const timestamp = new Date().toISOString();
  const text = `Webhook Event: ${source} / ${eventType}\n${JSON.stringify(data, null, 2)}`;

  return notifySlack(`[${timestamp}] ${text}`);
}

/**
 * Notify about a customer event
 */
export async function notifyCustomerEvent(
  action: string,
  customerData: {
    email?: string;
    name?: string;
    product?: string;
    [key: string]: unknown;
  }
): Promise<boolean> {
  const text =
    `Customer ${action}: ${customerData.name || customerData.email || 'Unknown'} ` +
    `${customerData.product ? `- Product: ${customerData.product}` : ''}`;

  return notifySlack(text);
}

/**
 * Notify about an agent update
 */
export async function notifyAgentUpdate(
  agentId: string,
  updates: Record<string, unknown>
): Promise<boolean> {
  const text =
    `Agent updated: ${agentId}\n` +
    Object.entries(updates)
      .map(([key, value]) => `  ${key}: ${value}`)
      .join('\n');

  return notifySlack(text);
}

/**
 * Notify about an error
 */
export async function notifyError(
  source: string,
  error: string,
  context?: Record<string, unknown>
): Promise<boolean> {
  const message: SlackMessage = {
    attachments: [
      {
        color: 'danger',
        title: `Error in ${source}`,
        text: error,
        fields: context
          ? Object.entries(context).map(([key, value]) => ({
              title: key,
              value: String(value),
              short: true,
            }))
          : undefined,
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };

  return notifySlackFormatted(message);
}

/**
 * Notify about a successful operation
 */
export async function notifySuccess(title: string, details?: string): Promise<boolean> {
  const message: SlackMessage = {
    attachments: [
      {
        color: 'good',
        title,
        text: details,
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };

  return notifySlackFormatted(message);
}

/**
 * Notify with warning level
 */
export async function notifyWarning(title: string, details?: string): Promise<boolean> {
  const message: SlackMessage = {
    attachments: [
      {
        color: 'warning',
        title,
        text: details,
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };

  return notifySlackFormatted(message);
}
