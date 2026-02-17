import { NextRequest, NextResponse } from 'next/server';

export interface Control {
  id: string;
  name: string;
  description: string;
  framework: 'NIST' | 'ISO-27001' | 'SOC2' | 'GDPR';
  category: 'Access Control' | 'Data Protection' | 'Network Security' | 'Incident Response' | 'Change Management' | 'Monitoring';
  status: 'Active' | 'Inactive' | 'Planned' | 'Retired';
  effectiveness: number; // 0-100
  lastTested: string; // ISO date
  owner: string;
}

// 15+ pre-defined controls mapped to frameworks
const CONTROLS: Control[] = [
  {
    id: 'AC-001',
    name: 'Multi-Factor Authentication',
    description: 'Require MFA for all user access to critical systems',
    framework: 'NIST',
    category: 'Access Control',
    status: 'Active',
    effectiveness: 95,
    lastTested: '2025-12-01',
    owner: 'Identity & Access Team',
  },
  {
    id: 'AC-002',
    name: 'Role-Based Access Control (RBAC)',
    description: 'Implement and maintain role-based access control policies',
    framework: 'ISO-27001',
    category: 'Access Control',
    status: 'Active',
    effectiveness: 88,
    lastTested: '2025-11-15',
    owner: 'Security Operations',
  },
  {
    id: 'AC-003',
    name: 'User Provisioning and Deprovisioning',
    description: 'Formal process for user account lifecycle management',
    framework: 'SOC2',
    category: 'Access Control',
    status: 'Active',
    effectiveness: 92,
    lastTested: '2025-10-30',
    owner: 'HR & IT Operations',
  },
  {
    id: 'DP-001',
    name: 'Data Encryption at Rest',
    description: 'Encrypt all sensitive data stored in databases and file systems',
    framework: 'GDPR',
    category: 'Data Protection',
    status: 'Active',
    effectiveness: 98,
    lastTested: '2025-12-10',
    owner: 'Data Security Team',
  },
  {
    id: 'DP-002',
    name: 'Data Encryption in Transit',
    description: 'Use TLS/SSL for all data transmission over networks',
    framework: 'ISO-27001',
    category: 'Data Protection',
    status: 'Active',
    effectiveness: 97,
    lastTested: '2025-12-05',
    owner: 'Infrastructure Team',
  },
  {
    id: 'DP-003',
    name: 'Data Classification and Handling',
    description: 'Classify data by sensitivity level and apply appropriate controls',
    framework: 'NIST',
    category: 'Data Protection',
    status: 'Active',
    effectiveness: 85,
    lastTested: '2025-11-20',
    owner: 'Information Governance',
  },
  {
    id: 'DP-004',
    name: 'Data Retention and Disposal',
    description: 'Define and enforce data retention schedules and secure disposal procedures',
    framework: 'GDPR',
    category: 'Data Protection',
    status: 'Active',
    effectiveness: 82,
    lastTested: '2025-10-15',
    owner: 'Records Management',
  },
  {
    id: 'NS-001',
    name: 'Firewall Configuration',
    description: 'Implement and maintain firewall rules to control network traffic',
    framework: 'NIST',
    category: 'Network Security',
    status: 'Active',
    effectiveness: 94,
    lastTested: '2025-12-08',
    owner: 'Network Security',
  },
  {
    id: 'NS-002',
    name: 'Intrusion Detection and Prevention',
    description: 'Deploy IDS/IPS to monitor and block malicious network activity',
    framework: 'SOC2',
    category: 'Network Security',
    status: 'Active',
    effectiveness: 91,
    lastTested: '2025-11-25',
    owner: 'Security Operations',
  },
  {
    id: 'NS-003',
    name: 'Vulnerability Management',
    description: 'Regular scanning, assessment, and remediation of network vulnerabilities',
    framework: 'ISO-27001',
    category: 'Network Security',
    status: 'Active',
    effectiveness: 87,
    lastTested: '2025-11-10',
    owner: 'Vulnerability Management',
  },
  {
    id: 'IR-001',
    name: 'Incident Response Plan',
    description: 'Documented procedures for detecting, analyzing, and responding to incidents',
    framework: 'NIST',
    category: 'Incident Response',
    status: 'Active',
    effectiveness: 89,
    lastTested: '2025-09-20',
    owner: 'Security Incident Response Team',
  },
  {
    id: 'IR-002',
    name: 'Incident Logging and Monitoring',
    description: 'Log all security incidents and maintain audit trail',
    framework: 'SOC2',
    category: 'Incident Response',
    status: 'Active',
    effectiveness: 93,
    lastTested: '2025-12-01',
    owner: 'Security Operations',
  },
  {
    id: 'CM-001',
    name: 'Change Management Process',
    description: 'Formal change control procedures for all system modifications',
    framework: 'NIST',
    category: 'Change Management',
    status: 'Active',
    effectiveness: 86,
    lastTested: '2025-11-05',
    owner: 'Change Advisory Board',
  },
  {
    id: 'CM-002',
    name: 'Configuration Baseline Management',
    description: 'Maintain and verify system configuration baselines',
    framework: 'ISO-27001',
    category: 'Change Management',
    status: 'Active',
    effectiveness: 84,
    lastTested: '2025-10-20',
    owner: 'Configuration Management',
  },
  {
    id: 'MON-001',
    name: 'Security Event Logging',
    description: 'Comprehensive logging of all security-relevant events',
    framework: 'SOC2',
    category: 'Monitoring',
    status: 'Active',
    effectiveness: 96,
    lastTested: '2025-12-12',
    owner: 'Security Monitoring',
  },
  {
    id: 'MON-002',
    name: 'Security Event Analysis and Alerting',
    description: 'Real-time analysis of security logs with automated alerting',
    framework: 'NIST',
    category: 'Monitoring',
    status: 'Active',
    effectiveness: 90,
    lastTested: '2025-12-10',
    owner: 'Security Operations Center',
  },
];

/**
 * GET /api/controls
 * Returns 15+ controls mapped to NIST/ISO 27001/SOC 2/GDPR
 */
export async function GET(request: NextRequest) {
  try {
    // Optional query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const framework = searchParams.get('framework');
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    let filtered = [...CONTROLS];

    if (framework) {
      filtered = filtered.filter((c) => c.framework === framework);
    }

    if (category) {
      filtered = filtered.filter((c) => c.category === category);
    }

    if (status) {
      filtered = filtered.filter((c) => c.status === status);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          controls: filtered,
          totalCount: filtered.length,
          frameworks: ['NIST', 'ISO-27001', 'SOC2', 'GDPR'],
          categories: [
            'Access Control',
            'Data Protection',
            'Network Security',
            'Incident Response',
            'Change Management',
            'Monitoring',
          ],
          statuses: ['Active', 'Inactive', 'Planned', 'Retired'],
          metadata: {
            timestamp: new Date().toISOString(),
            avgEffectiveness: Math.round(
              filtered.reduce((sum, c) => sum + c.effectiveness, 0) / filtered.length
            ),
            activeCount: filtered.filter((c) => c.status === 'Active').length,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve controls',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/controls
 * Create a new control
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, framework, category, status, effectiveness, lastTested, owner } = body as Partial<Control>;

    // Validate required fields
    if (!id || !name || !description || !framework || !category || !status || effectiveness === undefined || !lastTested || !owner) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: id, name, description, framework, category, status, effectiveness, lastTested, owner',
        },
        { status: 400 }
      );
    }

    // Validate framework
    const validFrameworks = ['NIST', 'ISO-27001', 'SOC2', 'GDPR'];
    if (!validFrameworks.includes(framework)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid framework: ${framework}. Valid frameworks are: ${validFrameworks.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['Access Control', 'Data Protection', 'Network Security', 'Incident Response', 'Change Management', 'Monitoring'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid category: ${category}. Valid categories are: ${validCategories.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['Active', 'Inactive', 'Planned', 'Retired'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status: ${status}. Valid statuses are: ${validStatuses.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate effectiveness
    if (typeof effectiveness !== 'number' || effectiveness < 0 || effectiveness > 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'effectiveness must be a number between 0 and 100',
        },
        { status: 400 }
      );
    }

    // Validate lastTested is a valid ISO date
    if (isNaN(Date.parse(lastTested))) {
      return NextResponse.json(
        {
          success: false,
          error: 'lastTested must be a valid ISO 8601 date string',
        },
        { status: 400 }
      );
    }

    // Check if control ID already exists
    if (CONTROLS.some((c) => c.id === id)) {
      return NextResponse.json(
        {
          success: false,
          error: `Control with ID ${id} already exists`,
        },
        { status: 409 }
      );
    }

    // Create new control
    const newControl: Control = {
      id,
      name,
      description,
      framework: framework as Control['framework'],
      category: category as Control['category'],
      status: status as Control['status'],
      effectiveness,
      lastTested,
      owner,
    };

    CONTROLS.push(newControl);

    return NextResponse.json(
      {
        success: true,
        data: {
          control: newControl,
          message: `Control ${id} created successfully`,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create control',
      },
      { status: 500 }
    );
  }
}
