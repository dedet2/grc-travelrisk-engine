import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

type Frequency = 'realtime' | 'hourly' | 'daily' | 'weekly';
type Channel = 'email' | 'slack' | 'in_app' | 'sms';

interface NotificationCategory {
  enabled: boolean;
  channels: Channel[];
  frequency: Frequency;
}

interface NotificationPreferences {
  userId: string;
  categories: {
    compliance_alerts: NotificationCategory;
    risk_changes: NotificationCategory;
    agent_updates: NotificationCategory;
    assessment_reminders: NotificationCategory;
    travel_alerts: NotificationCategory;
    system_updates: NotificationCategory;
    crm_updates: NotificationCategory;
  };
  updatedAt: Date;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  userId: 'user-001',
  categories: {
    compliance_alerts: {
      enabled: true,
      channels: ['email', 'slack', 'in_app'],
      frequency: 'realtime',
    },
    risk_changes: {
      enabled: true,
      channels: ['email', 'in_app'],
      frequency: 'daily',
    },
    agent_updates: {
      enabled: true,
      channels: ['in_app'],
      frequency: 'hourly',
    },
    assessment_reminders: {
      enabled: true,
      channels: ['email', 'in_app'],
      frequency: 'daily',
    },
    travel_alerts: {
      enabled: true,
      channels: ['email', 'sms', 'in_app'],
      frequency: 'realtime',
    },
    system_updates: {
      enabled: false,
      channels: ['email'],
      frequency: 'weekly',
    },
    crm_updates: {
      enabled: true,
      channels: ['email', 'slack'],
      frequency: 'daily',
    },
  },
  updatedAt: new Date(),
};

export async function GET(request: NextRequest) {
  try {
    const response: ApiResponse<NotificationPreferences> = {
      success: true,
      data: DEFAULT_PREFERENCES,
      timestamp: new Date(),
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch preferences';
    const response: ApiResponse<null> = {
      success: false,
      error: errorMessage,
      timestamp: new Date(),
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const updated: NotificationPreferences = {
      userId: body.userId || DEFAULT_PREFERENCES.userId,
      categories: {
        compliance_alerts: body.categories?.compliance_alerts || DEFAULT_PREFERENCES.categories.compliance_alerts,
        risk_changes: body.categories?.risk_changes || DEFAULT_PREFERENCES.categories.risk_changes,
        agent_updates: body.categories?.agent_updates || DEFAULT_PREFERENCES.categories.agent_updates,
        assessment_reminders: body.categories?.assessment_reminders || DEFAULT_PREFERENCES.categories.assessment_reminders,
        travel_alerts: body.categories?.travel_alerts || DEFAULT_PREFERENCES.categories.travel_alerts,
        system_updates: body.categories?.system_updates || DEFAULT_PREFERENCES.categories.system_updates,
        crm_updates: body.categories?.crm_updates || DEFAULT_PREFERENCES.categories.crm_updates,
      },
      updatedAt: new Date(),
    };

    const response: ApiResponse<NotificationPreferences> = {
      success: true,
      data: updated,
      timestamp: new Date(),
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update preferences';
    const response: ApiResponse<null> = {
      success: false,
      error: errorMessage,
      timestamp: new Date(),
    };
    return NextResponse.json(response, { status: 500 });
  }
}
