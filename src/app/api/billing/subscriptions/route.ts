import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

interface SubscriptionPlan {
  id: string;
  name: 'Starter' | 'Professional' | 'Enterprise';
  price: number;
  interval: 'monthly' | 'annual';
  features: string[];
}

interface Usage {
  apiCalls: { used: number; limit: number };
  agents: { active: number; limit: number };
  storage: { used: number; limit: number };
  users: { active: number; limit: number };
}

interface BillingInfo {
  nextBillingDate: Date;
  paymentMethod: { last4: string; brand: string };
  billingEmail: string;
}

interface Invoice {
  id: string;
  date: Date;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  downloadUrl: string;
}

interface SubscriptionDetails {
  plan: SubscriptionPlan;
  usage: Usage;
  billing: BillingInfo;
  invoices: Invoice[];
}

export const dynamic = 'force-dynamic';

function getMockSubscription(): SubscriptionDetails {
  return {
    plan: {
      id: 'plan_professional_monthly',
      name: 'Professional',
      price: 799,
      interval: 'monthly',
      features: [
        'Up to 25 users',
        '34 AI agents',
        'All GRC frameworks',
        '10GB storage',
        'Priority email support',
        'Custom reports',
        'API access',
        'Advanced analytics',
      ],
    },
    usage: {
      apiCalls: { used: 42500, limit: 100000 },
      agents: { active: 8, limit: 34 },
      storage: { used: 3.2, limit: 10 },
      users: { active: 12, limit: 25 },
    },
    billing: {
      nextBillingDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      paymentMethod: { last4: '4242', brand: 'Visa' },
      billingEmail: 'billing@example.com',
    },
    invoices: [
      {
        id: 'inv_202602_001',
        date: new Date('2026-02-01'),
        amount: 799.0,
        status: 'paid',
        downloadUrl: '/invoices/inv_202602_001.pdf',
      },
      {
        id: 'inv_202601_001',
        date: new Date('2026-01-01'),
        amount: 799.0,
        status: 'paid',
        downloadUrl: '/invoices/inv_202601_001.pdf',
      },
      {
        id: 'inv_202512_001',
        date: new Date('2025-12-01'),
        amount: 799.0,
        status: 'paid',
        downloadUrl: '/invoices/inv_202512_001.pdf',
      },
    ],
  };
}

export async function GET(): Promise<Response> {
  try {
    const subscription = getMockSubscription();

    return NextResponse.json(
      {
        success: true,
        data: subscription,
        timestamp: new Date(),
      } as ApiResponse<SubscriptionDetails>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch subscription',
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

interface ChangeSubscriptionBody {
  planId: string;
  interval?: 'monthly' | 'annual';
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as ChangeSubscriptionBody;

    if (!body.planId) {
      return NextResponse.json(
        {
          success: false,
          error: 'planId is required',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const validPlans = ['plan_starter_monthly', 'plan_professional_monthly', 'plan_enterprise_monthly'];
    if (!validPlans.includes(body.planId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid plan ID',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const planNameMap: Record<string, 'Starter' | 'Professional' | 'Enterprise'> = {
      'plan_starter_monthly': 'Starter',
      'plan_professional_monthly': 'Professional',
      'plan_enterprise_monthly': 'Enterprise',
    };

    const newSubscription = {
      ...getMockSubscription(),
      plan: {
        ...getMockSubscription().plan,
        id: body.planId,
        name: planNameMap[body.planId],
        interval: body.interval || 'monthly',
      },
    };

    return NextResponse.json(
      {
        success: true,
        data: {
          message: 'Subscription updated successfully',
          subscription: newSubscription,
        },
        timestamp: new Date(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error changing subscription:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to change subscription',
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
