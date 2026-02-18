import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

interface SyncedTable {
  name: string;
  recordCount: number;
  lastSync: string;
  syncStatus: 'success' | 'pending' | 'failed';
}

interface AirtableStatus extends ApiResponse {
  connected: boolean;
  baseId: string;
  syncedTables: SyncedTable[];
  lastSyncTime: string;
  webhookRegistered: boolean;
}

export async function GET(): Promise<NextResponse<AirtableStatus>> {
  const syncedTables: SyncedTable[] = [
    {
      name: 'Leads & Prospects',
      recordCount: 9,
      lastSync: new Date(Date.now() - 1800000).toISOString(),
      syncStatus: 'success',
    },
    {
      name: 'Deals Pipeline',
      recordCount: 5,
      lastSync: new Date(Date.now() - 900000).toISOString(),
      syncStatus: 'success',
    },
    {
      name: 'CISO Contacts',
      recordCount: 1557,
      lastSync: new Date(Date.now() - 3600000).toISOString(),
      syncStatus: 'success',
    },
    {
      name: 'Assessment Tracking',
      recordCount: 12,
      lastSync: new Date(Date.now() - 2700000).toISOString(),
      syncStatus: 'success',
    },
    {
      name: 'Vendor Registry',
      recordCount: 10,
      lastSync: new Date(Date.now() - 5400000).toISOString(),
      syncStatus: 'success',
    },
  ];

  return NextResponse.json({
    success: true,
    message: 'Airtable connection status retrieved',
    data: {
      connected: true,
      baseId: 'appXXXXXXXXXXXXXX',
      syncedTables,
      lastSyncTime: new Date().toISOString(),
      webhookRegistered: true,
    },
  });
}

interface SyncRequest {
  table: string;
  action: 'full_sync' | 'incremental' | 'webhook_register';
}

interface SyncResponse extends ApiResponse {
  syncId: string;
  table: string;
  action: string;
  status: string;
  recordsSynced?: number;
  timestamp: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<SyncResponse>> {
  try {
    const body = (await request.json()) as SyncRequest;
    const { table, action } = body;

    if (!table || !action) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: table and action',
        },
        { status: 400 }
      );
    }

    const validActions = [
      'full_sync',
      'incremental',
      'webhook_register',
    ];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid action. Must be one of: ${validActions.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const syncId = `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    let recordsSynced = 0;
    if (table === 'Leads & Prospects') recordsSynced = 9;
    else if (table === 'Deals Pipeline') recordsSynced = 5;
    else if (table === 'CISO Contacts') recordsSynced = 1557;
    else if (table === 'Assessment Tracking') recordsSynced = 12;
    else if (table === 'Vendor Registry') recordsSynced = 10;

    const response: SyncResponse = {
      success: true,
      message: `${action} initiated for table: ${table}`,
      data: {
        syncId,
        table,
        action,
        status: 'processing',
        recordsSynced,
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error processing Airtable sync request:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process sync request',
      },
      { status: 500 }
    );
  }
}
