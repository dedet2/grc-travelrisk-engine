export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

interface Assessment {
  id: string;
  name: string;
  framework: string;
  status: 'completed' | 'in_progress' | 'scheduled';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  dueDate: string;
  assessor: string;
  findings: number;
  lastUpdated: string;
}

const assessmentsData: Assessment[] = [
  {
    id: 'ASS-001',
    name: 'ISO 27001 Gap Analysis',
    framework: 'ISO 27001',
    status: 'completed',
    riskLevel: 'medium',
    score: 78,
    dueDate: '2024-01-15',
    assessor: 'Sarah Johnson',
    findings: 12,
    lastUpdated: '2024-01-10'
  },
  {
    id: 'ASS-002',
    name: 'SOC 2 Type II Readiness',
    framework: 'SOC 2',
    status: 'in_progress',
    riskLevel: 'high',
    score: 62,
    dueDate: '2024-02-20',
    assessor: 'Mike Chen',
    findings: 8,
    lastUpdated: '2024-01-08'
  },
  {
    id: 'ASS-003',
    name: 'GDPR Compliance Review',
    framework: 'GDPR',
    status: 'completed',
    riskLevel: 'low',
    score: 92,
    dueDate: '2024-01-20',
    assessor: 'Emma Wilson',
    findings: 3,
    lastUpdated: '2024-01-12'
  },
  {
    id: 'ASS-004',
    name: 'PCI DSS Assessment',
    framework: 'PCI DSS',
    status: 'completed',
    riskLevel: 'critical',
    score: 45,
    dueDate: '2024-02-15',
    assessor: 'James Martinez',
    findings: 24,
    lastUpdated: '2024-01-06'
  },
  {
    id: 'ASS-005',
    name: 'NIST CSF Evaluation',
    framework: 'NIST CSF',
    status: 'in_progress',
    riskLevel: 'medium',
    score: 71,
    dueDate: '2024-02-28',
    assessor: 'David Kumar',
    findings: 15,
    lastUpdated: '2024-01-11'
  },
  {
    id: 'ASS-006',
    name: 'HIPAA Security Audit',
    framework: 'HIPAA',
    status: 'scheduled',
    riskLevel: 'high',
    score: 0,
    dueDate: '2024-03-10',
    assessor: 'Lisa Anderson',
    findings: 0,
    lastUpdated: '2024-01-01'
  },
  {
    id: 'ASS-007',
    name: 'Cloud Security Assessment',
    framework: 'Cloud Security',
    status: 'completed',
    riskLevel: 'medium',
    score: 75,
    dueDate: '2024-01-25',
    assessor: 'Robert Taylor',
    findings: 9,
    lastUpdated: '2024-01-09'
  },
  {
    id: 'ASS-008',
    name: 'Third-Party Risk Review',
    framework: 'Vendor Management',
    status: 'in_progress',
    riskLevel: 'low',
    score: 85,
    dueDate: '2024-02-10',
    assessor: 'Jennifer Brown',
    findings: 5,
    lastUpdated: '2024-01-07'
  }
];

export async function GET(request: NextRequest) {
  try {
    const stats = {
      total: assessmentsData.length,
      completed: assessmentsData.filter(a => a.status === 'completed').length,
      inProgress: assessmentsData.filter(a => a.status === 'in_progress').length,
      scheduled: assessmentsData.filter(a => a.status === 'scheduled').length,
      criticalFindings: assessmentsData.reduce((sum, a) => sum + (a.riskLevel === 'critical' ? 1 : 0), 0)
    };

    return NextResponse.json({
      success: true,
      data: {
        assessments: assessmentsData,
        stats
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch assessments',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, framework, riskLevel, dueDate, assessor } = body;

    if (!name || !framework || !riskLevel || !dueDate || !assessor) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, framework, riskLevel, dueDate, assessor',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    const newAssessment: Assessment = {
      id: `ASS-${String(assessmentsData.length + 1).padStart(3, '0')}`,
      name,
      framework,
      status: 'scheduled',
      riskLevel,
      score: 0,
      dueDate,
      assessor,
      findings: 0,
      lastUpdated: new Date().toISOString()
    };

    assessmentsData.push(newAssessment);

    return NextResponse.json(
      {
        success: true,
        data: newAssessment,
        timestamp: new Date().toISOString()
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating assessment:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create assessment',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
