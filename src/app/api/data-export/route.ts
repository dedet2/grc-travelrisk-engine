import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

interface ExportFormat {
  id: string;
  name: string;
  mimeType: string;
  extension: string;
}

interface Dataset {
  id: string;
  name: string;
  recordCount: number;
  lastExported: string;
  estimatedSize: string;
}

interface ExportRequest {
  dataset: string;
  format: string;
  filters?: Record<string, unknown>;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

interface ExportResponse {
  exportId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  estimatedTime: number;
}

const EXPORT_FORMATS: ExportFormat[] = [
  { id: 'csv', name: 'CSV', mimeType: 'text/csv', extension: 'csv' },
  { id: 'json', name: 'JSON', mimeType: 'application/json', extension: 'json' },
  { id: 'pdf', name: 'PDF', mimeType: 'application/pdf', extension: 'pdf' },
  { id: 'xlsx', name: 'Excel (XLSX)', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', extension: 'xlsx' },
];

const DATASETS: Dataset[] = [
  {
    id: 'frameworks',
    name: 'Compliance Frameworks',
    recordCount: 12,
    lastExported: new Date(Date.now() - 2 * 24 * 60 * 60000).toISOString(),
    estimatedSize: '245 KB',
  },
  {
    id: 'assessments',
    name: 'Assessments',
    recordCount: 156,
    lastExported: new Date(Date.now() - 1 * 24 * 60 * 60000).toISOString(),
    estimatedSize: '3.2 MB',
  },
  {
    id: 'controls',
    name: 'Controls',
    recordCount: 487,
    lastExported: new Date(Date.now() - 3 * 24 * 60 * 60000).toISOString(),
    estimatedSize: '2.8 MB',
  },
  {
    id: 'vendors',
    name: 'Vendor Management',
    recordCount: 89,
    lastExported: new Date(Date.now() - 5 * 24 * 60 * 60000).toISOString(),
    estimatedSize: '1.5 MB',
  },
  {
    id: 'incidents',
    name: 'Security Incidents',
    recordCount: 34,
    lastExported: new Date(Date.now() - 7 * 24 * 60 * 60000).toISOString(),
    estimatedSize: '892 KB',
  },
  {
    id: 'compliance_gaps',
    name: 'Compliance Gaps',
    recordCount: 127,
    lastExported: new Date(Date.now() - 1 * 24 * 60 * 60000).toISOString(),
    estimatedSize: '2.1 MB',
  },
  {
    id: 'policies',
    name: 'Policies & Procedures',
    recordCount: 67,
    lastExported: new Date(Date.now() - 4 * 24 * 60 * 60000).toISOString(),
    estimatedSize: '4.3 MB',
  },
  {
    id: 'risk_scores',
    name: 'Risk Scores',
    recordCount: 512,
    lastExported: new Date().toISOString(),
    estimatedSize: '5.8 MB',
  },
  {
    id: 'audit_logs',
    name: 'Audit Logs',
    recordCount: 2847,
    lastExported: new Date(Date.now() - 6 * 60 * 60000).toISOString(),
    estimatedSize: '12.4 MB',
  },
  {
    id: 'training',
    name: 'Security Training Records',
    recordCount: 203,
    lastExported: new Date(Date.now() - 10 * 24 * 60 * 60000).toISOString(),
    estimatedSize: '1.8 MB',
  },
];

function generateExportId(): string {
  return `exp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

function getEstimatedTime(dataset: Dataset, format: ExportFormat): number {
  const baseTime = Math.ceil(dataset.recordCount / 100) * 1000;

  const formatMultiplier: Record<string, number> = {
    csv: 1.0,
    json: 1.2,
    xlsx: 1.8,
    pdf: 2.5,
  };

  return Math.max(1000, baseTime * (formatMultiplier[format.id] || 1.0));
}

export async function GET(_req: NextRequest) {
  try {
    const response: ApiResponse<{
      formats: ExportFormat[];
      datasets: Dataset[];
    }> = {
      success: true,
      data: {
        formats: EXPORT_FORMATS,
        datasets: DATASETS,
      },
      timestamp: new Date(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching export options:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch export options',
      timestamp: new Date(),
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: ExportRequest = await req.json();

    const { dataset, format, filters, dateRange } = body;

    if (!dataset || !format) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Missing required fields: dataset and format',
        timestamp: new Date(),
      };
      return NextResponse.json(response, { status: 400 });
    }

    const datasetInfo = DATASETS.find((d) => d.id === dataset);
    const formatInfo = EXPORT_FORMATS.find((f) => f.id === format);

    if (!datasetInfo || !formatInfo) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Invalid dataset or format specified',
        timestamp: new Date(),
      };
      return NextResponse.json(response, { status: 400 });
    }

    const exportId = generateExportId();
    const estimatedTime = getEstimatedTime(datasetInfo, formatInfo);

    const exportResponse: ApiResponse<ExportResponse> = {
      success: true,
      data: {
        exportId,
        status: 'pending',
        downloadUrl: `/api/data-export/download/${exportId}`,
        estimatedTime,
      },
      timestamp: new Date(),
    };

    console.log('Export requested:', {
      exportId,
      dataset,
      format,
      filters,
      dateRange,
      estimatedTime,
    });

    return NextResponse.json(exportResponse, { status: 202 });
  } catch (error) {
    console.error('Error processing export request:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process export request',
      timestamp: new Date(),
    };
    return NextResponse.json(response, { status: 500 });
  }
}
