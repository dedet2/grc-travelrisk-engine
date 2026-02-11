/**
 * In-Memory Store for Development and Testing
 * Provides a simple, thread-safe in-memory storage for:
 * - Scoring results
 * - GRC frameworks and controls
 * - Assessments
 * - Agent runs
 * Useful for development, testing, and single-instance deployments
 */

import type { ScoringOutput } from '@/lib/scoring/types';
import type { ControlScore } from '@/lib/scoring/types';
import type { AgentRunResult } from '../agents/base-agent';
import type { CombinedRiskReport } from '../agents/unified-risk-combiner-agent';

export interface StoredScoringResult {
  assessmentId: string;
  result: ScoringOutput;
  storedAt: Date;
  controls?: ControlScore[];
}

export interface StoredFramework {
  id: string;
  name: string;
  version: string;
  description: string;
  sourceUrl?: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  controlCount: number;
  categories: any[];
}

export interface StoredControl {
  id: string;
  frameworkId: string;
  controlIdStr: string;
  title: string;
  description: string;
  category: string;
  controlType: 'technical' | 'operational' | 'management';
  criticality?: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
}

export interface StoredAssessment {
  id: string;
  userId: string;
  frameworkId: string;
  name: string;
  status: 'in-progress' | 'completed' | 'archived';
  overallScore: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Simple in-memory store for scoring results, frameworks, and assessments
 */
class InMemoryStore {
  private results: Map<string, StoredScoringResult> = new Map();
  private lastResult?: StoredScoringResult;
  private frameworks: Map<string, StoredFramework> = new Map();
  private controls: Map<string, StoredControl[]> = new Map();
  private assessments: Map<string, StoredAssessment> = new Map();
  private agentRuns: AgentRunResult[] = [];
  private combinedRiskReports: Map<string, CombinedRiskReport> = new Map();
  private lastCombinedRiskReport?: CombinedRiskReport;

  // ===== Scoring Results Methods =====

  /**
   * Store a scoring result
   */
  storeScoringResult(result: ScoringOutput, controls?: ControlScore[]): void {
    const stored: StoredScoringResult = {
      assessmentId: result.assessmentId,
      result,
      storedAt: new Date(),
      controls,
    };

    this.results.set(result.assessmentId, stored);
    this.lastResult = stored;
  }

  /**
   * Retrieve a scoring result by assessment ID
   */
  getScoringResult(assessmentId: string): StoredScoringResult | undefined {
    return this.results.get(assessmentId);
  }

  /**
   * Get the last stored scoring result
   */
  getLastScoringResult(): StoredScoringResult | undefined {
    return this.lastResult;
  }

  /**
   * Get all stored results
   */
  getAllResults(): StoredScoringResult[] {
    return Array.from(this.results.values());
  }

  /**
   * Clear a specific result
   */
  clearResult(assessmentId: string): boolean {
    return this.results.delete(assessmentId);
  }

  /**
   * Get result count
   */
  getResultCount(): number {
    return this.results.size;
  }

  // ===== Framework Methods =====

  /**
   * Add a framework
   */
  addFramework(framework: StoredFramework): StoredFramework {
    this.frameworks.set(framework.id, framework);
    this.controls.set(framework.id, []);
    return framework;
  }

  /**
   * Get a framework by ID
   */
  getFramework(id: string): StoredFramework | undefined {
    return this.frameworks.get(id);
  }

  /**
   * Get a framework by name
   */
  getFrameworkByName(name: string): StoredFramework | undefined {
    for (const framework of this.frameworks.values()) {
      if (framework.name === name) {
        return framework;
      }
    }
    return undefined;
  }

  /**
   * Get all frameworks
   */
  getFrameworks(): StoredFramework[] {
    return Array.from(this.frameworks.values());
  }

  /**
   * Update a framework
   */
  updateFramework(id: string, updates: Partial<StoredFramework>): StoredFramework | undefined {
    const framework = this.frameworks.get(id);
    if (!framework) return undefined;

    const updated = {
      ...framework,
      ...updates,
      id: framework.id,
      createdAt: framework.createdAt,
      updatedAt: new Date(),
    };
    this.frameworks.set(id, updated);
    return updated;
  }

  /**
   * Delete a framework
   */
  deleteFramework(id: string): boolean {
    const deleted = this.frameworks.delete(id);
    if (deleted) {
      this.controls.delete(id);
    }
    return deleted;
  }

  // ===== Control Methods =====

  /**
   * Add controls to a framework
   */
  addControls(frameworkId: string, controls: StoredControl[]): StoredControl[] {
    const existing = this.controls.get(frameworkId) || [];
    const updated = [...existing, ...controls];
    this.controls.set(frameworkId, updated);
    return updated;
  }

  /**
   * Get all controls for a framework
   */
  getControls(frameworkId: string): StoredControl[] {
    return this.controls.get(frameworkId) || [];
  }

  /**
   * Get controls by category
   */
  getControlsByCategory(frameworkId: string, category: string): StoredControl[] {
    const controls = this.controls.get(frameworkId) || [];
    return controls.filter((c) => c.category === category);
  }

  /**
   * Get a specific control
   */
  getControl(frameworkId: string, controlId: string): StoredControl | undefined {
    const controls = this.controls.get(frameworkId) || [];
    return controls.find((c) => c.controlIdStr === controlId);
  }

  /**
   * Update a control
   */
  updateControl(
    frameworkId: string,
    controlId: string,
    updates: Partial<StoredControl>
  ): StoredControl | undefined {
    const controls = this.controls.get(frameworkId) || [];
    const index = controls.findIndex((c) => c.controlIdStr === controlId);
    if (index === -1) return undefined;

    const updated = {
      ...controls[index],
      ...updates,
      id: controls[index].id,
      frameworkId: controls[index].frameworkId,
      createdAt: controls[index].createdAt,
    };
    controls[index] = updated;
    this.controls.set(frameworkId, controls);
    return updated;
  }

  /**
   * Delete a control
   */
  deleteControl(frameworkId: string, controlId: string): boolean {
    const controls = this.controls.get(frameworkId) || [];
    const index = controls.findIndex((c) => c.controlIdStr === controlId);
    if (index === -1) return false;

    controls.splice(index, 1);
    this.controls.set(frameworkId, controls);
    return true;
  }

  /**
   * Get control count for a framework
   */
  getControlCount(frameworkId: string): number {
    return (this.controls.get(frameworkId) || []).length;
  }

  // ===== Assessment Methods =====

  /**
   * Add an assessment
   */
  addAssessment(assessment: StoredAssessment): StoredAssessment {
    this.assessments.set(assessment.id, assessment);
    return assessment;
  }

  /**
   * Get an assessment
   */
  getAssessment(id: string): StoredAssessment | undefined {
    return this.assessments.get(id);
  }

  /**
   * Get assessments by user
   */
  getAssessments(userId: string): StoredAssessment[] {
    return Array.from(this.assessments.values()).filter((a) => a.userId === userId);
  }

  /**
   * Update an assessment
   */
  updateAssessment(id: string, updates: Partial<StoredAssessment>): StoredAssessment | undefined {
    const assessment = this.assessments.get(id);
    if (!assessment) return undefined;

    const updated = {
      ...assessment,
      ...updates,
      id: assessment.id,
      createdAt: assessment.createdAt,
      updatedAt: new Date(),
    };
    this.assessments.set(id, updated);
    return updated;
  }

  /**
   * Delete an assessment
   */
  deleteAssessment(id: string): boolean {
    return this.assessments.delete(id);
  }

  // ===== Agent Run Methods =====

  /**
   * Add an agent run
   */
  addAgentRun(run: AgentRunResult): AgentRunResult {
    this.agentRuns.push(run);
    return run;
  }

  /**
   * Get agent runs
   */
  getAgentRuns(agentName?: string): AgentRunResult[] {
    if (!agentName) {
      return [...this.agentRuns];
    }
    return this.agentRuns.filter((run) => run.agentName === agentName);
  }

  /**
   * Get last agent run
   */
  getLastAgentRun(agentName: string): AgentRunResult | undefined {
    const runs = this.agentRuns.filter((run) => run.agentName === agentName);
    return runs.length > 0 ? runs[runs.length - 1] : undefined;
  }

  /**
   * Clear agent runs
   */
  clearAgentRuns(): void {
    this.agentRuns = [];
  }

  // ===== Combined Risk Report Methods =====

  /**
   * Store a combined risk report
   */
  storeCombinedRiskReport(report: CombinedRiskReport): void {
    this.combinedRiskReports.set(report.reportId, report);
    this.lastCombinedRiskReport = report;
  }

  /**
   * Retrieve a combined risk report by ID
   */
  getCombinedRiskReport(reportId: string): CombinedRiskReport | undefined {
    return this.combinedRiskReports.get(reportId);
  }

  /**
   * Get the last stored combined risk report
   */
  getLastCombinedRiskReport(): CombinedRiskReport | undefined {
    return this.lastCombinedRiskReport;
  }

  /**
   * Get combined risk reports for an assessment
   */
  getCombinedRiskReportsByAssessment(assessmentId: string): CombinedRiskReport[] {
    return Array.from(this.combinedRiskReports.values()).filter(
      (report) => report.assessmentId === assessmentId
    );
  }

  /**
   * Get all combined risk reports
   */
  getAllCombinedRiskReports(): CombinedRiskReport[] {
    return Array.from(this.combinedRiskReports.values());
  }

  /**
   * Clear a specific combined risk report
   */
  clearCombinedRiskReport(reportId: string): boolean {
    return this.combinedRiskReports.delete(reportId);
  }

  /**
   * Get count of combined risk reports
   */
  getCombinedRiskReportCount(): number {
    return this.combinedRiskReports.size;
  }

  // ===== Utility Methods =====

  /**
   * Clear all data
   */
  clearAll(): void {
    this.results.clear();
    this.lastResult = undefined;
    this.frameworks.clear();
    this.controls.clear();
    this.assessments.clear();
    this.agentRuns = [];
    this.combinedRiskReports.clear();
    this.lastCombinedRiskReport = undefined;
  }

  /**
   * Get store statistics
   */
  getStats(): {
    scoringResults: number;
    frameworks: number;
    totalControls: number;
    assessments: number;
    agentRuns: number;
    combinedRiskReports: number;
  } {
    let totalControls = 0;
    for (const controls of this.controls.values()) {
      totalControls += controls.length;
    }

    return {
      scoringResults: this.results.size,
      frameworks: this.frameworks.size,
      totalControls,
      assessments: this.assessments.size,
      agentRuns: this.agentRuns.length,
      combinedRiskReports: this.combinedRiskReports.size,
    };
  }
}

/**
 * Singleton instance of the in-memory store
 */
export const inMemoryStore = new InMemoryStore();
export const store = inMemoryStore;
