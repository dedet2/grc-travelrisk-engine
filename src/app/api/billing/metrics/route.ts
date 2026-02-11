/**
 * Billing Metrics API Route
 * GET: Retrieve revenue metrics and billing analytics
 */

import { createInvoiceBillingAgent } from '@/lib/agents/invoice-billing-agent';
import { inMemoryStore } from '@/lib/store/in-memory-store';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/billing/metrics
 * Retrieve billing metrics and revenue analytics
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const agent = createInvoiceBillingAgent();

    // Run the agent to collect and process data
    const result = await agent.run();

    if (result.status !== 'completed') {
      throw new Error(result.error || 'Failed to generate billing metrics');
    }

    // Get metrics from the store
    const metrics = inMemoryStore.getBillingMetrics();
    const invoices = inMemoryStore.getInvoices();

    // Calculate additional metrics
    const overduInvoices = invoices.filter((inv) => inv.status === 'overdue');
    const paidInvoices = invoices.filter((inv) => inv.status === 'paid');
    const draftInvoices = invoices.filter((inv) => inv.status === 'draft');

    return Response.json(
      {
        success: true,
        data: {
          metrics,
          summary: {
            totalInvoices: invoices.length,
            paidInvoices: paidInvoices.length,
            overduInvoices: overduInvoices.length,
            draftInvoices: draftInvoices.length,
          },
          agentExecutionTime: result.latencyMs,
        },
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching billing metrics:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch billing metrics',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
