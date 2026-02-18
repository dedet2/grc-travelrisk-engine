export interface KlentyCadence {
  id: string;
  name: string;
  description: string;
  steps: number;
  duration: number;
  status: 'active' | 'paused' | 'archived';
  totalProspects: number;
  createdAt: string;
}

export interface KlentyProspect {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  title: string;
  status: 'active' | 'paused' | 'completed' | 'bounced';
  cadenceId: string;
  addedAt: string;
}

export interface EmailTracking {
  id: string;
  prospectId: string;
  emailIndex: number;
  sent: boolean;
  sentAt?: string;
  opened: boolean;
  openCount: number;
  clicked: boolean;
  clickCount: number;
  replied: boolean;
  repliedAt?: string;
  bounced: boolean;
}

export interface CadenceTask {
  id: string;
  prospectId: string;
  cadenceId: string;
  taskType: string;
  description: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
}

export interface CadenceAnalytics {
  cadenceId: string;
  cadenceName: string;
  totalProspects: number;
  activeProspects: number;
  completedProspects: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
  conversionRate: number;
}

export class KlentyConnector {
  private apiUrl = 'https://api.klenty.com/v1';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  private getPreconfiguredCadences(): KlentyCadence[] {
    return [
      {
        id: 'cad-001',
        name: 'CISO Cold Outreach',
        description: 'Multi-step cold outreach sequence for CISO prospects',
        steps: 5,
        duration: 14,
        status: 'active',
        totalProspects: 342,
        createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
      },
      {
        id: 'cad-002',
        name: 'Post-Demo Follow-up',
        description:
          'Follow-up sequence after product demo or assessment',
        steps: 3,
        duration: 7,
        status: 'active',
        totalProspects: 156,
        createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
      },
      {
        id: 'cad-003',
        name: 'Conference Lead Nurture',
        description: 'Nurture sequence for leads captured at conferences',
        steps: 4,
        duration: 21,
        status: 'active',
        totalProspects: 78,
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      },
      {
        id: 'cad-004',
        name: 'Renewal Reminder',
        description: 'Renewal reminder and upsell sequence for existing customers',
        steps: 3,
        duration: 30,
        status: 'active',
        totalProspects: 89,
        createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
      },
    ];
  }

  async listCadences(): Promise<KlentyCadence[]> {
    try {
      return this.getPreconfiguredCadences();
    } catch (error) {
      console.error('Error listing cadences:', error);
      throw error;
    }
  }

  async getCadence(cadenceId: string): Promise<KlentyCadence> {
    try {
      const response = await fetch(
        `${this.apiUrl}/cadences/${cadenceId}`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get cadence: ${response.statusText}`);
      }

      const data = await response.json() as KlentyCadence;
      return data;
    } catch (error) {
      console.error(`Error getting cadence ${cadenceId}:`, error);
      throw error;
    }
  }

  async createCadence(
    name: string,
    description: string,
    steps: number,
    duration: number
  ): Promise<KlentyCadence> {
    try {
      const response = await fetch(`${this.apiUrl}/cadences`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          name,
          description,
          steps,
          duration,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create cadence: ${response.statusText}`);
      }

      const data = await response.json() as KlentyCadence;
      return data;
    } catch (error) {
      console.error('Error creating cadence:', error);
      throw error;
    }
  }

  async updateCadence(
    cadenceId: string,
    updates: Partial<KlentyCadence>
  ): Promise<KlentyCadence> {
    try {
      const response = await fetch(
        `${this.apiUrl}/cadences/${cadenceId}`,
        {
          method: 'PATCH',
          headers: this.getHeaders(),
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update cadence: ${response.statusText}`);
      }

      const data = await response.json() as KlentyCadence;
      return data;
    } catch (error) {
      console.error(`Error updating cadence ${cadenceId}:`, error);
      throw error;
    }
  }

  async listProspects(
    cadenceId: string,
    status?: string
  ): Promise<KlentyProspect[]> {
    try {
      let url = `${this.apiUrl}/cadences/${cadenceId}/prospects`;
      if (status) {
        url += `?status=${status}`;
      }

      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to list prospects: ${response.statusText}`);
      }

      const data = await response.json() as { prospects: KlentyProspect[] };
      return data.prospects || [];
    } catch (error) {
      console.error(`Error listing prospects for cadence ${cadenceId}:`, error);
      throw error;
    }
  }

  async addProspect(
    cadenceId: string,
    email: string,
    firstName: string,
    lastName: string,
    company?: string,
    title?: string
  ): Promise<KlentyProspect> {
    try {
      const response = await fetch(
        `${this.apiUrl}/cadences/${cadenceId}/prospects`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            email,
            firstName,
            lastName,
            company,
            title,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to add prospect: ${response.statusText}`);
      }

      const data = await response.json() as KlentyProspect;
      return data;
    } catch (error) {
      console.error('Error adding prospect:', error);
      throw error;
    }
  }

  async removeProspect(
    cadenceId: string,
    prospectId: string
  ): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.apiUrl}/cadences/${cadenceId}/prospects/${prospectId}`,
        {
          method: 'DELETE',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to remove prospect: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error removing prospect:', error);
      throw error;
    }
  }

  async getEmailTracking(
    prospectId: string
  ): Promise<EmailTracking[]> {
    try {
      const response = await fetch(
        `${this.apiUrl}/prospects/${prospectId}/email-tracking`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to get email tracking: ${response.statusText}`
        );
      }

      const data = await response.json() as { tracking: EmailTracking[] };
      return data.tracking || [];
    } catch (error) {
      console.error(
        `Error getting email tracking for prospect ${prospectId}:`,
        error
      );
      throw error;
    }
  }

  async getCadenceTasks(cadenceId: string): Promise<CadenceTask[]> {
    try {
      const response = await fetch(
        `${this.apiUrl}/cadences/${cadenceId}/tasks`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get cadence tasks: ${response.statusText}`);
      }

      const data = await response.json() as { tasks: CadenceTask[] };
      return data.tasks || [];
    } catch (error) {
      console.error(`Error getting tasks for cadence ${cadenceId}:`, error);
      throw error;
    }
  }

  async completeTask(taskId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.apiUrl}/tasks/${taskId}`,
        {
          method: 'PATCH',
          headers: this.getHeaders(),
          body: JSON.stringify({
            completed: true,
            completedAt: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to complete task: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error(`Error completing task ${taskId}:`, error);
      throw error;
    }
  }

  async getAnalytics(cadenceId: string): Promise<CadenceAnalytics> {
    try {
      const response = await fetch(
        `${this.apiUrl}/cadences/${cadenceId}/analytics`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get analytics: ${response.statusText}`);
      }

      const data = await response.json() as CadenceAnalytics;
      return data;
    } catch (error) {
      console.error(
        `Error getting analytics for cadence ${cadenceId}:`,
        error
      );
      throw error;
    }
  }

  async pauseCadence(cadenceId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.apiUrl}/cadences/${cadenceId}`,
        {
          method: 'PATCH',
          headers: this.getHeaders(),
          body: JSON.stringify({
            status: 'paused',
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to pause cadence: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error(`Error pausing cadence ${cadenceId}:`, error);
      throw error;
    }
  }

  async resumeCadence(cadenceId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.apiUrl}/cadences/${cadenceId}`,
        {
          method: 'PATCH',
          headers: this.getHeaders(),
          body: JSON.stringify({
            status: 'active',
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to resume cadence: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error(`Error resuming cadence ${cadenceId}:`, error);
      throw error;
    }
  }
}
