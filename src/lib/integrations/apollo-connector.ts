export interface ApolloContact {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  title: string;
  company_name: string;
  organization_id: string;
  linkedIn_url?: string;
  phone_number?: string;
}

export interface ApolloPerson {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  title: string;
  company_name: string;
  organization_id: string;
  departments?: string[];
  seniority_level?: string;
}

export interface ApolloSearchResponse {
  contacts: ApolloPerson[];
  pagination: {
    page: number;
    per_page: number;
    total_entries: number;
  };
}

export interface ApolloEnrichResponse {
  person: ApolloPerson;
  contact: ApolloContact;
  enriched_at: string;
}

export class ApolloConnector {
  private apiKey: string;
  private baseUrl = 'https://api.apollo.io/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.APOLLO_API_KEY || '';
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    };
  }

  async searchPeopleByTitle(
    title: string,
    company?: string,
    limit: number = 10
  ): Promise<{ success: boolean; data?: ApolloPerson[]; error?: string }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'APOLLO_API_KEY not configured' };
      }

      const params = new URLSearchParams({
        api_key: this.apiKey,
        q_people_title: title,
        per_page: limit.toString(),
        page: '1',
      });

      if (company) {
        params.append('q_organization_name', company);
      }

      const response = await fetch(
        `${this.baseUrl}/mixed_people/search?${params}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Apollo API error: ${response.status} - ${errorText}`,
        };
      }

      const data = (await response.json()) as ApolloSearchResponse;
      return { success: true, data: data.contacts };
    } catch (error) {
      console.error('Error searching people in Apollo:', error);
      return {
        success: false,
        error: `Search failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  async enrichContact(
    email: string
  ): Promise<{ success: boolean; data?: ApolloEnrichResponse; error?: string }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'APOLLO_API_KEY not configured' };
      }

      const response = await fetch(
        `${this.baseUrl}/contacts/match`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            api_key: this.apiKey,
            email,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Apollo API error: ${response.status} - ${errorText}`,
        };
      }

      const contactData = (await response.json()) as { contact: ApolloContact };

      return {
        success: true,
        data: {
          person: {
            id: contactData.contact.id,
            first_name: contactData.contact.first_name,
            last_name: contactData.contact.last_name,
            email: contactData.contact.email,
            title: contactData.contact.title,
            company_name: contactData.contact.company_name,
            organization_id: contactData.contact.organization_id,
          },
          contact: contactData.contact,
          enriched_at: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Error enriching contact:', error);
      return {
        success: false,
        error: `Enrichment failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  async getContactDetails(
    contactId: string
  ): Promise<{ success: boolean; data?: ApolloContact; error?: string }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: 'APOLLO_API_KEY not configured' };
      }

      const params = new URLSearchParams({
        api_key: this.apiKey,
        id: contactId,
      });

      const response = await fetch(
        `${this.baseUrl}/contacts/details?${params}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to fetch contact details: ${response.status}`,
        };
      }

      const data = (await response.json()) as { contact: ApolloContact };
      return { success: true, data: data.contact };
    } catch (error) {
      console.error('Error getting contact details:', error);
      return {
        success: false,
        error: `Fetch failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    message: string;
  }> {
    if (!this.apiKey) {
      return { status: 'unhealthy', message: 'APOLLO_API_KEY not configured' };
    }
    return { status: 'healthy', message: 'Apollo connector ready' };
  }
}

export const apolloConnector = new ApolloConnector();
