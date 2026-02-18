import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

interface SearchResult {
  id: string;
  title: string;
  type: 'framework' | 'assessment' | 'control' | 'vendor' | 'incident' | 'policy';
  description: string;
  relevanceScore: number;
  url: string;
}

interface SearchResponse {
  query: string;
  total: number;
  limit: number;
  offset: number;
  results: SearchResult[];
  groupedByType: Record<string, SearchResult[]>;
}

const SEARCHABLE_ITEMS: SearchResult[] = [
  {
    id: 'fw-001',
    title: 'ISO 27001:2022',
    type: 'framework',
    description: 'Information security management system standard for organizations of all sizes',
    relevanceScore: 0.95,
    url: '/frameworks/fw-001',
  },
  {
    id: 'fw-002',
    title: 'NIST Cybersecurity Framework',
    type: 'framework',
    description: 'Voluntary framework to help organizations manage cybersecurity risks',
    relevanceScore: 0.92,
    url: '/frameworks/fw-002',
  },
  {
    id: 'fw-003',
    title: 'SOC 2 Type II',
    type: 'framework',
    description: 'Service Organization Control compliance framework for trust and confidentiality',
    relevanceScore: 0.88,
    url: '/frameworks/fw-003',
  },
  {
    id: 'fw-004',
    title: 'GDPR Compliance Framework',
    type: 'framework',
    description: 'General Data Protection Regulation framework for EU data privacy',
    relevanceScore: 0.90,
    url: '/frameworks/fw-004',
  },
  {
    id: 'ctrl-001',
    title: 'Access Control Policy',
    type: 'control',
    description: 'Mechanisms to prevent unauthorized access to systems and data resources',
    relevanceScore: 0.85,
    url: '/controls/ctrl-001',
  },
  {
    id: 'ctrl-002',
    title: 'Incident Response Procedures',
    type: 'control',
    description: 'Documented procedures for detecting and responding to security incidents',
    relevanceScore: 0.87,
    url: '/controls/ctrl-002',
  },
  {
    id: 'ctrl-003',
    title: 'Encryption Standards',
    type: 'control',
    description: 'Encryption protocols and standards for data protection in transit and at rest',
    relevanceScore: 0.89,
    url: '/controls/ctrl-003',
  },
  {
    id: 'ctrl-004',
    title: 'Backup and Recovery',
    type: 'control',
    description: 'Data backup and disaster recovery procedures to ensure business continuity',
    relevanceScore: 0.86,
    url: '/controls/ctrl-004',
  },
  {
    id: 'assess-001',
    title: 'Q1 2024 SOC 2 Assessment',
    type: 'assessment',
    description: 'Quarterly assessment of SOC 2 Type II compliance status and control effectiveness',
    relevanceScore: 0.91,
    url: '/assessments/assess-001',
  },
  {
    id: 'assess-002',
    title: 'GDPR Privacy Assessment',
    type: 'assessment',
    description: 'Data protection and privacy assessment against GDPR requirements',
    relevanceScore: 0.88,
    url: '/assessments/assess-002',
  },
  {
    id: 'vendor-001',
    title: 'Acme Cloud Services',
    type: 'vendor',
    description: 'Cloud infrastructure provider with SOC 2 Type II certification',
    relevanceScore: 0.84,
    url: '/vendors/vendor-001',
  },
  {
    id: 'vendor-002',
    title: 'SecureData Analytics',
    type: 'vendor',
    description: 'Data analytics platform with encryption and access controls',
    relevanceScore: 0.82,
    url: '/vendors/vendor-002',
  },
  {
    id: 'incident-001',
    title: 'Unauthorized Access Attempt - Jan 2024',
    type: 'incident',
    description: 'Failed brute force attack on admin portal detected and mitigated within 2 hours',
    relevanceScore: 0.79,
    url: '/incidents/incident-001',
  },
  {
    id: 'incident-002',
    title: 'Data Classification Error',
    type: 'incident',
    description: 'Sensitive customer data incorrectly classified as public, corrected immediately',
    relevanceScore: 0.77,
    url: '/incidents/incident-002',
  },
  {
    id: 'policy-001',
    title: 'Information Security Policy',
    type: 'policy',
    description: 'Company-wide policy governing information security practices and requirements',
    relevanceScore: 0.93,
    url: '/policies/policy-001',
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q')?.toLowerCase() || '';
    const scope = searchParams.get('scope') || 'all';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    let items = SEARCHABLE_ITEMS;

    if (scope !== 'all') {
      const scopes = scope.split('|');
      items = items.filter(item => scopes.includes(item.type));
    }

    let filtered = items;
    if (query) {
      filtered = items.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );

      filtered = filtered.map(item => {
        const titleMatch = item.title.toLowerCase().includes(query) ? 2 : 0;
        const descMatch = item.description.toLowerCase().includes(query) ? 1 : 0;
        return {
          ...item,
          relevanceScore: Math.min(
            0.99,
            item.relevanceScore + (titleMatch + descMatch) * 0.05
          ),
        };
      });
    }

    filtered.sort((a, b) => b.relevanceScore - a.relevanceScore);

    const paginated = filtered.slice(offset, offset + limit);

    const groupedByType = paginated.reduce(
      (acc, item) => {
        if (!acc[item.type]) {
          acc[item.type] = [];
        }
        acc[item.type].push(item);
        return acc;
      },
      {} as Record<string, SearchResult[]>
    );

    const response: ApiResponse<SearchResponse> = {
      success: true,
      data: {
        query,
        total: filtered.length,
        limit,
        offset,
        results: paginated,
        groupedByType,
      },
      timestamp: new Date(),
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Search failed';
    const response: ApiResponse<null> = {
      success: false,
      error: errorMessage,
      timestamp: new Date(),
    };
    return NextResponse.json(response, { status: 500 });
  }
}
