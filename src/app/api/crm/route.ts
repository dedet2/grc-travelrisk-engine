/**
 * CRM Sync API Routes
 * POST: Create a new contact or deal
 * GET: List contacts or deals from pipeline
 */

import { createCrmSyncAgent, type CrmContact, type CrmDeal } from '@/lib/agents/crm-sync-agent';
import { inMemoryStore } from '@/lib/store/in-memory-store';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/crm
 * Create a new contact or deal
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    if (!type || (type !== 'contact' && type !== 'deal')) {
      return Response.json(
        {
          success: false,
          error: 'Invalid type. Must be "contact" or "deal"',
        } as ApiResponse<null>,
        { status: 400 }
      );
    }

    const agent = createCrmSyncAgent();

    if (type === 'contact') {
      const { firstName, lastName, email, jobTitle, companyId, companyName } = data;

      if (!firstName || !lastName || !email || !jobTitle || !companyId || !companyName) {
        return Response.json(
          {
            success: false,
            error: 'Missing required contact fields: firstName, lastName, email, jobTitle, companyId, companyName',
          } as ApiResponse<null>,
          { status: 400 }
        );
      }

      const contact = await agent.createContact(firstName, lastName, email, jobTitle, companyId, companyName);

      return Response.json(
        {
          success: true,
          data: contact,
          timestamp: new Date(),
        } as ApiResponse<CrmContact>,
        { status: 201 }
      );
    } else {
      const { dealName, companyId, companyName, contactId, contactName, value, expectedCloseDate } = data;

      if (!dealName || !companyId || !companyName || !contactId || !contactName || !value || !expectedCloseDate) {
        return Response.json(
          {
            success: false,
            error:
              'Missing required deal fields: dealName, companyId, companyName, contactId, contactName, value, expectedCloseDate',
          } as ApiResponse<null>,
          { status: 400 }
        );
      }

      const deal = await agent.createDeal(
        dealName,
        companyId,
        companyName,
        contactId,
        contactName,
        value,
        new Date(expectedCloseDate)
      );

      return Response.json(
        {
          success: true,
          data: deal,
          timestamp: new Date(),
        } as ApiResponse<CrmDeal>,
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Error creating CRM record:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create CRM record',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

/**
 * GET /api/crm
 * List contacts or deals from pipeline
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'pipeline';
    const stage = url.searchParams.get('stage');

    const agent = createCrmSyncAgent();

    if (type === 'contacts') {
      const contacts = agent.getContacts();

      // Run agent to update metrics
      await agent.run();
      const metrics = inMemoryStore.getCrmPipelineMetrics();

      return Response.json(
        {
          success: true,
          data: {
            contacts,
            metrics,
            count: contacts.length,
          },
          timestamp: new Date(),
        } as ApiResponse<{
          contacts: CrmContact[];
          metrics?: any;
          count: number;
        }>,
        { status: 200 }
      );
    } else if (type === 'deals') {
      let deals = agent.getDeals();

      if (stage) {
        deals = agent.getDealsByStage(stage as any);
      }

      // Run agent to update metrics
      await agent.run();
      const metrics = inMemoryStore.getCrmPipelineMetrics();

      return Response.json(
        {
          success: true,
          data: {
            deals,
            metrics,
            count: deals.length,
          },
          timestamp: new Date(),
        } as ApiResponse<{
          deals: CrmDeal[];
          metrics?: any;
          count: number;
        }>,
        { status: 200 }
      );
    } else {
      // Return pipeline summary
      const contacts = agent.getContacts();
      const deals = agent.getDeals();

      // Run agent to update metrics
      await agent.run();
      const metrics = inMemoryStore.getCrmPipelineMetrics();

      return Response.json(
        {
          success: true,
          data: {
            contacts: contacts.length,
            deals: deals.length,
            metrics,
          },
          timestamp: new Date(),
        } as ApiResponse<{
          contacts: number;
          deals: number;
          metrics?: any;
        }>,
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error fetching CRM data:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch CRM data',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
