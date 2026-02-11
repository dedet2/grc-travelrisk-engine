/**
 * Integration Health Check Endpoint
 * Verifies that configured integrations are working correctly
 * Requires admin role
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { isAirtableConfigured } from '@/lib/airtable-sync';
import { isSlackConfigured } from '@/lib/slack-notify';

export const dynamic = 'force-dynamic';

interface IntegrationHealth {
  name: string;
  configured: boolean;
  working: boolean;
  error?: string;
  testedAt: string;
}

/**
 * Test Airtable connection
 */
async function testAirtable(): Promise<IntegrationHealth> {
  const configured = isAirtableConfigured();

  if (!configured) {
    return {
      name: 'Airtable',
      configured: false,
      working: false,
      testedAt: new Date().toISOString(),
    };
  }

  try {
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;

    // Test API access
    const response = await fetch(
      `https://api.airtable.com/v0/meta/bases/${baseId}/tables`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const working = response.ok;
    const error = working ? undefined : `HTTP ${response.status}: ${response.statusText}`;

    return {
      name: 'Airtable',
      configured: true,
      working,
      error,
      testedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      name: 'Airtable',
      configured: true,
      working: false,
      error: error instanceof Error ? error.message : String(error),
      testedAt: new Date().toISOString(),
    };
  }
}

/**
 * Test Slack connection
 */
async function testSlack(): Promise<IntegrationHealth> {
  const configured = isSlackConfigured();

  if (!configured) {
    return {
      name: 'Slack',
      configured: false,
      working: false,
      testedAt: new Date().toISOString(),
    };
  }

  try {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;

    // Send test message
    const response = await fetch(webhookUrl || '', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Integration health check - test message',
      }),
    });

    const working = response.ok;
    const error = working ? undefined : `HTTP ${response.status}: ${response.statusText}`;

    return {
      name: 'Slack',
      configured: true,
      working,
      error,
      testedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      name: 'Slack',
      configured: true,
      working: false,
      error: error instanceof Error ? error.message : String(error),
      testedAt: new Date().toISOString(),
    };
  }
}

/**
 * Test Make.com webhook secret configuration
 */
function testMakeConfig(): IntegrationHealth {
  const configured = !!process.env.MAKE_SIGNING_SECRET;

  return {
    name: 'Make.com',
    configured,
    working: configured,
    testedAt: new Date().toISOString(),
  };
}

/**
 * Test Podia webhook secret configuration
 */
function testPodiaConfig(): IntegrationHealth {
  const configured = !!process.env.PODIA_WEBHOOK_SECRET;

  return {
    name: 'Podia',
    configured,
    working: configured || true, // Podia works without secret
    testedAt: new Date().toISOString(),
  };
}

export async function GET(req: NextRequest) {
  try {
    // Require admin role
    await requireRole('admin');

    // Run health checks
    const [airtableHealth, slackHealth] = await Promise.all([testAirtable(), testSlack()]);

    const makeHealth = testMakeConfig();
    const podiaHealth = testPodiaConfig();

    const integrations = [airtableHealth, slackHealth, makeHealth, podiaHealth];
    const allHealthy = integrations.every((i) => i.configured && i.working);

    return NextResponse.json({
      success: true,
      healthy: allHealthy,
      integrations,
      summary: {
        total: integrations.length,
        configured: integrations.filter((i) => i.configured).length,
        working: integrations.filter((i) => i.working).length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error('Health check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 403 }
    );
  }
}
