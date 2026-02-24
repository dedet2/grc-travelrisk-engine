import { supabaseStore } from '@/lib/store/supabase-store';
import { GrcIngestionAgent } from '@/lib/agents/grc-ingestion-agent';
import type { ApiResponse } from '@/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * POST /api/frameworks/seed
 * Seed the database with GRC frameworks using the SupabaseStore
 * Supports: ISO 27001:2022, NIST CSF 2.0, SOC 2 Type II
 *
 * Body: { framework?: 'iso27001' | 'nist-csf' | 'soc2' | 'all' }
 * Default: 'all'
 *
 * Protected by SEED_API_KEY in production
 */

// =============================================
// NIST CSF 2.0 Framework Data
// =============================================
const NIST_CSF_FRAMEWORK = {
  id: `nist-csf-2-0-${Date.now()}`,
  name: 'NIST CSF 2.0',
  version: '2.0',
  description:
    'NIST Cybersecurity Framework 2.0 - Comprehensive framework for improving cybersecurity risk management across all sectors.',
  sourceUrl: 'https://www.nist.gov/cyberframework',
  status: 'published' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  controlCount: 0,
  categories: [
    { id: 'GV', name: 'Govern', description: 'Establish and monitor cybersecurity risk management strategy' },
    { id: 'ID', name: 'Identify', description: 'Understanding organizational context and risk' },
    { id: 'PR', name: 'Protect', description: 'Safeguards to manage cybersecurity risks' },
    { id: 'DE', name: 'Detect', description: 'Finding and analyzing cybersecurity events' },
    { id: 'RS', name: 'Respond', description: 'Actions regarding detected incidents' },
    { id: 'RC', name: 'Recover', description: 'Restoring capabilities after incidents' },
  ],
};

const NIST_CSF_CONTROLS = [
  // GOVERN
  { controlIdStr: 'GV.OC-01', title: 'Organizational Context', description: 'The organizational mission is understood and informs cybersecurity risk management', category: 'GV', controlType: 'management' as const, criticality: 'critical' as const },
  { controlIdStr: 'GV.RM-01', title: 'Risk Management Strategy', description: 'Risk management objectives are established and expressed as statements of risk appetite and tolerance', category: 'GV', controlType: 'management' as const, criticality: 'critical' as const },
  { controlIdStr: 'GV.RM-02', title: 'Risk Management Process', description: 'Risk appetite and tolerance are determined and communicated', category: 'GV', controlType: 'management' as const, criticality: 'high' as const },
  { controlIdStr: 'GV.RR-01', title: 'Roles and Responsibilities', description: 'Organizational leadership establishes cybersecurity roles and responsibilities', category: 'GV', controlType: 'management' as const, criticality: 'high' as const },
  { controlIdStr: 'GV.PO-01', title: 'Policy', description: 'A policy for managing cybersecurity risks is established based on organizational context', category: 'GV', controlType: 'management' as const, criticality: 'critical' as const },
  { controlIdStr: 'GV.SC-01', title: 'Supply Chain Risk Management', description: 'Cybersecurity supply chain risk management processes are established and managed', category: 'GV', controlType: 'management' as const, criticality: 'high' as const },
  // IDENTIFY
  { controlIdStr: 'ID.AM-01', title: 'Asset Management', description: 'Inventories of hardware managed by the organization are maintained', category: 'ID', controlType: 'operational' as const, criticality: 'high' as const },
  { controlIdStr: 'ID.AM-02', title: 'Software Inventory', description: 'Inventories of software, services, and systems managed by the organization are maintained', category: 'ID', controlType: 'operational' as const, criticality: 'high' as const },
  { controlIdStr: 'ID.RA-01', title: 'Risk Assessment - Vulnerabilities', description: 'Vulnerabilities in assets are identified, validated, and recorded', category: 'ID', controlType: 'technical' as const, criticality: 'critical' as const },
  { controlIdStr: 'ID.RA-02', title: 'Risk Assessment - Threat Intelligence', description: 'Cyber threat intelligence is received from information sharing forums and sources', category: 'ID', controlType: 'technical' as const, criticality: 'high' as const },
  { controlIdStr: 'ID.RA-03', title: 'Risk Assessment - Threats', description: 'Internal and external threats are identified and recorded', category: 'ID', controlType: 'technical' as const, criticality: 'critical' as const },
  { controlIdStr: 'ID.IM-01', title: 'Improvement - Lessons Learned', description: 'Improvements are identified from evaluations and exercises', category: 'ID', controlType: 'operational' as const, criticality: 'medium' as const },
  // PROTECT
  { controlIdStr: 'PR.AA-01', title: 'Identity Management and Access Control', description: 'Identities and credentials for authorized users, services, and hardware are managed', category: 'PR', controlType: 'technical' as const, criticality: 'critical' as const },
  { controlIdStr: 'PR.AA-02', title: 'Access Enforcement', description: 'Identities are proofed and bound to credentials based on the context of interactions', category: 'PR', controlType: 'technical' as const, criticality: 'critical' as const },
  { controlIdStr: 'PR.AT-01', title: 'Awareness and Training', description: 'Personnel are provided cybersecurity awareness and training', category: 'PR', controlType: 'operational' as const, criticality: 'high' as const },
  { controlIdStr: 'PR.DS-01', title: 'Data Security - At Rest', description: 'The confidentiality, integrity, and availability of data-at-rest are protected', category: 'PR', controlType: 'technical' as const, criticality: 'critical' as const },
  { controlIdStr: 'PR.DS-02', title: 'Data Security - In Transit', description: 'The confidentiality, integrity, and availability of data-in-transit are protected', category: 'PR', controlType: 'technical' as const, criticality: 'critical' as const },
  { controlIdStr: 'PR.PS-01', title: 'Platform Security', description: 'The hardware, software, and services of physical and virtual platforms are managed', category: 'PR', controlType: 'technical' as const, criticality: 'high' as const },
  { controlIdStr: 'PR.IR-01', title: 'Technology Infrastructure Resilience', description: 'Security architectures are managed with the organizations risk strategy', category: 'PR', controlType: 'technical' as const, criticality: 'high' as const },
  // DETECT
  { controlIdStr: 'DE.CM-01', title: 'Continuous Monitoring - Networks', description: 'Networks and network services are monitored to find potentially adverse events', category: 'DE', controlType: 'technical' as const, criticality: 'critical' as const },
  { controlIdStr: 'DE.CM-02', title: 'Continuous Monitoring - Physical', description: 'The physical environment is monitored to find potentially adverse events', category: 'DE', controlType: 'technical' as const, criticality: 'high' as const },
  { controlIdStr: 'DE.CM-03', title: 'Continuous Monitoring - Personnel', description: 'Personnel activity and technology usage are monitored to find potentially adverse events', category: 'DE', controlType: 'operational' as const, criticality: 'high' as const },
  { controlIdStr: 'DE.AE-01', title: 'Adverse Event Analysis', description: 'Estimated impact and scope of adverse events are understood', category: 'DE', controlType: 'technical' as const, criticality: 'critical' as const },
  // RESPOND
  { controlIdStr: 'RS.MA-01', title: 'Incident Management', description: 'The incident response plan is executed in coordination with relevant third parties', category: 'RS', controlType: 'operational' as const, criticality: 'critical' as const },
  { controlIdStr: 'RS.AN-01', title: 'Incident Analysis', description: 'Investigations are conducted to ensure effective response and support forensics', category: 'RS', controlType: 'technical' as const, criticality: 'critical' as const },
  { controlIdStr: 'RS.CO-01', title: 'Incident Response Reporting', description: 'Internal and external stakeholders are notified of incidents', category: 'RS', controlType: 'operational' as const, criticality: 'high' as const },
  { controlIdStr: 'RS.MI-01', title: 'Incident Mitigation', description: 'Incidents are contained and mitigated', category: 'RS', controlType: 'technical' as const, criticality: 'critical' as const },
  // RECOVER
  { controlIdStr: 'RC.RP-01', title: 'Recovery Plan Execution', description: 'The recovery portion of the incident response plan is executed', category: 'RC', controlType: 'operational' as const, criticality: 'critical' as const },
  { controlIdStr: 'RC.CO-01', title: 'Recovery Communication', description: 'Restoration activities and progress are communicated to designated internal and external stakeholders', category: 'RC', controlType: 'operational' as const, criticality: 'high' as const },
];

// =============================================
// SOC 2 Type II Framework Data
// =============================================
const SOC2_FRAMEWORK = {
  id: `soc2-type-ii-${Date.now()}`,
  name: 'SOC 2 Type II',
  version: '2017-rev2024',
  description:
    'SOC 2 Type II - Trust Services Criteria for Security, Availability, Processing Integrity, Confidentiality, and Privacy.',
  sourceUrl: 'https://us.aicpa.org/interestareas/frc/assuranceadvisoryservices/socforserviceorganizations',
  status: 'published' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  controlCount: 0,
  categories: [
    { id: 'CC', name: 'Common Criteria (Security)', description: 'Foundation controls applicable to all trust services criteria' },
    { id: 'A', name: 'Availability', description: 'System is available for operation and use as committed or agreed' },
    { id: 'PI', name: 'Processing Integrity', description: 'System processing is complete, valid, accurate, timely, and authorized' },
    { id: 'C', name: 'Confidentiality', description: 'Information designated as confidential is protected as committed or agreed' },
    { id: 'P', name: 'Privacy', description: 'Personal information is collected, used, retained, disclosed, and disposed as committed' },
  ],
};

const SOC2_CONTROLS = [
  // COMMON CRITERIA (CC) - Security
  { controlIdStr: 'CC1.1', title: 'COSO Principle 1 - Integrity and Ethics', description: 'The entity demonstrates a commitment to integrity and ethical values', category: 'CC', controlType: 'management' as const, criticality: 'critical' as const },
  { controlIdStr: 'CC1.2', title: 'COSO Principle 2 - Board Oversight', description: 'The board of directors demonstrates independence from management and exercises oversight', category: 'CC', controlType: 'management' as const, criticality: 'high' as const },
  { controlIdStr: 'CC1.3', title: 'COSO Principle 3 - Management Structure', description: 'Management establishes structures, reporting lines, and appropriate authorities and responsibilities', category: 'CC', controlType: 'management' as const, criticality: 'high' as const },
  { controlIdStr: 'CC1.4', title: 'COSO Principle 4 - Competent Personnel', description: 'The entity demonstrates commitment to attract, develop, and retain competent individuals', category: 'CC', controlType: 'operational' as const, criticality: 'high' as const },
  { controlIdStr: 'CC1.5', title: 'COSO Principle 5 - Accountability', description: 'The entity holds individuals accountable for their internal control responsibilities', category: 'CC', controlType: 'management' as const, criticality: 'high' as const },
  { controlIdStr: 'CC2.1', title: 'Information Quality', description: 'The entity obtains or generates and uses relevant, quality information to support internal control', category: 'CC', controlType: 'operational' as const, criticality: 'high' as const },
  { controlIdStr: 'CC2.2', title: 'Internal Communication', description: 'The entity internally communicates information necessary to support internal control', category: 'CC', controlType: 'operational' as const, criticality: 'medium' as const },
  { controlIdStr: 'CC2.3', title: 'External Communication', description: 'The entity communicates with external parties regarding matters affecting internal control', category: 'CC', controlType: 'operational' as const, criticality: 'medium' as const },
  { controlIdStr: 'CC3.1', title: 'Risk Assessment Objectives', description: 'The entity specifies objectives with sufficient clarity to enable identification and assessment of risks', category: 'CC', controlType: 'management' as const, criticality: 'critical' as const },
  { controlIdStr: 'CC3.2', title: 'Risk Identification and Analysis', description: 'The entity identifies risks to the achievement of its objectives and analyzes risks', category: 'CC', controlType: 'management' as const, criticality: 'critical' as const },
  { controlIdStr: 'CC3.3', title: 'Fraud Risk Assessment', description: 'The entity considers the potential for fraud in assessing risks', category: 'CC', controlType: 'management' as const, criticality: 'high' as const },
  { controlIdStr: 'CC3.4', title: 'Change Management', description: 'The entity identifies and assesses changes that could significantly impact internal control', category: 'CC', controlType: 'operational' as const, criticality: 'high' as const },
  { controlIdStr: 'CC4.1', title: 'Monitoring Activities', description: 'The entity selects, develops, and performs ongoing and/or separate evaluations', category: 'CC', controlType: 'operational' as const, criticality: 'high' as const },
  { controlIdStr: 'CC4.2', title: 'Deficiency Remediation', description: 'The entity evaluates and communicates internal control deficiencies in a timely manner', category: 'CC', controlType: 'operational' as const, criticality: 'high' as const },
  { controlIdStr: 'CC5.1', title: 'Control Activities - Risk Mitigation', description: 'The entity selects and develops control activities that contribute to mitigation of risks', category: 'CC', controlType: 'operational' as const, criticality: 'critical' as const },
  { controlIdStr: 'CC5.2', title: 'Technology General Controls', description: 'The entity selects and develops general control activities over technology', category: 'CC', controlType: 'technical' as const, criticality: 'critical' as const },
  { controlIdStr: 'CC5.3', title: 'Control Activity Deployment', description: 'The entity deploys control activities through policies that establish expectations and procedures', category: 'CC', controlType: 'operational' as const, criticality: 'high' as const },
  { controlIdStr: 'CC6.1', title: 'Logical Access Security', description: 'The entity implements logical access security software, infrastructure, and architectures', category: 'CC', controlType: 'technical' as const, criticality: 'critical' as const },
  { controlIdStr: 'CC6.2', title: 'User Authentication', description: 'Prior to issuing system credentials, registered users are authorized and authenticated', category: 'CC', controlType: 'technical' as const, criticality: 'critical' as const },
  { controlIdStr: 'CC6.3', title: 'Access Authorization', description: 'The entity authorizes, modifies, or removes access to data and systems based on roles', category: 'CC', controlType: 'technical' as const, criticality: 'critical' as const },
  { controlIdStr: 'CC6.6', title: 'External Threats', description: 'The entity implements controls to prevent or detect and act upon the introduction of unauthorized software', category: 'CC', controlType: 'technical' as const, criticality: 'critical' as const },
  { controlIdStr: 'CC6.7', title: 'Data Transmission', description: 'The entity restricts the transmission, movement, and removal of information to authorized users', category: 'CC', controlType: 'technical' as const, criticality: 'high' as const },
  { controlIdStr: 'CC6.8', title: 'Malware Detection', description: 'The entity implements controls to prevent or detect and act upon the introduction of malware', category: 'CC', controlType: 'technical' as const, criticality: 'critical' as const },
  { controlIdStr: 'CC7.1', title: 'Vulnerability Management', description: 'To meet its objectives, the entity uses detection and monitoring procedures to identify changes to configurations', category: 'CC', controlType: 'technical' as const, criticality: 'critical' as const },
  { controlIdStr: 'CC7.2', title: 'Anomaly Detection', description: 'The entity monitors system components and the operation of those components for anomalies', category: 'CC', controlType: 'technical' as const, criticality: 'critical' as const },
  { controlIdStr: 'CC7.3', title: 'Security Event Evaluation', description: 'The entity evaluates security events to determine whether they could or have resulted in a failure', category: 'CC', controlType: 'technical' as const, criticality: 'critical' as const },
  { controlIdStr: 'CC7.4', title: 'Incident Response', description: 'The entity responds to identified security incidents by executing a defined incident response program', category: 'CC', controlType: 'operational' as const, criticality: 'critical' as const },
  { controlIdStr: 'CC7.5', title: 'Incident Recovery', description: 'The entity identifies, develops, and implements activities to recover from identified security incidents', category: 'CC', controlType: 'operational' as const, criticality: 'critical' as const },
  { controlIdStr: 'CC8.1', title: 'Change Management Process', description: 'The entity authorizes, designs, develops, configures, documents, tests, approves, and implements changes', category: 'CC', controlType: 'operational' as const, criticality: 'high' as const },
  { controlIdStr: 'CC9.1', title: 'Vendor Risk Management', description: 'The entity identifies, selects, and develops risk mitigation activities for risks from business partners', category: 'CC', controlType: 'management' as const, criticality: 'high' as const },
  { controlIdStr: 'CC9.2', title: 'Vendor Assessment', description: 'The entity assesses and manages risks associated with vendors and business partners', category: 'CC', controlType: 'management' as const, criticality: 'high' as const },
  // AVAILABILITY
  { controlIdStr: 'A1.1', title: 'System Capacity Management', description: 'The entity maintains, monitors, and evaluates current processing capacity and use', category: 'A', controlType: 'technical' as const, criticality: 'high' as const },
  { controlIdStr: 'A1.2', title: 'Environmental Protection', description: 'The entity authorizes, designs, develops, implements, operates, approves, maintains, and monitors environmental protections', category: 'A', controlType: 'technical' as const, criticality: 'high' as const },
  { controlIdStr: 'A1.3', title: 'Recovery Testing', description: 'The entity tests recovery plan procedures supporting system recovery to meet its objectives', category: 'A', controlType: 'operational' as const, criticality: 'critical' as const },
  // PROCESSING INTEGRITY
  { controlIdStr: 'PI1.1', title: 'Processing Completeness and Accuracy', description: 'The entity implements policies and procedures over system processing to ensure completeness', category: 'PI', controlType: 'technical' as const, criticality: 'high' as const },
  { controlIdStr: 'PI1.2', title: 'Input Validation', description: 'The entity implements policies and procedures over system inputs to result in products that are valid', category: 'PI', controlType: 'technical' as const, criticality: 'high' as const },
  { controlIdStr: 'PI1.3', title: 'Output Review', description: 'The entity implements policies and procedures over system processing to result in accurate output', category: 'PI', controlType: 'technical' as const, criticality: 'medium' as const },
  // CONFIDENTIALITY
  { controlIdStr: 'C1.1', title: 'Confidential Information Identification', description: 'The entity identifies and maintains confidential information to meet the entity\'s objectives', category: 'C', controlType: 'operational' as const, criticality: 'critical' as const },
  { controlIdStr: 'C1.2', title: 'Confidential Information Disposal', description: 'The entity disposes of confidential information to meet the entity\'s objectives', category: 'C', controlType: 'operational' as const, criticality: 'high' as const },
  // PRIVACY
  { controlIdStr: 'P1.1', title: 'Privacy Notice', description: 'The entity provides notice to data subjects about its privacy practices', category: 'P', controlType: 'operational' as const, criticality: 'critical' as const },
  { controlIdStr: 'P2.1', title: 'Consent', description: 'The entity communicates choices available regarding the collection, use, and disclosure of personal information', category: 'P', controlType: 'operational' as const, criticality: 'critical' as const },
  { controlIdStr: 'P3.1', title: 'Collection Limitation', description: 'Personal information is collected consistent with the entity\'s objectives', category: 'P', controlType: 'operational' as const, criticality: 'high' as const },
  { controlIdStr: 'P4.1', title: 'Use and Retention', description: 'The entity limits the use, retention, and disposal of personal information', category: 'P', controlType: 'operational' as const, criticality: 'high' as const },
  { controlIdStr: 'P5.1', title: 'Data Subject Access', description: 'The entity grants identified and authenticated data subjects the ability to access their personal information', category: 'P', controlType: 'operational' as const, criticality: 'high' as const },
  { controlIdStr: 'P6.1', title: 'Third-Party Disclosure', description: 'The entity discloses personal information to third parties with the consent of the data subject', category: 'P', controlType: 'operational' as const, criticality: 'critical' as const },
  { controlIdStr: 'P7.1', title: 'Data Quality', description: 'The entity collects and maintains accurate, up-to-date, complete, and relevant personal information', category: 'P', controlType: 'operational' as const, criticality: 'medium' as const },
  { controlIdStr: 'P8.1', title: 'Privacy Incident Response', description: 'The entity implements a process for receiving, addressing, resolving, and communicating complaints', category: 'P', controlType: 'operational' as const, criticality: 'high' as const },
];

// =============================================
// Seed Helper Functions
// =============================================

function buildControlObject(
  frameworkId: string,
  ctrl: { controlIdStr: string; title: string; description: string; category: string; controlType: 'technical' | 'operational' | 'management'; criticality: 'low' | 'medium' | 'high' | 'critical' }
) {
  return {
    id: `${frameworkId}-${ctrl.controlIdStr}`,
    frameworkId,
    controlIdStr: ctrl.controlIdStr,
    title: ctrl.title,
    description: ctrl.description,
    category: ctrl.category,
    controlType: ctrl.controlType,
    criticality: ctrl.criticality,
    createdAt: new Date(),
  };
}

async function seedFramework(
  frameworkData: typeof NIST_CSF_FRAMEWORK,
  controlsData: typeof NIST_CSF_CONTROLS
) {
  // Check if framework already exists
  const existing = supabaseStore.getFrameworkByName(frameworkData.name);
  if (existing) {
    return {
      success: false,
      message: `${frameworkData.name} already exists (id: ${existing.id})`,
      framework: existing,
      controlCount: supabaseStore.getControls(existing.id).length,
      skipped: true,
    };
  }

  // Build controls
  const controls = controlsData.map((ctrl) => buildControlObject(frameworkData.id, ctrl));

  // Update count
  frameworkData.controlCount = controls.length;

  // Add to store (Supabase + in-memory)
  const storedFramework = supabaseStore.addFramework(frameworkData);
  const storedControls = supabaseStore.addControls(frameworkData.id, controls);

  // Build category breakdown
  const categoryCounts: Record<string, number> = {};
  controls.forEach((c) => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });

  // Build type breakdown
  const typeCounts: Record<string, number> = {};
  controls.forEach((c) => {
    typeCounts[c.controlType] = (typeCounts[c.controlType] || 0) + 1;
  });

  return {
    success: true,
    message: `${frameworkData.name} seeded successfully`,
    framework: {
      id: storedFramework.id,
      name: storedFramework.name,
      version: storedFramework.version,
      status: storedFramework.status,
    },
    controlCount: storedControls.length,
    categoryBreakdown: categoryCounts,
    typeBreakdown: typeCounts,
    skipped: false,
  };
}

// =============================================
// Route Handlers
// =============================================

export async function POST(request: Request): Promise<Response> {
  try {
    const authHeader = request.headers.get('authorization');
    const expectedKey = process.env.SEED_API_KEY || 'development-seed-key';

    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${expectedKey}`) {
      return Response.json(
        {
          success: false,
          error: 'Unauthorized - seed endpoint requires valid API key in production',
          timestamp: new Date(),
        } as ApiResponse<null>,
        { status: 401 }
      );
    }

    let body: { framework?: string } = {};
    try {
      body = await request.json();
    } catch {
      // Default to 'all' if no body
    }

    const target = body.framework || 'all';
    const results: Record<string, any> = {};

    // Seed ISO 27001 via GrcIngestionAgent
    if (target === 'all' || target === 'iso27001') {
      try {
        const existingIso = supabaseStore.getFrameworkByName('ISO 27001:2022');
        if (existingIso) {
          results.iso27001 = {
            success: false,
            message: 'ISO 27001:2022 already exists',
            skipped: true,
            controlCount: supabaseStore.getControls(existingIso.id).length,
          };
        } else {
          const agent = new GrcIngestionAgent({
            name: 'GRC-Ingestion-Seed',
            description: 'Seeds ISO 27001:2022 via SupabaseStore',
          });
          const agentResult = await agent.run();
          results.iso27001 = {
            success: agentResult.status === 'completed',
            message: agentResult.status === 'completed'
              ? 'ISO 27001:2022 seeded via ingestion agent'
              : agentResult.error || 'Agent failed',
            agentStatus: agentResult.status,
            latencyMs: agentResult.latencyMs,
          };
        }
      } catch (error) {
        results.iso27001 = {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to seed ISO 27001',
        };
      }
    }

    // Seed NIST CSF 2.0
    if (target === 'all' || target === 'nist-csf') {
      results.nistCsf = await seedFramework(NIST_CSF_FRAMEWORK, NIST_CSF_CONTROLS);
    }

    // Seed SOC 2 Type II
    if (target === 'all' || target === 'soc2') {
      results.soc2 = await seedFramework(SOC2_FRAMEWORK, SOC2_CONTROLS);
    }

    const allSuccess = Object.values(results).every(
      (r: any) => r.success || r.skipped
    );

    return Response.json(
      {
        success: allSuccess,
        data: results,
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: allSuccess ? 201 : 207 }
    );
  } catch (error) {
    console.error('[Seed] Error:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to seed frameworks',
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

export async function GET(): Promise<Response> {
  try {
    const frameworks = supabaseStore.getFrameworks();
    const stats = supabaseStore.getStats();

    const frameworkDetails = frameworks.map((fw) => {
      const controls = supabaseStore.getControls(fw.id);
      const categoryCounts: Record<string, number> = {};
      const typeCounts: Record<string, number> = {};
      controls.forEach((c) => {
        categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
        typeCounts[c.controlType] = (typeCounts[c.controlType] || 0) + 1;
      });
      return {
        id: fw.id,
        name: fw.name,
        version: fw.version,
        status: fw.status,
        controlCount: controls.length,
        categoryCounts,
        typeCounts,
        createdAt: fw.createdAt,
      };
    });

    return Response.json(
      {
        success: true,
        data: {
          frameworks: frameworkDetails,
          storeStats: stats,
        },
        timestamp: new Date(),
      } as ApiResponse<any>,
      { status: 200 }
    );
  } catch (error) {
    console.error('[Seed] Error checking status:', error);
    return Response.json(
      {
        success: false,
        error: 'Failed to check seed status',
        timestamp: new Date(),
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
