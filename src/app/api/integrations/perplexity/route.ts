import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';
import { PerplexityConnector } from '@/lib/integrations/perplexity-connector';

interface PerplexityStatus extends ApiResponse<{
  connected: boolean;
  models: string[];
  templates: number;
  lastQuery: string;
}> {
  success: boolean;
  message?: string;
}

export async function GET(): Promise<
  NextResponse<PerplexityStatus>
> {
  try {
    const connector = new PerplexityConnector(process.env.PERPLEXITY_API_KEY || '');
    const templates = await connector.listTemplates();

    const response: PerplexityStatus = {
      success: true,
      message: 'Perplexity integration status retrieved',
      data: {
        connected: true,
        models: ['sonar', 'sonar-pro'],
        templates: templates.length,
        lastQuery: new Date().toISOString(),
      },
      timestamp: new Date(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error getting Perplexity status:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to get Perplexity status',
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}

interface PerplexityAction {
  action: string;
  query?: string;
  model?: string;
  country?: string;
  threatType?: string;
  jurisdiction?: string;
  regulatoryDomain?: string;
  topic?: string;
  industry?: string;
  researchId?: string;
  domain?: string;
  language?: string;
}

interface ActionResponse extends ApiResponse<unknown> {
  success: boolean;
  message?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ActionResponse>> {
  try {
    const body = (await request.json()) as PerplexityAction;
    const {
      action,
      query,
      model,
      country,
      threatType,
      jurisdiction,
      regulatoryDomain,
      topic,
      industry,
      researchId,
      domain,
      language,
    } = body;

    const connector = new PerplexityConnector(process.env.PERPLEXITY_API_KEY || '');

    if (action === 'list-templates') {
      const templates = await connector.listTemplates();
      return NextResponse.json({
        success: true,
        message: 'Templates retrieved',
        data: templates,
        timestamp: new Date(),
      });
    }

    if (action === 'query' && query) {
      const result = await connector.query(query, model || 'sonar');
      return NextResponse.json({
        success: true,
        message: 'Query processed',
        data: result,
        timestamp: new Date(),
      });
    }

    if (action === 'threat-intelligence' && country) {
      const threats = await connector.queryThreatIntelligence(
        country,
        threatType || 'all'
      );
      return NextResponse.json({
        success: true,
        message: 'Threat intelligence retrieved',
        data: threats,
        timestamp: new Date(),
      });
    }

    if (action === 'regulatory-changes' && jurisdiction) {
      const changes = await connector.monitorRegulatoryChanges(
        jurisdiction,
        regulatoryDomain || 'data-protection'
      );
      return NextResponse.json({
        success: true,
        message: 'Regulatory changes retrieved',
        data: changes,
        timestamp: new Date(),
      });
    }

    if (action === 'market-research' && topic) {
      const result = await connector.conductMarketResearch(topic, industry);
      return NextResponse.json({
        success: true,
        message: 'Market research completed',
        data: result,
        timestamp: new Date(),
      });
    }

    if (action === 'get-status' && researchId) {
      const status = await connector.getResearchStatus(researchId);
      return NextResponse.json({
        success: true,
        message: 'Research status retrieved',
        data: status,
        timestamp: new Date(),
      });
    }

    if (action === 'search-with-citations' && query) {
      const result = await connector.searchWithCitations(query, {
        domain,
        language,
      });
      return NextResponse.json({
        success: true,
        message: 'Search with citations completed',
        data: result,
        timestamp: new Date(),
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Invalid action or missing required parameters',
        timestamp: new Date(),
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in Perplexity integration:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process Perplexity request',
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
