/**
 * Airtable Integration - Customer Sync and Upsert Utilities
 * Provides bidirectional sync with Airtable bases
 */

const API_BASE = 'https://api.airtable.com/v0';

interface AirtableRecord {
  [key: string]: unknown;
}

interface AirtableListResponse {
  records?: Array<{
    id: string;
    fields: AirtableRecord;
  }>;
  offset?: string;
}

interface AirtableCreateResponse {
  records?: Array<{
    id: string;
    fields: AirtableRecord;
  }>;
}

/**
 * Get Airtable credentials from environment
 */
function getAirtableCredentials(): { apiKey: string; baseId: string; tableCustomers: string } {
  const apiKey = process.env.AIRTABLE_API_KEY || '';
  const baseId = process.env.AIRTABLE_BASE_ID || '';
  const tableCustomers = process.env.AIRTABLE_TABLE_CUSTOMERS || 'Customers';

  return { apiKey, baseId, tableCustomers };
}

/**
 * Get default headers for Airtable API calls
 */
function getHeaders(apiKey: string): HeadersInit {
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Check if Airtable is configured
 */
export function isAirtableConfigured(): boolean {
  const { apiKey, baseId } = getAirtableCredentials();
  return !!(apiKey && baseId);
}

/**
 * Fetch a customer from Airtable by email
 */
export async function fetchCustomerByEmail(
  email: string
): Promise<{ id: string; fields: AirtableRecord } | null> {
  const { apiKey, baseId, tableCustomers } = getAirtableCredentials();

  if (!apiKey || !baseId) {
    console.warn('Airtable not configured');
    return null;
  }

  try {
    const filterFormula = `{Email}='${email.replace(/'/g, "\\'")}'`;
    const url = `${API_BASE}/${baseId}/${encodeURIComponent(tableCustomers)}?filterByFormula=${encodeURIComponent(
      filterFormula
    )}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(apiKey),
    });

    if (!response.ok) {
      console.error('Airtable fetch error:', response.statusText);
      return null;
    }

    const data = (await response.json()) as AirtableListResponse;
    return data.records?.[0] || null;
  } catch (error) {
    console.error('Error fetching customer from Airtable:', error);
    return null;
  }
}

/**
 * Update an existing Airtable record
 */
export async function updateAirtableRecord(
  recordId: string,
  fields: AirtableRecord,
  tableName: string = 'Customers'
): Promise<boolean> {
  const { apiKey, baseId } = getAirtableCredentials();

  if (!apiKey || !baseId) {
    console.warn('Airtable not configured');
    return false;
  }

  try {
    const url = `${API_BASE}/${baseId}/${encodeURIComponent(tableName)}/${recordId}`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: getHeaders(apiKey),
      body: JSON.stringify({ fields }),
    });

    if (!response.ok) {
      console.error('Airtable update error:', response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating Airtable record:', error);
    return false;
  }
}

/**
 * Create a new Airtable record
 */
export async function createAirtableRecord(
  fields: AirtableRecord,
  tableName: string = 'Customers'
): Promise<string | null> {
  const { apiKey, baseId } = getAirtableCredentials();

  if (!apiKey || !baseId) {
    console.warn('Airtable not configured');
    return null;
  }

  try {
    const url = `${API_BASE}/${baseId}/${encodeURIComponent(tableName)}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(apiKey),
      body: JSON.stringify({ records: [{ fields }] }),
    });

    if (!response.ok) {
      console.error('Airtable create error:', response.statusText);
      return null;
    }

    const data = (await response.json()) as AirtableCreateResponse;
    return data.records?.[0]?.id || null;
  } catch (error) {
    console.error('Error creating Airtable record:', error);
    return null;
  }
}

/**
 * Upsert a customer (create if not exists, update if exists)
 */
export async function upsertCustomer(
  email: string,
  data: AirtableRecord
): Promise<{
  success: boolean;
  id?: string;
  action?: 'created' | 'updated';
  message?: string;
}> {
  if (!email) {
    return {
      success: false,
      message: 'Email is required',
    };
  }

  try {
    // Try to find existing customer
    const existing = await fetchCustomerByEmail(email);

    if (existing) {
      // Update existing record
      const updated = await updateAirtableRecord(existing.id, data);
      if (updated) {
        return {
          success: true,
          id: existing.id,
          action: 'updated',
          message: `Customer ${email} updated`,
        };
      } else {
        return {
          success: false,
          message: 'Failed to update customer',
        };
      }
    } else {
      // Create new record
      const recordId = await createAirtableRecord(data);
      if (recordId) {
        return {
          success: true,
          id: recordId,
          action: 'created',
          message: `Customer ${email} created`,
        };
      } else {
        return {
          success: false,
          message: 'Failed to create customer',
        };
      }
    }
  } catch (error) {
    console.error('Error upserting customer:', error);
    return {
      success: false,
      message: String(error),
    };
  }
}

/**
 * Fetch all records from a table
 */
export async function fetchAllRecords(
  tableName: string = 'Customers',
  filterFormula?: string
): Promise<Array<{ id: string; fields: AirtableRecord }>> {
  const { apiKey, baseId } = getAirtableCredentials();

  if (!apiKey || !baseId) {
    console.warn('Airtable not configured');
    return [];
  }

  try {
    const params = new URLSearchParams();
    if (filterFormula) {
      params.append('filterByFormula', filterFormula);
    }

    const url = `${API_BASE}/${baseId}/${encodeURIComponent(tableName)}?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(apiKey),
    });

    if (!response.ok) {
      console.error('Airtable fetch all error:', response.statusText);
      return [];
    }

    const data = (await response.json()) as AirtableListResponse;
    return data.records || [];
  } catch (error) {
    console.error('Error fetching records from Airtable:', error);
    return [];
  }
}

/**
 * Sync a batch of customers to Airtable
 */
export async function syncCustomerBatch(
  customers: Array<{ email: string; data: AirtableRecord }>
): Promise<{
  successful: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
}> {
  const results = {
    successful: 0,
    failed: 0,
    errors: [] as Array<{ email: string; error: string }>,
  };

  for (const customer of customers) {
    try {
      const result = await upsertCustomer(customer.email, customer.data);
      if (result.success) {
        results.successful++;
      } else {
        results.failed++;
        results.errors.push({
          email: customer.email,
          error: result.message || 'Unknown error',
        });
      }
    } catch (error) {
      results.failed++;
      results.errors.push({
        email: customer.email,
        error: String(error),
      });
    }
  }

  return results;
}

/**
 * Delete an Airtable record
 */
export async function deleteAirtableRecord(
  recordId: string,
  tableName: string = 'Customers'
): Promise<boolean> {
  const { apiKey, baseId } = getAirtableCredentials();

  if (!apiKey || !baseId) {
    console.warn('Airtable not configured');
    return false;
  }

  try {
    const url = `${API_BASE}/${baseId}/${encodeURIComponent(tableName)}/${recordId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders(apiKey),
    });

    if (!response.ok) {
      console.error('Airtable delete error:', response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting Airtable record:', error);
    return false;
  }
}
