/**
 * PDF Parser Utility
 * Extracts text content and parses framework structure from PDF text
 * Supports common patterns from ISO 27001, NIST, SOC 2 documents
 */

export interface ParsedFrameworkData {
  frameworkName: string;
  version: string;
  controls: ParsedFrameworkControl[];
}

export interface ParsedFrameworkControl {
  id: string;
  title: string;
  description: string;
  category: string;
}

/**
 * Parse framework structure from pre-extracted PDF text content
 * Detects common patterns from ISO 27001, NIST, and SOC 2 frameworks
 */
export function parseFrameworkText(textContent: string): ParsedFrameworkData {
  const lines = textContent.split('\n').map((line) => line.trim());

  // Extract framework name and version
  const frameworkName = extractFrameworkName(lines);
  const version = extractVersion(lines);

  // Extract controls
  const controls = extractControls(lines);

  if (controls.length === 0) {
    throw new Error('No controls found in document. Ensure the document contains control definitions.');
  }

  return {
    frameworkName,
    version,
    controls,
  };
}

/**
 * Extract framework name from document
 */
function extractFrameworkName(lines: string[]): string {
  // Look for common framework identifiers
  const frameworks: Record<string, string> = {
    'ISO 27001': 'ISO 27001:2022',
    'NIST CSF': 'NIST Cybersecurity Framework',
    'SOC 2': 'SOC 2 Type II',
    'CIS': 'CIS Controls',
    'PCI DSS': 'PCI Data Security Standard',
  };

  for (const [keyword, name] of Object.entries(frameworks)) {
    const found = lines.find((line) => line.includes(keyword));
    if (found) return name;
  }

  // Default: use first non-empty line or generic name
  const titleLine = lines.find((line) => line.length > 5 && !line.includes('Version'));
  return titleLine || 'Imported Framework';
}

/**
 * Extract version from document
 */
function extractVersion(lines: string[]): string {
  // Look for version patterns: "v1.0", "Version 1.0", etc.
  const versionPattern = /(?:v|version|ver|release)[\s:]*([0-9.]+)/i;

  for (const line of lines) {
    const match = line.match(versionPattern);
    if (match) return match[1];
  }

  // Default version
  return '1.0';
}

/**
 * Extract controls from document text
 * Detects patterns like:
 * - A.1.1 Access control policy
 * - 1.1 Physical Security
 * - AC-1: Access Control Policy
 */
function extractControls(lines: string[]): ParsedFrameworkControl[] {
  const controls: ParsedFrameworkControl[] = [];
  const controlPattern =
    /^([A-Z]?\d+[\.\-]\d+(?:[\.\-]\d+)?)\s*[-:]?\s*(.+?)(?:\n|$)/i;

  let currentCategory = 'Uncategorized';
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Detect category headers (usually all caps or bold-looking)
    if (line.length > 5 && line.length < 100) {
      const isCategoryHeader =
        line === line.toUpperCase() &&
        !line.includes('VERSION') &&
        !line.includes('DOCUMENT');

      if (isCategoryHeader) {
        currentCategory = normalizeCategory(line);
        i++;
        continue;
      }
    }

    // Look for control ID patterns
    const match = line.match(controlPattern);
    if (match) {
      const controlId = match[1];
      const titleAndDesc = match[2];

      // Split title and description if they exist on following lines
      let title = titleAndDesc;
      let description = '';

      // Collect description from next non-empty lines
      let j = i + 1;
      while (j < lines.length && j < i + 4) {
        const nextLine = lines[j];
        if (!nextLine || nextLine.match(controlPattern)) break;
        if (!nextLine.includes('Page ') && nextLine.length < 200) {
          description += (description ? ' ' : '') + nextLine;
        }
        j++;
      }

      if (title) {
        controls.push({
          id: controlId,
          title: title.substring(0, 100),
          description: description.substring(0, 500),
          category: currentCategory,
        });
      }
    }

    i++;
  }

  return controls;
}

/**
 * Normalize category name
 */
function normalizeCategory(category: string): string {
  return category
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Validate that parsed data has required fields
 */
export function validateParsedFramework(data: ParsedFrameworkData): boolean {
  return (
    data.frameworkName &&
    data.frameworkName.length > 0 &&
    data.version &&
    data.controls &&
    Array.isArray(data.controls) &&
    data.controls.length > 0 &&
    data.controls.every((c) => c.id && c.title && c.category)
  );
}
