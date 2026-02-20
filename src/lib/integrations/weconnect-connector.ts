export interface WeConnectCampaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
  stats?: WeConnectCampaignStats;
}

export interface WeConnectCampaignStats {
  totalInvites: number;
  acceptedInvites: number;
  pendingInvites: number;
  rejectedInvites: number;
  acceptanceRate: number;
  lastUpdated: string;
}

export interface WeConnectConnectionRequest {
  id: string;
  linkedinProfileUrl: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  sentAt: string;
  respondedAt?: string;
  campaignId: string;
}

export interface WeConnectProfile {
  id: string;
  linkedinUrl: string;
  name: string;
  headline: string;
  company: string;
  location?: string;
}

export class WeConnectConnector {
  private apiKey: string;
  private baseUrl = 'https://api.we-connect.io';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.WECONNECT_API_KEY || '';
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  async getCampaignStats(
    campaignId: string
  ): Promise<{
    success: boolean;
    campaign?: WeConnectCampaign;
    error?: string;
  }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'WECONNECT_API_KEY not configured' };
      }

      const response = await fetch(
        `${this.baseUrl}/v1/campaigns/${campaignId}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `WeConnect API error: ${response.status} - ${errorText}`,
        };
      }

      const campaign = (await response.json()) as WeConnectCampaign;
      return { success: true, campaign };
    } catch (error) {
      console.error('Error fetching campaign stats:', error);
      return {
        success: false,
        error: `Fetch failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  async getConnectionRequestsStatus(
    campaignId: string
  ): Promise<{
    success: boolean;
    requests?: WeConnectConnectionRequest[];
    summary?: {
      total: number;
      accepted: number;
      pending: number;
      rejected: number;
    };
    error?: string;
  }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'WECONNECT_API_KEY not configured' };
      }

      const response = await fetch(
        `${this.baseUrl}/v1/campaigns/${campaignId}/connection-requests`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Failed to fetch requests: ${response.status} - ${errorText}`,
        };
      }

      const data = (await response.json()) as {
        requests: WeConnectConnectionRequest[];
      };
      const requests = data.requests;

      const summary = {
        total: requests.length,
        accepted: requests.filter((r) => r.status === 'accepted').length,
        pending: requests.filter((r) => r.status === 'pending').length,
        rejected: requests.filter((r) => r.status === 'rejected').length,
      };

      return {
        success: true,
        requests,
        summary,
      };
    } catch (error) {
      console.error('Error fetching connection requests:', error);
      return {
        success: false,
        error: `Fetch failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  async sendConnectionRequest(
    campaignId: string,
    linkedinProfileUrl: string,
    message?: string
  ): Promise<{
    success: boolean;
    requestId?: string;
    error?: string;
  }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'WECONNECT_API_KEY not configured' };
      }

      const response = await fetch(
        `${this.baseUrl}/v1/campaigns/${campaignId}/send-request`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            linkedinProfileUrl,
            message,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Failed to send request: ${response.status} - ${errorText}`,
        };
      }

      const data = (await response.json()) as { id: string };
      return { success: true, requestId: data.id };
    } catch (error) {
      console.error('Error sending connection request:', error);
      return {
        success: false,
        error: `Request send failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  async listCampaigns(): Promise<{
    success: boolean;
    campaigns?: WeConnectCampaign[];
    error?: string;
  }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'WECONNECT_API_KEY not configured' };
      }

      const response = await fetch(
        `${this.baseUrl}/v1/campaigns`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Failed to list campaigns: ${response.status} - ${errorText}`,
        };
      }

      const data = (await response.json()) as { campaigns: WeConnectCampaign[] };
      return { success: true, campaigns: data.campaigns };
    } catch (error) {
      console.error('Error listing campaigns:', error);
      return {
        success: false,
        error: `List failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    message: string;
  }> {
    if (!this.apiKey) {
      return { status: 'unhealthy', message: 'WECONNECT_API_KEY not configured' };
    }
    return { status: 'healthy', message: 'WeConnect connector ready' };
  }
}

export const weconnectConnector = new WeConnectConnector();
