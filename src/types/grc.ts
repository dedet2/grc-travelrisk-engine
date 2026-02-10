// Enums for GRC Framework Types
export type ComplianceStatus = 'implemented' | 'partially-implemented' | 'not-implemented' | 'not-applicable' | 'planned';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type ControlCriticality = 'low' | 'medium' | 'high' | 'critical';

// Framework Types
export interface FrameworkCategory {
  id: string;
  name: string;
  description: string;
  controlCount: number;
}

export interface FrameworkMetadata {
  ISO27001Version?: string;
  releasedDate?: string;
  lastUpdated?: string;
  complianceRegions?: string[];
  [key: string]: unknown;
}

export interface ExtendedFramework {
  id: string;
  name: string;
  version: string;
  description: string;
  sourceUrl?: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  controlCount: number;
  categories: FrameworkCategory[];
  metadata?: FrameworkMetadata;
}

// Control Types
export interface ParsedControl {
  id: string;
  category: string;
  title: string;
  description: string;
  controlType: 'technical' | 'operational' | 'management';
  criticality?: ControlCriticality;
  relatedControls?: string[];
  objectives?: string[];
}

export interface DetailedControl extends ParsedControl {
  frameworkId: string;
  controlIdStr: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Assessment Types
export interface Assessment {
  id: string;
  userId: string;
  frameworkId: string;
  name: string;
  status: 'in-progress' | 'completed' | 'archived';
  overallScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssessmentResponse {
  id: string;
  assessmentId: string;
  controlId: string;
  response: ComplianceStatus;
  evidence?: string;
  score: number;
  notes?: string;
  createdAt: Date;
}

// Risk Assessment Types
export interface RiskScore {
  overall: number;
  categories: Record<string, number>;
  riskLevel: RiskLevel;
  timestamp: Date;
  confidence: number;
}

export interface ControlRiskAssessment {
  controlId: string;
  controlIdStr: string;
  riskLevel: RiskLevel;
  score: number;
  recommendation: string;
  impactIfNotImplemented: string;
}

// API Response Types (extend from index.ts)
export interface FrameworkResponse {
  id: string;
  name: string;
  version: string;
  description: string;
  controlCount: number;
  status: 'draft' | 'published' | 'archived';
  categories: FrameworkCategory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ControlsResponse {
  controls: DetailedControl[];
  total: number;
  category?: string;
  frameworkId: string;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  controlCount: number;
  implementationStatus?: Record<ComplianceStatus, number>;
}

export interface FrameworkDetailResponse {
  framework: FrameworkResponse;
  categoryBreakdown: CategoryBreakdown[];
  totalControls: number;
  lastUpdated: Date;
}
