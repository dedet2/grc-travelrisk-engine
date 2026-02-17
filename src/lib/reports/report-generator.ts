import type { TripAssessment } from '@/types';

interface ReportSection {
  title: string;
  content: string;
  score?: number;
  status?: 'passed' | 'failed' | 'warning';
}

interface ComplianceScore {
  category: string;
  score: number;
  status: 'compliant' | 'partial' | 'non-compliant';
}

interface ComplianceGap {
  control: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
}

interface ComplianceReport {
  id: string;
  title: string;
  generatedAt: Date;
  generatedBy: string;
  format: 'pdf' | 'json' | 'html';
  frameworkId: string;
  overallScore: number;
  sections: ReportSection[];
  scores: ComplianceScore[];
  gaps: ComplianceGap[];
  recommendations: string[];
}

interface RiskMetric {
  category: string;
  score: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

interface TopRisk {
  id: string;
  title: string;
  score: number;
  impact: 'high' | 'medium' | 'low';
  likelihood: 'high' | 'medium' | 'low';
  mitigation: string;
}

interface RiskReport {
  id: string;
  title: string;
  generatedAt: Date;
  generatedBy: string;
  format: 'pdf' | 'json' | 'html';
  portfolioScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  sections: ReportSection[];
  metrics: RiskMetric[];
  topRisks: TopRisk[];
  trendData: Array<{ period: string; score: number }>;
}

interface ExecutiveReport {
  id: string;
  title: string;
  generatedAt: Date;
  generatedBy: string;
  format: 'pdf' | 'json' | 'html';
  sections: ReportSection[];
  complianceScore: number;
  riskScore: number;
  businessMetrics: Record<string, number | string>;
  keyInsights: string[];
  recommendations: string[];
}

interface DestinationBreakdown {
  destination: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  healthRisks: string[];
  securityThreats: string[];
  recommendations: string[];
}

interface TravelRiskReport {
  id: string;
  title: string;
  generatedAt: Date;
  generatedBy: string;
  format: 'pdf' | 'json' | 'html';
  overallTripScore: number;
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  sections: ReportSection[];
  destinationBreakdown: DestinationBreakdown[];
  recommendations: string[];
  advisories: Array<{ destination: string; advisory: string }>;
}

export class ReportGenerator {
  private userId: string = 'system';

  constructor(userId?: string) {
    if (userId) {
      this.userId = userId;
    }
  }

  generateComplianceReport(frameworkId: string): ComplianceReport {
    const reportId = `rpt-compliance-${Date.now()}`;
    const now = new Date();

    const sections: ReportSection[] = [
      {
        title: 'Executive Summary',
        content: `Compliance assessment for framework ${frameworkId}. This report provides a comprehensive evaluation of organizational compliance posture against the specified framework.`,
        score: 78,
        status: 'passed',
      },
      {
        title: 'Governance & Risk Management',
        content: 'Assessment of governance structures, risk management processes, and oversight mechanisms.',
        score: 82,
        status: 'passed',
      },
      {
        title: 'Control Environment',
        content: 'Evaluation of control design and operational effectiveness across the organization.',
        score: 75,
        status: 'warning',
      },
      {
        title: 'Monitoring & Testing',
        content: 'Review of ongoing monitoring activities and periodic testing of control effectiveness.',
        score: 70,
        status: 'warning',
      },
    ];

    const scores: ComplianceScore[] = [
      { category: 'Access Control', score: 85, status: 'compliant' },
      { category: 'Data Protection', score: 78, status: 'partial' },
      { category: 'Incident Response', score: 72, status: 'partial' },
      { category: 'Change Management', score: 81, status: 'compliant' },
      { category: 'Business Continuity', score: 68, status: 'non-compliant' },
      { category: 'Third-Party Risk', score: 75, status: 'partial' },
    ];

    const gaps: ComplianceGap[] = [
      {
        control: 'Encryption in Transit',
        severity: 'high',
        description: 'Not all data in transit is encrypted with TLS 1.2 or higher.',
        recommendation: 'Implement mandatory TLS 1.2+ for all external communications.',
      },
      {
        control: 'Multi-Factor Authentication',
        severity: 'high',
        description: 'MFA not enforced for privileged accounts.',
        recommendation: 'Deploy MFA across all administrative accounts within 90 days.',
      },
      {
        control: 'Backup Testing',
        severity: 'medium',
        description: 'Backup restoration drills conducted infrequently.',
        recommendation: 'Establish quarterly backup restoration testing schedule.',
      },
      {
        control: 'Access Reviews',
        severity: 'medium',
        description: 'User access reviews not performed on a consistent schedule.',
        recommendation: 'Implement bi-annual access reviews with documented approval.',
      },
    ];

    const recommendations: string[] = [
      'Implement automated compliance monitoring tools to track control effectiveness in real-time.',
      'Establish a formal compliance training program for all employees with annual refresher requirements.',
      'Create a remediation roadmap with specific timelines for addressing identified gaps.',
      'Conduct quarterly compliance reviews with cross-functional stakeholders.',
      'Implement automated logging and alerting for security events.',
    ];

    return {
      id: reportId,
      title: `Compliance Report - ${frameworkId}`,
      generatedAt: now,
      generatedBy: this.userId,
      format: 'json',
      frameworkId,
      overallScore: 76,
      sections,
      scores,
      gaps,
      recommendations,
    };
  }

  generateRiskReport(): RiskReport {
    const reportId = `rpt-risk-${Date.now()}`;
    const now = new Date();

    const sections: ReportSection[] = [
      {
        title: 'Risk Overview',
        content: 'Summary of organizational risk landscape across all major risk categories.',
        score: 68,
        status: 'warning',
      },
      {
        title: 'Risk Heat Map',
        content: 'Analysis of risk distribution by impact and likelihood dimensions.',
        score: 72,
        status: 'warning',
      },
      {
        title: 'Key Risk Indicators',
        content: 'Monitoring of critical risk indicators and threshold breaches.',
        score: 65,
        status: 'warning',
      },
      {
        title: 'Trend Analysis',
        content: 'Historical risk trend analysis showing movement over the past 12 months.',
        score: 70,
        status: 'warning',
      },
    ];

    const metrics: RiskMetric[] = [
      { category: 'Cybersecurity Risk', score: 72, trend: 'stable' },
      { category: 'Operational Risk', score: 68, trend: 'increasing' },
      { category: 'Compliance Risk', score: 75, trend: 'decreasing' },
      { category: 'Third-Party Risk', score: 64, trend: 'increasing' },
      { category: 'Strategic Risk', score: 70, trend: 'stable' },
    ];

    const topRisks: TopRisk[] = [
      {
        id: 'risk-001',
        title: 'Ransomware Attack Exposure',
        score: 8.5,
        impact: 'high',
        likelihood: 'high',
        mitigation: 'Deploy EDR solutions, backup redundancy, incident response plan.',
      },
      {
        id: 'risk-002',
        title: 'Insider Threat',
        score: 7.8,
        impact: 'high',
        likelihood: 'medium',
        mitigation: 'User behavior analytics, DLP systems, access controls.',
      },
      {
        id: 'risk-003',
        title: 'Supply Chain Compromise',
        score: 7.2,
        impact: 'high',
        likelihood: 'medium',
        mitigation: 'Vendor risk assessments, security requirements, audit rights.',
      },
      {
        id: 'risk-004',
        title: 'Data Breach',
        score: 7.5,
        impact: 'high',
        likelihood: 'medium',
        mitigation: 'Encryption, segmentation, monitoring, response procedures.',
      },
      {
        id: 'risk-005',
        title: 'System Downtime',
        score: 6.8,
        impact: 'medium',
        likelihood: 'medium',
        mitigation: 'HA/DR planning, redundant infrastructure, monitoring.',
      },
    ];

    const trendData = [
      { period: 'Jan 2025', score: 72 },
      { period: 'Dec 2024', score: 70 },
      { period: 'Nov 2024', score: 69 },
      { period: 'Oct 2024', score: 71 },
      { period: 'Sep 2024', score: 68 },
      { period: 'Aug 2024', score: 66 },
    ];

    return {
      id: reportId,
      title: 'Organizational Risk Report',
      generatedAt: now,
      generatedBy: this.userId,
      format: 'json',
      portfolioScore: 70,
      riskLevel: 'medium',
      sections,
      metrics,
      topRisks,
      trendData,
    };
  }

  generateExecutiveReport(): ExecutiveReport {
    const reportId = `rpt-executive-${Date.now()}`;
    const now = new Date();

    const sections: ReportSection[] = [
      {
        title: 'Business Overview',
        content: 'Strategic context and organizational objectives for the reporting period.',
        status: 'passed',
      },
      {
        title: 'Compliance Status',
        content: 'Summary of compliance posture across key regulatory frameworks.',
        score: 76,
        status: 'warning',
      },
      {
        title: 'Risk Profile',
        content: 'High-level assessment of organizational risk exposure and trends.',
        score: 70,
        status: 'warning',
      },
      {
        title: 'Financial Impact',
        content: 'Quantification of compliance and risk-related costs and benefits.',
        status: 'passed',
      },
      {
        title: 'Action Items',
        content: 'Board-level recommendations requiring executive attention and decision-making.',
        status: 'warning',
      },
    ];

    const businessMetrics = {
      'Revenue Impacted by Compliance': '$0',
      'Active Compliance Initiatives': 12,
      'Risk Events (Last 12 months)': 3,
      'Regulatory Inquiries': 0,
      'Third-Party Risk Assessments': 47,
      'Employee Training Completion': '94%',
      'Security Incident Response Time': '< 1 hour',
      'Audit Findings': 8,
    };

    const keyInsights: string[] = [
      'Compliance maturity has improved 8% year-over-year with consistent trend.',
      'Cybersecurity risk remains elevated due to increasing threat landscape.',
      'Third-party vendor ecosystem presents emerging risk requiring enhanced oversight.',
      'Business continuity capabilities need strengthening for critical operations.',
      'Regulatory environment remains dynamic with potential new requirements.',
    ];

    const recommendations: string[] = [
      'Increase investment in security infrastructure and talent acquisition.',
      'Establish board-level risk oversight committee to review KRIs monthly.',
      'Develop comprehensive third-party risk management program.',
      'Accelerate cloud security and data protection initiatives.',
      'Implement automated compliance monitoring and reporting infrastructure.',
    ];

    return {
      id: reportId,
      title: 'Executive Risk & Compliance Report',
      generatedAt: now,
      generatedBy: this.userId,
      format: 'json',
      sections,
      complianceScore: 76,
      riskScore: 70,
      businessMetrics,
      keyInsights,
      recommendations,
    };
  }

  generateTravelRiskReport(trips: TripAssessment[]): TravelRiskReport {
    const reportId = `rpt-travel-${Date.now()}`;
    const now = new Date();

    const destinationBreakdown: DestinationBreakdown[] = trips.flatMap((trip) =>
      trip.legs.map((leg) => ({
        destination: leg.destination,
        riskScore: leg.riskScore,
        riskLevel: leg.riskLevel,
        healthRisks: [
          'Yellow Fever',
          'Malaria',
          'Typhoid',
          'Hepatitis A',
        ],
        securityThreats: [
          'Petty Crime',
          'Civil Unrest',
          'Terrorism Risk',
          'Carjacking',
        ],
        recommendations: [
          'Obtain comprehensive travel insurance.',
          'Register travel with embassy.',
          'Maintain situational awareness.',
          'Follow local guidance and advisories.',
          'Carry approved vaccinations.',
        ],
      }))
    );

    const overallTripScore =
      trips.length > 0
        ? trips.reduce((sum, trip) => sum + trip.overallTripScore, 0) /
          trips.length
        : 50;

    const overallRiskLevel: 'low' | 'medium' | 'high' | 'critical' =
      overallTripScore < 30
        ? 'low'
        : overallTripScore < 60
          ? 'medium'
          : overallTripScore < 80
            ? 'high'
            : 'critical';

    const sections: ReportSection[] = [
      {
        title: 'Trip Summary',
        content: `Comprehensive risk assessment for ${trips.length} planned trip(s). Analysis includes health, security, and infrastructure considerations.`,
        score: Math.round(overallTripScore),
        status: overallRiskLevel === 'low' ? 'passed' : 'warning',
      },
      {
        title: 'Health Risk Assessment',
        content: 'Evaluation of disease prevalence, required vaccinations, and medical facilities.',
        status: 'warning',
      },
      {
        title: 'Security Analysis',
        content: 'Assessment of political stability, crime rates, and terrorism risk.',
        status: 'warning',
      },
      {
        title: 'Travel Recommendations',
        content: 'Specific guidance for safe and secure travel to planned destinations.',
        status: 'passed',
      },
    ];

    const advisories: Array<{ destination: string; advisory: string }> =
      trips.length > 0
        ? trips.flatMap((trip) =>
            trip.legs.map((leg) => ({
              destination: leg.destination,
              advisory: `Advisory Level ${leg.advisoryLevel}: Review travel requirements and insurance coverage before departure.`,
            }))
          )
        : [];

    const recommendations: string[] = [
      'Verify passport validity (minimum 6 months beyond travel dates).',
      'Obtain travel insurance with medical evacuation coverage.',
      'Register travel plans with company HR and security teams.',
      'Maintain emergency contact information and backup communication methods.',
      'Review destination-specific health and safety requirements.',
      'Carry copies of important documents (passport, insurance, visas).',
      'Subscribe to embassy alerts for travel destinations.',
    ];

    return {
      id: reportId,
      title: 'Travel Risk Assessment Report',
      generatedAt: now,
      generatedBy: this.userId,
      format: 'json',
      overallTripScore: Math.round(overallTripScore),
      overallRiskLevel,
      sections,
      destinationBreakdown,
      recommendations,
      advisories,
    };
  }
}
