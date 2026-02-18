export interface ResearchQuery {
  id: string;
  query: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

export interface ResearchResult {
  id: string;
  query: string;
  answer: string;
  citations: Citation[];
  sources: string[];
  confidence: number;
  generatedAt: string;
}

export interface Citation {
  id: string;
  source: string;
  title?: string;
  url?: string;
  relevanceScore: number;
}

export interface ThreatIntelligence {
  id: string;
  country: string;
  threatType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  lastUpdated: string;
  citations: Citation[];
}

export interface RegulatoryChange {
  id: string;
  jurisdiction: string;
  regulation: string;
  changeType: string;
  effectiveDate: string;
  summary: string;
  citations: Citation[];
}

export interface ResearchTemplate {
  id: string;
  name: string;
  description: string;
  templateQuery: string;
  category: string;
}

export class PerplexityConnector {
  private apiUrl = 'https://api.perplexity.ai/v1';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  private getPreconfiguredTemplates(): ResearchTemplate[] {
    return [
      {
        id: 'tpl-001',
        name: 'Country Risk Briefing',
        description: 'Comprehensive risk assessment for a specific country',
        templateQuery:
          'Provide a comprehensive risk briefing for [COUNTRY] including security threats, health risks, natural disasters, and infrastructure status.',
        category: 'country-analysis',
      },
      {
        id: 'tpl-002',
        name: 'Regulatory Updates',
        description:
          'Latest regulatory changes and compliance requirements',
        templateQuery:
          'What are the latest regulatory changes in [JURISDICTION] related to [REGULATORY_DOMAIN]? Include effective dates and key requirements.',
        category: 'regulatory',
      },
      {
        id: 'tpl-003',
        name: 'Threat Landscape Analysis',
        description: 'Current threat actors, vulnerabilities, and risks',
        templateQuery:
          'Analyze the current threat landscape for [INDUSTRY/REGION] including emerging threats, threat actors, and recommended defenses.',
        category: 'threat-intelligence',
      },
      {
        id: 'tpl-004',
        name: 'Competitor Intelligence',
        description: 'Competitive positioning and market analysis',
        templateQuery:
          'Provide intelligence on [COMPETITOR] including their market positioning, products, partnerships, and recent developments.',
        category: 'competitive-analysis',
      },
      {
        id: 'tpl-005',
        name: 'Industry Trends',
        description:
          'Emerging trends, innovations, and market developments',
        templateQuery:
          'What are the key trends and innovations in the [INDUSTRY] sector? Include market drivers and future outlook.',
        category: 'market-analysis',
      },
    ];
  }

  async listTemplates(): Promise<ResearchTemplate[]> {
    try {
      return this.getPreconfiguredTemplates();
    } catch (error) {
      console.error('Error listing templates:', error);
      throw error;
    }
  }

  async query(
    query: string,
    model: string = 'sonar'
  ): Promise<ResearchResult> {
    try {
      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'user',
              content: query,
            },
          ],
          return_citations: true,
          search_recency_filter: 'month',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to query: ${response.statusText}`);
      }

      const data = await response.json() as {
        id: string;
        choices: Array<{ message: { content: string } }>;
        citations?: string[];
      };

      const resultId = `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const citations: Citation[] = (data.citations || []).map(
        (source, index) => ({
          id: `cite-${index}`,
          source: source,
          relevanceScore: 0.95 - index * 0.05,
        })
      );

      return {
        id: resultId,
        query,
        answer:
          data.choices[0]?.message?.content || 'Unable to process query',
        citations,
        sources: data.citations || [],
        confidence: 0.92,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error querying Perplexity:', error);
      throw error;
    }
  }

  async queryThreatIntelligence(
    country: string,
    threatType: string = 'all'
  ): Promise<ThreatIntelligence[]> {
    try {
      const query = `Identify current ${threatType === 'all' ? 'security, cyber, and physical' : threatType} threats in ${country}. Include severity levels and recent incidents.`;
      const result = await this.query(query);

      const threats: ThreatIntelligence[] = [
        {
          id: `threat-${Date.now()}`,
          country,
          threatType,
          severity: 'high',
          description: result.answer,
          lastUpdated: new Date().toISOString(),
          citations: result.citations,
        },
      ];

      return threats;
    } catch (error) {
      console.error('Error querying threat intelligence:', error);
      throw error;
    }
  }

  async monitorRegulatoryChanges(
    jurisdiction: string,
    regulatoryDomain: string = 'data-protection'
  ): Promise<RegulatoryChange[]> {
    try {
      const query = `What are the latest ${regulatoryDomain} regulatory changes in ${jurisdiction}? Include effective dates and compliance requirements.`;
      const result = await this.query(query);

      const changes: RegulatoryChange[] = [
        {
          id: `reg-${Date.now()}`,
          jurisdiction,
          regulation: regulatoryDomain,
          changeType: 'update',
          effectiveDate: new Date(Date.now() + 86400000 * 30).toISOString(),
          summary: result.answer,
          citations: result.citations,
        },
      ];

      return changes;
    } catch (error) {
      console.error('Error monitoring regulatory changes:', error);
      throw error;
    }
  }

  async conductMarketResearch(
    topic: string,
    industry?: string
  ): Promise<ResearchResult> {
    try {
      const query = industry
        ? `Conduct market research on ${topic} in the ${industry} industry. Include market size, growth trends, key players, and opportunities.`
        : `Conduct market research on ${topic}. Include key trends, market drivers, competitive landscape, and future outlook.`;

      return await this.query(query);
    } catch (error) {
      console.error('Error conducting market research:', error);
      throw error;
    }
  }

  async getResearchStatus(
    researchId: string
  ): Promise<ResearchQuery> {
    try {
      const response = await fetch(
        `${this.apiUrl}/research/${researchId}`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to get research status: ${response.statusText}`
        );
      }

      const data = await response.json() as ResearchQuery;
      return data;
    } catch (error) {
      console.error('Error getting research status:', error);
      throw error;
    }
  }

  async searchWithCitations(
    query: string,
    filters?: { domain?: string; language?: string }
  ): Promise<ResearchResult> {
    try {
      const response = await fetch(
        `${this.apiUrl}/search?q=${encodeURIComponent(query)}`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            filters,
            include_citations: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to search: ${response.statusText}`);
      }

      const data = await response.json() as {
        results: Array<{ content: string; source: string; url?: string }>;
      };

      const resultId = `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const citations: Citation[] = (data.results || []).map(
        (result, index) => ({
          id: `cite-${index}`,
          source: result.source,
          url: result.url,
          relevanceScore: 0.95 - index * 0.05,
        })
      );

      const answer = data.results
        .map((r) => r.content)
        .join('\n\n');

      return {
        id: resultId,
        query,
        answer,
        citations,
        sources: data.results.map((r) => r.source),
        confidence: 0.94,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error searching with citations:', error);
      throw error;
    }
  }
}
