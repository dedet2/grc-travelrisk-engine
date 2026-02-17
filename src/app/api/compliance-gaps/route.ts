import { NextRequest, NextResponse } from 'next/server';

export type Framework = 'NIST CSF' | 'ISO 27001' | 'SOC 2' | 'GDPR';
export type ComplianceStatus = 'Met' | 'Partial' | 'Not Met';
export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface ComplianceGap {
  id: string;
  requirement: string;
  framework: Framework;
  currentStatus: ComplianceStatus;
  gap: string;
  priority: Priority;
  remediationPlan: string;
  estimatedEffort: string;
  owner: string;
  dueDate: string;
}

// Mock data - 20+ compliance gaps across frameworks
const COMPLIANCE_GAPS: ComplianceGap[] = [
  {
    id: 'gap-001',
    requirement: 'PR.AC-1 Identities and Credentials',
    framework: 'NIST CSF',
    currentStatus: 'Partial',
    gap: 'MFA not enforced for all users',
    priority: 'Critical',
    remediationPlan: 'Implement mandatory MFA across all systems using Azure AD',
    estimatedEffort: '40 hours',
    owner: 'security-team@company.com',
    dueDate: '2025-03-31',
  },
  {
    id: 'gap-002',
    requirement: 'PR.DS-1 Data Handling Process',
    framework: 'NIST CSF',
    currentStatus: 'Not Met',
    gap: 'Data classification policy not documented',
    priority: 'High',
    remediationPlan: 'Create and implement data classification standard',
    estimatedEffort: '60 hours',
    owner: 'compliance-officer@company.com',
    dueDate: '2025-04-15',
  },
  {
    id: 'gap-003',
    requirement: 'A.5.1.1 Information Security Policies',
    framework: 'ISO 27001',
    currentStatus: 'Partial',
    gap: 'Security policies incomplete for cloud services',
    priority: 'High',
    remediationPlan: 'Extend security policies to cover cloud infrastructure',
    estimatedEffort: '50 hours',
    owner: 'policy-team@company.com',
    dueDate: '2025-04-30',
  },
  {
    id: 'gap-004',
    requirement: 'A.6.2.2 User Resource Management',
    framework: 'ISO 27001',
    currentStatus: 'Not Met',
    gap: 'Formal user access review process missing',
    priority: 'Critical',
    remediationPlan: 'Establish quarterly access review procedures',
    estimatedEffort: '80 hours',
    owner: 'identity-team@company.com',
    dueDate: '2025-03-15',
  },
  {
    id: 'gap-005',
    requirement: 'A.9.2.1 User Password Management',
    framework: 'ISO 27001',
    currentStatus: 'Partial',
    gap: 'Password policy compliance monitoring not automated',
    priority: 'Medium',
    remediationPlan: 'Deploy automated password policy enforcement tool',
    estimatedEffort: '30 hours',
    owner: 'infrastructure-team@company.com',
    dueDate: '2025-05-31',
  },
  {
    id: 'gap-006',
    requirement: 'A.12.1.1 Audit Trails',
    framework: 'ISO 27001',
    currentStatus: 'Partial',
    gap: 'Audit logging incomplete for some systems',
    priority: 'High',
    remediationPlan: 'Implement centralized logging for all systems',
    estimatedEffort: '100 hours',
    owner: 'siem-team@company.com',
    dueDate: '2025-04-30',
  },
  {
    id: 'gap-007',
    requirement: 'C1.2 Change Management',
    framework: 'SOC 2',
    currentStatus: 'Partial',
    gap: 'Change approval workflow not consistently followed',
    priority: 'High',
    remediationPlan: 'Implement mandatory change management workflow system',
    estimatedEffort: '70 hours',
    owner: 'devops-team@company.com',
    dueDate: '2025-04-15',
  },
  {
    id: 'gap-008',
    requirement: 'C1.3 Separation of Duties',
    framework: 'SOC 2',
    currentStatus: 'Not Met',
    gap: 'Development and production environment access not separated',
    priority: 'Critical',
    remediationPlan: 'Enforce role-based access control with segregated duties',
    estimatedEffort: '120 hours',
    owner: 'security-team@company.com',
    dueDate: '2025-03-31',
  },
  {
    id: 'gap-009',
    requirement: 'CC6.1 Logical Boundaries',
    framework: 'SOC 2',
    currentStatus: 'Partial',
    gap: 'Network segmentation incomplete for critical systems',
    priority: 'Critical',
    remediationPlan: 'Redesign network architecture with proper segmentation',
    estimatedEffort: '200 hours',
    owner: 'network-team@company.com',
    dueDate: '2025-06-30',
  },
  {
    id: 'gap-010',
    requirement: 'CC6.2 Encryption',
    framework: 'SOC 2',
    currentStatus: 'Partial',
    gap: 'Data in transit not encrypted for all channels',
    priority: 'High',
    remediationPlan: 'Enforce TLS 1.2+ for all data transmission',
    estimatedEffort: '60 hours',
    owner: 'infrastructure-team@company.com',
    dueDate: '2025-04-30',
  },
  {
    id: 'gap-011',
    requirement: 'Article 5 - Data Protection Principles',
    framework: 'GDPR',
    currentStatus: 'Partial',
    gap: 'Data minimization not documented for all systems',
    priority: 'High',
    remediationPlan: 'Audit and document data retention policies',
    estimatedEffort: '90 hours',
    owner: 'dpo@company.com',
    dueDate: '2025-05-15',
  },
  {
    id: 'gap-012',
    requirement: 'Article 28 - Data Processor Agreements',
    framework: 'GDPR',
    currentStatus: 'Not Met',
    gap: 'Data Processing Agreements missing for 5 vendors',
    priority: 'Critical',
    remediationPlan: 'Execute DPAs with all identified processors',
    estimatedEffort: '40 hours',
    owner: 'legal-team@company.com',
    dueDate: '2025-03-15',
  },
  {
    id: 'gap-013',
    requirement: 'Article 32 - Security Measures',
    framework: 'GDPR',
    currentStatus: 'Partial',
    gap: 'Incident response plan does not address GDPR requirements',
    priority: 'High',
    remediationPlan: 'Update incident response plan with GDPR breach notification process',
    estimatedEffort: '50 hours',
    owner: 'incident-response@company.com',
    dueDate: '2025-04-30',
  },
  {
    id: 'gap-014',
    requirement: 'Article 34 - Breach Notification',
    framework: 'GDPR',
    currentStatus: 'Partial',
    gap: 'Breach notification timeline may exceed 72-hour requirement',
    priority: 'High',
    remediationPlan: 'Establish automated breach notification workflow',
    estimatedEffort: '60 hours',
    owner: 'incident-response@company.com',
    dueDate: '2025-04-15',
  },
  {
    id: 'gap-015',
    requirement: 'Article 35 - Privacy Impact Assessment',
    framework: 'GDPR',
    currentStatus: 'Not Met',
    gap: 'DPIA process not established for high-risk processing',
    priority: 'High',
    remediationPlan: 'Create and document DPIA procedure',
    estimatedEffort: '80 hours',
    owner: 'dpo@company.com',
    dueDate: '2025-05-31',
  },
  {
    id: 'gap-016',
    requirement: 'PR.IP-1 Security Awareness',
    framework: 'NIST CSF',
    currentStatus: 'Partial',
    gap: 'Security training not mandatory for all employees',
    priority: 'Medium',
    remediationPlan: 'Implement mandatory annual security training program',
    estimatedEffort: '40 hours',
    owner: 'hr-team@company.com',
    dueDate: '2025-06-30',
  },
  {
    id: 'gap-017',
    requirement: 'DE.CM-1 Vulnerability Scanning',
    framework: 'NIST CSF',
    currentStatus: 'Partial',
    gap: 'Vulnerability scanning not performed on all systems',
    priority: 'High',
    remediationPlan: 'Expand vulnerability scanning to 100% of assets',
    estimatedEffort: '75 hours',
    owner: 'security-team@company.com',
    dueDate: '2025-04-30',
  },
  {
    id: 'gap-018',
    requirement: 'A.10.1.1 Encryption',
    framework: 'ISO 27001',
    currentStatus: 'Not Met',
    gap: 'Database encryption at rest not implemented',
    priority: 'Critical',
    remediationPlan: 'Enable database encryption for all systems',
    estimatedEffort: '150 hours',
    owner: 'database-team@company.com',
    dueDate: '2025-05-15',
  },
  {
    id: 'gap-019',
    requirement: 'A.13.1.1 Information Transfer Policies',
    framework: 'ISO 27001',
    currentStatus: 'Partial',
    gap: 'USB usage policy not enforced',
    priority: 'Medium',
    remediationPlan: 'Deploy technical controls to restrict USB usage',
    estimatedEffort: '35 hours',
    owner: 'endpoint-security@company.com',
    dueDate: '2025-05-31',
  },
  {
    id: 'gap-020',
    requirement: 'CC7.2 Monitoring',
    framework: 'SOC 2',
    currentStatus: 'Partial',
    gap: 'Real-time security monitoring not implemented for all systems',
    priority: 'High',
    remediationPlan: 'Deploy security monitoring across entire infrastructure',
    estimatedEffort: '110 hours',
    owner: 'soc-team@company.com',
    dueDate: '2025-05-15',
  },
  {
    id: 'gap-021',
    requirement: 'Article 37 - Data Protection Officer',
    framework: 'GDPR',
    currentStatus: 'Met',
    gap: 'None - DPO appointed and publicly listed',
    priority: 'Low',
    remediationPlan: 'Annual DPO effectiveness review',
    estimatedEffort: '10 hours',
    owner: 'dpo@company.com',
    dueDate: '2025-12-31',
  },
  {
    id: 'gap-022',
    requirement: 'PR.AT-1 Security Awareness',
    framework: 'NIST CSF',
    currentStatus: 'Partial',
    gap: 'Third-party security training requirements not documented',
    priority: 'Medium',
    remediationPlan: 'Establish vendor security training requirements',
    estimatedEffort: '25 hours',
    owner: 'vendor-management@company.com',
    dueDate: '2025-06-30',
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  let filtered = COMPLIANCE_GAPS;

  // Filter by framework
  const framework = searchParams.get('framework');
  if (framework) {
    filtered = filtered.filter(g => g.framework === framework);
  }

  // Filter by priority
  const priority = searchParams.get('priority');
  if (priority) {
    filtered = filtered.filter(g => g.priority === priority);
  }

  // Filter by status
  const status = searchParams.get('status');
  if (status) {
    filtered = filtered.filter(g => g.currentStatus === status);
  }

  return NextResponse.json({
    data: filtered,
    total: filtered.length,
    filters: {
      framework: framework || null,
      priority: priority || null,
      status: status || null,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const required = ['requirement', 'framework', 'currentStatus', 'priority'];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const updatedGap: ComplianceGap = {
      id: body.id || `gap-${Date.now()}`,
      requirement: body.requirement,
      framework: body.framework,
      currentStatus: body.currentStatus,
      gap: body.gap || '',
      priority: body.priority,
      remediationPlan: body.remediationPlan || '',
      estimatedEffort: body.estimatedEffort || 'TBD',
      owner: body.owner || 'unassigned@company.com',
      dueDate: body.dueDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };

    return NextResponse.json({
      success: true,
      data: updatedGap,
      message: 'Compliance gap updated successfully',
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update compliance gap' },
      { status: 500 }
    );
  }
}
