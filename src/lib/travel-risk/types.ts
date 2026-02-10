export interface AdvisoryData {
  countryCode: string;
  countryName: string;
  advisoryLevel: 1 | 2 | 3 | 4; // 1=Exercise Normal Precautions, 2=Exercise Increased Caution, 3=Reconsider Travel, 4=Do Not Travel
  healthRiskLevel?: number;
  securityRiskLevel?: number;
  lastUpdated: Date;
}

export interface TravelRiskFactors {
  advisoryLevel: string;
  healthFactors: string[];
  securityFactors: string[];
  otherFactors: string[];
}

export interface TravelRiskOutput {
  destination: string;
  score: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: TravelRiskFactors;
  travelRecommendation: string;
  lastUpdated: Date;
}

export interface TravelAdvisoryResponse {
  countryCode: string;
  countryName: string;
  advisoryLevel: number;
  description: string;
  date: Date;
}
