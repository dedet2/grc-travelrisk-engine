/**
 * Backup & Recovery API Routes
 * POST: Run backup integrity check
 * GET: Get backup status and recovery readiness
 */

import { createBackupRecoveryAgent } from '@/lib/agents/backup-recovery-agent';
import { inMemoryStore } from '@/lib/store/in-memory-store';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/backup
 * Run backup integrity check and recovery test
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const agent = createBackupRecoveryAgent();
    const result = await agent.run();

    return Response.json(
      {
        success: result.status === 'completed',
        data: {
          agentRun: result,
          backupReport: inMemoryStore.getBackupRecoveryReport(),
        },
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: result.status === 'completed' ? 200 : 500 }
    );
  } catch (error) {
    console.error('Error running backup check:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to run backup check',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * GET /api/backup
 * Get backup status and recovery readiness
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const dataSource = url.searchParams.get('dataSource');

    const agent = createBackupRecoveryAgent();
    const backupReport = inMemoryStore.getBackupRecoveryReport();

    let backupJobs = agent.getFailedBackups();
    if (dataSource) {
      backupJobs = agent.getBackupsByDataSource(dataSource);
    }

    const recoveryReadiness = backupReport?.backupHealth;

    return Response.json(
      {
        success: true,
        data: {
          report: backupReport,
          failedBackups: agent.getFailedBackups(),
          backupLocations: backupReport?.backupLocations,
          recoveryReadiness,
          latestRecoveryTests: backupReport?.latestRecoveryTests,
        },
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching backup status:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch backup status',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
