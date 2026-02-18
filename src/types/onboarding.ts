export type ComplianceFramework =
  | 'NIST'
  | 'ISO_27001'
  | 'SOC_2'
  | 'GDPR'
  | 'CCPA'
  | 'HIPAA';

export type CompanySize = 'startup' | 'small' | 'medium' | 'enterprise';

export type IntegrationPlatform = 'airtable' | 'slack' | 'make';

export interface OnboardingStep1 {
  companyName: string;
  industry: string;
  companySize: CompanySize;
  complianceNeeds: string;
}

export interface OnboardingStep2 {
  frameworks: ComplianceFramework[];
}

export interface OnboardingStep3 {
  integrations: Record<IntegrationPlatform, boolean>;
}

export interface OnboardingStep4 {
  teamMembers: Array<{
    email: string;
    role: 'admin' | 'analyst' | 'viewer';
  }>;
}

export interface OnboardingStep5 {
  summary: {
    organization: OnboardingStep1;
    frameworks: OnboardingStep2;
    integrations: OnboardingStep3;
    team: OnboardingStep4;
  };
}

export interface OnboardingSession {
  id: string;
  userId: string;
  currentStep: number;
  step1?: OnboardingStep1;
  step2?: OnboardingStep2;
  step3?: OnboardingStep3;
  step4?: OnboardingStep4;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
