/**
 * Remediation Recommendations Engine
 * Maps non-compliant controls to specific, actionable remediation steps
 * Hard-coded recommendations for common ISO 27001 control gaps
 */

import type { Finding, Recommendation } from '@/types/assessment';

/**
 * Hard-coded recommendations library for common ISO 27001 controls
 * Format: controlId/pattern -> recommendation details
 */
const RECOMMENDATIONS_LIBRARY: Record<
  string,
  Omit<Recommendation, 'findingId' | 'controlId'>
> = {
  // Access Control (A.6)
  'access-control': {
    title: 'Implement Comprehensive Access Control Policy',
    description:
      'Develop and enforce a formal access control policy that defines roles, responsibilities, and access approval procedures. Ensure all user access is documented and reviewed regularly.',
    priority: 'P0',
    estimatedEffort: 'high',
    estimatedDays: 30,
    actionItems: [
      'Conduct access control audit across all systems',
      'Document current access rights and identify excess privileges',
      'Develop role-based access control (RBAC) model',
      'Implement principle of least privilege',
      'Establish quarterly access review process',
      'Create user access request and approval workflow',
    ],
  },

  // User Authentication (A.6.2)
  'user-authentication': {
    title: 'Strengthen User Authentication Mechanisms',
    description:
      'Implement multi-factor authentication (MFA) for all systems, especially critical and remote access. Enforce strong password policies and monitor authentication logs.',
    priority: 'P0',
    estimatedEffort: 'medium',
    estimatedDays: 21,
    actionItems: [
      'Deploy multi-factor authentication across all systems',
      'Enforce strong password policy (min 12 chars, complexity)',
      'Implement account lockout after failed attempts',
      'Monitor and alert on authentication failures',
      'Review and update authentication for legacy systems',
      'Provide user training on MFA and password security',
    ],
  },

  // Password Management (A.6.2.2)
  'password-management': {
    title: 'Establish Password Management System',
    description:
      'Implement automated password management with enforced policies. Ensure passwords are not reused, meet complexity requirements, and are changed regularly.',
    priority: 'P1',
    estimatedEffort: 'medium',
    estimatedDays: 14,
    actionItems: [
      'Deploy password manager or identity system',
      'Enforce minimum password age (24 hours)',
      'Enforce maximum password age (90 days)',
      'Prevent password reuse (last 5 passwords)',
      'Implement password history tracking',
      'Conduct password policy audit and user training',
    ],
  },

  // Cryptography (A.10.1)
  'cryptography': {
    title: 'Implement Cryptographic Controls',
    description:
      'Deploy encryption for data at rest and in transit using industry-standard algorithms. Manage cryptographic keys securely with proper lifecycle management.',
    priority: 'P0',
    estimatedEffort: 'high',
    estimatedDays: 45,
    actionItems: [
      'Conduct encryption assessment across systems',
      'Implement TLS 1.2+ for all network communications',
      'Deploy AES-256 encryption for data at rest',
      'Establish cryptographic key management system',
      'Create key rotation schedule (annual minimum)',
      'Implement hardware security modules (HSM) for key storage',
    ],
  },

  // Physical Security (A.11.1)
  'physical-security': {
    title: 'Strengthen Physical Security Controls',
    description:
      'Secure facilities with access controls, surveillance, and environmental monitoring. Protect hardware from unauthorized access and environmental hazards.',
    priority: 'P1',
    estimatedEffort: 'high',
    estimatedDays: 60,
    actionItems: [
      'Install and maintain physical access controls (badge readers)',
      'Deploy CCTV monitoring in data centers and server rooms',
      'Implement environmental monitoring (temperature, humidity)',
      'Restrict physical access to sensitive areas',
      'Establish visitor management and badging procedures',
      'Schedule regular physical security audits',
    ],
  },

  // Asset Management (A.8)
  'asset-management': {
    title: 'Implement Asset Management Program',
    description:
      'Maintain a comprehensive inventory of all IT assets. Track ownership, location, and status. Implement controls for asset disposal and end-of-life management.',
    priority: 'P1',
    estimatedEffort: 'medium',
    estimatedDays: 28,
    actionItems: [
      'Create complete IT asset inventory with unique identifiers',
      'Assign asset owners and track accountability',
      'Implement asset tracking system or database',
      'Establish asset disposal procedures',
      'Conduct quarterly asset audits',
      'Implement barcode or RFID tracking system',
    ],
  },

  // Configuration Management (A.12.1)
  'configuration-management': {
    title: 'Establish Configuration Management System',
    description:
      'Maintain baseline configurations for all systems. Implement change management and configuration monitoring to prevent unauthorized modifications.',
    priority: 'P1',
    estimatedEffort: 'high',
    estimatedDays: 35,
    actionItems: [
      'Document baseline configurations for all critical systems',
      'Implement configuration management database (CMDB)',
      'Deploy configuration monitoring tools',
      'Establish change advisory board (CAB)',
      'Implement change tracking and approval workflow',
      'Conduct regular configuration audits',
    ],
  },

  // Patch Management (A.12.6.1)
  'patch-management': {
    title: 'Implement Patch Management Program',
    description:
      'Deploy automated patch management across all systems. Test patches in staging and deploy within defined timeframes based on criticality.',
    priority: 'P0',
    estimatedEffort: 'medium',
    estimatedDays: 21,
    actionItems: [
      'Deploy automated patch management system',
      'Establish patch testing environment',
      'Define patch deployment schedules by criticality',
      'Monitor vendors for security patches',
      'Maintain patch inventory and deployment records',
      'Conduct monthly patch compliance audits',
    ],
  },

  // Incident Management (A.16.1)
  'incident-management': {
    title: 'Develop Incident Response Program',
    description:
      'Create formal incident response procedures including detection, reporting, and resolution. Establish incident response team and conduct regular drills.',
    priority: 'P0',
    estimatedEffort: 'high',
    estimatedDays: 40,
    actionItems: [
      'Develop incident response plan (IRP) and procedures',
      'Establish incident response team with defined roles',
      'Create incident classification and severity matrix',
      'Implement incident ticketing and tracking system',
      'Create incident response playbooks for common scenarios',
      'Conduct quarterly incident response drills and tabletops',
    ],
  },

  // Backup and Recovery (A.12.3)
  'backup-recovery': {
    title: 'Implement Backup and Disaster Recovery Program',
    description:
      'Establish automated backup procedures for all critical data. Test recovery procedures regularly and maintain offsite backups.',
    priority: 'P0',
    estimatedEffort: 'high',
    estimatedDays: 45,
    actionItems: [
      'Conduct business impact analysis (BIA) and RTO/RPO assessment',
      'Deploy automated backup solution for all critical systems',
      'Implement daily incremental and weekly full backups',
      'Store backup copies offsite or in separate cloud region',
      'Encrypt all backups at rest and in transit',
      'Test backup restoration quarterly',
    ],
  },

  // Business Continuity (A.17.1)
  'business-continuity': {
    title: 'Develop Business Continuity Plan',
    description:
      'Create comprehensive business continuity and disaster recovery plans. Define recovery procedures and critical function priorities.',
    priority: 'P1',
    estimatedEffort: 'high',
    estimatedDays: 60,
    actionItems: [
      'Conduct business impact analysis (BIA)',
      'Develop business continuity plan (BCP)',
      'Establish recovery time objectives (RTO) and recovery point objectives (RPO)',
      'Create alternate processing site or redundancy',
      'Establish communication procedures during incidents',
      'Conduct annual BCP exercises and updates',
    ],
  },

  // Security Training (A.7.2)
  'security-training': {
    title: 'Implement Mandatory Security Awareness Program',
    description:
      'Provide comprehensive security training to all employees. Cover phishing, password security, data handling, and incident reporting.',
    priority: 'P1',
    estimatedEffort: 'medium',
    estimatedDays: 14,
    actionItems: [
      'Develop mandatory security awareness curriculum',
      'Conduct annual training for all employees',
      'Create role-specific security training modules',
      'Implement phishing simulation campaigns',
      'Track training completion and assessment scores',
      'Provide monthly security awareness updates',
    ],
  },

  // Vulnerability Management (A.12.6.2)
  'vulnerability-management': {
    title: 'Establish Vulnerability Management Program',
    description:
      'Scan systems regularly for vulnerabilities. Track, prioritize, and remediate findings. Maintain remediation timelines based on severity.',
    priority: 'P1',
    estimatedEffort: 'medium',
    estimatedDays: 28,
    actionItems: [
      'Deploy vulnerability scanning tools (Nessus, OpenVAS)',
      'Conduct quarterly vulnerability assessments',
      'Establish vulnerability rating and prioritization process',
      'Define remediation timelines (critical: 30 days)',
      'Implement vulnerability tracking system',
      'Conduct annual penetration testing',
    ],
  },

  // Access Logging (A.12.4.1)
  'access-logging': {
    title: 'Implement Comprehensive Audit Logging',
    description:
      'Enable and retain audit logs for all systems. Monitor logs for suspicious activity and maintain secure log storage.',
    priority: 'P1',
    estimatedEffort: 'medium',
    estimatedDays: 21,
    actionItems: [
      'Enable audit logging on all systems',
      'Centralize logs to SIEM or log aggregation system',
      'Implement log retention (min 1 year)',
      'Establish log integrity protection and monitoring',
      'Create alerts for suspicious activities',
      'Conduct monthly log reviews and analysis',
    ],
  },

  // Data Classification (A.8.2)
  'data-classification': {
    title: 'Implement Data Classification Scheme',
    description:
      'Define data classification levels. Implement controls based on data sensitivity and regulatory requirements.',
    priority: 'P1',
    estimatedEffort: 'medium',
    estimatedDays: 21,
    actionItems: [
      'Define data classification scheme (public, internal, confidential, restricted)',
      'Classify existing data inventory',
      'Document classification guidance and examples',
      'Implement technical controls based on classification',
      'Train employees on data classification',
      'Conduct annual data classification review',
    ],
  },

  // Network Segmentation (A.13.1.3)
  'network-segmentation': {
    title: 'Implement Network Segmentation',
    description:
      'Segment networks based on trust levels and data sensitivity. Implement firewalls and access controls between segments.',
    priority: 'P0',
    estimatedEffort: 'high',
    estimatedDays: 45,
    actionItems: [
      'Map current network topology',
      'Design network segmentation strategy',
      'Implement firewall rules between segments',
      'Deploy intrusion detection/prevention systems',
      'Implement VLANs for logical segmentation',
      'Monitor and audit network traffic between segments',
    ],
  },

  // Third-party Risk Management (A.15.1)
  'third-party-risk': {
    title: 'Establish Third-party Risk Management Program',
    description:
      'Assess and monitor security controls of third-party vendors and suppliers. Implement contracts with security requirements.',
    priority: 'P1',
    estimatedEffort: 'high',
    estimatedDays: 45,
    actionItems: [
      'Create vendor risk assessment questionnaire (VRAQ)',
      'Assess current vendors for security controls',
      'Establish vendor security requirements in contracts',
      'Implement vendor performance monitoring',
      'Conduct annual vendor security audits',
      'Maintain vendor risk register and tracking system',
    ],
  },
};

/**
 * Generate remediation recommendations for key findings
 */
export function generateRecommendations(keyFindings: Finding[]): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const processedControls = new Set<string>();

  for (const finding of keyFindings) {
    if (processedControls.has(finding.controlId)) {
      continue;
    }

    const rec = findRecommendationForControl(finding.controlId, finding);
    if (rec) {
      recommendations.push(rec);
      processedControls.add(finding.controlId);
    }
  }

  return recommendations;
}

/**
 * Find or generate recommendation for a specific control
 */
function findRecommendationForControl(
  controlId: string,
  finding: Finding
): Recommendation | null {
  // Try exact control ID match first
  let libRec = RECOMMENDATIONS_LIBRARY[controlId];

  // Try pattern matching on control category
  if (!libRec) {
    const categoryKey = finding.category
      .toLowerCase()
      .replace(/\s+/g, '-')
      .substring(0, 20);
    libRec = RECOMMENDATIONS_LIBRARY[categoryKey];
  }

  // Fall back to generic recommendation
  if (!libRec) {
    libRec = generateGenericRecommendation(finding);
  }

  if (!libRec) {
    return null;
  }

  return {
    ...libRec,
    findingId: `${controlId}-rec`,
    controlId,
  };
}

/**
 * Generate a generic recommendation when no specific one is available
 */
function generateGenericRecommendation(finding: Finding): Omit<
  Recommendation,
  'findingId' | 'controlId'
> {
  let priority: 'P0' | 'P1' | 'P2' | 'P3' = 'P2';
  let estimatedDays = 14;
  let estimatedEffort: 'low' | 'medium' | 'high' = 'medium';

  if (finding.criticality === 'critical') {
    priority = 'P0';
    estimatedDays = 30;
    estimatedEffort = 'high';
  } else if (finding.criticality === 'high') {
    priority = 'P1';
    estimatedDays = 21;
    estimatedEffort = 'medium';
  } else if (finding.criticality === 'low') {
    priority = 'P3';
    estimatedDays = 7;
    estimatedEffort = 'low';
  }

  return {
    title: `Remediate ${finding.controlTitle} Gap`,
    description: `Address the ${finding.status} status of control: ${finding.controlTitle}. Implement necessary controls and procedures to achieve full compliance with this requirement.`,
    priority,
    estimatedEffort,
    estimatedDays,
    actionItems: [
      'Review control requirements and current implementation',
      'Identify gaps and root causes',
      'Develop remediation plan with timeline',
      'Assign responsibility and track progress',
      'Test and validate remediation',
      'Document evidence of compliance',
    ],
  };
}

/**
 * Calculate effort and cost estimates based on recommendations
 */
export function estimateRemediationEffort(
  recommendations: Recommendation[]
): {
  totalDays: number;
  effortLevel: 'low' | 'medium' | 'high';
  estimatedCostRange: { low: number; high: number };
} {
  const totalDays = recommendations.reduce((sum, rec) => sum + rec.estimatedDays, 0);

  // Cost estimation: $150-250 per day based on effort
  let dailyRate = 150;
  const highEffort = recommendations.filter((r) => r.estimatedEffort === 'high').length;
  const mediumEffort = recommendations.filter((r) => r.estimatedEffort === 'medium')
    .length;
  const lowEffort = recommendations.filter((r) => r.estimatedEffort === 'low').length;

  // Adjust daily rate based on effort mix
  if (highEffort > mediumEffort) {
    dailyRate = 250;
  } else if (highEffort > lowEffort) {
    dailyRate = 200;
  }

  const costLow = totalDays * 150;
  const costHigh = totalDays * 250;

  let effortLevel: 'low' | 'medium' | 'high' = 'medium';
  if (totalDays < 15) {
    effortLevel = 'low';
  } else if (totalDays > 45) {
    effortLevel = 'high';
  }

  return {
    totalDays,
    effortLevel,
    estimatedCostRange: { low: costLow, high: costHigh },
  };
}
