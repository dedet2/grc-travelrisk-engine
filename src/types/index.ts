// GRC Framework Types
export interface Framework {
  id: string;
  name: string;
  version: string;
  description: string;
  sourceUrl?: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface Control {
  id: string;
  frameworkId: string;
  controlIdStr: string;
  title: string;
  description: string;
  category: string;
  controlType: 'technical' | 'operational' | 'management';
  createdAt: Date;
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
  response: 'implemented' | 'partially-implemented' | 'not-implemented';
  evidence?: string;
  score: number;
  notes?: string;
  createdAt: Date;
}

// Scoring Types
export interface RiskScore {
  overall: number;
  categories: Record<string, number>;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

// Travel Risk Types
export interface TravelAdvisory {
  id: string;
  countryCode: string;
  countryName: string;
  advisoryLevel: 1 | 2 | 3 | 4;
  description: string;
  source: string;
  fetchedAt: Date;
  expiresAt: Date;
}

export interface TravelRiskScore {
  score: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  advisoryLevel: number;
}

export interface TripRiskReport {
  id: string;
  userId: string;
  assessmentId?: string;
  destinationCountry: string;
  departureDate: Date;
  returnDate: Date;
  grcScore: number;
  travelScore: number;
  combinedScore: number;
  reportData: Record<string, unknown>;
  createdAt: Date;
}

// Agent Types
export interface AgentRun {
  id: string;
  agentName: string;
  workflow: string;
  taskTitle: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  latencyMs: number;
  tasksCompleted: number;
  totalTasks: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  errorMessage?: string;
  autonomyLevel: 'low' | 'medium' | 'high';
  humanReviewed: boolean;
  outputInRange: boolean;
  createdAt: Date;
}

// Audit Types
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}
