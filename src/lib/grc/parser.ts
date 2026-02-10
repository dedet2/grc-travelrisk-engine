import type { ParsedFramework, ParsedControl } from './types';

/**
 * Parse GRC framework documents in various formats
 * Supports: CSV, JSON, PDF (requires Claude API for PDF)
 */
export async function parseFrameworkDocument(
  file: Buffer,
  format: 'pdf' | 'csv' | 'json'
): Promise<ParsedFramework> {
  switch (format) {
    case 'csv':
      return parseCSV(file);
    case 'json':
      return parseJSON(file);
    case 'pdf':
      return parsePDF(file);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

/**
 * Parse CSV format framework
 * Expected columns: control_id, category, title, description, control_type
 */
function parseCSV(file: Buffer): ParsedFramework {
  const content = file.toString('utf-8');
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
 * Parse JSON format framework
 */
function parseJSON(file: Buffer): ParsedFramework {
  const content = file.toString('utf-8');

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
 * Parse PDF format framework
 * This requires Claude API for document understanding
 * TODO: Implement with Claude API for PDF parsing
 */
async function parsePDF(file: Buffer): Promise<ParsedFramework> {
  // Placeholder for PDF parsing with Claude API
  console.log('PDF parsing requires Claude API implementation');
  throw new Error(
    'PDF parsing not yet implemented. Please provide CSV or JSON format.'
  );
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
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
