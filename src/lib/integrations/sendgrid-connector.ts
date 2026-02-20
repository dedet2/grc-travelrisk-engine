export interface SendGridContact {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  country?: string;
  city?: string;
}

export interface SendGridEmailMessage {
  to: SendGridContact[];
  from: {
    email: string;
    name?: string;
  };
  subject: string;
  html: string;
  text?: string;
  template_id?: string;
  dynamic_template_data?: Record<string, unknown>;
  reply_to?: {
    email: string;
    name?: string;
  };
}

export interface SendGridListResponse {
  id: string;
  name: string;
  contact_count: number;
}

export interface SendGridContactListResponse {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export class SendGridConnector {
  private apiKey: string;
  private baseUrl = 'https://api.sendgrid.com/v3';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.SENDGRID_API_KEY || '';
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  async sendTransactionalEmail(
    message: SendGridEmailMessage
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'SENDGRID_API_KEY not configured' };
      }

      const payload = {
        personalizations: [
          {
            to: message.to.map((contact) => ({
              email: contact.email,
              name: contact.first_name
                ? `${contact.first_name} ${contact.last_name || ''}`
                : undefined,
            })),
          },
        ],
        from: {
          email: message.from.email,
          name: message.from.name,
        },
        subject: message.subject,
        content: [
          {
            type: 'text/html',
            value: message.html,
          },
        ],
        reply_to: message.reply_to,
        custom_args: {
          sent_at: new Date().toISOString(),
        },
      };

      const response = await fetch(
        `${this.baseUrl}/mail/send`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `SendGrid API error: ${response.status} - ${errorText}`,
        };
      }

      const messageId = response.headers.get('x-message-id') || 'unknown';
      return { success: true, messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: `Send failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  async addContactToList(
    listId: string,
    contacts: SendGridContact[]
  ): Promise<{ success: boolean; jobId?: string; error?: string }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'SENDGRID_API_KEY not configured' };
      }

      const response = await fetch(
        `${this.baseUrl}/marketing/contacts`,
        {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify({
            list_ids: [listId],
            contacts: contacts.map((contact) => ({
              email: contact.email,
              first_name: contact.first_name,
              last_name: contact.last_name,
              phone_number: contact.phone,
              country: contact.country,
              city: contact.city,
            })),
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Failed to add contacts: ${response.status} - ${errorText}`,
        };
      }

      const data = (await response.json()) as { job_id: string };
      return { success: true, jobId: data.job_id };
    } catch (error) {
      console.error('Error adding contacts to list:', error);
      return {
        success: false,
        error: `Operation failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  async getList(
    listId: string
  ): Promise<{ success: boolean; data?: SendGridListResponse; error?: string }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'SENDGRID_API_KEY not configured' };
      }

      const response = await fetch(
        `${this.baseUrl}/marketing/lists/${listId}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to fetch list: ${response.status}`,
        };
      }

      const data = (await response.json()) as SendGridListResponse;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching list:', error);
      return {
        success: false,
        error: `Fetch failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  async createList(
    name: string
  ): Promise<{ success: boolean; listId?: string; error?: string }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'SENDGRID_API_KEY not configured' };
      }

      const response = await fetch(
        `${this.baseUrl}/marketing/lists`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ name }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Failed to create list: ${response.status} - ${errorText}`,
        };
      }

      const data = (await response.json()) as { id: string };
      return { success: true, listId: data.id };
    } catch (error) {
      console.error('Error creating list:', error);
      return {
        success: false,
        error: `Create failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    message: string;
  }> {
    if (!this.apiKey) {
      return { status: 'unhealthy', message: 'SENDGRID_API_KEY not configured' };
    }
    return { status: 'healthy', message: 'SendGrid connector ready' };
  }
}

export const sendgridConnector = new SendGridConnector();
