export interface AirtableConfig {
  baseId: string;
  apiKey: string;
}

export interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
  createdTime: string;
}

export interface WebhookRegistration {
  webhookId: string;
  url: string;
  table: string;
  isNotificationEnabled: boolean;
}

export class AirtableConnector {
  private baseId: string;
  private apiKey: string;
  private baseUrl = 'https://api.airtable.com/v0';

  constructor(config: AirtableConfig) {
    this.baseId = config.baseId;
    this.apiKey = config.apiKey;
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async getRecords(tableName: string): Promise<AirtableRecord[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.baseId}/${tableName}`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch records: ${response.statusText}`);
      }

      const data = await response.json() as { records: AirtableRecord[] };
      return data.records;
    } catch (error) {
      console.error(`Error fetching records from ${tableName}:`, error);
      throw error;
    }
  }

  async createRecord(
    tableName: string,
    fields: Record<string, unknown>
  ): Promise<AirtableRecord> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.baseId}/${tableName}`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ fields }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create record: ${response.statusText}`);
      }

      return await response.json() as AirtableRecord;
    } catch (error) {
      console.error(`Error creating record in ${tableName}:`, error);
      throw error;
    }
  }

  async updateRecord(
    tableName: string,
    recordId: string,
    fields: Record<string, unknown>
  ): Promise<AirtableRecord> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.baseId}/${tableName}/${recordId}`,
        {
          method: 'PATCH',
          headers: this.getHeaders(),
          body: JSON.stringify({ fields }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update record: ${response.statusText}`);
      }

      return await response.json() as AirtableRecord;
    } catch (error) {
      console.error(`Error updating record in ${tableName}:`, error);
      throw error;
    }
  }

  async deleteRecord(tableName: string, recordId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.baseId}/${tableName}/${recordId}`,
        {
          method: 'DELETE',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete record: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error(`Error deleting record from ${tableName}:`, error);
      throw error;
    }
  }

  async syncLeads(): Promise<{
    synced: number;
    updated: number;
    timestamp: string;
  }> {
    try {
      const records = await this.getRecords('Leads%20%26%20Prospects');
      return {
        synced: records.length,
        updated: 0,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error syncing leads:', error);
      throw error;
    }
  }

  async syncContacts(): Promise<{
    synced: number;
    updated: number;
    timestamp: string;
  }> {
    try {
      const records = await this.getRecords('CISO%20Contacts');
      return {
        synced: records.length,
        updated: 0,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error syncing contacts:', error);
      throw error;
    }
  }

  async registerWebhook(
    tableName: string,
    webhookUrl: string
  ): Promise<WebhookRegistration> {
    try {
      const response = await fetch(
        `${this.baseUrl}/meta/bases/${this.baseId}/webhooks`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            notificationUrl: webhookUrl,
            specification: {
              options: {
                filters: {
                  dataTypes: ['tableData'],
                  createdTablesOnly: false,
                },
              },
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to register webhook: ${response.statusText}`);
      }

      const data = await response.json() as {
        id: string;
      };
      return {
        webhookId: data.id,
        url: webhookUrl,
        table: tableName,
        isNotificationEnabled: true,
      };
    } catch (error) {
      console.error('Error registering webhook:', error);
      throw error;
    }
  }
}
