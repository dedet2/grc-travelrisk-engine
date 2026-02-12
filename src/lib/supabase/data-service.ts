/**
 * Data Service - Supabase Integration with In-Memory Fallback
 *
 * This service provides a unified data access layer that:
 * - Attempts to use Supabase for all operations
 * - Falls back to the in-memory store if Supabase is unavailable
 * - Logs warnings when fallback occurs
 * - Handles connection errors gracefully
 */

import { inMemoryStore, type StoredFramework, type StoredControl, type StoredAssessment } from '@/lib/store/in-memory-store';
import { createServiceRoleClient } from './server';
import type { Database } from './types';

/**
 * Represents travel advisory data
 */
export interface TravelAdvisory {
  id: string;
  countryCode: string;
  countryName: string;
  advisoryLevel: number;
  description: string;
  source: string;
  fetchedAt: Date;
  expiresAt: Date;
}

/**
 * Represents audit log data
 */
export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
}

/**
 * Represents agent run data
 */
export interface AgentRun {
  id: string;
  agentName: string;
  workflow: string;
  taskTitle: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  latencyMs: number;
  tasksCompleted: number;
  totalTasks: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  errorMessage?: string;
  autonomyLevel: 'low' | 'medium' | 'high';
  humanReviewed: boolean;
  outputInRange: boolean;
  createdAt: Date;
}

/**
 * Control status update payload
 */
export interface ControlStatusUpdate {
  response: 'implemented' | 'partially-implemented' | 'not-implemented';
  evidence?: string;
  score?: number;
  notes?: string;
}

/**
 * DataService class - Provides unified data access with fallback pattern
 */
export class DataService {
  private supabaseClient: Awaited<ReturnType<typeof createServiceRoleClient>> | null = null;
  private supabaseAvailable: boolean = false;

  /**
   * Initialize the data service
   */
  async initialize(): Promise<void> {
    try {
      this.supabaseClient = await createServiceRoleClient();
      this.supabaseAvailable = true;
    } catch (error) {
      console.warn('DataService: Could not initialize Supabase client', error);
      this.supabaseAvailable = false;
    }
  }

  /**
   * Get all frameworks
   */
  async getFrameworks(): Promise<StoredFramework[]> {
    try {
      if (this.supabaseClient && this.supabaseAvailable) {
        const { data, error } = await this.supabaseClient
          .from('frameworks')
          .select('*');

        if (!error && data) {
          return data.map((row: any) => ({
            id: row.id,
            name: row.name,
            version: row.version,
            description: row.description || '',
            sourceUrl: row.source_url,
            status: row.status,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
            controlCount: 0,
            categories: [],
          }));
        }
      }
    } catch (error) {
      console.warn('DataService: Error fetching frameworks from Supabase, using in-memory store', error);
    }

    return inMemoryStore.getFrameworks();
  }

  /**
   * Get a single framework by ID
   */
  async getFramework(id: string): Promise<StoredFramework | null> {
    try {
      if (this.supabaseClient && this.supabaseAvailable) {
        const { data, error } = await this.supabaseClient
          .from('frameworks')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) {
          return {
            id: data.id,
            name: data.name,
            version: data.version,
            description: data.description || '',
            sourceUrl: data.source_url,
            status: data.status,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
            controlCount: 0,
            categories: [],
          };
        }
      }
    } catch (error) {
      console.warn('DataService: Error fetching framework from Supabase, using in-memory store', error);
    }

    const framework = inMemoryStore.getFramework(id);
    return framework || null;
  }

  /**
   * Get all assessments for a user
   */
  async getAssessments(userId: string): Promise<StoredAssessment[]> {
    try {
      if (this.supabaseClient && this.supabaseAvailable) {
        const { data, error } = await this.supabaseClient
          .from('assessments')
          .select('*')
          .eq('user_id', userId);

        if (!error && data) {
          return data.map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            frameworkId: row.framework_id,
            name: row.name,
            status: row.status,
            overallScore: row.overall_score || 0,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
          }));
        }
      }
    } catch (error) {
      console.warn('DataService: Error fetching assessments from Supabase, using in-memory store', error);
    }

    return inMemoryStore.getAssessments(userId);
  }

  /**
   * Create a new assessment
   */
  async createAssessment(assessment: Omit<StoredAssessment, 'id' | 'createdAt' | 'updatedAt'>): Promise<StoredAssessment | null> {
    try {
      if (this.supabaseClient && this.supabaseAvailable) {
        const { data, error } = await this.supabaseClient
          .from('assessments')
          .insert([
            {
              user_id: assessment.userId,
              framework_id: assessment.frameworkId,
              name: assessment.name,
              status: assessment.status,
              overall_score: assessment.overallScore,
            },
          ])
          .select()
          .single();

        if (!error && data) {
          return {
            id: data.id,
            userId: data.user_id,
            frameworkId: data.framework_id,
            name: data.name,
            status: data.status,
            overallScore: data.overall_score || 0,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
          };
        }
      }
    } catch (error) {
      console.warn('DataService: Error creating assessment in Supabase, using in-memory store', error);
    }

    const newAssessment: StoredAssessment = {
      id: `assessment-${Date.now()}`,
      ...assessment,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return inMemoryStore.addAssessment(newAssessment);
  }

  /**
   * Get all travel advisories
   */
  async getTravelAdvisories(): Promise<TravelAdvisory[]> {
    try {
      if (this.supabaseClient && this.supabaseAvailable) {
        const { data, error } = await this.supabaseClient
          .from('travel_advisories')
          .select('*');

        if (!error && data) {
          return data.map((row: any) => ({
            id: row.id,
            countryCode: row.country_code,
            countryName: row.country_name,
            advisoryLevel: row.advisory_level,
            description: row.description || '',
            source: row.source,
            fetchedAt: new Date(row.fetched_at),
            expiresAt: new Date(row.expires_at),
          }));
        }
      }
    } catch (error) {
      console.warn('DataService: Error fetching travel advisories from Supabase, using in-memory store', error);
    }

    // In-memory store doesn't have travel advisories, return empty array
    return [];
  }

  /**
   * Get a travel advisory by country code
   */
  async getTravelAdvisory(countryCode: string): Promise<TravelAdvisory | null> {
    try {
      if (this.supabaseClient && this.supabaseAvailable) {
        const { data, error } = await this.supabaseClient
          .from('travel_advisories')
          .select('*')
          .eq('country_code', countryCode)
          .single();

        if (!error && data) {
          return {
            id: data.id,
            countryCode: data.country_code,
            countryName: data.country_name,
            advisoryLevel: data.advisory_level,
            description: data.description || '',
            source: data.source,
            fetchedAt: new Date(data.fetched_at),
            expiresAt: new Date(data.expires_at),
          };
        }
      }
    } catch (error) {
      console.warn(
        `DataService: Error fetching travel advisory for ${countryCode} from Supabase`,
        error
      );
    }

    // In-memory store doesn't have travel advisories
    return null;
  }

  /**
   * Get all agent runs
   */
  async getAgentRuns(agentName?: string): Promise<AgentRun[]> {
    try {
      if (this.supabaseClient && this.supabaseAvailable) {
        let query = this.supabaseClient.from('agent_runs').select('*');

        if (agentName) {
          query = query.eq('agent_name', agentName);
        }

        const { data, error } = await query;

        if (!error && data) {
          return data.map((row: any) => ({
            id: row.id,
            agentName: row.agent_name,
            workflow: row.workflow,
            taskTitle: row.task_title,
            status: row.status,
            latencyMs: row.latency_ms,
            tasksCompleted: row.tasks_completed,
            totalTasks: row.total_tasks,
            inputTokens: row.input_tokens,
            outputTokens: row.output_tokens,
            costUsd: row.cost_usd,
            errorMessage: row.error_message,
            autonomyLevel: row.autonomy_level,
            humanReviewed: row.human_reviewed,
            outputInRange: row.output_in_range,
            createdAt: new Date(row.created_at),
          }));
        }
      }
    } catch (error) {
      console.warn('DataService: Error fetching agent runs from Supabase, using in-memory store', error);
    }

    // Convert in-memory store format to API format
    const runs = inMemoryStore.getAgentRuns(agentName);
    return runs.map((run: any) => ({
      id: run.runId || `run-${Date.now()}`,
      agentName: run.agentName,
      workflow: run.workflow || '',
      taskTitle: run.taskTitle || '',
      status: run.status || 'completed',
      latencyMs: run.latencyMs || 0,
      tasksCompleted: run.tasksCompleted || 0,
      totalTasks: run.totalTasks || 0,
      inputTokens: run.inputTokens || 0,
      outputTokens: run.outputTokens || 0,
      costUsd: run.costUsd || 0,
      errorMessage: run.errorMessage,
      autonomyLevel: run.autonomyLevel || 'medium',
      humanReviewed: run.humanReviewed || false,
      outputInRange: run.outputInRange !== false,
      createdAt: run.createdAt || new Date(),
    }));
  }

  /**
   * Create a new agent run
   */
  async createAgentRun(run: Omit<AgentRun, 'id' | 'createdAt'>): Promise<AgentRun | null> {
    try {
      if (this.supabaseClient && this.supabaseAvailable) {
        const { data, error } = await this.supabaseClient
          .from('agent_runs')
          .insert([
            {
              agent_name: run.agentName,
              workflow: run.workflow,
              task_title: run.taskTitle,
              status: run.status,
              latency_ms: run.latencyMs,
              tasks_completed: run.tasksCompleted,
              total_tasks: run.totalTasks,
              input_tokens: run.inputTokens,
              output_tokens: run.outputTokens,
              cost_usd: run.costUsd,
              error_message: run.errorMessage,
              autonomy_level: run.autonomyLevel,
              human_reviewed: run.humanReviewed,
              output_in_range: run.outputInRange,
            },
          ])
          .select()
          .single();

        if (!error && data) {
          return {
            id: data.id,
            agentName: data.agent_name,
            workflow: data.workflow,
            taskTitle: data.task_title,
            status: data.status,
            latencyMs: data.latency_ms,
            tasksCompleted: data.tasks_completed,
            totalTasks: data.total_tasks,
            inputTokens: data.input_tokens,
            outputTokens: data.output_tokens,
            costUsd: data.cost_usd,
            errorMessage: data.error_message,
            autonomyLevel: data.autonomy_level,
            humanReviewed: data.human_reviewed,
            outputInRange: data.output_in_range,
            createdAt: new Date(data.created_at),
          };
        }
      }
    } catch (error) {
      console.warn('DataService: Error creating agent run in Supabase, using in-memory store', error);
    }

    // Use in-memory store as fallback
    const agentRun: any = {
      runId: `run-${Date.now()}`,
      ...run,
      createdAt: new Date(),
    };

    inMemoryStore.addAgentRun(agentRun);

    return {
      id: agentRun.runId,
      ...run,
      createdAt: new Date(),
    };
  }

  /**
   * Get all audit logs (typically admin/service role only)
   */
  async getAuditLogs(): Promise<AuditLogEntry[]> {
    try {
      if (this.supabaseClient && this.supabaseAvailable) {
        const { data, error } = await this.supabaseClient
          .from('audit_logs')
          .select('*');

        if (!error && data) {
          return data.map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            action: row.action,
            resourceType: row.resource_type,
            resourceId: row.resource_id,
            details: row.details,
            ipAddress: row.ip_address,
            createdAt: new Date(row.created_at),
          }));
        }
      }
    } catch (error) {
      console.warn('DataService: Error fetching audit logs from Supabase', error);
    }

    // In-memory store doesn't have audit logs
    return [];
  }

  /**
   * Create an audit log entry
   */
  async createAuditLog(log: Omit<AuditLogEntry, 'id' | 'createdAt'>): Promise<AuditLogEntry | null> {
    try {
      if (this.supabaseClient && this.supabaseAvailable) {
        const { data, error } = await this.supabaseClient
          .from('audit_logs')
          .insert([
            {
              user_id: log.userId,
              action: log.action,
              resource_type: log.resourceType,
              resource_id: log.resourceId,
              details: log.details,
              ip_address: log.ipAddress,
            },
          ])
          .select()
          .single();

        if (!error && data) {
          return {
            id: data.id,
            userId: data.user_id,
            action: data.action,
            resourceType: data.resource_type,
            resourceId: data.resource_id,
            details: data.details,
            ipAddress: data.ip_address,
            createdAt: new Date(data.created_at),
          };
        }
      }
    } catch (error) {
      console.warn('DataService: Error creating audit log in Supabase', error);
    }

    // In-memory store doesn't support audit logs, return null
    return null;
  }

  /**
   * Get all controls for a framework
   */
  async getControls(frameworkId: string): Promise<StoredControl[]> {
    try {
      if (this.supabaseClient && this.supabaseAvailable) {
        const { data, error } = await this.supabaseClient
          .from('controls')
          .select('*')
          .eq('framework_id', frameworkId);

        if (!error && data) {
          return data.map((row: any) => ({
            id: row.id,
            frameworkId: row.framework_id,
            controlIdStr: row.control_id_str,
            title: row.title,
            description: row.description || '',
            category: row.category,
            controlType: row.control_type,
            criticality: row.criticality,
            createdAt: new Date(row.created_at),
          }));
        }
      }
    } catch (error) {
      console.warn(
        `DataService: Error fetching controls for framework ${frameworkId} from Supabase, using in-memory store`,
        error
      );
    }

    return inMemoryStore.getControls(frameworkId);
  }

  /**
   * Update a control's status/response
   */
  async updateControlStatus(
    assessmentId: string,
    controlId: string,
    update: ControlStatusUpdate
  ): Promise<boolean> {
    try {
      if (this.supabaseClient && this.supabaseAvailable) {
        const { error } = await this.supabaseClient
          .from('assessment_responses')
          .update({
            response: update.response,
            evidence: update.evidence,
            score: update.score,
            notes: update.notes,
          })
          .eq('assessment_id', assessmentId)
          .eq('control_id', controlId);

        if (!error) {
          return true;
        }
      }
    } catch (error) {
      console.warn(
        `DataService: Error updating control status in Supabase for assessment ${assessmentId}`,
        error
      );
    }

    // In-memory store doesn't support this operation
    console.warn('DataService: Control status update not supported in in-memory store');
    return false;
  }

  /**
   * Check if Supabase is available
   */
  isSupabaseAvailable(): boolean {
    return this.supabaseAvailable && this.supabaseClient !== null;
  }

  /**
   * Get the current mode (Supabase or in-memory)
   */
  getMode(): 'supabase' | 'in-memory' {
    return this.isSupabaseAvailable() ? 'supabase' : 'in-memory';
  }
}

/**
 * Create and export a singleton instance
 */
export const dataService = new DataService();

/**
 * Initialize the data service on import
 */
if (typeof window === 'undefined') {
  // Server-side only
  dataService.initialize().catch((error) => {
    console.warn('Failed to initialize DataService:', error);
  });
}
