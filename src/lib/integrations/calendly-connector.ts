export interface CalendlyEventType {
  id: string;
  name: string;
  slug: string;
  duration: number;
  description?: string;
  color?: string;
  timezone?: string;
}

export interface CalendlyEvent {
  id: string;
  eventTypeId: string;
  name: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'cancelled' | 'completed';
  invitees: Invitee[];
  uri: string;
}

export interface Invitee {
  id: string;
  email: string;
  fullName: string;
  status: 'active' | 'cancelled';
  responseStatus: 'accepted' | 'pending' | 'declined';
}

export interface ScheduledEvent {
  id: string;
  eventTypeId: string;
  startTime: string;
  endTime: string;
  inviteeEmail: string;
  inviteeName: string;
  status: 'scheduled' | 'cancelled';
  cancelledAt?: string;
}

export interface WebhookRegistration {
  webhookId: string;
  url: string;
  event: string;
  status: 'active' | 'inactive';
}

export class CalendlyConnector {
  private apiUrl = 'https://api.calendly.com/v1';
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  private getPreconfiguredEventTypes(): CalendlyEventType[] {
    return [
      {
        id: 'evt-001',
        name: 'Discovery Call',
        slug: 'discovery-call',
        duration: 30,
        description: 'Initial consultation to understand your GRC needs',
        color: '#3B82F6',
        timezone: 'UTC',
      },
      {
        id: 'evt-002',
        name: 'GRC Assessment Review',
        slug: 'grc-assessment-review',
        duration: 60,
        description: 'Deep-dive review of your GRC assessment results',
        color: '#10B981',
        timezone: 'UTC',
      },
      {
        id: 'evt-003',
        name: 'Executive Briefing',
        slug: 'executive-briefing',
        duration: 45,
        description: 'Executive-level briefing on travel risk and GRC',
        color: '#8B5CF6',
        timezone: 'UTC',
      },
      {
        id: 'evt-004',
        name: 'Travel Risk Consultation',
        slug: 'travel-risk-consultation',
        duration: 30,
        description: 'Consultation on travel risk assessment and mitigation',
        color: '#F59E0B',
        timezone: 'UTC',
      },
      {
        id: 'evt-005',
        name: 'Quarterly Business Review',
        slug: 'quarterly-business-review',
        duration: 90,
        description: 'Comprehensive quarterly review of all GRC initiatives',
        color: '#EC4899',
        timezone: 'UTC',
      },
    ];
  }

  async listEventTypes(): Promise<CalendlyEventType[]> {
    try {
      return this.getPreconfiguredEventTypes();
    } catch (error) {
      console.error('Error listing event types:', error);
      throw error;
    }
  }

  async getEventType(eventTypeId: string): Promise<CalendlyEventType> {
    try {
      const response = await fetch(
        `${this.apiUrl}/event_types/${eventTypeId}`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get event type: ${response.statusText}`);
      }

      const data = await response.json() as { resource: CalendlyEventType };
      return data.resource;
    } catch (error) {
      console.error(`Error getting event type ${eventTypeId}:`, error);
      throw error;
    }
  }

  async createEventType(
    name: string,
    duration: number,
    description?: string
  ): Promise<CalendlyEventType> {
    try {
      const response = await fetch(`${this.apiUrl}/event_types`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          name,
          duration_minutes: duration,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create event type: ${response.statusText}`);
      }

      const data = await response.json() as { resource: CalendlyEventType };
      return data.resource;
    } catch (error) {
      console.error('Error creating event type:', error);
      throw error;
    }
  }

  async listScheduledEvents(
    eventTypeId?: string,
    status?: 'scheduled' | 'cancelled' | 'completed'
  ): Promise<ScheduledEvent[]> {
    try {
      let url = `${this.apiUrl}/scheduled_events`;
      const params: string[] = [];

      if (eventTypeId) {
        params.push(`event_type=${eventTypeId}`);
      }
      if (status) {
        params.push(`status=${status}`);
      }

      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to list scheduled events: ${response.statusText}`
        );
      }

      const data = await response.json() as {
        collection: Array<{
          name: string;
          start_time: string;
          end_time: string;
          uri: string;
        }>;
      };

      return (data.collection || []).map((event, index) => ({
        id: `evt-${Date.now()}-${index}`,
        eventTypeId: eventTypeId || '',
        startTime: event.start_time,
        endTime: event.end_time,
        inviteeEmail: 'contact@example.com',
        inviteeName: event.name,
        status: 'scheduled',
      }));
    } catch (error) {
      console.error('Error listing scheduled events:', error);
      throw error;
    }
  }

  async getScheduledEvent(eventId: string): Promise<CalendlyEvent> {
    try {
      const response = await fetch(
        `${this.apiUrl}/scheduled_events/${eventId}`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to get scheduled event: ${response.statusText}`
        );
      }

      const data = await response.json() as {
        resource: {
          name: string;
          start_time: string;
          end_time: string;
          invitees: Array<{
            email: string;
            name: string;
            status: string;
          }>;
          uri: string;
        };
      };

      const resource = data.resource;
      return {
        id: eventId,
        eventTypeId: '',
        name: resource.name,
        startTime: resource.start_time,
        endTime: resource.end_time,
        status: 'scheduled',
        invitees: (resource.invitees || []).map((inv) => ({
          id: `invitee-${inv.email}`,
          email: inv.email,
          fullName: inv.name,
          status: 'active',
          responseStatus: 'accepted',
        })),
        uri: resource.uri,
      };
    } catch (error) {
      console.error(`Error getting scheduled event ${eventId}:`, error);
      throw error;
    }
  }

  async scheduleEvent(
    eventTypeId: string,
    inviteeEmail: string,
    inviteeName: string,
    startTime: string
  ): Promise<ScheduledEvent> {
    try {
      const response = await fetch(`${this.apiUrl}/scheduled_events`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          event_type: eventTypeId,
          invitee_email: inviteeEmail,
          invitee_name: inviteeName,
          start_time: startTime,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to schedule event: ${response.statusText}`);
      }

      const data = await response.json() as {
        resource: { uri: string; start_time: string; end_time: string };
      };

      const eventId = `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      return {
        id: eventId,
        eventTypeId,
        startTime: data.resource.start_time,
        endTime: data.resource.end_time,
        inviteeEmail,
        inviteeName,
        status: 'scheduled',
      };
    } catch (error) {
      console.error('Error scheduling event:', error);
      throw error;
    }
  }

  async cancelEvent(eventId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.apiUrl}/scheduled_events/${eventId}/cancellation`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            reason: 'cancelled_by_staff',
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to cancel event: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error(`Error cancelling event ${eventId}:`, error);
      throw error;
    }
  }

  async listInvitees(eventId: string): Promise<Invitee[]> {
    try {
      const response = await fetch(
        `${this.apiUrl}/scheduled_events/${eventId}/invitees`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to list invitees: ${response.statusText}`);
      }

      const data = await response.json() as {
        collection: Array<{
          email: string;
          name: string;
          status: string;
          response_status: string;
        }>;
      };

      return (data.collection || []).map((invitee) => ({
        id: `invitee-${invitee.email}`,
        email: invitee.email,
        fullName: invitee.name,
        status: invitee.status === 'active' ? 'active' : 'cancelled',
        responseStatus: invitee.response_status as
          | 'accepted'
          | 'pending'
          | 'declined',
      }));
    } catch (error) {
      console.error(`Error listing invitees for event ${eventId}:`, error);
      throw error;
    }
  }

  async registerWebhook(
    url: string,
    event: string
  ): Promise<WebhookRegistration> {
    try {
      const response = await fetch(`${this.apiUrl}/webhook_subscriptions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          url,
          events: [event],
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to register webhook: ${response.statusText}`);
      }

      const data = await response.json() as { resource: { uri: string } };
      const webhookId = data.resource.uri.split('/').pop() || '';

      return {
        webhookId,
        url,
        event,
        status: 'active',
      };
    } catch (error) {
      console.error('Error registering webhook:', error);
      throw error;
    }
  }

  async unregisterWebhook(webhookId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.apiUrl}/webhook_subscriptions/${webhookId}`,
        {
          method: 'DELETE',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to unregister webhook: ${response.statusText}`
        );
      }

      return true;
    } catch (error) {
      console.error(`Error unregistering webhook ${webhookId}:`, error);
      throw error;
    }
  }
}
