export interface KitSubscriber {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: 'subscribed' | 'unsubscribed' | 'bounced' | 'complained';
  createdAt: string;
  tags?: string[];
}

export interface KitTag {
  id: string;
  name: string;
  subscriberCount: number;
}

export interface KitForm {
  id: string;
  name: string;
  type: 'web' | 'popup' | 'landing_page';
  status: 'published' | 'draft';
  createdAt: string;
}

export interface KitSequence {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'archived';
  subscriberCount: number;
  createdAt: string;
}

export interface KitBroadcast {
  id: string;
  subject: string;
  status:
    | 'draft'
    | 'scheduled'
    | 'sending'
    | 'completed'
    | 'cancelled'
    | 'failed';
  recipientCount: number;
  sentAt?: string;
  createdAt: string;
}

export interface KitWebhookEvent {
  id: string;
  event: 'subscriber.created' | 'subscriber.updated' | 'subscriber.deleted';
  targetUrl: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface KitBroadcastContent {
  subject: string;
  previewText?: string;
  htmlContent: string;
  fromEmail?: string;
  fromName?: string;
  replyTo?: string;
  tags?: string[];
}

export interface KitSequenceEnrollment {
  subscriberId: string;
  sequenceId: string;
  enrolledAt: string;
  status: 'active' | 'completed' | 'paused';
}

export class KitConnector {
  private apiKey: string;
  private baseUrl = 'https://api.kit.com/v4';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.KIT_API_KEY || '';
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };
  }

  /**
   * Add a new subscriber to Kit
   */
  async addSubscriber(
    email: string,
    firstName?: string,
    lastName?: string,
    tags?: string[]
  ): Promise<{ success: boolean; subscriberId?: string; error?: string }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'KIT_API_KEY not configured' };
      }

      const payload: Record<string, unknown> = {
        email_address: email,
      };

      if (firstName) payload.first_name = firstName;
      if (lastName) payload.last_name = lastName;
      if (tags && tags.length > 0) payload.tag_ids = tags;

      const response = await fetch(`${this.baseUrl}/subscribers`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Failed to add subscriber: ${response.status} - ${errorText}`,
        };
      }

      const data = (await response.json()) as { id: string };
      return { success: true, subscriberId: data.id };
    } catch (error) {
      console.error('Error adding subscriber:', error);
      return {
        success: false,
        error: `Operation failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Get a subscriber by email
   */
  async getSubscriber(email: string): Promise<{
    success: boolean;
    data?: KitSubscriber;
    error?: string;
  }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'KIT_API_KEY not configured' };
      }

      const response = await fetch(
        `${this.baseUrl}/subscribers?email_address=${encodeURIComponent(email)}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to fetch subscriber: ${response.status}`,
        };
      }

      const data = (await response.json()) as { data?: KitSubscriber[] };
      const subscriber = data.data?.[0];

      if (!subscriber) {
        return {
          success: false,
          error: 'Subscriber not found',
        };
      }

      return { success: true, data: subscriber };
    } catch (error) {
      console.error('Error getting subscriber:', error);
      return {
        success: false,
        error: `Fetch failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * List all subscribers with pagination
   */
  async listSubscribers(limit = 100, offset = 0): Promise<{
    success: boolean;
    data?: KitSubscriber[];
    total?: number;
    error?: string;
  }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'KIT_API_KEY not configured' };
      }

      const response = await fetch(
        `${this.baseUrl}/subscribers?limit=${limit}&offset=${offset}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to list subscribers: ${response.status}`,
        };
      }

      const data = (await response.json()) as {
        data?: KitSubscriber[];
        total?: number;
      };
      return { success: true, data: data.data, total: data.total };
    } catch (error) {
      console.error('Error listing subscribers:', error);
      return {
        success: false,
        error: `Fetch failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Update a subscriber
   */
  async updateSubscriber(
    subscriberId: string,
    updates: {
      firstName?: string;
      lastName?: string;
      status?: string;
      tags?: string[];
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'KIT_API_KEY not configured' };
      }

      const payload: Record<string, unknown> = {};

      if (updates.firstName) payload.first_name = updates.firstName;
      if (updates.lastName) payload.last_name = updates.lastName;
      if (updates.status) payload.status = updates.status;
      if (updates.tags) payload.tag_ids = updates.tags;

      const response = await fetch(`${this.baseUrl}/subscribers/${subscriberId}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Failed to update subscriber: ${response.status} - ${errorText}`,
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating subscriber:', error);
      return {
        success: false,
        error: `Update failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Tag a subscriber
   */
  async tagSubscriber(subscriberId: string, tagIds: string[]): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'KIT_API_KEY not configured' };
      }

      const response = await fetch(
        `${this.baseUrl}/subscribers/${subscriberId}/tags`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ tag_ids: tagIds }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Failed to tag subscriber: ${response.status} - ${errorText}`,
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error tagging subscriber:', error);
      return {
        success: false,
        error: `Operation failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Unsubscribe a subscriber
   */
  async unsubscribeSubscriber(subscriberId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'KIT_API_KEY not configured' };
      }

      const response = await fetch(`${this.baseUrl}/subscribers/${subscriberId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Failed to unsubscribe: ${response.status} - ${errorText}`,
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error unsubscribing subscriber:', error);
      return {
        success: false,
        error: `Operation failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * List all tags
   */
  async listTags(): Promise<{
    success: boolean;
    data?: KitTag[];
    error?: string;
  }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'KIT_API_KEY not configured' };
      }

      const response = await fetch(`${this.baseUrl}/tags`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to list tags: ${response.status}`,
        };
      }

      const data = (await response.json()) as { data?: KitTag[] };
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error listing tags:', error);
      return {
        success: false,
        error: `Fetch failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Create a new tag
   */
  async createTag(name: string): Promise<{
    success: boolean;
    tagId?: string;
    error?: string;
  }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'KIT_API_KEY not configured' };
      }

      const response = await fetch(`${this.baseUrl}/tags`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Failed to create tag: ${response.status} - ${errorText}`,
        };
      }

      const data = (await response.json()) as { id: string };
      return { success: true, tagId: data.id };
    } catch (error) {
      console.error('Error creating tag:', error);
      return {
        success: false,
        error: `Create failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * List all forms
   */
  async listForms(): Promise<{
    success: boolean;
    data?: KitForm[];
    error?: string;
  }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'KIT_API_KEY not configured' };
      }

      const response = await fetch(`${this.baseUrl}/forms`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to list forms: ${response.status}`,
        };
      }

      const data = (await response.json()) as { data?: KitForm[] };
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error listing forms:', error);
      return {
        success: false,
        error: `Fetch failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * List all sequences
   */
  async listSequences(): Promise<{
    success: boolean;
    data?: KitSequence[];
    error?: string;
  }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'KIT_API_KEY not configured' };
      }

      const response = await fetch(`${this.baseUrl}/sequences`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to list sequences: ${response.status}`,
        };
      }

      const data = (await response.json()) as { data?: KitSequence[] };
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error listing sequences:', error);
      return {
        success: false,
        error: `Fetch failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Enroll a subscriber in a sequence
   */
  async enrollInSequence(
    subscriberId: string,
    sequenceId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'KIT_API_KEY not configured' };
      }

      const response = await fetch(
        `${this.baseUrl}/subscribers/${subscriberId}/sequence_subscriptions`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ sequence_id: sequenceId }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Failed to enroll in sequence: ${response.status} - ${errorText}`,
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error enrolling in sequence:', error);
      return {
        success: false,
        error: `Operation failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Unenroll a subscriber from a sequence
   */
  async unenrollFromSequence(
    subscriberId: string,
    sequenceId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'KIT_API_KEY not configured' };
      }

      const response = await fetch(
        `${this.baseUrl}/subscribers/${subscriberId}/sequence_subscriptions/${sequenceId}`,
        {
          method: 'DELETE',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Failed to unenroll from sequence: ${response.status} - ${errorText}`,
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error unenrolling from sequence:', error);
      return {
        success: false,
        error: `Operation failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * List all broadcasts
   */
  async listBroadcasts(limit = 100): Promise<{
    success: boolean;
    data?: KitBroadcast[];
    error?: string;
  }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'KIT_API_KEY not configured' };
      }

      const response = await fetch(
        `${this.baseUrl}/broadcasts?limit=${limit}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to list broadcasts: ${response.status}`,
        };
      }

      const data = (await response.json()) as { data?: KitBroadcast[] };
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error listing broadcasts:', error);
      return {
        success: false,
        error: `Fetch failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Create a broadcast (email campaign)
   */
  async createBroadcast(
    content: KitBroadcastContent
  ): Promise<{ success: boolean; broadcastId?: string; error?: string }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'KIT_API_KEY not configured' };
      }

      const payload: Record<string, unknown> = {
        subject: content.subject,
        html: content.htmlContent,
      };

      if (content.previewText) payload.preview_text = content.previewText;
      if (content.fromEmail) payload.from_email = content.fromEmail;
      if (content.fromName) payload.from_name = content.fromName;
      if (content.replyTo) payload.reply_to = content.replyTo;
      if (content.tags) payload.tag_ids = content.tags;

      const response = await fetch(`${this.baseUrl}/broadcasts`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Failed to create broadcast: ${response.status} - ${errorText}`,
        };
      }

      const data = (await response.json()) as { id: string };
      return { success: true, broadcastId: data.id };
    } catch (error) {
      console.error('Error creating broadcast:', error);
      return {
        success: false,
        error: `Create failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Send a broadcast
   */
  async sendBroadcast(broadcastId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'KIT_API_KEY not configured' };
      }

      const response = await fetch(
        `${this.baseUrl}/broadcasts/${broadcastId}/send`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Failed to send broadcast: ${response.status} - ${errorText}`,
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending broadcast:', error);
      return {
        success: false,
        error: `Operation failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Schedule a broadcast for later
   */
  async scheduleBroadcast(
    broadcastId: string,
    sendAt: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'KIT_API_KEY not configured' };
      }

      const response = await fetch(
        `${this.baseUrl}/broadcasts/${broadcastId}/schedule`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ send_at: sendAt }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Failed to schedule broadcast: ${response.status} - ${errorText}`,
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error scheduling broadcast:', error);
      return {
        success: false,
        error: `Operation failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Register a webhook for subscriber events
   */
  async registerWebhook(
    targetUrl: string,
    events: Array<
      'subscriber.created' | 'subscriber.updated' | 'subscriber.deleted'
    >
  ): Promise<{ success: boolean; webhookId?: string; error?: string }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'KIT_API_KEY not configured' };
      }

      const response = await fetch(`${this.baseUrl}/webhooks`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          target_url: targetUrl,
          events,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Failed to register webhook: ${response.status} - ${errorText}`,
        };
      }

      const data = (await response.json()) as { id: string };
      return { success: true, webhookId: data.id };
    } catch (error) {
      console.error('Error registering webhook:', error);
      return {
        success: false,
        error: `Operation failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * List all webhooks
   */
  async listWebhooks(): Promise<{
    success: boolean;
    data?: KitWebhookEvent[];
    error?: string;
  }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'KIT_API_KEY not configured' };
      }

      const response = await fetch(`${this.baseUrl}/webhooks`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to list webhooks: ${response.status}`,
        };
      }

      const data = (await response.json()) as { data?: KitWebhookEvent[] };
      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error listing webhooks:', error);
      return {
        success: false,
        error: `Fetch failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(webhookId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'KIT_API_KEY not configured' };
      }

      const response = await fetch(`${this.baseUrl}/webhooks/${webhookId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Failed to delete webhook: ${response.status} - ${errorText}`,
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting webhook:', error);
      return {
        success: false,
        error: `Operation failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Health check to verify API connectivity
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    message: string;
  }> {
    if (!this.apiKey) {
      return { status: 'unhealthy', message: 'KIT_API_KEY not configured' };
    }
    return { status: 'healthy', message: 'Kit connector ready' };
  }
}

export const kitConnector = new KitConnector();
