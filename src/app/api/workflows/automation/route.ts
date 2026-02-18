/**
 * Workflow Automation API Routes
 * GET: List all workflows with status and execution history
 * POST: Trigger a workflow
 */

import { NextRequest, NextResponse } from 'next/server';
import { workflowEngine } from '@/lib/workflows/workflow-engine';
import type { ApiResponse } from '@/types';
import type { Workflow, WorkflowExecutionResponse } from '@/types/workflows';

export const dynamic = 'force-dynamic';

/**
 * GET /api/workflows/automation
 * List all workflows with status and execution history
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const workflowId = searchParams.get('id');
    const includeHistory = searchParams.get('history') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (workflowId) {
      const workflow = workflowEngine.getWorkflow(workflowId);
      if (!workflow) {
        return NextResponse.json(
          {
            success: false,
            error: 'Workflow not found',
          } as ApiResponse<null>,
          { status: 404 }
        );
      }

      const response = {
        ...workflow,
        executionHistory: includeHistory ? workflow.executionHistory.slice(-limit) : undefined,
      };

      return NextResponse.json(
        {
          success: true,
          data: response,
          timestamp: new Date(),
        } as ApiResponse<any>,
        { status: 200 }
      );
    }

    const workflows = workflowEngine.getWorkflows();
    const response = workflows.map((workflow) => ({
      ...workflow,
      executionHistory: includeHistory ? workflow.executionHistory.slice(-limit) : undefined,
      metrics: workflowEngine.getWorkflowMetrics(workflow.id),
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          workflows: response,
          total: workflows.length,
          active: workflows.filter((w) => w.enabled).length,
        },
        timestamp: new Date(),
      } as ApiResponse<{
        workflows: any[];
        total: number;
        active: number;
      }>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch workflows',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * POST /api/workflows/automation
 * Trigger a workflow execution
 * Body: { workflowId, triggerData? }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { workflowId, triggerData } = body as {
      workflowId: string;
      triggerData?: Record<string, any>;
    };

    if (!workflowId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: workflowId',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const workflow = workflowEngine.getWorkflow(workflowId);
    if (!workflow) {
      return NextResponse.json(
        {
          success: false,
          error: 'Workflow not found',
        } as ApiResponse<null>,
        { status: 404 }
      );
    }

    if (!workflow.enabled) {
      return NextResponse.json(
        {
          success: false,
          error: 'Workflow is not enabled',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const executionId = await workflowEngine.executeWorkflow(workflowId, triggerData);
    const execution = workflowEngine.getExecution(executionId);

    return NextResponse.json(
      {
        success: true,
        data: {
          executionId,
          workflowId,
          status: execution?.status || 'running',
          startTime: execution?.startTime,
          workflowName: workflow.name,
        } as WorkflowExecutionResponse,
        timestamp: new Date(),
      } as ApiResponse<WorkflowExecutionResponse>,
      { status: 202 }
    );
  } catch (error) {
    console.error('Error executing workflow:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to execute workflow',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/workflows/automation
 * Pause or resume a workflow
 * Body: { workflowId, action: 'pause' | 'resume' }
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { workflowId, action } = body as {
      workflowId: string;
      action: 'pause' | 'resume';
    };

    if (!workflowId || !action) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: workflowId, action',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const workflow = workflowEngine.getWorkflow(workflowId);
    if (!workflow) {
      return NextResponse.json(
        {
          success: false,
          error: 'Workflow not found',
        } as ApiResponse<null>,
        { status: 404 }
      );
    }

    let success = false;
    if (action === 'pause') {
      success = workflowEngine.pauseWorkflow(workflowId);
    } else if (action === 'resume') {
      success = workflowEngine.resumeWorkflow(workflowId);
    }

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to ${action} workflow`,
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const updatedWorkflow = workflowEngine.getWorkflow(workflowId);

    return NextResponse.json(
      {
        success: true,
        data: {
          workflowId,
          action,
          status: updatedWorkflow?.status,
          enabled: updatedWorkflow?.enabled,
        },
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating workflow:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update workflow',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
