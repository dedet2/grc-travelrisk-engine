import { NextRequest, NextResponse } from 'next/server';
import { tenantManager } from '@/lib/tenants/tenant-manager';
import { PlanType } from '@/types/tenants';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tenantId = searchParams.get('tenantId');
  const action = searchParams.get('action');

  if (action === 'usage' && tenantId) {
    const usage = tenantManager.getTenantUsage(tenantId);
    if (!usage) {
      return NextResponse.json(
        { success: false, error: 'Tenant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        usage
      },
      { status: 200 }
    );
  }

  if (action === 'limits' && tenantId) {
    const tenant = tenantManager.getTenant(tenantId);
    if (!tenant) {
      return NextResponse.json(
        { success: false, error: 'Tenant not found' },
        { status: 404 }
      );
    }

    const limits = tenantManager.getPlanLimits(tenant.plan);

    return NextResponse.json(
      {
        success: true,
        tenantId,
        plan: tenant.plan,
        limits
      },
      { status: 200 }
    );
  }

  if (tenantId) {
    const tenant = tenantManager.getTenant(tenantId);
    if (!tenant) {
      return NextResponse.json(
        { success: false, error: 'Tenant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        tenant
      },
      { status: 200 }
    );
  }

  const allTenants = tenantManager.listTenants();

  return NextResponse.json(
    {
      success: true,
      tenants: allTenants,
      count: allTenants.length
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, plan, adminId } = body;

    if (!name || !plan || !adminId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, plan, adminId' },
        { status: 400 }
      );
    }

    const validPlans: PlanType[] = ['starter', 'professional', 'enterprise'];
    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan type' },
        { status: 400 }
      );
    }

    const tenant = tenantManager.createTenant(name, plan, adminId);

    return NextResponse.json(
      {
        success: true,
        message: 'Tenant created successfully',
        tenant
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create tenant' },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, plan, usage } = body;

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'Missing tenantId' },
        { status: 400 }
      );
    }

    const tenant = tenantManager.getTenant(tenantId);
    if (!tenant) {
      return NextResponse.json(
        { success: false, error: 'Tenant not found' },
        { status: 404 }
      );
    }

    let updatedTenant = tenant;

    if (plan) {
      const validPlans: PlanType[] = ['starter', 'professional', 'enterprise'];
      if (!validPlans.includes(plan)) {
        return NextResponse.json(
          { success: false, error: 'Invalid plan type' },
          { status: 400 }
        );
      }
      updatedTenant = tenantManager.updateTenantPlan(tenantId, plan);
    }

    if (usage) {
      tenantManager.updateTenantUsage(tenantId, usage);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Tenant updated successfully',
        tenant: updatedTenant
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update tenant' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId } = body;

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'Missing tenantId' },
        { status: 400 }
      );
    }

    const tenant = tenantManager.getTenant(tenantId);
    if (!tenant) {
      return NextResponse.json(
        { success: false, error: 'Tenant not found' },
        { status: 404 }
      );
    }

    const deactivated = tenantManager.deactivateTenant(tenantId);

    return NextResponse.json(
      {
        success: true,
        message: 'Tenant deactivated successfully',
        tenant: deactivated
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to deactivate tenant' },
      { status: 400 }
    );
  }
}
