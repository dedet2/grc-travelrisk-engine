export interface ReplitDeployment {
  id: string;
  agentId: string;
  status: 'deploying' | 'active' | 'failed' | 'stopped';
  deployedAt: string;
  url?: string;
}

export interface ReplitRepl {
  id: string;
  title: string;
  language: string;
  owner: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
}

export interface CodeExecutionResult {
  output: string;
  error?: string;
  exitCode: number;
  executionTime: number;
}

export class ReplitConnector {
  private apiUrl = 'https://api.replit.com/api/v1';
  private token: string;

  private preconfiguredRepls: ReplitRepl[] = [
    {
      id: 'repl-001',
      title: 'Risk Scoring Sandbox',
      language: 'python',
      owner: 'grc-admin',
      url: 'https://replit.com/@grc-admin/risk-scoring-sandbox',
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      isPublished: false,
    },
    {
      id: 'repl-002',
      title: 'Compliance Checker',
      language: 'python',
      owner: 'grc-admin',
      url: 'https://replit.com/@grc-admin/compliance-checker',
      createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
      updatedAt: new Date(Date.now() - 7200000).toISOString(),
      isPublished: false,
    },
    {
      id: 'repl-003',
      title: 'Travel API Tester',
      language: 'javascript',
      owner: 'grc-admin',
      url: 'https://replit.com/@grc-admin/travel-api-tester',
      createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
      updatedAt: new Date(Date.now() - 10800000).toISOString(),
      isPublished: false,
    },
    {
      id: 'repl-004',
      title: 'Data Pipeline Runner',
      language: 'python',
      owner: 'grc-admin',
      url: 'https://replit.com/@grc-admin/data-pipeline-runner',
      createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
      updatedAt: new Date(Date.now() - 1800000).toISOString(),
      isPublished: false,
    },
  ];

  constructor(token: string) {
    this.token = token;
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  async deployAgent(agentId: string, code: string): Promise<ReplitDeployment> {
    try {
      const response = await fetch(`${this.apiUrl}/repls`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          title: `Agent-${agentId}`,
          language: 'python',
          files: {
            'main.py': {
              content: code,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to deploy agent: ${response.statusText}`);
      }

      const data = await response.json() as { id: string; url: string };
      return {
        id: data.id,
        agentId,
        status: 'deploying',
        deployedAt: new Date().toISOString(),
        url: data.url,
      };
    } catch (error) {
      console.error(`Error deploying agent ${agentId}:`, error);
      throw error;
    }
  }

  async getDeploymentStatus(deployId: string): Promise<ReplitDeployment> {
    try {
      const response = await fetch(`${this.apiUrl}/repls/${deployId}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to get deployment status: ${response.statusText}`
        );
      }

      const data = await response.json() as {
        id: string;
        url: string;
      };
      return {
        id: data.id,
        agentId: '',
        status: 'active',
        deployedAt: new Date().toISOString(),
        url: data.url,
      };
    } catch (error) {
      console.error(`Error getting deployment status:`, error);
      throw error;
    }
  }

  async runCode(
    language: string,
    code: string
  ): Promise<CodeExecutionResult> {
    try {
      const response = await fetch(`${this.apiUrl}/exec`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          language,
          code,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to execute code: ${response.statusText}`);
      }

      const data = await response.json() as {
        output: string;
        error?: string;
        exitCode: number;
        executionTime: number;
      };
      return {
        output: data.output,
        error: data.error,
        exitCode: data.exitCode,
        executionTime: data.executionTime,
      };
    } catch (error) {
      console.error('Error running code:', error);
      throw error;
    }
  }

  async getRepl(replId: string): Promise<ReplitRepl> {
    try {
      const response = await fetch(`${this.apiUrl}/repls/${replId}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to get repl: ${response.statusText}`);
      }

      const data = await response.json() as ReplitRepl;
      return data;
    } catch (error) {
      console.error(`Error getting repl:`, error);
      throw error;
    }
  }

  async forkRepl(replId: string): Promise<ReplitRepl> {
    try {
      const response = await fetch(`${this.apiUrl}/repls/${replId}/fork`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fork repl: ${response.statusText}`);
      }

      const data = await response.json() as ReplitRepl;
      return data;
    } catch (error) {
      console.error(`Error forking repl:`, error);
      throw error;
    }
  }

  async listRepls(): Promise<ReplitRepl[]> {
    try {
      return this.preconfiguredRepls;
    } catch (error) {
      console.error('Error listing repls:', error);
      throw error;
    }
  }
}
