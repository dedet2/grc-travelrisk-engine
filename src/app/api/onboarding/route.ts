import { NextRequest, NextResponse } from 'next/server';
import { tenantManager } from '@/lib/tenants/tenant-manager';
import { notificationEngine } from '@/lib/notifications/notification-engine';

const onboardingSessions = new Map<string, any>();

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id') || 'user_1';

  const session = onboardingSessions.get(userId);

  if (!session) {
    return NextResponse.json(
      {
        currentStep: 1,
        formData: {
          step1: { companyName: '', industry: '', companySize: '', complianceNeeds: '' },
          step2: { frameworks: [] },
          step3: { integrations: { airtable: false, slack: false, make: false } },
          step4: { teamMembers: [{ email: '', role: 'analyst' }] }
        }
      },
      { status: 200 }
    );
  }

  return NextResponse.json(session, { status: 200 });
}

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id') || 'user_1';

  try {
    const body = await request.json();
    const { step, formData } = body;

    const session = onboardingSessions.get(userId) || {
      userId,
      currentStep: 1,
      formData: {
        step1: { companyName: '', industry: '', companySize: '', complianceNeeds: '' },
        step2: { frameworks: [] },
        step3: { integrations: { airtable: false, slack: false, make: false } },
        step4: { teamMembers: [{ email: '', role: 'analyst' }] }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    session.currentStep = step;
    session.formData = formData;
    session.updatedAt = new Date();

    onboardingSessions.set(userId, session);

    return NextResponse.json(
      {
        success: true,
        message: 'Progress saved',
        currentStep: step
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to save progress' },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const userId = request.headers.get('x-user-id') || 'user_1';

  try {
    const body = await request.json();
    const { formData } = body;

    const companyName = formData.step1.companyName || 'New Organization';
    const plan = formData.step1.companySize === 'enterprise' ? 'enterprise' : 'professional';

    const tenant = tenantManager.createTenant(companyName, plan, userId);

    const frameworks = formData.step2.frameworks || [];
    if (frameworks.length > 0) {
      notificationEngine.sendNotification(
        userId,
        'system_update',
        'Organization Created Successfully',
        `Welcome to GRC TravelRisk! Your organization "${companyName}" has been set up with ${frameworks.length} frameworks.`,
        'info',
        '/dashboard',
        { tenantId: tenant.id, frameworks }
      );
    }

    const enabledIntegrations = Object.entries(formData.step3.integrations)
      .filter(([, enabled]) => enabled)
      .map(([name]) => name);

    if (enabledIntegrations.length > 0) {
      notificationEngine.sendNotification(
        userId,
        'system_update',
        'Integrations Connected',
        `Connected to ${enabledIntegrations.join(', ')} successfully.`,
        'info',
        '/dashboard/settings/integrations',
        { integrations: enabledIntegrations }
      );
    }

    onboardingSessions.delete(userId);

    return NextResponse.json(
      {
        success: true,
        message: 'Organization created successfully',
        tenantId: tenant.id,
        redirectUrl: '/dashboard'
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to complete onboarding' },
      { status: 400 }
    );
  }
}
