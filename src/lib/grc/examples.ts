/**
 * GRC Framework Ingestion API Examples
 * This file contains example usage patterns and API requests
 */

/**
 * Example 1: CSV Format Framework Upload
 * Upload a CSV file with control definitions
 */
export const csvUploadExample = {
  format: 'csv',
  content: `control_id,category,title,description,control_type
A.5.1.1,A.5,Policies for information security,Establish and maintain information security policies,management
A.5.1.2,A.5,Information security roles and responsibilities,Define and communicate IS responsibilities,management
A.6.1.1,A.6,Screening of personnel,Conduct background checks for employees,operational
A.7.1.1,A.7,Physical security perimeter,Implement physical access controls,technical
A.8.1.1,A.8,User registration and access management,Manage user access rights,technical`,
  frameworkName: 'Custom Framework',
  version: '1.0',
  description: 'Example custom security framework',
  publish: false,
};

/**
 * Example 2: JSON Format Framework Upload
 * Upload framework definition as JSON
 */
export const jsonUploadExample = {
  format: 'json',
  content: JSON.stringify({
    name: 'NIST Cybersecurity Framework',
    version: '1.1',
    description: 'NIST CSF for critical infrastructure protection',
    controls: [
      {
        id: 'ID.AM-1',
        category: 'Asset Management',
        title: 'Organizational and Information Assets',
        description:
          'Develop and maintain an inventory of organizational and information assets.',
        controlType: 'management',
        criticality: 'high',
      },
      {
        id: 'PR.AC-1',
        category: 'Access Control',
        title: 'Physical Access Management',
        description: 'Limit physical access to organizational assets.',
        controlType: 'technical',
        criticality: 'critical',
      },
    ],
  }),
  publish: false,
};

/**
 * Example 3: Text Format Framework Upload (using Claude API)
 * Upload unstructured text that Claude will parse
 */
export const textUploadExample = {
  format: 'text',
  content: `
  Security Control Framework

  A.5.1.1 Information Security Policies
  The organization shall develop, document, and disseminate information security policies.
  These policies shall define the scope, objectives, and implementation approach for IS.
  Type: Management Control

  A.5.1.2 Information Security Roles
  All personnel shall have clearly defined IS roles and responsibilities.
  These shall be communicated and acknowledged in writing.
  Type: Management Control

  A.6.1.1 Personnel Screening
  Background checks shall be performed on all personnel before employment.
  Results shall be retained securely.
  Type: Operational Control
  `,
  publish: false,
};

/**
 * Example 4: Seed ISO 27001:2022 Framework
 * POST request to populate the built-in ISO 27001:2022 framework
 */
export const seedIso27001Request = {
  method: 'POST',
  endpoint: '/api/frameworks/seed',
  headers: {
    'Content-Type': 'application/json',
    // Only required in production: Authorization: 'Bearer YOUR_SEED_API_KEY'
  },
  response: {
    success: true,
    data: {
      framework: {
        id: 'uuid-here',
        name: 'ISO 27001:2022',
        version: '2022',
        controlCount: 30,
        status: 'published',
        createdAt: '2024-01-01T00:00:00Z',
      },
      insertedControlCount: 30,
      categoryBreakdown: [
        { category: 'A.5', count: 8 },
        { category: 'A.6', count: 8 },
        { category: 'A.7', count: 14 },
      ],
    },
  },
};

/**
 * Example 5: List All Frameworks
 * GET /api/frameworks
 */
export const listFrameworksExample = {
  method: 'GET',
  endpoint: '/api/frameworks?status=published',
  response: {
    success: true,
    data: [
      {
        id: 'uuid-1',
        name: 'ISO 27001:2022',
        version: '2022',
        description: 'Information security management system requirements',
        controlCount: 30,
        status: 'published',
        categories: [
          {
            id: 'A.5',
            name: 'A.5',
            description: '',
            controlCount: 8,
          },
        ],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ],
  },
};

/**
 * Example 6: Get Framework Details with Category Breakdown
 * GET /api/frameworks/[id]
 */
export const getFrameworkDetailsExample = {
  method: 'GET',
  endpoint: '/api/frameworks/uuid-1',
  response: {
    success: true,
    data: {
      framework: {
        id: 'uuid-1',
        name: 'ISO 27001:2022',
        version: '2022',
        description: 'Information security management system requirements',
        controlCount: 30,
        status: 'published',
        categories: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      categoryBreakdown: [
        {
          categoryId: 'A.5',
          categoryName: 'A.5',
          controlCount: 8,
          implementationStatus: {},
        },
        {
          categoryId: 'A.6',
          categoryName: 'A.6',
          controlCount: 8,
          implementationStatus: {},
        },
      ],
      totalControls: 30,
      lastUpdated: '2024-01-01T00:00:00Z',
    },
  },
};

/**
 * Example 7: Get Controls with Category Filter
 * GET /api/frameworks/[id]/controls?category=A.5
 */
export const getControlsExample = {
  method: 'GET',
  endpoint: '/api/frameworks/uuid-1/controls?category=A.5&limit=20',
  response: {
    success: true,
    data: {
      controls: [
        {
          id: 'control-uuid-1',
          frameworkId: 'uuid-1',
          controlIdStr: 'A.5.1.1',
          category: 'A.5',
          title: 'Policies for information security',
          description: 'Establish and maintain information security policies',
          controlType: 'management',
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'control-uuid-2',
          frameworkId: 'uuid-1',
          controlIdStr: 'A.5.1.2',
          category: 'A.5',
          title: 'Information security roles and responsibilities',
          description: 'Define and communicate IS responsibilities',
          controlType: 'management',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ],
      total: 8,
      category: 'A.5',
      frameworkId: 'uuid-1',
    },
  },
};

/**
 * Example 8: Add Controls to Framework
 * POST /api/frameworks/[id]/controls
 */
export const addControlsExample = {
  method: 'POST',
  endpoint: '/api/frameworks/uuid-1/controls',
  body: {
    controls: [
      {
        id: 'A.19.1.1',
        title: 'New Control Title',
        description: 'Control description',
        category: 'A.19',
        controlType: 'technical',
      },
    ],
  },
  response: {
    success: true,
    data: {
      frameworkId: 'uuid-1',
      insertedCount: 1,
      controls: [
        {
          id: 'control-uuid-3',
          framework_id: 'uuid-1',
          control_id_str: 'A.19.1.1',
          title: 'New Control Title',
          description: 'Control description',
          category: 'A.19',
          control_type: 'technical',
          created_at: '2024-01-02T00:00:00Z',
        },
      ],
    },
  },
};

/**
 * Example 9: Ingest Framework Document (CSV)
 * POST /api/frameworks/ingest
 */
export const ingestFrameworkExample = {
  method: 'POST',
  endpoint: '/api/frameworks/ingest',
  body: {
    format: 'csv',
    content: csvUploadExample.content,
    publish: true,
  },
  response: {
    success: true,
    data: {
      framework: {
        id: 'uuid-new',
        name: 'Custom Framework',
        version: '1.0',
        description: 'Example custom security framework',
        controlCount: 5,
        status: 'published',
        categories: [
          {
            id: 'A.5',
            name: 'A.5',
            description: '',
            controlCount: 2,
          },
        ],
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
      parseMetadata: {
        importDate: '2024-01-02T00:00:00Z',
        rowCount: 5,
      },
    },
  },
};

/**
 * Example 10: JavaScript/TypeScript Usage
 * Using the GRC framework utilities
 */
export const typescriptUsageExample = `
import { getFramework, getControlsByCategory, searchControls } from '@/lib/grc/frameworks';

// Get framework by name
const framework = getFramework('ISO 27001:2022');
console.log(\`Framework: \${framework?.name}, Version: \${framework?.version}\`);
console.log(\`Total Controls: \${framework?.controls.length}\`);

// Get controls by category
const a5Controls = getControlsByCategory('A.5');
console.log(\`Controls in A.5: \${a5Controls.length}\`);

// Search for controls
const results = searchControls('access management');
console.log(\`Found \${results.length} controls matching "access management"\`);

// Filter by criticality
const criticalControls = framework?.controls.filter(c => c.criticality === 'critical') || [];
console.log(\`Critical controls: \${criticalControls.length}\`);
`;

/**
 * Example 11: Error Responses
 */
export const errorResponsesExample = {
  unauthorized: {
    success: false,
    error: 'Unauthorized',
    timestamp: '2024-01-02T00:00:00Z',
    statusCode: 401,
  },
  invalidFormat: {
    success: false,
    error: 'Invalid format. Must be one of: csv, json, text',
    timestamp: '2024-01-02T00:00:00Z',
    statusCode: 400,
  },
  validationError: {
    success: false,
    error: 'Validation errors: Control A.5.1.1: Missing title; Control A.5.1.2: Invalid controlType',
    timestamp: '2024-01-02T00:00:00Z',
    statusCode: 400,
  },
  notFound: {
    success: false,
    error: 'Framework not found',
    timestamp: '2024-01-02T00:00:00Z',
    statusCode: 404,
  },
  serverError: {
    success: false,
    error: 'Failed to create framework',
    timestamp: '2024-01-02T00:00:00Z',
    statusCode: 500,
  },
};

/**
 * API Endpoint Summary
 */
export const apiEndpointSummary = {
  frameworkManagement: [
    {
      method: 'GET',
      endpoint: '/api/frameworks',
      description: 'List all frameworks',
      queryParams: ['status=published|draft|archived'],
      requiresAuth: false,
    },
    {
      method: 'POST',
      endpoint: '/api/frameworks',
      description: 'Create a new framework',
      body: ['name', 'version', 'description', 'controls[]', 'status'],
      requiresAuth: true,
    },
    {
      method: 'GET',
      endpoint: '/api/frameworks/[id]',
      description: 'Get framework details with category breakdown',
      requiresAuth: false,
    },
    {
      method: 'DELETE',
      endpoint: '/api/frameworks/[id]',
      description: 'Delete a framework',
      requiresAuth: true,
    },
  ],
  controlManagement: [
    {
      method: 'GET',
      endpoint: '/api/frameworks/[id]/controls',
      description: 'Get controls for a framework',
      queryParams: ['category', 'controlType', 'limit', 'offset'],
      requiresAuth: false,
    },
    {
      method: 'POST',
      endpoint: '/api/frameworks/[id]/controls',
      description: 'Add controls to framework',
      body: ['controls[]'],
      requiresAuth: true,
    },
  ],
  ingestion: [
    {
      method: 'POST',
      endpoint: '/api/frameworks/ingest',
      description: 'Parse and ingest framework document',
      body: ['format', 'content', 'frameworkName', 'version', 'description', 'publish'],
      requiresAuth: true,
    },
  ],
  seeding: [
    {
      method: 'POST',
      endpoint: '/api/frameworks/seed',
      description: 'Seed ISO 27001:2022 framework',
      requiresAuth: false,
      notes: 'Requires SEED_API_KEY in production',
    },
    {
      method: 'GET',
      endpoint: '/api/frameworks/seed',
      description: 'Check seed status',
      requiresAuth: false,
    },
  ],
};
