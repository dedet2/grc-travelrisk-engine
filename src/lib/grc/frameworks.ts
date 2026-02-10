import type { ParsedControl, FrameworkCategory, DetailedControl } from '@/types/grc';

/**
 * ISO 27001:2022 Control Catalog
 * Based on Annex A - 14 control categories with representative controls
 * Reference: ISO/IEC 27001:2022 Information security, cybersecurity and privacy protection
 */

export const ISO_27001_2022_CATEGORIES: FrameworkCategory[] = [
  {
    id: 'A.5',
    name: 'Organizational Controls',
    description: 'Controls to establish the context and governance structure for information security',
    controlCount: 8,
  },
  {
    id: 'A.6',
    name: 'People Controls',
    description: 'Controls related to people and resources for information security',
    controlCount: 8,
  },
  {
    id: 'A.7',
    name: 'Physical Controls',
    description: 'Controls for physical and environmental security of organizational premises',
    controlCount: 14,
  },
  {
    id: 'A.8',
    name: 'Technological Controls',
    description: 'Controls for managing and protecting information technology systems and data',
    controlCount: 32,
  },
  {
    id: 'A.9',
    name: 'Cryptographic Controls',
    description: 'Controls for encryption and key management',
    controlCount: 4,
  },
  {
    id: 'A.10',
    name: 'Physical and Cryptographic Controls',
    description: 'Combined physical and cryptographic protection controls',
    controlCount: 3,
  },
  {
    id: 'A.11',
    name: 'Logical and Access Controls',
    description: 'Controls for logical access and network security',
    controlCount: 9,
  },
  {
    id: 'A.12',
    name: 'Operations and Communications Security',
    description: 'Controls for managing IT operations and communications',
    controlCount: 14,
  },
  {
    id: 'A.13',
    name: 'System Acquisition, Development and Maintenance',
    description: 'Controls for secure development and deployment of systems',
    controlCount: 13,
  },
  {
    id: 'A.14',
    name: 'Communications Security',
    description: 'Controls for securing communications channels',
    controlCount: 4,
  },
  {
    id: 'A.15',
    name: 'System and Communications Protection',
    description: 'Controls for protecting systems and communications against interference',
    controlCount: 7,
  },
  {
    id: 'A.16',
    name: 'Identity and Access Management',
    description: 'Controls for managing user identities and access rights',
    controlCount: 5,
  },
  {
    id: 'A.17',
    name: 'Incident Management',
    description: 'Controls for responding to and managing security incidents',
    controlCount: 5,
  },
  {
    id: 'A.18',
    name: 'Business Continuity Management',
    description: 'Controls for ensuring continuity and resilience of operations',
    controlCount: 8,
  },
];

/**
 * ISO 27001:2022 Representative Controls (20+ key controls)
 * These are representative controls from each major category
 */
export const ISO_27001_2022_CONTROLS: ParsedControl[] = [
  // A.5 - Organizational Controls
  {
    id: 'A.5.1.1',
    category: 'A.5',
    title: 'Policies for information security',
    description:
      'Establish, document, communicate and keep information security policies up-to-date. Policies shall address organizational objectives and information security requirements.',
    controlType: 'management',
    criticality: 'critical',
    objectives: ['Establish governance framework', 'Define information security direction'],
  },
  {
    id: 'A.5.1.2',
    category: 'A.5',
    title: 'Information security roles and responsibilities',
    description:
      'Define and assign information security responsibilities to relevant personnel. Ensure roles and responsibilities are communicated and understood across the organization.',
    controlType: 'management',
    criticality: 'high',
    objectives: ['Establish clear accountability', 'Define ownership'],
  },
  {
    id: 'A.5.2.1',
    category: 'A.5',
    title: 'Information security assessments',
    description:
      'Conduct regular assessments of information security and the effectiveness of information security controls. Document findings and take appropriate action.',
    controlType: 'management',
    criticality: 'high',
    objectives: ['Monitor compliance', 'Identify improvement areas'],
  },
  {
    id: 'A.5.2.2',
    category: 'A.5',
    title: 'Compliance with applicable laws and regulations',
    description:
      'Determine, document and keep current applicable legal, regulatory and contractual information security requirements. Ensure compliance monitoring and enforcement.',
    controlType: 'management',
    criticality: 'critical',
    objectives: ['Meet regulatory requirements', 'Manage legal exposure'],
  },

  // A.6 - People Controls
  {
    id: 'A.6.1.1',
    category: 'A.6',
    title: 'Screening of personnel',
    description:
      'Conduct background checks and screening of personnel before employment, proportionate to business risk. Verify claimed qualifications and information.',
    controlType: 'operational',
    criticality: 'high',
    objectives: ['Minimize insider threats', 'Ensure trustworthiness'],
  },
  {
    id: 'A.6.2.1',
    category: 'A.6',
    title: 'Information security awareness and training',
    description:
      'Provide information security awareness training to all personnel. Ensure training covers policies, procedures, and practical information security practices.',
    controlType: 'operational',
    criticality: 'high',
    objectives: ['Build security culture', 'Reduce human error'],
  },
  {
    id: 'A.6.2.2',
    category: 'A.6',
    title: 'Disciplinary process',
    description:
      'Establish and implement a disciplinary process for personnel who commit information security violations. Ensure fair and consistent application.',
    controlType: 'operational',
    criticality: 'medium',
    objectives: ['Enforce compliance', 'Maintain accountability'],
  },
  {
    id: 'A.6.3.1',
    category: 'A.6',
    title: 'Termination or change of employment',
    description:
      'Manage the return of equipment, cancellation of access rights, and removal of access credentials for employees leaving or changing roles.',
    controlType: 'operational',
    criticality: 'high',
    objectives: ['Prevent unauthorized access', 'Protect information assets'],
  },

  // A.7 - Physical Controls
  {
    id: 'A.7.1.1',
    category: 'A.7',
    title: 'Physical security perimeter',
    description:
      'Establish physical security perimeters using barriers such as walls, gates or card access systems to protect premises and information assets.',
    controlType: 'technical',
    criticality: 'high',
    objectives: ['Restrict unauthorized physical access', 'Protect facilities'],
  },
  {
    id: 'A.7.1.2',
    category: 'A.7',
    title: 'Physical access to buildings',
    description:
      'Implement and maintain physical access controls such as reception areas, access passes, visitor badges, and intrusion detection systems.',
    controlType: 'technical',
    criticality: 'high',
    objectives: ['Monitor and control access', 'Audit physical access'],
  },
  {
    id: 'A.7.2.1',
    category: 'A.7',
    title: 'Physical access to equipment',
    description:
      'Ensure that equipment is physically protected and that access is restricted to authorized personnel. Secure equipment location and implement controls for equipment installation.',
    controlType: 'technical',
    criticality: 'high',
    objectives: ['Prevent theft or damage', 'Ensure equipment integrity'],
  },

  // A.8 - Technological Controls (representative selection)
  {
    id: 'A.8.1.1',
    category: 'A.8',
    title: 'User registration and access management',
    description:
      'Implement a formal user registration and de-registration procedure for granting and revoking access to information and information processing facilities.',
    controlType: 'technical',
    criticality: 'critical',
    objectives: ['Manage user lifecycle', 'Control access rights'],
  },
  {
    id: 'A.8.1.2',
    category: 'A.8',
    title: 'Privilege access management',
    description:
      'Restrict and control the allocation and use of privileged access rights. Implement controls for provisioning, usage monitoring, and de-provisioning.',
    controlType: 'technical',
    criticality: 'critical',
    objectives: ['Minimize privilege escalation risk', 'Audit privileged access'],
  },
  {
    id: 'A.8.1.4',
    category: 'A.8',
    title: 'Password management',
    description:
      'Implement password policies requiring strong passwords, regular changes, and secure storage. Prevent password reuse and implement password recovery procedures.',
    controlType: 'technical',
    criticality: 'high',
    objectives: ['Strengthen authentication', 'Prevent credential compromise'],
  },
  {
    id: 'A.8.2.1',
    category: 'A.8',
    title: 'Confidentiality or separation of duties',
    description:
      'Separate duties and areas of responsibility to reduce opportunities for unauthorized modification or misuse of information and systems.',
    controlType: 'operational',
    criticality: 'high',
    objectives: ['Prevent fraud', 'Reduce insider risks'],
  },
  {
    id: 'A.8.3.1',
    category: 'A.8',
    title: 'Information security in supplier relationships',
    description:
      'Establish information security requirements for suppliers providing services accessing, processing, or delivering information systems and information.',
    controlType: 'management',
    criticality: 'high',
    objectives: ['Manage third-party risk', 'Ensure supply chain security'],
  },

  // A.9 - Cryptographic Controls
  {
    id: 'A.9.1.1',
    category: 'A.9',
    title: 'Cryptographic policy',
    description:
      'Establish and implement a cryptographic policy defining the use, protection and maintenance of cryptographic keys and algorithms.',
    controlType: 'management',
    criticality: 'high',
    objectives: ['Protect data in transit and at rest', 'Ensure cryptographic effectiveness'],
  },
  {
    id: 'A.9.2.1',
    category: 'A.9',
    title: 'Cryptographic key management',
    description:
      'Implement procedures for the generation, storage, archiving, retrieval and destruction of cryptographic keys.',
    controlType: 'technical',
    criticality: 'critical',
    objectives: ['Maintain key security', 'Ensure availability when needed'],
  },

  // A.11 - Logical and Access Controls (representative)
  {
    id: 'A.11.1.1',
    category: 'A.11',
    title: 'Network perimeter security',
    description:
      'Implement network perimeter controls such as firewalls, proxies, or network segmentation to protect information systems and networks.',
    controlType: 'technical',
    criticality: 'critical',
    objectives: ['Prevent unauthorized network access', 'Segment networks'],
  },
  {
    id: 'A.11.2.1',
    category: 'A.11',
    title: 'Secure log-on procedures',
    description:
      'Implement secure authentication mechanisms such as multi-factor authentication, strong passwords, or biometric controls for system access.',
    controlType: 'technical',
    criticality: 'critical',
    objectives: ['Authenticate users', 'Prevent unauthorized access'],
  },

  // A.12 - Operations and Communications Security
  {
    id: 'A.12.4.1',
    category: 'A.12',
    title: 'Event logging',
    description:
      'Record user activities, exceptions, and security-relevant events. Retain logs for an agreed period and protect them from unauthorized access.',
    controlType: 'technical',
    criticality: 'high',
    objectives: ['Audit user actions', 'Support incident investigation'],
  },
  {
    id: 'A.12.4.2',
    category: 'A.12',
    title: 'Protection of log information',
    description:
      'Protect logging facilities and log information from tampering and unauthorized access. Implement secure log management and archiving.',
    controlType: 'technical',
    criticality: 'high',
    objectives: ['Ensure log integrity', 'Prevent log tampering'],
  },

  // A.13 - System Acquisition, Development and Maintenance
  {
    id: 'A.13.1.1',
    category: 'A.13',
    title: 'Information security requirements for software development',
    description:
      'Establish and implement information security requirements for software development and system implementation projects.',
    controlType: 'management',
    criticality: 'high',
    objectives: ['Build security into development', 'Prevent vulnerabilities'],
  },
  {
    id: 'A.13.2.1',
    category: 'A.13',
    title: 'Change control procedures',
    description:
      'Implement procedures for controlling changes to information processing systems to ensure only authorized changes are made.',
    controlType: 'operational',
    criticality: 'high',
    objectives: ['Prevent unauthorized changes', 'Track modifications'],
  },

  // A.17 - Incident Management
  {
    id: 'A.17.1.1',
    category: 'A.17',
    title: 'Incident response procedures',
    description:
      'Establish and maintain incident response procedures including detection, assessment, classification, containment, and recovery.',
    controlType: 'operational',
    criticality: 'critical',
    objectives: ['Minimize incident impact', 'Rapid response'],
  },
  {
    id: 'A.17.1.2',
    category: 'A.17',
    title: 'Assessing and deciding on incident response',
    description:
      'Develop procedures to assess incidents and decide on appropriate response actions including investigation, mitigation, and communication.',
    controlType: 'operational',
    criticality: 'high',
    objectives: ['Effective incident management', 'Stakeholder communication'],
  },

  // A.18 - Business Continuity Management
  {
    id: 'A.18.1.1',
    category: 'A.18',
    title: 'Business continuity planning',
    description:
      'Establish and maintain business continuity plans to ensure continuous or timely recovery of critical information systems and processes.',
    controlType: 'management',
    criticality: 'critical',
    objectives: ['Ensure business resilience', 'Minimize downtime'],
  },
  {
    id: 'A.18.1.2',
    category: 'A.18',
    title: 'Business continuity testing',
    description:
      'Test business continuity plans at planned intervals to verify their effectiveness and keep them current.',
    controlType: 'operational',
    criticality: 'high',
    objectives: ['Validate recovery procedures', 'Identify gaps'],
  },
];

/**
 * Get a specific framework by name
 */
export function getFramework(name: string): {
  name: string;
  version: string;
  description: string;
  categories: FrameworkCategory[];
  controls: ParsedControl[];
} | null {
  if (name.toLowerCase().includes('iso 27001') || name.toLowerCase().includes('iso27001')) {
    return {
      name: 'ISO 27001:2022',
      version: '2022',
      description:
        'ISO/IEC 27001:2022 Information security, cybersecurity and privacy protection - Information security management systems - Requirements',
      categories: ISO_27001_2022_CATEGORIES,
      controls: ISO_27001_2022_CONTROLS,
    };
  }
  return null;
}

/**
 * List all available frameworks
 */
export function listFrameworks(): string[] {
  return ['ISO 27001:2022'];
}

/**
 * Get controls by category
 */
export function getControlsByCategory(
  category: string,
  frameworkName: string = 'ISO 27001:2022'
): ParsedControl[] {
  const framework = getFramework(frameworkName);
  if (!framework) return [];

  return framework.controls.filter((control) => control.category === category);
}

/**
 * Get all categories for a framework
 */
export function getFrameworkCategories(frameworkName: string = 'ISO 27001:2022'): FrameworkCategory[] {
  const framework = getFramework(frameworkName);
  return framework ? framework.categories : [];
}

/**
 * Get controls by criticality level
 */
export function getControlsByCriticality(
  criticality: 'low' | 'medium' | 'high' | 'critical',
  frameworkName: string = 'ISO 27001:2022'
): ParsedControl[] {
  const framework = getFramework(frameworkName);
  if (!framework) return [];

  return framework.controls.filter((control) => control.criticality === criticality);
}

/**
 * Get controls by control type
 */
export function getControlsByType(
  controlType: 'technical' | 'operational' | 'management',
  frameworkName: string = 'ISO 27001:2022'
): ParsedControl[] {
  const framework = getFramework(frameworkName);
  if (!framework) return [];

  return framework.controls.filter((control) => control.controlType === controlType);
}

/**
 * Search controls by keyword
 */
export function searchControls(
  keyword: string,
  frameworkName: string = 'ISO 27001:2022'
): ParsedControl[] {
  const framework = getFramework(frameworkName);
  if (!framework) return [];

  const lowerKeyword = keyword.toLowerCase();
  return framework.controls.filter(
    (control) =>
      control.id.toLowerCase().includes(lowerKeyword) ||
      control.title.toLowerCase().includes(lowerKeyword) ||
      control.description.toLowerCase().includes(lowerKeyword)
  );
}

/**
 * Get category details with control count
 */
export function getCategoryDetails(
  categoryId: string,
  frameworkName: string = 'ISO 27001:2022'
): FrameworkCategory | null {
  const categories = getFrameworkCategories(frameworkName);
  const category = categories.find((c) => c.id === categoryId);

  if (!category) return null;

  const controls = getControlsByCategory(categoryId, frameworkName);
  return {
    ...category,
    controlCount: controls.length,
  };
}

/**
 * Get control hierarchy (parent/child relationships)
 * e.g., A.5.1.1 belongs to A.5.1 which belongs to A.5
 */
export function getControlHierarchy(
  controlId: string
): {
  level1: string;
  level2?: string;
  level3?: string;
  full: string;
} {
  const parts = controlId.split('.');
  return {
    level1: parts[0] + '.' + parts[1],
    level2: parts.length > 2 ? parts[0] + '.' + parts[1] + '.' + parts[2] : undefined,
    level3: parts.length > 3 ? controlId : undefined,
    full: controlId,
  };
}

/**
 * Get all related controls for a given control
 */
export function getRelatedControls(
  controlId: string,
  frameworkName: string = 'ISO 27001:2022'
): ParsedControl[] {
  const framework = getFramework(frameworkName);
  if (!framework) return [];

  const control = framework.controls.find((c) => c.id === controlId);
  if (!control || !control.relatedControls) return [];

  return framework.controls.filter((c) => control.relatedControls?.includes(c.id));
}

/**
 * Get control count statistics
 */
export function getFrameworkStats(frameworkName: string = 'ISO 27001:2022'): {
  totalControls: number;
  byCategory: Record<string, number>;
  byType: Record<string, number>;
  byCriticality: Record<string, number>;
} {
  const framework = getFramework(frameworkName);
  if (!framework)
    return {
      totalControls: 0,
      byCategory: {},
      byType: {},
      byCriticality: {},
    };

  const stats = {
    totalControls: framework.controls.length,
    byCategory: {} as Record<string, number>,
    byType: {} as Record<string, number>,
    byCriticality: {} as Record<string, number>,
  };

  framework.controls.forEach((control) => {
    stats.byCategory[control.category] = (stats.byCategory[control.category] || 0) + 1;
    stats.byType[control.controlType] = (stats.byType[control.controlType] || 0) + 1;
    if (control.criticality) {
      stats.byCriticality[control.criticality] = (stats.byCriticality[control.criticality] || 0) + 1;
    }
  });

  return stats;
}
