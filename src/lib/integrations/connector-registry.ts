import { apolloConnector } from './apollo-connector';
import { sendgridConnector } from './sendgrid-connector';
import { stripeConnector } from './stripe-connector';
import { weconnectConnector } from './weconnect-connector';
import { vibeKanbanConnector } from './vibekanban-connector';
import { MakeConnector } from './make-connector';

export interface ConnectorStatus {
  name: string;
  status: 'healthy' | 'unhealthy';
  message: string;
  lastChecked: string;
}

export interface RegistryHealthReport {
  timestamp: string;
  overallStatus: 'healthy' | 'unhealthy' | 'degraded';
  connectors: ConnectorStatus[];
  failureCount: number;
}

export interface ConnectorMetrics {
  name: string;
  requestsTotal: number;
  requestsSuccess: number;
  requestsError: number;
  successRate: number;
  lastError?: string;
  lastErrorTime?: string;
}

export class ConnectorRegistry {
  private connectors: Map<
    string,
    {
      healthCheck: () => Promise<{ status: string; message: string }>;
      name: string;
    }
  > = new Map();

  private metrics: Map<string, ConnectorMetrics> = new Map();
  private makeConnector: MakeConnector;

  constructor() {
    this.makeConnector = new MakeConnector();
    this.initializeConnectors();
  }

  private initializeConnectors(): void {
    this.connectors.set('apollo', {
      name: 'Apollo.io',
      healthCheck: () => apolloConnector.healthCheck(),
    });

    this.connectors.set('sendgrid', {
      name: 'SendGrid',
      healthCheck: () => sendgridConnector.healthCheck(),
    });

    this.connectors.set('stripe', {
      name: 'Stripe',
      healthCheck: () => stripeConnector.healthCheck(),
    });

    this.connectors.set('weconnect', {
      name: 'WeConnect',
      healthCheck: () => weconnectConnector.healthCheck(),
    });

    this.connectors.set('vibekanban', {
      name: 'VibeKanban',
      healthCheck: () => vibeKanbanConnector.healthCheck(),
    });

    this.connectors.set('make', {
      name: 'Make.com',
      healthCheck: () => this.makeConnector.healthCheck(),
    });

    // Initialize metrics for each connector
    this.connectors.forEach((_, connectorKey) => {
      const connectorName = this.connectors.get(connectorKey)?.name || connectorKey;
      this.metrics.set(connectorKey, {
        name: connectorName,
        requestsTotal: 0,
        requestsSuccess: 0,
        requestsError: 0,
        successRate: 0,
      });
    });
  }

  async runHealthCheck(): Promise<RegistryHealthReport> {
    const results: ConnectorStatus[] = [];
    let failureCount = 0;

    const healthCheckPromises = Array.from(this.connectors.entries()).map(
      async ([key, connector]) => {
        try {
          const healthStatus = await connector.healthCheck();
          const status: ConnectorStatus = {
            name: connector.name,
            status: (healthStatus.status as 'healthy' | 'unhealthy') || 'unhealthy',
            message: healthStatus.message || 'Unknown status',
            lastChecked: new Date().toISOString(),
          };

          if (status.status === 'unhealthy') {
            failureCount++;
          }

          results.push(status);
        } catch (error) {
          failureCount++;
          results.push({
            name: connector.name,
            status: 'unhealthy',
            message: `Health check failed: ${error instanceof Error ? error.message : String(error)}`,
            lastChecked: new Date().toISOString(),
          });
        }
      }
    );

    await Promise.all(healthCheckPromises);

    const overallStatus =
      failureCount === 0
        ? 'healthy'
        : failureCount < this.connectors.size
          ? 'degraded'
          : 'unhealthy';

    return {
      timestamp: new Date().toISOString(),
      overallStatus,
      connectors: results.sort((a, b) => a.name.localeCompare(b.name)),
      failureCount,
    };
  }

  recordRequest(
    connectorKey: string,
    success: boolean,
    errorMessage?: string
  ): void {
    const metrics = this.metrics.get(connectorKey);
    if (!metrics) return;

    metrics.requestsTotal++;
    if (success) {
      metrics.requestsSuccess++;
    } else {
      metrics.requestsError++;
      metrics.lastError = errorMessage;
      metrics.lastErrorTime = new Date().toISOString();
    }

    metrics.successRate =
      metrics.requestsTotal > 0
        ? (metrics.requestsSuccess / metrics.requestsTotal) * 100
        : 0;
  }

  getMetrics(connectorKey?: string): ConnectorMetrics[] {
    if (connectorKey) {
      const metric = this.metrics.get(connectorKey);
      return metric ? [metric] : [];
    }

    return Array.from(this.metrics.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  getConnector(connectorKey: string): unknown {
    switch (connectorKey) {
      case 'apollo':
        return apolloConnector;
      case 'sendgrid':
        return sendgridConnector;
      case 'stripe':
        return stripeConnector;
      case 'weconnect':
        return weconnectConnector;
      case 'make':
        return this.makeConnector;
      default:
        return null;
    }
  }

  listConnectors(): Array<{ key: string; name: string }> {
    return Array.from(this.connectors.entries()).map(([key, connector]) => ({
      key,
      name: connector.name,
    }));
  }

  async shutdown(): Promise<void> {
    console.log('Shutting down connector registry...');
    // Perform any cleanup operations
    this.metrics.clear();
  }
}

export const connectorRegistry = new ConnectorRegistry();
