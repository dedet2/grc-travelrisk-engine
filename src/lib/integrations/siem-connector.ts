/**
 * SIEM Connector Framework
 * Abstract base class and concrete implementations for SIEM integrations
 * Supports: Splunk, QRadar, Azure Sentinel
 */

export type SIEMType = 'splunk' | 'qradar' | 'sentinel';
export type SIEMConnectorStatus = 'connected' | 'disconnected' | 'error' | 'testing';

export interface SIEMEvent {
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  eventType: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface SIEMConnectorConfig {
  name: string;
  type: SIEMType;
  status: SIEMConnectorStatus;
  lastSync?: Date;
  eventsSent: number;
  config: Record<string, any>;
  errorMessage?: string;
}

/**
 * Abstract SIEM Connector base class
 */
export abstract class SIEMConnector {
  protected name: string;
  protected type: SIEMType;
  protected status: SIEMConnectorStatus = 'disconnected';
  protected lastSync?: Date;
  protected eventsSent: number = 0;
  protected config: Record<string, any>;
  protected errorMessage?: string;

  constructor(name: string, type: SIEMType, config: Record<string, any>) {
    this.name = name;
    this.type = type;
    this.config = config;
  }

  /**
   * Connect to SIEM system
   */
  abstract connect(): Promise<void>;

  /**
   * Disconnect from SIEM system
   */
  abstract disconnect(): Promise<void>;

  /**
   * Send event to SIEM
   */
  abstract sendEvent(event: SIEMEvent): Promise<void>;

  /**
   * Get connector status
   */
  getStatus(): SIEMConnectorConfig {
    return {
      name: this.name,
      type: this.type,
      status: this.status,
      lastSync: this.lastSync,
      eventsSent: this.eventsSent,
      config: this.config,
      errorMessage: this.errorMessage,
    };
  }

  /**
   * Test connection
   */
  abstract testConnection(): Promise<boolean>;

  /**
   * Reset error state
   */
  protected clearError(): void {
    this.errorMessage = undefined;
  }

  /**
   * Set error state
   */
  protected setError(message: string): void {
    this.errorMessage = message;
    this.status = 'error';
  }
}

/**
 * Splunk Connector
 * Sends events to Splunk HEC (HTTP Event Collector)
 */
export class SplunkConnector extends SIEMConnector {
  private connected: boolean = false;

  constructor(config: Record<string, any>) {
    super('Splunk', 'splunk', config);
  }

  async connect(): Promise<void> {
    try {
      this.clearError();
      // Validate required config
      if (!this.config.hecUrl || !this.config.hecToken) {
        throw new Error('Missing required config: hecUrl, hecToken');
      }

      // Test connection
      const isValid = await this.testConnection();
      if (!isValid) {
        throw new Error('Failed to authenticate with Splunk');
      }

      this.connected = true;
      this.status = 'connected';
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Connection failed');
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.status = 'disconnected';
  }

  async sendEvent(event: SIEMEvent): Promise<void> {
    if (!this.connected) {
      throw new Error('Splunk connector not connected');
    }

    try {
      // Format event for Splunk HEC
      const splunkEvent = {
        time: Math.floor(event.timestamp.getTime() / 1000),
        source: event.source,
        sourcetype: '_json',
        event: {
          severity: event.severity,
          eventType: event.eventType,
          message: event.message,
          metadata: event.metadata || {},
        },
      };

      // In production, this would POST to the Splunk HEC endpoint
      // For now, simulate the send
      console.log('Splunk event sent:', splunkEvent);

      this.eventsSent++;
      this.lastSync = new Date();
      this.clearError();
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Send failed');
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      // In production, this would make a real HTTP request to validate the token
      // For now, just validate config presence
      if (!this.config.hecUrl || !this.config.hecToken) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * QRadar Connector
 * Sends events to IBM QRadar in LEEF format
 */
export class QRadarConnector extends SIEMConnector {
  private connected: boolean = false;

  constructor(config: Record<string, any>) {
    super('QRadar', 'qradar', config);
  }

  async connect(): Promise<void> {
    try {
      this.clearError();
      // Validate required config
      if (!this.config.qradarHost || !this.config.qradarPort) {
        throw new Error('Missing required config: qradarHost, qradarPort');
      }

      // Test connection
      const isValid = await this.testConnection();
      if (!isValid) {
        throw new Error('Failed to connect to QRadar');
      }

      this.connected = true;
      this.status = 'connected';
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Connection failed');
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.status = 'disconnected';
  }

  async sendEvent(event: SIEMEvent): Promise<void> {
    if (!this.connected) {
      throw new Error('QRadar connector not connected');
    }

    try {
      // Format event for QRadar LEEF format
      const leefEvent = [
        'LEEF:2.0',
        'IBM QRadar',
        'GRC TravelRisk Engine',
        '1.0',
        `timestamp=${Math.floor(event.timestamp.getTime() / 1000)}`,
        `severity=${this.mapSeverity(event.severity)}`,
        `eventType=${event.eventType}`,
        `source=${event.source}`,
        `message=${event.message}`,
      ].join('\t');

      // In production, this would send via syslog or UDP to QRadar
      // For now, simulate the send
      console.log('QRadar event sent:', leefEvent);

      this.eventsSent++;
      this.lastSync = new Date();
      this.clearError();
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Send failed');
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      // In production, this would validate connectivity to QRadar
      // For now, just validate config presence
      if (!this.config.qradarHost || !this.config.qradarPort) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Map severity levels to QRadar severity codes
   */
  private mapSeverity(severity: string): number {
    const severityMap: Record<string, number> = {
      low: 1,
      medium: 3,
      high: 5,
      critical: 7,
    };
    return severityMap[severity] || 3;
  }
}

/**
 * Azure Sentinel Connector
 * Sends events to Azure Sentinel via Log Analytics API
 */
export class SentinelConnector extends SIEMConnector {
  private connected: boolean = false;

  constructor(config: Record<string, any>) {
    super('Azure Sentinel', 'sentinel', config);
  }

  async connect(): Promise<void> {
    try {
      this.clearError();
      // Validate required config
      if (!this.config.workspaceId || !this.config.sharedKey) {
        throw new Error('Missing required config: workspaceId, sharedKey');
      }

      // Test connection
      const isValid = await this.testConnection();
      if (!isValid) {
        throw new Error('Failed to authenticate with Azure Sentinel');
      }

      this.connected = true;
      this.status = 'connected';
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Connection failed');
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.status = 'disconnected';
  }

  async sendEvent(event: SIEMEvent): Promise<void> {
    if (!this.connected) {
      throw new Error('Sentinel connector not connected');
    }

    try {
      // Format event for Azure Sentinel
      const sentinelEvent = {
        TimeGenerated: event.timestamp.toISOString(),
        Severity: event.severity.toUpperCase(),
        SourceSystem: event.source,
        EventType: event.eventType,
        Message: event.message,
        CustomMetadata: event.metadata || {},
      };

      // In production, this would POST to the Log Analytics API
      // For now, simulate the send
      console.log('Sentinel event sent:', sentinelEvent);

      this.eventsSent++;
      this.lastSync = new Date();
      this.clearError();
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Send failed');
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      // In production, this would validate credentials with Azure
      // For now, just validate config presence
      if (!this.config.workspaceId || !this.config.sharedKey) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * SIEM Manager
 * Manages multiple SIEM connectors and routes events
 */
export class SIEMManager {
  private connectors: Map<string, SIEMConnector> = new Map();

  /**
   * Register a SIEM connector
   */
  registerConnector(id: string, connector: SIEMConnector): void {
    this.connectors.set(id, connector);
  }

  /**
   * Get a connector by ID
   */
  getConnector(id: string): SIEMConnector | undefined {
    return this.connectors.get(id);
  }

  /**
   * Get all connectors
   */
  getConnectors(): SIEMConnector[] {
    return Array.from(this.connectors.values());
  }

  /**
   * Get status of all connectors
   */
  getStatus(): SIEMConnectorConfig[] {
    return Array.from(this.connectors.values()).map((connector) =>
      connector.getStatus()
    );
  }

  /**
   * Send event to all connected connectors
   */
  async sendToAll(event: SIEMEvent): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    for (const [id, connector] of this.connectors.entries()) {
      try {
        await connector.sendEvent(event);
        results.set(id, true);
      } catch (error) {
        console.error(`Failed to send event to connector ${id}:`, error);
        results.set(id, false);
      }
    }

    return results;
  }

  /**
   * Send event to specific connector
   */
  async sendToConnector(
    connectorId: string,
    event: SIEMEvent
  ): Promise<boolean> {
    const connector = this.connectors.get(connectorId);
    if (!connector) {
      return false;
    }

    try {
      await connector.sendEvent(event);
      return true;
    } catch (error) {
      console.error(`Failed to send event to connector ${connectorId}:`, error);
      return false;
    }
  }

  /**
   * Connect all connectors
   */
  async connectAll(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    for (const [id, connector] of this.connectors.entries()) {
      try {
        await connector.connect();
        results.set(id, true);
      } catch (error) {
        console.error(`Failed to connect to ${id}:`, error);
        results.set(id, false);
      }
    }

    return results;
  }

  /**
   * Disconnect all connectors
   */
  async disconnectAll(): Promise<void> {
    for (const connector of this.connectors.values()) {
      try {
        await connector.disconnect();
      } catch (error) {
        console.error('Error disconnecting:', error);
      }
    }
  }

  /**
   * Test connection to a connector
   */
  async testConnector(connectorId: string): Promise<boolean> {
    const connector = this.connectors.get(connectorId);
    if (!connector) {
      return false;
    }

    try {
      return await connector.testConnection();
    } catch (error) {
      console.error(`Test failed for connector ${connectorId}:`, error);
      return false;
    }
  }
}

/**
 * Singleton instance of SIEM Manager
 */
export const siemManager = new SIEMManager();
export default siemManager;
