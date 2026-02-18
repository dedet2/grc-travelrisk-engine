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

export class MakeConnector {
  private apiUrl = 'https://api.integromat.com/v1';
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
  ): Promise<{ executionId: string; status: string }> {
    try {
      const scenarios = this.getPreconfiguredScenarios();
      const scenario = scenarios.find((s) => s.id === scenarioId);

      if (!scenario) {
        throw new Error(`Scenario ${scenarioId} not found`);
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
        throw new Error(`Failed to trigger scenario: ${response.statusText}`);
      }

      const result = await response.json() as { id: string };
      return {
        executionId: result.id,
        status: 'queued',
      };
    } catch (error) {
      console.error(`Error triggering scenario ${scenarioId}:`, error);
      throw error;
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
  ): Promise<MakeWebhook> {
    try {
      const response = await fetch(
        `${this.apiUrl}/scenarios/${scenarioId}/webhooks`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ url }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create webhook: ${response.statusText}`);
      }

      const data = await response.json() as { id: string };
      return {
        id: data.id,
        scenarioId,
        url,
        enabled: true,
      };
    } catch (error) {
      console.error('Error creating webhook:', error);
      throw error;
    }
  }
}
