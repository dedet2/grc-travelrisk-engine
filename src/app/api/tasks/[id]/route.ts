/**
 * Task Detail API Routes
 * GET: Get a specific task
 * PUT: Update a specific task
 * DELETE: Delete a specific task (soft delete)
 */

import { createTaskProjectAgent, type ProjectTask } from '@/lib/agents/task-project-agent';
import { inMemoryStore } from '@/lib/store/in-memory-store';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/tasks/[id]
 * Get a specific task by ID
 */
export async function GET(request: Request, { params }: RouteParams): Promise<Response> {
  try {
    const { id: taskId } = params;

    if (!taskId) {
      return Response.json(
        {
          success: false,
          error: 'Missing task ID',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const agent = createTaskProjectAgent();
    const task = agent.getTask(taskId);

    if (!task) {
      return Response.json(
        {
          success: false,
          error: 'Task not found',
        } as ApiResponse<null>,
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        data: task,
        timestamp: new Date(),
      } as ApiResponse<ProjectTask>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching task:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch task',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * PUT /api/tasks/[id]
 * Update a specific task
 */
export async function PUT(request: Request, { params }: RouteParams): Promise<Response> {
  try {
    const { id: taskId } = params;
    const body = await request.json();
    const { status, assignee, actualHours, sprintId } = body;

    if (!taskId) {
      return Response.json(
        {
          success: false,
          error: 'Missing task ID',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const agent = createTaskProjectAgent();
    let task: ProjectTask | null = null;

    if (status) {
      task = await agent.updateTaskStatus(taskId, status);
    }

    if (assignee) {
      task = await agent.assignTask(taskId, assignee);
    }

    if (actualHours !== undefined && actualHours > 0) {
      task = await agent.logHours(taskId, actualHours);
    }

    if (sprintId) {
      task = await agent.addTaskToSprint(taskId, sprintId);
    }

    if (!task) {
      return Response.json(
        {
          success: false,
          error: 'Task not found or update failed',
        } as ApiResponse<null>,
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        data: task,
        timestamp: new Date(),
      } as ApiResponse<ProjectTask>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating task:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update task',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tasks/[id]
 * Soft delete a task (mark as archived/completed)
 */
export async function DELETE(request: Request, { params }: RouteParams): Promise<Response> {
  try {
    const { id: taskId } = params;

    if (!taskId) {
      return Response.json(
        {
          success: false,
          error: 'Missing task ID',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const agent = createTaskProjectAgent();
    const task = await agent.updateTaskStatus(taskId, 'completed');

    if (!task) {
      return Response.json(
        {
          success: false,
          error: 'Task not found',
        } as ApiResponse<null>,
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        data: { message: 'Task marked as completed', task },
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting task:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete task',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
