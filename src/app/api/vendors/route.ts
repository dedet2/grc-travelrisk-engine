import { NextRequest, NextResponse } from 'next/server';
import type { Vendor } from '@/lib/vendor/vendor-risk-manager';

// Mock data - 10 realistic vendors with risk profiles
const VENDORS: Vendor[] = [
  {
    id: 'vendor-001',
    name: 'AWS',
    category: 'Cloud Services',
    riskTier: 'Low',
    complianceCertifications: ['SOC 2 Type II', 'ISO 27001', 'GDPR', 'HIPAA', 'FedRAMP'],
    lastAssessmentDate: '2025-02-01',
    nextAssessmentDue: '2026-02-01',
    overallScore: 92,
    dataAccess: ['Customer Data', 'Financial Records', 'Infrastructure'],
    contractExpiry: '2027-12-31',
    primaryContact: 'enterprise-support@aws.amazon.com',
    status: 'Active',
  },
  {
    id: 'vendor-002',
    name: 'Salesforce',
    category: 'SaaS',
    riskTier: 'Low',
    complianceCertifications: ['SOC 2 Type II', 'ISO 27001', 'GDPR', 'CCPA'],
    lastAssessmentDate: '2025-01-15',
    nextAssessmentDue: '2026-01-15',
    overallScore: 88,
    dataAccess: ['CRM Data', 'Customer Information'],
    contractExpiry: '2026-06-30',
    primaryContact: 'account-manager@salesforce.com',
    status: 'Active',
  },
  {
    id: 'vendor-003',
    name: 'Okta',
    category: 'Cloud Services',
    riskTier: 'Low',
    complianceCertifications: ['SOC 2 Type II', 'ISO 27001', 'GDPR', 'FedRAMP'],
    lastAssessmentDate: '2025-02-05',
    nextAssessmentDue: '2026-02-05',
    overallScore: 90,
    dataAccess: ['Identity Data', 'Access Logs', 'Authentication'],
    contractExpiry: '2026-09-15',
    primaryContact: 'support@okta.com',
    status: 'Active',
  },
  {
    id: 'vendor-004',
    name: 'Datadog',
    category: 'Infrastructure',
    riskTier: 'Medium',
    complianceCertifications: ['SOC 2 Type II', 'ISO 27001', 'GDPR'],
    lastAssessmentDate: '2024-11-20',
    nextAssessmentDue: '2025-11-20',
    overallScore: 78,
    dataAccess: ['Monitoring Data', 'System Metrics', 'Log Data'],
    contractExpiry: '2026-03-31',
    primaryContact: 'enterprise@datadoghq.com',
    status: 'Active',
  },
  {
    id: 'vendor-005',
    name: 'Snowflake',
    category: 'Data Processing',
    riskTier: 'High',
    complianceCertifications: ['SOC 2 Type II', 'ISO 27001', 'GDPR', 'HIPAA'],
    lastAssessmentDate: '2024-10-10',
    nextAssessmentDue: '2025-04-10',
    overallScore: 72,
    dataAccess: ['Data Warehouse', 'Analytics Data', 'Sensitive Records'],
    contractExpiry: '2027-01-31',
    primaryContact: 'enterprise@snowflake.com',
    status: 'At Risk',
  },
  {
    id: 'vendor-006',
    name: 'CrowdStrike',
    category: 'Infrastructure',
    riskTier: 'Medium',
    complianceCertifications: ['SOC 2 Type II', 'ISO 27001', 'FedRAMP'],
    lastAssessmentDate: '2025-01-08',
    nextAssessmentDue: '2025-07-08',
    overallScore: 81,
    dataAccess: ['Endpoint Data', 'Threat Intelligence', 'System Logs'],
    contractExpiry: '2026-12-15',
    primaryContact: 'sales@crowdstrike.com',
    status: 'Active',
  },
  {
    id: 'vendor-007',
    name: 'Slack',
    category: 'SaaS',
    riskTier: 'Low',
    complianceCertifications: ['SOC 2 Type II', 'ISO 27001', 'GDPR', 'HIPAA'],
    lastAssessmentDate: '2025-02-10',
    nextAssessmentDue: '2026-02-10',
    overallScore: 87,
    dataAccess: ['Communication Data', 'User Information'],
    contractExpiry: '2026-05-30',
    primaryContact: 'enterprise-support@slack.com',
    status: 'Active',
  },
  {
    id: 'vendor-008',
    name: 'GitHub',
    category: 'Cloud Services',
    riskTier: 'Medium',
    complianceCertifications: ['SOC 2 Type II', 'ISO 27001', 'GDPR', 'FedRAMP'],
    lastAssessmentDate: '2024-12-15',
    nextAssessmentDue: '2025-12-15',
    overallScore: 79,
    dataAccess: ['Code Repository', 'CI/CD Data', 'Developer Information'],
    contractExpiry: '2027-03-31',
    primaryContact: 'enterprise@github.com',
    status: 'Active',
  },
  {
    id: 'vendor-009',
    name: 'MongoDB',
    category: 'Data Processing',
    riskTier: 'High',
    complianceCertifications: ['SOC 2 Type II', 'ISO 27001', 'GDPR'],
    lastAssessmentDate: '2024-09-20',
    nextAssessmentDue: '2025-03-20',
    overallScore: 71,
    dataAccess: ['Database', 'Application Data', 'Customer Records'],
    contractExpiry: '2026-08-31',
    primaryContact: 'enterprise-support@mongodb.com',
    status: 'At Risk',
  },
  {
    id: 'vendor-010',
    name: 'Twilio',
    category: 'SaaS',
    riskTier: 'Medium',
    complianceCertifications: ['SOC 2 Type II', 'ISO 27001', 'GDPR', 'HIPAA'],
    lastAssessmentDate: '2025-01-25',
    nextAssessmentDue: '2025-07-25',
    overallScore: 77,
    dataAccess: ['Communication Data', 'Phone Numbers', 'Message Logs'],
    contractExpiry: '2026-11-30',
    primaryContact: 'enterprise-support@twilio.com',
    status: 'Active',
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  let filtered = VENDORS;

  // Filter by tier
  const tier = searchParams.get('tier');
  if (tier) {
    filtered = filtered.filter(v => v.riskTier === tier);
  }

  // Filter by status
  const status = searchParams.get('status');
  if (status) {
    filtered = filtered.filter(v => v.status === status);
  }

  // Filter by category
  const category = searchParams.get('category');
  if (category) {
    filtered = filtered.filter(v => v.category === category);
  }

  return NextResponse.json({
    data: filtered,
    total: filtered.length,
    filters: {
      tier: tier || null,
      status: status || null,
      category: category || null,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const required = ['id', 'name', 'category', 'riskTier', 'status'];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const newVendor: Vendor = {
      id: body.id,
      name: body.name,
      category: body.category,
      riskTier: body.riskTier,
      complianceCertifications: body.complianceCertifications || [],
      lastAssessmentDate: body.lastAssessmentDate || new Date().toISOString().split('T')[0],
      nextAssessmentDue: body.nextAssessmentDue || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      overallScore: body.overallScore || 50,
      dataAccess: body.dataAccess || [],
      contractExpiry: body.contractExpiry || new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      primaryContact: body.primaryContact || 'not-provided@vendor.com',
      status: body.status,
    };

    return NextResponse.json({
      success: true,
      data: newVendor,
      message: 'Vendor added successfully',
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create vendor' },
      { status: 500 }
    );
  }
}
