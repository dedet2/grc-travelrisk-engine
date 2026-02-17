import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

interface Policy {
  id: string;
  name: string;
  category: string;
  version: string;
  status: 'Active' | 'Draft' | 'Under Review' | 'Deprecated';
  lastReviewed: Date;
  nextReview: Date;
  owner: string;
  approver: string;
  description: string;
  keyRequirements: string[];
  applicableTo: string[];
  complianceMapping: Array<{
    framework: string;
    control: string;
  }>;
}

interface CreatePolicyRequest {
  name: string;
  category: string;
  version: string;
  owner: string;
  approver: string;
  description: string;
  keyRequirements: string[];
  applicableTo: string[];
  complianceMapping: Array<{
    framework: string;
    control: string;
  }>;
}

const policies: Policy[] = [
  {
    id: 'policy-001',
    name: 'Acceptable Use Policy',
    category: 'Security',
    version: '2.1',
    status: 'Active',
    lastReviewed: new Date('2025-01-15'),
    nextReview: new Date('2025-07-15'),
    owner: 'Chief Information Officer',
    approver: 'Chief Compliance Officer',
    description:
      'Establishes guidelines for appropriate use of company IT resources and systems.',
    keyRequirements: [
      'Users must use IT resources for business purposes only',
      'Prohibited uses include illegal activities and explicit content',
      'Personal use must be minimal and pre-approved',
      'Compliance is mandatory for all employees and contractors',
      'Violations may result in disciplinary action up to termination',
    ],
    applicableTo: [
      'All Employees',
      'Contractors',
      'Temporary Staff',
      'Vendors',
    ],
    complianceMapping: [
      { framework: 'ISO 27001', control: 'A.9.1.1' },
      { framework: 'CIS Controls', control: '4.1' },
    ],
  },
  {
    id: 'policy-002',
    name: 'Data Classification Policy',
    category: 'Security',
    version: '1.8',
    status: 'Active',
    lastReviewed: new Date('2024-11-20'),
    nextReview: new Date('2025-05-20'),
    owner: 'Chief Information Officer',
    approver: 'Chief Compliance Officer',
    description:
      'Defines data classification levels and handling requirements based on sensitivity.',
    keyRequirements: [
      'All data must be classified as Public, Confidential, or Restricted',
      'Classification must be documented and regularly reviewed',
      'Access controls must match the classification level',
      'Disposal procedures must comply with classification requirements',
    ],
    applicableTo: ['All Employees', 'Contractors', 'Vendors'],
    complianceMapping: [
      { framework: 'ISO 27001', control: 'A.8.1.2' },
      { framework: 'GDPR', control: 'Article 5' },
      { framework: 'NIST CSF', control: 'ID.GV-1' },
    ],
  },
  {
    id: 'policy-003',
    name: 'Incident Response Policy',
    category: 'Security',
    version: '3.0',
    status: 'Active',
    lastReviewed: new Date('2025-02-01'),
    nextReview: new Date('2025-08-01'),
    owner: 'Chief Information Security Officer',
    approver: 'Chief Risk Officer',
    description:
      'Provides framework for detecting, responding to, and recovering from security incidents.',
    keyRequirements: [
      'Incident discovery and notification within 24 hours',
      'Incident team activation and escalation procedures',
      'Evidence preservation and chain of custody',
      'Investigation and root cause analysis',
      'Post-incident review and lessons learned documentation',
    ],
    applicableTo: ['All Employees', 'IT Department', 'Security Team'],
    complianceMapping: [
      { framework: 'ISO 27001', control: 'A.16.1.5' },
      { framework: 'NIST CSF', control: 'RS.RP-1' },
    ],
  },
  {
    id: 'policy-004',
    name: 'Access Control Policy',
    category: 'Security',
    version: '2.3',
    status: 'Active',
    lastReviewed: new Date('2025-01-10'),
    nextReview: new Date('2025-07-10'),
    owner: 'Chief Information Officer',
    approver: 'Chief Compliance Officer',
    description:
      'Establishes principles for user access management and privilege administration.',
    keyRequirements: [
      'Principle of least privilege for all accounts',
      'Documented access approvals before provisioning',
      'Quarterly access reviews and recertification',
      'Immediate revocation upon termination',
      'Privileged access management for admin accounts',
    ],
    applicableTo: ['All Employees', 'Contractors', 'IT Department'],
    complianceMapping: [
      { framework: 'ISO 27001', control: 'A.9.2.1' },
      { framework: 'CIS Controls', control: '5.3' },
    ],
  },
  {
    id: 'policy-005',
    name: 'Remote Work Policy',
    category: 'Security',
    version: '2.0',
    status: 'Active',
    lastReviewed: new Date('2024-12-05'),
    nextReview: new Date('2025-06-05'),
    owner: 'Chief Human Resources Officer',
    approver: 'Chief Information Security Officer',
    description:
      'Governs secure remote work practices and home network requirements.',
    keyRequirements: [
      'VPN required for all remote access',
      'Secure home network with strong passwords',
      'Endpoint security software mandatory',
      'No public WiFi for confidential data',
      'Privacy screens and locked devices when away',
    ],
    applicableTo: ['Remote Employees', 'Mobile Workers'],
    complianceMapping: [
      { framework: 'ISO 27001', control: 'A.6.2.1' },
      { framework: 'NIST CSF', control: 'PR.AC-1' },
    ],
  },
  {
    id: 'policy-006',
    name: 'BYOD Policy',
    category: 'Security',
    version: '1.5',
    status: 'Active',
    lastReviewed: new Date('2024-10-30'),
    nextReview: new Date('2025-04-30'),
    owner: 'Chief Information Officer',
    approver: 'Chief Compliance Officer',
    description:
      'Allows use of personal devices under strict security requirements.',
    keyRequirements: [
      'Device enrollment in MDM system required',
      'OS updates and security patches mandatory',
      'Encryption for data at rest',
      'Remote wipe capability enabled',
      'Annual security training required',
    ],
    applicableTo: ['All Employees', 'Contractors'],
    complianceMapping: [
      { framework: 'ISO 27001', control: 'A.6.9.2' },
      { framework: 'CIS Controls', control: '13.1' },
    ],
  },
  {
    id: 'policy-007',
    name: 'Encryption Standards Policy',
    category: 'Security',
    version: '2.2',
    status: 'Active',
    lastReviewed: new Date('2025-01-25'),
    nextReview: new Date('2025-07-25'),
    owner: 'Chief Information Security Officer',
    approver: 'Chief Information Officer',
    description:
      'Specifies encryption algorithms and key management for data protection.',
    keyRequirements: [
      'TLS 1.2+ for all data in transit',
      'AES-256 for data at rest',
      'Key management per NIST guidelines',
      'Regular key rotation (annually minimum)',
      'Hardware security modules for critical keys',
    ],
    applicableTo: ['IT Department', 'Security Team', 'System Architects'],
    complianceMapping: [
      { framework: 'ISO 27001', control: 'A.10.1.1' },
      { framework: 'NIST SP 800-53', control: 'SC-7' },
    ],
  },
  {
    id: 'policy-008',
    name: 'Password Management Policy',
    category: 'Security',
    version: '3.1',
    status: 'Active',
    lastReviewed: new Date('2025-02-03'),
    nextReview: new Date('2025-08-03'),
    owner: 'Chief Information Security Officer',
    approver: 'Chief Information Officer',
    description: 'Defines password complexity and management requirements.',
    keyRequirements: [
      'Minimum 12 characters with upper, lower, number, special character',
      'No dictionary words or user information in passwords',
      'Password changes every 90 days for privileged accounts',
      'MFA required for admin accounts',
      'Password history - cannot reuse last 12 passwords',
    ],
    applicableTo: ['All Users', 'Administrators'],
    complianceMapping: [
      { framework: 'CIS Controls', control: '5.2' },
      { framework: 'NIST SP 800-53', control: 'IA-5' },
    ],
  },
  {
    id: 'policy-009',
    name: 'Backup & Recovery Policy',
    category: 'Security',
    version: '2.0',
    status: 'Active',
    lastReviewed: new Date('2024-11-08'),
    nextReview: new Date('2025-05-08'),
    owner: 'Chief Information Officer',
    approver: 'Chief Information Security Officer',
    description:
      'Establishes backup frequency, testing, and recovery procedures.',
    keyRequirements: [
      'Daily incremental backups, weekly full backups',
      'Geographically dispersed backup locations',
      'Recovery Time Objective (RTO) of 4 hours',
      'Recovery Point Objective (RPO) of 24 hours',
      'Quarterly backup restoration testing',
    ],
    applicableTo: ['IT Department', 'System Administrators'],
    complianceMapping: [
      { framework: 'ISO 27001', control: 'A.12.3.1' },
      { framework: 'NIST CSF', control: 'RC.RP-1' },
    ],
  },
  {
    id: 'policy-010',
    name: 'Change Management Policy',
    category: 'Operations',
    version: '2.5',
    status: 'Active',
    lastReviewed: new Date('2025-01-20'),
    nextReview: new Date('2025-07-20'),
    owner: 'Chief Information Officer',
    approver: 'Chief Operations Officer',
    description:
      'Requires formal approval and testing before production changes.',
    keyRequirements: [
      'Change request submission and approval process',
      'Risk assessment for all changes',
      'Testing in non-production environment first',
      'Maintenance window scheduling',
      'Rollback procedures documented',
      'Post-change verification and documentation',
    ],
    applicableTo: [
      'IT Department',
      'Development Team',
      'System Administrators',
    ],
    complianceMapping: [
      { framework: 'ISO 27001', control: 'A.12.5.1' },
      { framework: 'ITIL', control: 'CAB' },
    ],
  },
  {
    id: 'policy-011',
    name: 'Third-Party Risk Management Policy',
    category: 'Governance',
    version: '1.9',
    status: 'Active',
    lastReviewed: new Date('2024-12-12'),
    nextReview: new Date('2025-06-12'),
    owner: 'Chief Risk Officer',
    approver: 'Chief Compliance Officer',
    description:
      'Governs vendor selection, onboarding, and ongoing risk monitoring.',
    keyRequirements: [
      'Vendor security assessment before engagement',
      'Contractual security and compliance requirements',
      'Annual vendor risk reviews and audits',
      'Incident notification requirements (24 hours)',
      'Right to audit and terminate clauses',
    ],
    applicableTo: ['Procurement', 'Vendor Management', 'Compliance'],
    complianceMapping: [
      { framework: 'ISO 27001', control: 'A.15.1.1' },
      { framework: 'NIST CSF', control: 'PR.PE-2' },
    ],
  },
  {
    id: 'policy-012',
    name: 'Data Retention & Disposal Policy',
    category: 'Governance',
    version: '2.1',
    status: 'Active',
    lastReviewed: new Date('2025-02-10'),
    nextReview: new Date('2025-08-10'),
    owner: 'Chief Privacy Officer',
    approver: 'Chief Legal Officer',
    description:
      'Specifies retention periods and secure disposal methods for data.',
    keyRequirements: [
      'Retention based on legal and business requirements',
      'Regular review and purging of unnecessary data',
      'Secure deletion using approved methods',
      'Certification of destruction documented',
      'Regulatory compliance (GDPR right to be forgotten)',
    ],
    applicableTo: ['All Departments', 'Records Management'],
    complianceMapping: [
      { framework: 'GDPR', control: 'Article 17' },
      { framework: 'ISO 27001', control: 'A.18.2.3' },
    ],
  },
];

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<Policy[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    let filteredPolicies = [...policies];

    if (status) {
      filteredPolicies = filteredPolicies.filter(
        (p) => p.status === status
      );
    }

    if (category) {
      filteredPolicies = filteredPolicies.filter(
        (p) => p.category === category
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: filteredPolicies,
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
): Promise<NextResponse<ApiResponse<Policy>>> {
  try {
    const body: CreatePolicyRequest = await request.json();

    const newPolicy: Policy = {
      id: `policy-${Date.now()}`,
      name: body.name,
      category: body.category,
      version: body.version,
      status: 'Draft',
      lastReviewed: new Date(),
      nextReview: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
      owner: body.owner,
      approver: body.approver,
      description: body.description,
      keyRequirements: body.keyRequirements,
      applicableTo: body.applicableTo,
      complianceMapping: body.complianceMapping,
    };

    return NextResponse.json(
      {
        success: true,
        data: newPolicy,
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
      { status: 400 }
    );
  }
}
