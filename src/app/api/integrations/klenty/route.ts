import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';
import { KlentyConnector } from '@/lib/integrations/klenty-connector';

interface KlentyStatus extends ApiResponse<{
  connected: boolean;
  cadences: number;
  activeProspects: number;
  avgOpenRate: number;
  avgReplyRate: number;
  lastSync: string;
}> {
  success: boolean;
  message?: string;
}

export async function GET(): Promise<
  NextResponse<KlentyStatus>
> {
  try {
    const connector = new KlentyConnector(process.env.KLENTY_API_KEY || '');
    const cadences = await connector.listCadences();

    const totalProspects = cadences.reduce((sum, c) => sum + c.totalProspects, 0);

    const response: KlentyStatus = {
      success: true,
      message: 'Klenty integration status retrieved',
      data: {
        connected: true,
        cadences: cadences.length,
        activeProspects: totalProspects,
        avgOpenRate: 0.42,
        avgReplyRate: 0.18,
        lastSync: new Date().toISOString(),
      },
      timestamp: new Date(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error getting Klenty status:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to get Klenty status',
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}

interface KlentyAction {
  action: string;
  cadenceId?: string;
  cadenceName?: string;
  description?: string;
  steps?: number;
  duration?: number;
  prospectId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  title?: string;
  status?: string;
  taskId?: string;
}

interface ActionResponse extends ApiResponse<unknown> {
  success: boolean;
  message?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ActionResponse>> {
  try {
    const body = (await request.json()) as KlentyAction;
    const {
      action,
      cadenceId,
      cadenceName,
      description,
      steps,
      duration,
      prospectId,
      email,
      firstName,
      lastName,
      company,
      title,
      status,
      taskId,
    } = body;

    const connector = new KlentyConnector(process.env.KLENTY_API_KEY || '');

    if (action === 'list-cadences') {
      const cadences = await connector.listCadences();
      return NextResponse.json({
        success: true,
        message: 'Cadences retrieved',
        data: cadences,
        timestamp: new Date(),
      });
    }

    if (action === 'get-cadence' && cadenceId) {
      const cadence = await connector.getCadence(cadenceId);
      return NextResponse.json({
        success: true,
        message: 'Cadence retrieved',
        data: cadence,
        timestamp: new Date(),
      });
    }

    if (
      action === 'create-cadence' &&
      cadenceName &&
      steps &&
      duration
    ) {
      const cadence = await connector.createCadence(
        cadenceName,
        description || '',
        steps,
        duration
      );
      return NextResponse.json(
        {
          success: true,
          message: 'Cadence created',
          data: cadence,
          timestamp: new Date(),
        },
        { status: 201 }
      );
    }

    if (action === 'update-cadence' && cadenceId) {
      const updates = {
        ...(cadenceName && { name: cadenceName }),
        ...(description && { description }),
        ...(status && { status }),
      };
      const cadence = await connector.updateCadence(cadenceId, updates);
      return NextResponse.json({
        success: true,
        message: 'Cadence updated',
        data: cadence,
        timestamp: new Date(),
      });
    }

    if (action === 'list-prospects' && cadenceId) {
      const prospects = await connector.listProspects(cadenceId, status);
      return NextResponse.json({
        success: true,
        message: 'Prospects retrieved',
        data: prospects,
        timestamp: new Date(),
      });
    }

    if (
      action === 'add-prospect' &&
      cadenceId &&
      email &&
      firstName &&
      lastName
    ) {
      const prospect = await connector.addProspect(
        cadenceId,
        email,
        firstName,
        lastName,
        company,
        title
      );
      return NextResponse.json(
        {
          success: true,
          message: 'Prospect added',
          data: prospect,
          timestamp: new Date(),
        },
        { status: 201 }
      );
    }

    if (action === 'remove-prospect' && cadenceId && prospectId) {
      const removed = await connector.removeProspect(cadenceId, prospectId);
      return NextResponse.json({
        success: true,
        message: 'Prospect removed',
        data: { removed },
        timestamp: new Date(),
      });
    }

    if (action === 'get-email-tracking' && prospectId) {
      const tracking = await connector.getEmailTracking(prospectId);
      return NextResponse.json({
        success: true,
        message: 'Email tracking retrieved',
        data: tracking,
        timestamp: new Date(),
      });
    }

    if (action === 'get-tasks' && cadenceId) {
      const tasks = await connector.getCadenceTasks(cadenceId);
      return NextResponse.json({
        success: true,
        message: 'Tasks retrieved',
        data: tasks,
        timestamp: new Date(),
      });
    }

    if (action === 'complete-task' && taskId) {
      const completed = await connector.completeTask(taskId);
      return NextResponse.json({
        success: true,
        message: 'Task completed',
        data: { completed },
        timestamp: new Date(),
      });
    }

    if (action === 'get-analytics' && cadenceId) {
      const analytics = await connector.getAnalytics(cadenceId);
      return NextResponse.json({
        success: true,
        message: 'Analytics retrieved',
        data: analytics,
        timestamp: new Date(),
      });
    }

    if (action === 'pause-cadence' && cadenceId) {
      const paused = await connector.pauseCadence(cadenceId);
      return NextResponse.json({
        success: true,
        message: 'Cadence paused',
        data: { paused },
        timestamp: new Date(),
      });
    }

    if (action === 'resume-cadence' && cadenceId) {
      const resumed = await connector.resumeCadence(cadenceId);
      return NextResponse.json({
        success: true,
        message: 'Cadence resumed',
        data: { resumed },
        timestamp: new Date(),
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Invalid action or missing required parameters',
        timestamp: new Date(),
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in Klenty integration:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process Klenty request',
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
