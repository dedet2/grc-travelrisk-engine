/**
 * Task & Project Tracking API Routes
 * POST: Create a task
 * GET: List tasks with filtering
 */

import { createTaskProjectAgent, type ProjectTask } from '@/lib/agents/task-project-agent';
import { inMemoryStore } from '@/lib/store/in-memory-store';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/tasks
 * Create a new task
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { projectId, title, description, assignee, estimatedHours, dueDate, priority } = body;

    if (!projectId || !title || !assignee || !estimatedHours || !dueDate) {
      return Response.json(
        {
          success: false,
          error: 'Missing required fields: projectId, title, assignee, estimatedHours, dueDate',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const agent = createTaskProjectAgent();
    const task = await agent.createTask(
      projectId,
      title,
      description || '',
      assignee,
      estimatedHours,
      new Date(dueDate),
      priority || 'medium'
    );

    return Response.json(
      {
        success: true,
        data: task,
        timestamp: new Date(),
      } as ApiResponse<ProjectTask>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating task:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create task',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * GET /api/tasks
 * List tasks with optional filtering
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const projectId = url.searchParams.get('projectId');
    const status = url.searchParams.get('status');
    const assignee = url.searchParams.get('assignee');

    const agent = createTaskProjectAgent();

    // Run the agent to collect and process data
    const result = await agent.run();

    if (result.status !== 'completed') {
      throw new Error(result.error || 'Failed to generate task metrics');
    }

    let tasks = agent.getAllSprints()[0]?.tasks || [];

    if (projectId) {
      tasks = agent.getProjectTasks(projectId);
    }

    if (status) {
      tasks = agent.getTasksByStatus(status as any);
    }

    if (assignee) {
      tasks = agent.getTasksByAssignee(assignee);
    }

    const reports = inMemoryStore.getStatusReports();

    return Response.json(
      {
        success: true,
        data: {
          tasks,
        reports,
          count: tasks.length,
          agentExecutionTime: result.latencyMs,
        },
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch tasks',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
