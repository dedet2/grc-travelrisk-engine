export type ControlResponse = 'implemented' | 'partially-implemented' | 'not-implemented';

export interface ControlScore {
  controlId: string;
  controlIdStr: string;
  title: string;
  response: ControlResponse;
  score: number;
  category: string;
  weight?: number;
}

export interface CategoryScore {
  category: string;
  score: number;
  weight: number;
  controlCount: number;
  implementedCount: number;
}

export interface ScoringInput {
  assessmentId: string;
  frameworkId: string;
  controls: ControlScore[];
}

export interface ScoringOutput {
  assessmentId: string;
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  categoryScores: CategoryScore[];
  timestamp: Date;
}

export interface ScoringWeights {
  categories: Record<string, number>;
  controlTypeWeights: {
    technical: number;
    operational: number;
    management: number;
  };
}
