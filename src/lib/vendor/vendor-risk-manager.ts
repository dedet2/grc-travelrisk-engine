export type VendorCategory = 'SaaS' | 'Infrastructure' | 'Consulting' | 'Data Processing' | 'Cloud Services';
export type RiskTier = 'Critical' | 'High' | 'Medium' | 'Low';
export type VendorStatus = 'Active' | 'Inactive' | 'At Risk' | 'Suspended';

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  riskTier: RiskTier;
  complianceCertifications: string[];
  lastAssessmentDate: string;
  nextAssessmentDue: string;
  overallScore: number;
  dataAccess: string[];
  contractExpiry: string;
  primaryContact: string;
  status: VendorStatus;
}

export interface VendorAssessment {
  vendorId: string;
  assessmentDate: string;
  scores: {
    security: number;
    privacy: number;
    compliance: number;
    businessContinuity: number;
    financialStability: number;
  };
  findings: string[];
  overallRisk: RiskTier;
  recommendation: string;
}

export interface PortfolioConcentration {
  category: VendorCategory;
  count: number;
  percentage: number;
  concentrationRisk: 'Low' | 'Medium' | 'High';
}

export class VendorRiskManager {
  private vendors: Map<string, Vendor> = new Map();
  private assessments: Map<string, VendorAssessment[]> = new Map();

  constructor(initialVendors: Vendor[] = []) {
    initialVendors.forEach(vendor => {
      this.vendors.set(vendor.id, vendor);
    });
  }

  /**
   * Assess a vendor and update its risk profile
   */
  assessVendor(vendorId: string, assessment: VendorAssessment): void {
    const vendor = this.vendors.get(vendorId);
    if (!vendor) {
      throw new Error(`Vendor ${vendorId} not found`);
    }

    // Store assessment
    if (!this.assessments.has(vendorId)) {
      this.assessments.set(vendorId, []);
    }
    this.assessments.get(vendorId)!.push(assessment);

    // Update vendor with new scores
    const avgScore = (
      assessment.scores.security +
      assessment.scores.privacy +
      assessment.scores.compliance +
      assessment.scores.businessContinuity +
      assessment.scores.financialStability
    ) / 5;

    vendor.overallScore = avgScore;
    vendor.riskTier = assessment.overallRisk;
    vendor.lastAssessmentDate = assessment.assessmentDate;
    vendor.nextAssessmentDue = this.calculateNextAssessmentDate(assessment.assessmentDate, assessment.overallRisk);
  }

  /**
   * Get vendors filtered by risk tier
   */
  getVendorsByRiskTier(tier: RiskTier): Vendor[] {
    return Array.from(this.vendors.values()).filter(v => v.riskTier === tier);
  }

  /**
   * Get vendors with upcoming assessments (due within 30 days)
   */
  getUpcomingAssessments(): Vendor[] {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    return Array.from(this.vendors.values()).filter(vendor => {
      const dueDate = new Date(vendor.nextAssessmentDue);
      return dueDate <= thirtyDaysFromNow && dueDate >= today;
    });
  }

  /**
   * Calculate vendor concentration risk across categories
   */
  calculatePortfolioConcentration(): PortfolioConcentration[] {
    const categoryCounts: Record<VendorCategory, number> = {
      'SaaS': 0,
      'Infrastructure': 0,
      'Consulting': 0,
      'Data Processing': 0,
      'Cloud Services': 0,
    };

    const activeVendors = Array.from(this.vendors.values()).filter(v => v.status === 'Active');
    const totalActive = activeVendors.length;

    activeVendors.forEach(vendor => {
      categoryCounts[vendor.category]++;
    });

    return Object.entries(categoryCounts).map(([category, count]) => {
      const percentage = (count / totalActive) * 100;
      let concentrationRisk: 'Low' | 'Medium' | 'High';

      if (percentage > 40) {
        concentrationRisk = 'High';
      } else if (percentage > 25) {
        concentrationRisk = 'Medium';
      } else {
        concentrationRisk = 'Low';
      }

      return {
        category: category as VendorCategory,
        count,
        percentage: Math.round(percentage * 10) / 10,
        concentrationRisk,
      };
    });
  }

  /**
   * Add or update a vendor
   */
  addVendor(vendor: Vendor): void {
    this.vendors.set(vendor.id, vendor);
  }

  /**
   * Get a vendor by ID
   */
  getVendor(vendorId: string): Vendor | undefined {
    return this.vendors.get(vendorId);
  }

  /**
   * Get all vendors
   */
  getAllVendors(): Vendor[] {
    return Array.from(this.vendors.values());
  }

  /**
   * Get assessment history for a vendor
   */
  getAssessmentHistory(vendorId: string): VendorAssessment[] {
    return this.assessments.get(vendorId) || [];
  }

  /**
   * Calculate next assessment date based on risk tier
   */
  private calculateNextAssessmentDate(lastAssessment: string, riskTier: RiskTier): string {
    const lastDate = new Date(lastAssessment);
    const monthsToAdd = riskTier === 'Critical' ? 3 : riskTier === 'High' ? 6 : riskTier === 'Medium' ? 12 : 24;
    
    lastDate.setMonth(lastDate.getMonth() + monthsToAdd);
    return lastDate.toISOString().split('T')[0];
  }
}
