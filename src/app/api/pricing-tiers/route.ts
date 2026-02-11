/**
 * Pricing Tiers API
 *
 * Returns agent pricing tiers (Lite, Standard, Premium)
 * Based on Merrick Agent Implementation Bundle data
 */

export const dynamic = 'force-dynamic';

export interface PricingTier {
  id: string;
  name: string;
  title: string;
  price: number;
  originalPrice?: number;
  description: string;
  features: string[];
  targetPersona: string[];
  includedServices: string[];
  callToAction: string;
}

const pricingTiers: PricingTier[] = [
  {
    id: 'lite',
    name: 'Lite',
    title: 'Compliance Conversation Playbook (Lite)',
    price: 297,
    description:
      'Get the essential PDF Playbook to start addressing compliance conversations confidently, aligned with your product, legal, and engineering needs. Perfect for those who want a simple, effective jumpstart.',
    features: [
      'PDF Playbook',
      'Core Compliance Templates',
      'Email Access Support',
      '30-day access to updates',
    ],
    targetPersona: [
      'Individual Contributors',
      'Small Teams',
      'Startup Founders',
    ],
    includedServices: [
      'Compliance Conversation Playbook (PDF)',
      'Basic email template library',
    ],
    callToAction: 'Get Started with Lite',
  },
  {
    id: 'standard',
    name: 'Standard',
    title: 'Compliance Conversation Playbook (Standard)',
    price: 997,
    originalPrice: 1297,
    description:
      'Includes the PDF Playbook, editable Decision Decoder templates (Google Sheets + Airtable), and a tutorial video to implement in your workflow immediately. Best for teams needing practical alignment without friction.',
    features: [
      'PDF Playbook',
      'Decision Decoder Templates (Google Sheets + Airtable)',
      'Tutorial Video',
      'Editable Workflows',
      'Email & Slack Support',
      '90-day access to updates',
      'Implementation guide',
    ],
    targetPersona: [
      'Product Managers',
      'Engineering Leads',
      'Team Leaders',
    ],
    includedServices: [
      'Compliance Conversation Playbook',
      'Decision Decoder templates',
      'Tutorial video walkthrough',
      'Implementation checklist',
    ],
    callToAction: 'Upgrade to Standard',
  },
  {
    id: 'premium',
    name: 'Premium',
    title: 'Compliance Conversation Playbook (Premium)',
    price: 2497,
    originalPrice: 3497,
    description:
      'Includes everything in Standard plus a 45-minute live Q&A implementation session with Dr. Dédé to align your team, address objections, and integrate compliance into your roadmap seamlessly. Ideal for high-stakes launches and executive alignment.',
    features: [
      'Everything in Standard',
      '45-minute live Q&A Session',
      'Executive Alignment Consulting',
      'Custom Implementation Strategy',
      'Dedicated Support',
      'Priority email & Slack support',
      '1-year access to updates',
      'Quarterly check-in calls',
      'Trust Pressure Test included',
    ],
    targetPersona: [
      'CPO/CTO',
      'VP Product',
      'Executive Leadership',
      'Enterprise Teams',
    ],
    includedServices: [
      'All Standard features',
      '45-minute implementation session with Dr. Dédé',
      'Custom roadmap integration',
      'Trust Pressure Test assessment',
      'Quarterly strategic reviews',
    ],
    callToAction: 'Get Premium Access',
  },
];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const tierId = url.searchParams.get('tier');

    // Filter by tier if specified
    let result = pricingTiers;
    if (tierId) {
      result = pricingTiers.filter(tier => tier.id === tierId);
      if (result.length === 0) {
        return Response.json(
          {
            error: `Pricing tier '${tierId}' not found`,
            available: pricingTiers.map(t => t.id),
          },
          { status: 404 }
        );
      }
    }

    return Response.json(
      {
        success: true,
        data: result,
        count: result.length,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('Pricing tiers API error:', error);
    return Response.json(
      {
        error: 'Failed to fetch pricing tiers',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tierId } = body;

    if (!tierId) {
      return Response.json(
        { error: 'tierId is required' },
        { status: 400 }
      );
    }

    const tier = pricingTiers.find(t => t.id === tierId);
    if (!tier) {
      return Response.json(
        {
          error: `Pricing tier '${tierId}' not found`,
          available: pricingTiers.map(t => t.id),
        },
        { status: 404 }
      );
    }

    // Simulate checkout initialization
    return Response.json(
      {
        success: true,
        checkoutSession: {
          id: `checkout_${Date.now()}`,
          tier: tier,
          status: 'ready',
          createdAt: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Pricing tiers POST error:', error);
    return Response.json(
      {
        error: 'Failed to process pricing request',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
