export interface ParsedFramework {
  name: string;
  version: string;
  description: string;
  source: string;
  controls: ParsedControl[];
  metadata: Record<string, unknown>;
}

export interface ParsedControl {
  id: string;
  category: string;
  title: string;
  description: string;
  controlType: 'technical' | 'operational' | 'management';
}

export interface ControlMapping {
  sourceControlId: string;
  sourceControlTitle: string;
  targetControlIds: string[];
  targetControlTitles: string[];
  confidenceScore: number;
  reasoning: string;
}

export interface FrameworkMapping {
  sourceFramework: string;
  targetFramework: string;
  mappings: ControlMapping[];
  completeness: number;
  timestamp: Date;
}
