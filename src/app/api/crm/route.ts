/**
 * CRM API Routes - Airtable Integration
 * Fetches real prospects from Airtable with caching
 * POST: Create a new contact or deal
 * GET: List contacts or deals from pipeline
 */

import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';

// Type definitions for Airtable responses and frontend data
interface Contact {
  id: string;
  name: string;
  email: string;
  company: string;
  status: 'lead' | 'prospect' | 'customer';
  createdAt: string;
}

interface Deal {
  id: string;
  title: string;
  stage: 'negotiation' | 'proposal' | 'qualified' | 'closed-won' | 'closed-lost';
  value: number;
  probability: number;
  contact: string;
}

interface CRMMetrics {
  totalContacts: number;
  activePipeline: number;
  closureRate: number;
  averageDealValue: number;
}

interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
  createdTime: string;
}

interface AirtableResponse {
  records: AirtableRecord[];
  offset?: string;
}

// Simple in-memory cache with TTL
const cache: { [key: string]: { data: any; timestamp: number } } = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCachedData(key: string): any | null {
  const cached = cache[key];
  if (!cached) return null;

  const now = Date.now();
  if (now - cached.timestamp > CACHE_TTL) {
    delete cache[key];
    return null;
  }

  return cached.data;
}

function setCachedData(key: string, data: any): void {
  cache[key] = { data, timestamp: Date.now() };
}

// Fallback mock data
const mockContacts: Contact[] = [
  { id: 'c1', name: 'Scott Kennedy', email: 'skennedy@appviewx.com', company: 'AppViewX', status: 'prospect', createdAt: '2026-02-01' },
  { id: 'c2', name: 'John Wilson', email: 'jwilson@haystackid.com', company: 'HaystackID', status: 'lead', createdAt: '2026-02-02' },
  { id: 'c3', name: 'Radhika Bajpai', email: 'rbajpai@russell.com', company: 'Russell Investments', status: 'prospect', createdAt: '2026-02-03' },
  { id: 'c4', name: 'Rodrigo Jorge', email: 'rjorge@cerc.com', company: 'CERC', status: 'lead', createdAt: '2026-02-04' },
  { id: 'c5', name: 'David Ulloa', email: 'dulloa@imclogistics.com', company: 'IMC Logistics', status: 'prospect', createdAt: '2026-02-05' },
  { id: 'c6', name: 'Michael Block', email: 'mblock@lereta.com', company: 'LERETA LLC', status: 'customer', createdAt: '2026-01-15' },
  { id: 'c7', name: 'Ray Taft', email: 'rtaft@metadata.io', company: 'Metadata', status: 'lead', createdAt: '2026-02-06' },
  { id: 'c8', name: 'Nilanjan Ghatak', email: 'nghatak@tatasteel.com', company: 'Tata Steel Utilities', status: 'lead', createdAt: '2026-02-07' },
  { id: 'c9', name: 'Donna Ross', email: 'dross@radian.com', company: 'Radian', status: 'prospect', createdAt: '2026-02-08' },
];

const mockDeals: Deal[] = [
  { id: 'd1', title: 'AppViewX - Enterprise GRC Suite', stage: 'qualified', value: 75000, probability: 25, contact: 'Scott Kennedy' },
  { id: 'd2', title: 'Russell Investments - AI Risk Engine', stage: 'proposal', value: 120000, probability: 50, contact: 'Radhika Bajpai' },
  { id: 'd3', title: 'LERETA - Compliance Automation', stage: 'negotiation', value: 95000, probability: 70, contact: 'Michael Block' },
  { id: 'd4', title: 'IMC Logistics - Travel Risk Module', stage: 'negotiation', value: 82000, probability: 65, contact: 'David Ulloa' },
  { id: 'd5', title: 'Radian - ISO 27001 Assessment', stage: 'proposal', value: 45000, probability: 40, contact: 'Donna Ross' },
  { id: 'd6', title: 'HaystackID - SOC 2 Readiness', stage: 'qualified', value: 60000, probability: 20, contact: 'John Wilson' },
  { id: 'd7', title: 'Metadata - GDPR Compliance Pack', stage: 'proposal', value: 55000, probability: 45, contact: 'Ray Taft' },
  { id: 'd8', title: 'CERC - Risk Assessment Pilot', stage: 'qualified', value: 35000, probability: 15, contact: 'Rodrigo Jorge' },
  { id: 'd9', title: 'Tata Steel - Enterprise Bundle', stage: 'closed-lost', value: 200000, probability: 0, contact: 'Nilanjan Ghatak' },
];

/**
 * Fetch prospects from Airtable API
 */
async function fetchAirtableProspects(): Promise<Contact[]> {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = 'appOV1EhlOeCh6ZdO';
  const tableId = 'tblgG67OFRZsgX4lI';

  if (!apiKey) {
    console.warn('AIRTABLE_API_KEY not set, using mock data');
    return mockContacts;
  }

  try {
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`Airtable API error (${response.status}), using mock data`);
      return mockContacts;
    }

    const data: AirtableResponse = await response.json();

    if (!data.records || !Array.isArray(data.records)) {
      console.warn('Invalid Airtable response structure, using mock data');
      return mockContacts;
    }

    // Map Airtable records to Contact format
    const contacts: Contact[] = data.records
      .map((record: AirtableRecord) => {
        const fields = record.fields;

        // Extract name - try different field combinations
        let name = '';
        if (fields.Name) {
          name = fields.Name;
        } else if (fields['First Name'] && fields['Last Name']) {
          name = `${fields['First Name']} ${fields['Last Name']}`.trim();
        } else if (fields.FirstName && fields.LastName) {
          name = `${fields.FirstName} ${fields.LastName}`.trim();
        }

        // Extract email
        const email = fields.Email || fields.email || '';

        // Extract company
        const company = fields.Company || fields.company || '';

        // Extract status - default to 'prospect'
        const status = (fields.Status || fields.status || 'prospect').toLowerCase() as 'lead' | 'prospect' | 'customer';

        // Use record ID and created time
        return {
          id: record.id,
          name: name || 'Unknown',
          email,
          company,
          status: ['lead', 'prospect', 'customer'].includes(status) ? status : 'prospect',
          createdAt: new Date(record.createdTime).toISOString().split('T')[0],
        };
      })
      .filter((contact: Contact) => contact.name && contact.email); // Filter out incomplete records

    console.log(`Fetched ${contacts.length} prospects from Airtable`);
    return contacts.length > 0 ? contacts : mockContacts;
  } catch (error) {
    console.error('Failed to fetch from Airtable:', error);
    return mockContacts;
  }
}

/**
 * Calculate CRM metrics from contacts and deals
 */
function calculateMetrics(contacts: Contact[], deals: Deal[]): CRMMetrics {
  const totalPipeline = deals
    .filter((d) => !['closed-won', 'closed-lost'].includes(d.stage))
    .reduce((sum, d) => sum + d.value, 0);

  const wonDeals = deals.filter((d) => d.stage === 'closed-won').length;
  const totalDeals = deals.length || 1;
  const closureRate = Math.round((wonDeals / totalDeals) * 100);

  const averageDealValue = deals.length > 0
    ? Math.round(deals.reduce((sum, d) => sum + d.value, 0) / deals.length)
    : 0;

  return {
    totalContacts: contacts.length,
    activePipeline: totalPipeline,
    closureRate,
    averageDealValue,
  };
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

    if (type === 'contacts') {
      // Check cache first
      const cached = getCachedData('airtable_contacts');
      let contacts = cached || (await fetchAirtableProspects());

      if (!cached) {
        setCachedData('airtable_contacts', contacts);
      }

      const metrics = calculateMetrics(contacts, mockDeals);

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
          contacts: Contact[];
          metrics: CRMMetrics;
          count: number;
        }>,
        { status: 200 }
      );
    } else if (type === 'deals') {
      let deals = mockDeals;

      if (stage) {
        deals = mockDeals.filter((d) => d.stage === stage);
      }

      // Fetch contacts for metrics calculation
      const cached = getCachedData('airtable_contacts');
      const contacts = cached || (await fetchAirtableProspects());

      if (!cached) {
        setCachedData('airtable_contacts', contacts);
      }

      const metrics = calculateMetrics(contacts, deals);

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
          deals: Deal[];
          metrics: CRMMetrics;
          count: number;
        }>,
        { status: 200 }
      );
    } else {
      // Return pipeline summary
      const cached = getCachedData('airtable_contacts');
      const contacts = cached || (await fetchAirtableProspects());

      if (!cached) {
        setCachedData('airtable_contacts', contacts);
      }

      const deals = mockDeals;
      const metrics = calculateMetrics(contacts, deals);

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
          metrics: CRMMetrics;
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

    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = 'appOV1EhlOeCh6ZdO';
    const tableId = 'tblgG67OFRZsgX4lI';

    if (!apiKey) {
      return Response.json(
        {
          success: false,
          error: 'Airtable API key not configured',
        } as ApiResponse<null>,
        { status: 500 }
      );
    }

    if (type === 'contact') {
      const { name, email, company, status = 'prospect' } = data;

      if (!name || !email || !company) {
        return Response.json(
          {
            success: false,
            error: 'Missing required contact fields: name, email, company',
          } as ApiResponse<null>,
          { status: 400 }
        );
      }

      try {
        const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            records: [
              {
                fields: {
                  Name: name,
                  Email: email,
                  Company: company,
                  Status: status,
                },
              },
            ],
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error('Airtable error:', errorData);
          return Response.json(
            {
              success: false,
              error: `Airtable API error: ${response.statusText}`,
            } as ApiResponse<null>,
            { status: response.status }
          );
        }

        const result: { records: AirtableRecord[] } = await response.json();
        const record = result.records[0];

        // Clear cache since we added new data
        delete cache['airtable_contacts'];

        const contact: Contact = {
          id: record.id,
          name,
          email,
          company,
          status,
          createdAt: new Date(record.createdTime).toISOString().split('T')[0],
        };

        return Response.json(
          {
            success: true,
            data: contact,
            timestamp: new Date(),
          } as ApiResponse<Contact>,
          { status: 201 }
        );
      } catch (error) {
        console.error('Error creating contact in Airtable:', error);
        return Response.json(
          {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create contact',
          } as ApiResponse<null>,
          { status: 500 }
        );
      }
    }

    return Response.json(
      {
        success: false,
        error: 'Deal creation not yet implemented',
      } as ApiResponse<null>,
      { status: 501 }
    );
  } catch (error) {
    console.error('Error in CRM POST:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process request',
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
