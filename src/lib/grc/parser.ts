import type { ParsedFramework, ParsedControl } from './types';
import { analyzeDocument } from '../ai/claude';

/**
 * Parse GRC framework documents in various formats
 * Supports: CSV, JSON, PDF (requires Claude API for PDF), and raw text
 */
export async function parseFrameworkDocument(
  file: Buffer | string,
  format: 'pdf' | 'csv' | 'json' | 'text'
): Promise<ParsedFramework> {
  switch (format) {
    case 'csv':
      return typeof file === 'string' ? parseCsvString(file) : parseCSV(file);
    case 'json':
      return typeof file === 'string' ? parseJsonString(file) : parseJSON(file);
    case 'text':
      return parseTextWithClaude(typeof file === 'string' ? file : file.toString('utf-8'));
    case 'pdf':
      return parsePDF(file instanceof Buffer ? file : Buffer.from(file));
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

/**
 * Parse CSV string directly (for API uploads)
 */
export function parseCsvString(content: string): ParsedFramework {
  const lines = content.split('\n');

  if (lines.length < 2) {
    throw new Error('CSV file is empty or malformed');
  }

  // Parse header
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const idIndex = headers.indexOf('control_id');
  const categoryIndex = headers.indexOf('category');
  const titleIndex = headers.indexOf('title');
  const descIndex = headers.indexOf('description');
  const typeIndex = headers.indexOf('control_type');
  const criticityIndex = headers.indexOf('criticality');

  if (idIndex === -1 || categoryIndex === -1 || titleIndex === -1) {
    throw new Error('CSV missing required columns: control_id, category, title');
  }

  const controls: ParsedControl[] = [];

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const columns = line.split(',').map((c) => c.trim());
    const controlType = (columns[typeIndex] || 'operational') as
      | 'technical'
      | 'operational'
      | 'management';

    controls.push({
      id: columns[idIndex],
      category: columns[categoryIndex],
      title: columns[titleIndex],
      description: descIndex !== -1 ? columns[descIndex] : '',
      controlType,
      criticality: criticityIndex !== -1 ? (columns[criticityIndex] as any) : undefined,
    });
  }

  return {
    name: 'Imported Framework',
    version: '1.0',
    description: 'Framework imported from CSV',
    source: 'csv_upload',
    controls,
    metadata: {
      importDate: new Date().toISOString(),
      rowCount: controls.length,
    },
  };
}

/**
 * Parse JSON string directly (for API uploads)
 */
export function parseJsonString(content: string): ParsedFramework {
  try {
    const data = JSON.parse(content);

    // Validate required fields
    if (!data.name || !Array.isArray(data.controls)) {
      throw new Error('JSON missing required fields: name, controls');
    }

    // Transform controls to standard format
    const controls: ParsedControl[] = data.controls.map(
      (control: Record<string, unknown>) => ({
        id: String(control.id || control.control_id || ''),
        category: String(control.category || 'Uncategorized'),
        title: String(control.title || ''),
        description: String(control.description || ''),
        controlType: (control.control_type || 'operational') as
          | 'technical'
          | 'operational'
          | 'management',
        criticality: control.criticality as any,
        relatedControls: Array.isArray(control.relatedControls)
          ? (control.relatedControls as string[])
          : undefined,
        objectives: Array.isArray(control.objectives) ? (control.objectives as string[]) : undefined,
      })
    );

    return {
      name: data.name,
      version: data.version || '1.0',
      description: data.description || '',
      source: 'json_upload',
      controls,
      metadata: data.metadata || {},
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format');
    }
    throw error;
  }
}

/**
 * Parse CSV format framework
 * Expected columns: control_id, category, title, description, control_type
 */
function parseCSV(file: Buffer): ParsedFramework {
  const content = file.toString('utf-8');
  return parseCsvString(content);
}

/**
 * Parse JSON format framework
 */
function parseJSON(file: Buffer): ParsedFramework {
  const content = file.toString('utf-8');
  return parseJsonString(content);
}

/**
 * Parse text format framework using Claude API
 * The API extracts controls from unstructured text
 */
async function parseTextWithClaude(content: string): Promise<ParsedFramework> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      'ANTHROPIC_API_KEY not set. Cannot parse text format without Claude API. Use CSV or JSON format instead.'
    );
  }

  const prompt = `You are a GRC (Governance, Risk, and Compliance) expert. Extract information security controls from the provided text.

For each control, identify:
1. Control ID (e.g., A.5.1.1)
2. Category (e.g., A.5, A.6, etc.)
3. Title
4. Description
5. Control Type (technical, operational, or management)
6. Criticality (low, medium, high, or critical)

Return a JSON object with this exact structure:
{
  "name": "Framework Name",
  "version": "Version",
  "description": "Framework Description",
  "controls": [
    {
      "id": "Control ID",
      "category": "Category",
      "title": "Title",
      "description": "Description",
      "controlType": "technical|operational|management",
      "criticality": "low|medium|high|critical"
    }
  ]
}

Extract only valid controls. Ensure all required fields are present.`;

  try {
    const response = await analyzeDocument(content, prompt, 4096);

    // Parse JSON response
    try {
      const data = JSON.parse(response);

      // Validate structure
      if (!data.name || !Array.isArray(data.controls)) {
        throw new Error('Invalid response structure from Claude');
      }

      // Transform to ParsedFramework
      const controls: ParsedControl[] = data.controls.map(
        (control: Record<string, unknown>) => ({
          id: String(control.id || ''),
          category: String(control.category || ''),
          title: String(control.title || ''),
          description: String(control.description || ''),
          controlType: (control.controlType || 'operational') as
            | 'technical'
            | 'operational'
            | 'management',
          criticality: control.criticality as any,
        })
      );

      return {
        name: String(data.name),
        version: String(data.version || '1.0'),
        description: String(data.description || ''),
        source: 'text_upload_claude',
        controls,
        metadata: {
          parsedDate: new Date().toISOString(),
          aiParsed: true,
        },
      };
    } catch (parseError) {
      console.error('Failed to parse Claude response as JSON:', parseError);
      throw new Error('Claude response was not valid JSON');
    }
  } catch (error) {
    console.error('Error parsing text with Claude:', error);
    throw new Error(
      'Failed to parse text format with Claude API. Ensure ANTHROPIC_API_KEY is set and valid.'
    );
  }
}

/**
 * Parse PDF format framework
 * This requires Claude API for document understanding
 */
async function parsePDF(file: Buffer): Promise<ParsedFramework> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      'ANTHROPIC_API_KEY not set. Cannot parse PDF without Claude API. Use CSV or JSON format instead.'
    );
  }

  // Convert PDF buffer to text (simplified - in production, use a PDF library)
  // For now, we'll treat the buffer as text
  const content = file.toString('utf-8');

  try {
    return await parseTextWithClaude(content);
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('PDF parsing requires ANTHROPIC_API_KEY and valid PDF content');
  }
}

/**
 * Validate parsed framework
 */
export function validateFramework(framework: ParsedFramework): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!framework.name) {
    errors.push('Framework name is required');
  }

  if (!framework.controls || framework.controls.length === 0) {
    errors.push('Framework must contain at least one control');
  }

  for (const control of framework.controls) {
    if (!control.id) {
      errors.push('All controls must have an ID');
    }
    if (!control.title) {
      errors.push(`Control ${control.id} is missing a title`);
    }
    if (!control.category) {
      errors.push(`Control ${control.id} is missing a category`);
    }
    if (!['technical', 'operational', 'management'].includes(control.controlType)) {
      errors.push(
        `Control ${control.id} has invalid control type: ${control.controlType}. Must be one of: technical, operational, management`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Normalize control IDs to ensure consistency
 * e.g., "A.5.1.1" remains "A.5.1.1", handles variations
 */
export function normalizeControlId(id: string): string {
  // Remove whitespace
  id = id.trim();
  // Convert to uppercase for consistency
  id = id.toUpperCase();
  // Remove common prefixes if present
  if (id.startsWith('CONTROL ')) id = id.substring(8);
  // Ensure proper dot notation
  return id;
}

/**
 * Extract category from control ID
 * e.g., "A.5.1.1" -> "A.5"
 */
export function extractCategoryFromControlId(controlId: string): string {
  const parts = controlId.split('.');
  if (parts.length >= 2) {
    return `${parts[0]}.${parts[1]}`;
  }
  return controlId;
}
