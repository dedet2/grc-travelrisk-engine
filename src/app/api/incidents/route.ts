import { NextRequest, NextResponse } from 'next/server';

export type SeverityLevel = 'P1' | 'P2' | 'P3' | 'P4';
export type IncidentStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export type IncidentType = 'Data Breach' | 'Phishing' | 'Malware' | 'Unauthorized Access' | 'DDoS' | 'Insider Threat' | 'Misconfiguration';

export interface SecurityIncident {
  id: string;
  title: string;
  severity: SeverityLevel;
  status: IncidentStatus;
  type: IncidentType;
  detectedAt: string;
  resolvedAt: string | null;
  affectedSystems: string[];
  assignee: string;
  rootCause: string | null;
}

// Mock data - 12 realistic security incidents
const INCIDENTS: SecurityIncident[] = [
  {
    id: 'incident-001',
    title: 'AWS S3 Bucket Misconfiguration Exposed Customer Data',
    severity: 'P1',
    status: 'Resolved',
    type: 'Misconfiguration',
    detectedAt: '2025-02-15T08:30:00Z',
    resolvedAt: '2025-02-15T12:45:00Z',
    affectedSystems: ['AWS S3', 'Customer Database'],
    assignee: 'john.doe@company.com',
    rootCause: 'Incorrect S3 bucket policies allowing public read access',
  },
  {
    id: 'incident-002',
    title: 'Phishing Campaign Targeting Finance Department',
    severity: 'P2',
    status: 'In Progress',
    type: 'Phishing',
    detectedAt: '2025-02-14T14:20:00Z',
    resolvedAt: null,
    affectedSystems: ['Email System', 'Network Access'],
    assignee: 'jane.smith@company.com',
    rootCause: null,
  },
  {
    id: 'incident-003',
    title: 'Unauthorized API Access Detected from Unknown IP',
    severity: 'P2',
    status: 'In Progress',
    type: 'Unauthorized Access',
    detectedAt: '2025-02-13T10:15:00Z',
    resolvedAt: null,
    affectedSystems: ['API Gateway', 'Authentication Service'],
    assignee: 'mike.johnson@company.com',
    rootCause: null,
  },
  {
    id: 'incident-004',
    title: 'Ransomware Detected on File Server',
    severity: 'P1',
    status: 'Open',
    type: 'Malware',
    detectedAt: '2025-02-12T16:45:00Z',
    resolvedAt: null,
    affectedSystems: ['File Server', 'Backup System', 'Workstations'],
    assignee: 'sarah.williams@company.com',
    rootCause: null,
  },
  {
    id: 'incident-005',
    title: 'DDoS Attack on Web Application',
    severity: 'P2',
    status: 'Resolved',
    type: 'DDoS',
    detectedAt: '2025-02-11T09:20:00Z',
    resolvedAt: '2025-02-11T14:30:00Z',
    affectedSystems: ['Web Application', 'Load Balancer', 'CDN'],
    assignee: 'robert.brown@company.com',
    rootCause: 'Botnet attack from compromised nodes',
  },
  {
    id: 'incident-006',
    title: 'Insider Trading Data Accessed Inappropriately',
    severity: 'P1',
    status: 'Open',
    type: 'Insider Threat',
    detectedAt: '2025-02-10T13:00:00Z',
    resolvedAt: null,
    affectedSystems: ['Financial Database', 'Audit Logs'],
    assignee: 'lisa.anderson@company.com',
    rootCause: null,
  },
  {
    id: 'incident-007',
    title: 'SSL Certificate Misconfiguration',
    severity: 'P3',
    status: 'Resolved',
    type: 'Misconfiguration',
    detectedAt: '2025-02-09T11:30:00Z',
    resolvedAt: '2025-02-09T13:15:00Z',
    affectedSystems: ['Web Server', 'API Endpoint'],
    assignee: 'david.miller@company.com',
    rootCause: 'Incorrect certificate renewal process',
  },
  {
    id: 'incident-008',
    title: 'Employee Credential Compromise via Spear Phishing',
    severity: 'P2',
    status: 'In Progress',
    type: 'Phishing',
    detectedAt: '2025-02-08T15:45:00Z',
    resolvedAt: null,
    affectedSystems: ['Email', 'VPN', 'Active Directory'],
    assignee: 'jennifer.davis@company.com',
    rootCause: null,
  },
  {
    id: 'incident-009',
    title: 'SQL Injection Vulnerability Exploitation Attempt',
    severity: 'P2',
    status: 'Resolved',
    type: 'Unauthorized Access',
    detectedAt: '2025-02-07T10:20:00Z',
    resolvedAt: '2025-02-07T11:45:00Z',
    affectedSystems: ['Web Application', 'Database'],
    assignee: 'thomas.martin@company.com',
    rootCause: 'Unpatched application vulnerability',
  },
  {
    id: 'incident-010',
    title: 'Malicious Insider Downloaded Customer Database',
    severity: 'P1',
    status: 'Open',
    type: 'Data Breach',
    detectedAt: '2025-02-06T09:00:00Z',
    resolvedAt: null,
    affectedSystems: ['Database Server', 'Data Loss Prevention'],
    assignee: 'patricia.jones@company.com',
    rootCause: null,
  },
  {
    id: 'incident-011',
    title: 'Credential Stuffing Attack on Login Portal',
    severity: 'P3',
    status: 'Resolved',
    type: 'Unauthorized Access',
    detectedAt: '2025-02-05T14:30:00Z',
    resolvedAt: '2025-02-05T18:00:00Z',
    affectedSystems: ['Login Portal', 'Authentication'],
    assignee: 'matthew.wilson@company.com',
    rootCause: 'Compromised credentials from external data breach',
  },
  {
    id: 'incident-012',
    title: 'Suspicious Process Execution on Production Server',
    severity: 'P3',
    status: 'In Progress',
    type: 'Malware',
    detectedAt: '2025-02-04T12:15:00Z',
    resolvedAt: null,
    affectedSystems: ['Production Server', 'Application Runtime'],
    assignee: 'christopher.taylor@company.com',
    rootCause: null,
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  let filtered = INCIDENTS;

  // Filter by severity
  const severity = searchParams.get('severity');
  if (severity) {
    filtered = filtered.filter(i => i.severity === severity);
  }

  // Filter by status
  const status = searchParams.get('status');
  if (status) {
    filtered = filtered.filter(i => i.status === status);
  }

  // Filter by type
  const type = searchParams.get('type');
  if (type) {
    filtered = filtered.filter(i => i.type === type);
  }

  return NextResponse.json({
    data: filtered,
    total: filtered.length,
    filters: {
      severity: severity || null,
      status: status || null,
      type: type || null,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const required = ['title', 'severity', 'status', 'type'];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const newIncident: SecurityIncident = {
      id: `incident-${Date.now()}`,
      title: body.title,
      severity: body.severity,
      status: body.status,
      type: body.type,
      detectedAt: body.detectedAt || new Date().toISOString(),
      resolvedAt: body.resolvedAt || null,
      affectedSystems: body.affectedSystems || [],
      assignee: body.assignee || 'unassigned@company.com',
      rootCause: body.rootCause || null,
    };

    return NextResponse.json({
      success: true,
      data: newIncident,
      message: 'Incident created successfully',
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create incident' },
      { status: 500 }
    );
  }
}
