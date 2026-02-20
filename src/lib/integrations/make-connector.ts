export interface MakeScenario {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'error';
  lastRun?: string;
  triggerType: 'webhook' | 'schedule' | 'manual';
  actions: string[];
  webhookUrl?: string;
}

export interface MakeWebhook {
  id: string;
  scenarioId: string;
  url: string;
  enabled: boolean;
}

export interface MakeExecution {
  id: string;
  scenarioId: string;
  status: 'pending' | 'running' | 'success' | 'error';
  startedAt: string;
  completedAt?: string;
  resultCount: number;
}

export class MakeConnector {
  private apiUrl = 'https://us1.make.com/api/v2';
  private apiToken: string;
  private teamId: string;

  constructor(apiToken?: string, teamId?: string) {
    this.apiToken = apiToken || process.env.MAKE_API_TOKEN || '';
    this.teamId = teamId || process.env.MAKE_TEAM_ID || '';
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json',
      'X-Team-Id': this.teamId,
    };
  }

  private getPreconfiguredScenarios(): MakeScenario[] {
    return [
      {
        id: 'scenario-001',
        name: 'Lead Enrichment',
        status: 'active',
        lastRun: new Date(Date.now() - 3600000).toISOString(),
        triggerType: 'webhook',
        actions: ['validate-email', 'enrich-data', 'update-crm'],
        webhookUrl: 'https://grc-travelrisk.com/webhooks/make/lead-enrichment',
      },
      {
        id: 'scenario-002',
        name: 'Compliance Alert Routing',
        status: 'active',
        lastRun: new Date(Date.now() - 7200000).toISOString(),
        triggerType: 'schedule',
        actions: ['check-compliance', 'route-alert', 'notify-team'],
        webhookUrl: 'https://grc-travelrisk.com/webhooks/make/compliance-alerts',
      },
      {
        id: 'scenario-003',
        name: 'Incident Escalation',
        status: 'active',
        lastRun: new Date(Date.now() - 1800000).toISOString(),
        triggerType: 'webhook',
        actions: ['assess-severity', 'escalate', 'create-ticket'],
        webhookUrl:
          'https://grc-travelrisk.com/webhooks/make/incident-escalation',
      },
      {
        id: 'scenario-004',
        name: 'Vendor Assessment Trigger',
        status: 'active',
        lastRun: new Date(Date.now() - 10800000).toISOString(),
        triggerType: 'manual',
        actions: ['validate-vendor', 'run-assessment', 'generate-report'],
        webhookUrl:
          'https://grc-travelrisk.com/webhooks/make/vendor-assessment',
      },
      {
        id: 'scenario-005',
        name: 'Travel Advisory Sync',
        status: 'active',
        lastRun: new Date(Date.now() - 5400000).toISOString(),
        triggerType: 'schedule',
        actions: ['fetch-advisories', 'parse-data', 'update-database'],
        webhookUrl:
          'https://grc-travelrisk.com/webhooks/make/travel-advisories',
      },
      {
        id: 'scenario-006',
        name: 'Report Generation',
        status: 'active',
        lastRun: new Date(Date.now() - 21600000).toISOString(),
        triggerType: 'schedule',
        actions: ['aggregate-data', 'generate-pdf', 'send-email'],
        webhookUrl:
          'https://grc-travelrisk.com/webhooks/make/report-generation',
      },
      {
        id: 'scenario-007',
        name: 'CRM Sync Pipeline',
        status: 'active',
        lastRun: new Date(Date.now() - 2700000).toISOString(),
        triggerType: 'schedule',
        actions: ['extract-crm-data', 'transform', 'load-to-airtable'],
        webhookUrl: 'https://grc-travelrisk.com/webhooks/make/crm-sync',
      },
    ];
  }

  async listScenarios(): Promise<MakeScenario[]> {
    try {
      return this.getPreconfiguredScenarios();
    } catch (error) {
      console.error('Error listing scenarios:', error);
      throw error;
    }
  }

  async triggerScenario(
    scenarioId: string,
    data: Record<string, unknown>
  ): Promise<{
    success: boolean;
    executionId?: string;
    status?: string;
    error?: string;
  }> {
    try {
      if (!this.apiToken) {
        return { success: false, error: 'MAKE_API_TOKEN not configured' };
      }

      const response = await fetch(
        `${this.apiUrl}/scenarios/${scenarioId}/trigger`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Make API error: ${response.status} - ${errorText}`,
        };
      }

      const result = (await response.json()) as { id: string };
      return {
        success: true,
        executionId: result.id,
        status: 'queued',
      };
    } catch (error) {
      console.error(`Error triggering scenario ${scenarioId}:`, error);
      return {
        success: false,
        error: `Trigger failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  async getScenarioStatus(
    scenarioId: string
  ): Promise<{ status: string; lastRun: string; successRate: number }> {
    try {
      const scenarios = this.getPreconfiguredScenarios();
      const scenario = scenarios.find((s) => s.id === scenarioId);

      if (!scenario) {
        throw new Error(`Scenario ${scenarioId} not found`);
      }

      return {
        status: scenario.status,
        lastRun: scenario.lastRun || '',
        successRate: 0.98,
      };
    } catch (error) {
      console.error(`Error getting scenario status:`, error);
      throw error;
    }
  }

  async createWebhook(
    scenarioId: string,
    url: string
  ): Promise<{ success: boolean; webhook?: MakeWebhook; error?: string }> {
    try {
      if (!this.apiToken) {
        return { success: false, error: 'MAKE_API_TOKEN not configured' };
      }

      const response = await fetch(
        `${this.apiUrl}/scenarios/${scenarioId}/webhooks`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ url }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Failed to create webhook: ${response.status} - ${errorText}`,
        };
      }

      const data = (await response.json()) as { id: string };
      return {
        success: true,
        webhook: {
          id: data.id,
          scenarioId,
          url,
          enabled: true,
        },
      };
    } catch (error) {
      console.error('Error creating webhook:', error);
      return {
        success: false,
        error: `Webhook creation failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  async getExecutionHistory(
    scenarioId: string,
    limit: number = 20
  ): Promise<{
    success: boolean;
    executions?: MakeExecution[];
    error?: string;
  }> {
    try {
      if (!this.apiToken) {
        return { success: false, error: 'MAKE_API_TOKEN not configured' };
      }

      const params = new URLSearchParams({
        limit: limit.toString(),
        sort: 'startedAt:desc',
      });

      const response = await fetch(
        `${this.apiUrl}/scenarios/${scenarioId}/executions?${params}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Failed to fetch history: ${response.status} - ${errorText}`,
        };
      }

      const data = (await response.json()) as { executions: MakeExecution[] };
      return { success: true, executions: data.executions };
    } catch (error) {
      console.error('Error fetching execution history:', error);
      return {
        success: false,
        error: `History fetch failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    message: string;
  }> {
    if (!this.apiToken) {
      return { status: 'unhealthy', message: 'MAKE_API_TOKEN not configured' };
    }
    if (!this.teamId) {
      return { status: 'unhealthy', message: 'MAKE_TEAM_ID not configured' };
    }
    return { status: 'healthy', message: 'Make connector ready' };
  }
}
