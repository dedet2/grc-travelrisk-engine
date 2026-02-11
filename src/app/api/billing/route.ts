/**
 * Billing API Routes
 * POST: Create a new invoice
 * GET: List all invoices
 */

import { createInvoiceBillingAgent, type InvoiceData } from '@/lib/agents/invoice-billing-agent';
import { inMemoryStore } from '@/lib/store/in-memory-store';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/billing
 * Create a new invoice
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { clientId, items } = body;

    if (!clientId || !items || !Array.isArray(items)) {
      return Response.json(
        {
          success: false,
          error: 'Missing required fields: clientId, items',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const agent = createInvoiceBillingAgent();
    const invoice = await agent.createInvoice(clientId, items);

    return Response.json(
      {
        success: true,
        data: invoice,
        timestamp: new Date(),
      } as ApiResponse<InvoiceData>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating invoice:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create invoice',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * GET /api/billing
 * List all invoices with optional filtering
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const clientId = url.searchParams.get('clientId');

    const agent = createInvoiceBillingAgent();
    let invoices = agent.getInvoices();

    if (status) {
      invoices = invoices.filter((inv) => inv.status === status);
    }

    if (clientId) {
      invoices = invoices.filter((inv) => inv.clientId === clientId);
    }

    const metrics = await agent.run().then((result) => {
      const stats = inMemoryStore.getBillingMetrics();
      return stats;
    });

    return Response.json(
      {
        success: true,
        data: {
          invoices,
          metrics,
          count: invoices.length,
        },
        timestamp: new Date(),
      } as ApiResponse<{
        invoices: InvoiceData[];
        metrics?: any;
        count: number;
      }>,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch invoices',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
