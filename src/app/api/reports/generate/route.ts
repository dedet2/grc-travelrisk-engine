import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';
import { ReportGenerator } from '@/lib/reports/report-generator';

interface GenerateReportRequest {
  type: 'compliance' | 'risk' | 'executive' | 'travel-risk';
  params?: {
    frameworkId?: string;
    trips?: Array<{
      legs: Array<{
        destination: string;
        riskScore: number;
        riskLevel: 'low' | 'medium' | 'high' | 'critical';
        advisoryLevel: 1 | 2 | 3 | 4;
        recommendations: string[];
      }>;
      overallTripScore: number;
      overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
    }>;
  };
}

interface ReportType {
  type: 'compliance' | 'risk' | 'executive' | 'travel-risk';
  name: string;
  description: string;
  requiredParams: string[];
}

const reportTypes: ReportType[] = [
  {
    type: 'compliance',
    name: 'Compliance Report',
    description:
      'Comprehensive assessment of organizational compliance posture against a specified framework.',
    requiredParams: ['frameworkId'],
  },
  {
    type: 'risk',
    name: 'Risk Report',
    description:
      'Detailed analysis of organizational risk landscape with metrics, trends, and top risks.',
    requiredParams: [],
  },
  {
    type: 'executive',
    name: 'Executive Report',
    description:
      'Board-level summary combining compliance, risk, and business metrics with key recommendations.',
    requiredParams: [],
  },
  {
    type: 'travel-risk',
    name: 'Travel Risk Report',
    description:
      'Per-destination breakdown of health, security, and infrastructure risks for planned trips.',
    requiredParams: ['trips'],
  },
];

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<ReportType[]>>> {
  try {
    return NextResponse.json(
      {
        success: true,
        data: reportTypes,
        timestamp: new Date(),
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<object>>> {
  try {
    const body: GenerateReportRequest = await request.json();
    const { type, params } = body;

    if (!type) {
      return NextResponse.json(
        {
          success: false,
          error: 'Report type is required',
          timestamp: new Date(),
        },
        { status: 400 }
      );
    }

    const generator = new ReportGenerator('api-user');
    let report: object;

    switch (type) {
      case 'compliance': {
        if (!params?.frameworkId) {
          return NextResponse.json(
            {
              success: false,
              error: 'frameworkId is required for compliance reports',
              timestamp: new Date(),
            },
            { status: 400 }
          );
        }
        report = generator.generateComplianceReport(params.frameworkId);
        break;
      }

      case 'risk': {
        report = generator.generateRiskReport();
        break;
      }

      case 'executive': {
        report = generator.generateExecutiveReport();
        break;
      }

      case 'travel-risk': {
        if (!params?.trips || params.trips.length === 0) {
          return NextResponse.json(
            {
              success: false,
              error: 'trips array is required for travel-risk reports',
              timestamp: new Date(),
            },
            { status: 400 }
          );
        }
        report = generator.generateTravelRiskReport(params.trips as any);
        break;
      }

      default: {
        return NextResponse.json(
          {
            success: false,
            error: `Unknown report type: ${type}`,
            timestamp: new Date(),
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: report,
        timestamp: new Date(),
      },
      { status: 201 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      },
      { status: 500 }
    );
  }
}
