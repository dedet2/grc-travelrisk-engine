import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

interface PricingTier {
  id: string;
  name: 'Starter' | 'Professional' | 'Enterprise';
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  limits: {
    users: number;
    agents: number;
    frameworks: number | string;
    storage: number;
  };
  support: string;
  popular: boolean;
  cta: string;
}

interface PricingResponse {
  currency: string;
  tiers: PricingTier[];
}

export const dynamic = 'force-dynamic';

function getPricingTiers(): PricingTier[] {
  return [
    {
      id: 'plan_starter_monthly',
      name: 'Starter',
      monthlyPrice: 299,
      annualPrice: 2871,
      features: [
        '5 team users',
        '10 AI agents',
        '2 GRC frameworks',
        '1GB storage',
        'Email support',
        'Basic dashboards',
        'API access (limited)',
        'Monthly reports',
      ],
      limits: {
        users: 5,
        agents: 10,
        frameworks: 2,
        storage: 1,
      },
      support: 'Basic email support',
      popular: false,
      cta: 'Start Free Trial',
    },
    {
      id: 'plan_professional_monthly',
      name: 'Professional',
      monthlyPrice: 799,
      annualPrice: 7671,
      features: [
        '25 team users',
        '34 AI agents',
        'All GRC frameworks',
        '10GB storage',
        'Priority email support',
        'Advanced dashboards',
        'Full API access',
        'Custom reports',
        'Compliance automation',
        'Risk scoring engine',
      ],
      limits: {
        users: 25,
        agents: 34,
        frameworks: 'all',
        storage: 10,
      },
      support: 'Priority email support',
      popular: true,
      cta: 'Start Trial',
    },
    {
      id: 'plan_enterprise_monthly',
      name: 'Enterprise',
      monthlyPrice: 2499,
      annualPrice: 23991,
      features: [
        'Unlimited team users',
        'Unlimited AI agents',
        'All GRC frameworks',
        '100GB storage',
        '24/7 phone & email support',
        'Custom integrations',
        'Dedicated account manager',
        'White-label option',
        'Advanced security',
        'SLA guarantee (99.9%)',
        'Custom compliance workflows',
        'Advanced audit trails',
      ],
      limits: {
        users: Infinity,
        agents: Infinity,
        frameworks: 'all',
        storage: 100,
      },
      support: 'Dedicated support & SLA',
      popular: false,
      cta: 'Contact Sales',
    },
  ];
}

export async function GET(): Promise<Response> {
  try {
    const tiers = getPricingTiers();

    const response: PricingResponse = {
      currency: 'USD',
      tiers,
    };

    return NextResponse.json(
      {
        success: true,
        data: response,
        timestamp: new Date(),
      } as ApiResponse<PricingResponse>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching pricing:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch pricing',
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
