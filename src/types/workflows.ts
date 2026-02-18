/**
 * Workflow Automation Types
 * Core interfaces for the automated GRC workflow engine
 */

/**
 * Trigger types for workflow execution
 */
export type WorkflowTrigger = 'manual' | 'scheduled' | 'event';

/**
 * Workflow execution status
 */
export type WorkflowStatus = 'active' | 'paused' | 'completed' | 'failed';

/**
 * Execution status for workflow runs
 */
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'paused';

/**
 * Step status in workflow execution
 */
export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

/**
 * Represents a single step in a workflow
 */
export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  action: string;
  params?: Record<string, any>;
  retryPolicy?: {
    maxRetries: number;
    backoffMs: number;
  };
  timeout?: number;
  condition?: string;
}

/**
 * Workflow execution history entry
 */
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  startTime: Date;
  endTime?: Date;
  status: ExecutionStatus;
  steps: Array<{
    stepId: string;
    status: StepStatus;
    startTime: Date;
    endTime?: Date;
    output?: Record<string, any>;
    error?: string;
  }>;
  output?: Record<string, any>;
  error?: string;
  triggeredBy: 'manual' | 'scheduled' | 'event';
  triggerData?: Record<string, any>;
}

/**
 * Core Workflow definition
 */
export interface Workflow {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  trigger: {
    type: WorkflowTrigger;
    schedule?: string;
    eventType?: string;
  };
  steps: WorkflowStep[];
  status: WorkflowStatus;
  lastRun?: Date;
  nextRun?: Date;
  executionHistory: WorkflowExecution[];
  metrics?: {
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    averageDuration: number;
    successRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Workflow execution request
 */
export interface WorkflowExecutionRequest {
  workflowId: string;
  triggerData?: Record<string, any>;
}

/**
 * Workflow execution response
 */
export interface WorkflowExecutionResponse {
  executionId: string;
  workflowId: string;
  status: ExecutionStatus;
  startTime: Date;
  endTime?: Date;
  output?: Record<string, any>;
  error?: string;
}
