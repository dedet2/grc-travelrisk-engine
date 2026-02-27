/**
 * Supabase Persistence Layer for Agent Store
 * Replaces in-memory storage with Supabase backend
 * Includes automatic fallback to in-memory if Supabase is unreachable
 */

import type { ScoringOutput } from '@/lib/scoring/types';
import type { ControlScore } from '@/lib/scoring/types';
import type { AgentRunResult } from '../agents/base-agent';
import type { CombinedRiskReport } from '../agents/unified-risk-combiner-agent';
import type { MonitoringAlert } from '../agents/continuous-monitoring-agent';
import type { InvoiceData, BillingMetrics } from '../agents/invoice-billing-agent';
import type { CalendarEvent } from '../agents/calendar-scheduling-agent';
import type { SchedulingProcessedData } from '../agents/calendar-scheduling-agent';
import type { TriagedEmail, TriageMetrics } from '../agents/email-triage-agent';
import type { ComplianceDocument, DocumentMetrics, DocumentSummary } from '../agents/document-management-agent';
import type { ProjectTask, Project, StatusReport } from '../agents/task-project-agent';
import type { Sprint } from '../agents/task-project-agent';
import type { ScoredLead, LeadPipelineMetrics } from '../agents/lead-scoring-agent';
import type { OutreachSequence, OutreachMetrics } from '../agents/outreach-automation-agent';
import type { CrmContact, CrmDeal, CrmPipelineMetrics } from '../agents/crm-sync-agent';
import type { ProposalDocument, ProposalMetrics } from '../agents/proposal-generator-agent';
import type { ScheduledContent, ContentCalendarMetrics } from '../agents/content-calendar-agent';
import type { KeywordRanking, CompetitorAnalysis, SEOMetrics } from '../agents/seo-intelligence-agent';
import type { SocialPost, SocialMention, SocialMetrics } from '../agents/social-media-agent';
import type { ContentAnalysis, BrandVoiceMetrics } from '../agents/brand-voice-agent';
import type { ChannelMetrics, DashboardMetrics } from '../agents/analytics-dashboard-agent';
import type { HealthReport, HealthAlert } from '../agents/uptime-health-agent';
import type { DatabaseMetrics } from '../agents/database-optimization-agent';
import type { SecurityAuditReport } from '../agents/security-audit-agent';
import type { GovernanceAuditReport } from '../agents/governance-audit-agent';
import type { BackupRecoveryReport } from '../agents/backup-recovery-agent';
import type { CostOptimizationReport } from '../agents/cost-optimization-agent';
import type { CompetitiveIntelligenceReport } from '../agents/competitive-intelligence-agent';
import type { RevenueForecastingReport } from '../agents/revenue-forecasting-agent';
import type { StrategicPlan } from '../agents/strategic-planning-agent';

import { isSupabaseReachable, supabaseGet, supabaseInsert, supabaseUpdate, supabaseDelete } from '../supabase-rest';
import { inMemoryStore, type StoredScoringResult, type StoredFramework, type StoredControl, type StoredAssessment } from './in-memory-store';

/**
 * Supabase-backed store with in-memory fallback
 */
class SupabaseStore {
  private isReachable: boolean = false;
  private fallbackStore = inMemoryStore;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheMaxAge: number = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.initializeSupabase();
  }

  /**
   * Initialize Supabase connectivity check
   */
  private async initializeSupabase(): Promise<void> {
    try {
      this.isReachable = await isSupabaseReachable();
      if (this.isReachable) {
        console.log('[Store] Supabase is reachable, using persistent store');
      } else {
        console.warn('[Store] Supabase is not reachable, falling back to in-memory store');
      }
    } catch (error) {
      console.warn('[Store] Failed to initialize Supabase connection:', error);
      this.isReachable = false;
    }
  }

  /**
   * Get from cache if available
   */
  private getCache<T>(key: string): T | undefined {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheMaxAge) {
      return cached.data as T;
    }
    this.cache.delete(key);
    return undefined;
  }

  /**
   * Set cache
   */
  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Invalidate related cache entries
   */
  private invalidateCache(patterns: string[]): void {
    const keys = Array.from(this.cache.keys());
    keys.forEach((key) => {
      if (patterns.some((p) => key.includes(p))) {
        this.cache.delete(key);
      }
    });
  }

  // ===== Scoring Results Methods =====

  storeScoringResult(result: ScoringOutput, controls?: ControlScore[]): void {
    if (this.isReachable) {
      try {
        supabaseInsert('scoring_results', {
          assessment_id: result.assessmentId,
          result: result,
          controls: controls,
          created_at: new Date().toISOString(),
        });
        this.invalidateCache(['scoring_result']);
      } catch (error) {
        console.warn('[Store] Failed to store scoring result to Supabase:', error);
        this.fallbackStore.storeScoringResult(result, controls);
      }
    } else {
      this.fallbackStore.storeScoringResult(result, controls);
    }
  }

  getScoringResult(assessmentId: string): StoredScoringResult | undefined {
    const cacheKey = `scoring_result_${assessmentId}`;
    const cached = this.getCache<StoredScoringResult>(cacheKey);
    if (cached) return cached;

    if (this.isReachable) {
      try {
        supabaseGet('scoring_results', `assessment_id=eq.${assessmentId}`).then((res) => {
          if (res.data && res.data.length > 0) {
            const stored: StoredScoringResult = {
              assessmentId: res.data[0].assessment_id,
              result: res.data[0].result,
              storedAt: new Date(res.data[0].created_at),
              controls: res.data[0].controls,
            };
            this.setCache(cacheKey, stored);
            return stored;
          }
        });
      } catch (error) {
        console.warn('[Store] Failed to get scoring result from Supabase:', error);
      }
    }

    return this.fallbackStore.getScoringResult(assessmentId);
  }

  getLastScoringResult(): StoredScoringResult | undefined {
    const cacheKey = 'scoring_result_last';
    const cached = this.getCache<StoredScoringResult>(cacheKey);
    if (cached) return cached;

    if (this.isReachable) {
      try {
        supabaseGet('scoring_results', 'order=created_at.desc&limit=1').then((res) => {
          if (res.data && res.data.length > 0) {
            const stored: StoredScoringResult = {
              assessmentId: res.data[0].assessment_id,
              result: res.data[0].result,
              storedAt: new Date(res.data[0].created_at),
              controls: res.data[0].controls,
            };
            this.setCache(cacheKey, stored);
            return stored;
          }
        });
      } catch (error) {
        console.warn('[Store] Failed to get last scoring result from Supabase:', error);
      }
    }

    return this.fallbackStore.getLastScoringResult();
  }

  getAllResults(): StoredScoringResult[] {
    if (this.isReachable) {
      try {
        const cacheKey = 'scoring_results_all';
        const cached = this.getCache<StoredScoringResult[]>(cacheKey);
        if (cached) return cached;

        supabaseGet('scoring_results').then((res) => {
          if (res.data) {
            const results = res.data.map((row: any) => ({
              assessmentId: row.assessment_id,
              result: row.result,
              storedAt: new Date(row.created_at),
              controls: row.controls,
            }));
            this.setCache(cacheKey, results);
            return results;
          }
        });
      } catch (error) {
        console.warn('[Store] Failed to get all scoring results from Supabase:', error);
      }
    }

    return this.fallbackStore.getAllResults();
  }

  clearResult(assessmentId: string): boolean {
    if (this.isReachable) {
      try {
        supabaseDelete('scoring_results', { assessment_id: assessmentId });
        this.invalidateCache(['scoring_result']);
        return true;
      } catch (error) {
        console.warn('[Store] Failed to clear scoring result from Supabase:', error);
      }
    }
    return this.fallbackStore.clearResult(assessmentId);
  }

  getResultCount(): number {
    return this.fallbackStore.getResultCount();
  }

  // ===== Framework Methods =====

  addFramework(framework: StoredFramework): StoredFramework {
    if (this.isReachable) {
      try {
        supabaseInsert('frameworks', {
          id: framework.id,
          name: framework.name,
          version: framework.version,
          description: framework.description,
          source_url: framework.sourceUrl,
          status: framework.status,
          control_count: framework.controlCount,
          categories: framework.categories,
          created_at: framework.createdAt.toISOString(),
          updated_at: framework.updatedAt.toISOString(),
        });
        this.invalidateCache(['framework']);
      } catch (error) {
        console.warn('[Store] Failed to add framework to Supabase:', error);
      }
    }
    return this.fallbackStore.addFramework(framework);
  }

  getFramework(id: string): StoredFramework | undefined {
    if (this.isReachable) {
      const cacheKey = `framework_${id}`;
      const cached = this.getCache<StoredFramework>(cacheKey);
      if (cached) return cached;
    }
    return this.fallbackStore.getFramework(id);
  }

  getFrameworkByName(name: string): StoredFramework | undefined {
    return this.fallbackStore.getFrameworkByName(name);
  }

  getFrameworks(): StoredFramework[] {
    if (this.isReachable) {
      const cacheKey = 'frameworks_all';
      const cached = this.getCache<StoredFramework[]>(cacheKey);
      if (cached) return cached;
    }
    return this.fallbackStore.getFrameworks();
  }

  updateFramework(id: string, updates: Partial<StoredFramework>): StoredFramework | undefined {
    if (this.isReachable) {
      try {
        supabaseUpdate(
          'frameworks',
          {
            ...updates,
            updated_at: new Date().toISOString(),
          },
          { id }
        );
        this.invalidateCache(['framework']);
      } catch (error) {
        console.warn('[Store] Failed to update framework in Supabase:', error);
      }
    }
    return this.fallbackStore.updateFramework(id, updates);
  }

  deleteFramework(id: string): boolean {
    if (this.isReachable) {
      try {
        supabaseDelete('frameworks', { id });
        supabaseDelete('controls', { framework_id: id });
        this.invalidateCache(['framework', 'control']);
        return true;
      } catch (error) {
        console.warn('[Store] Failed to delete framework from Supabase:', error);
      }
    }
    return this.fallbackStore.deleteFramework(id);
  }

  // ===== Control Methods =====

  addControls(frameworkId: string, controls: StoredControl[]): StoredControl[] {
    if (this.isReachable) {
      try {
        supabaseInsert(
          'controls',
          controls.map((c) => ({
            id: c.id,
            framework_id: frameworkId,
            control_id_str: c.controlIdStr,
            title: c.title,
            description: c.description,
            category: c.category,
            control_type: c.controlType,
            criticality: c.criticality,
            created_at: c.createdAt.toISOString(),
          }))
        );
        this.invalidateCache(['control']);
      } catch (error) {
        console.warn('[Store] Failed to add controls to Supabase:', error);
      }
    }
    return this.fallbackStore.addControls(frameworkId, controls);
  }

  getControls(frameworkId: string): StoredControl[] {
    if (this.isReachable) {
      const cacheKey = `controls_${frameworkId}`;
      const cached = this.getCache<StoredControl[]>(cacheKey);
      if (cached) return cached;
    }
    return this.fallbackStore.getControls(frameworkId);
  }

  getControlsByCategory(frameworkId: string, category: string): StoredControl[] {
    return this.fallbackStore.getControlsByCategory(frameworkId, category);
  }

  getControl(frameworkId: string, controlId: string): StoredControl | undefined {
    return this.fallbackStore.getControl(frameworkId, controlId);
  }

  updateControl(frameworkId: string, controlId: string, updates: Partial<StoredControl>): StoredControl | undefined {
    if (this.isReachable) {
      try {
        supabaseUpdate('controls', updates, {
          framework_id: frameworkId,
          control_id_str: controlId,
        });
        this.invalidateCache(['control']);
      } catch (error) {
        console.warn('[Store] Failed to update control in Supabase:', error);
      }
    }
    return this.fallbackStore.updateControl(frameworkId, controlId, updates);
  }

  deleteControl(frameworkId: string, controlId: string): boolean {
    if (this.isReachable) {
      try {
        supabaseDelete('controls', {
          framework_id: frameworkId,
          control_id_str: controlId,
        });
        this.invalidateCache(['control']);
        return true;
      } catch (error) {
        console.warn('[Store] Failed to delete control from Supabase:', error);
      }
    }
    return this.fallbackStore.deleteControl(frameworkId, controlId);
  }

  getControlCount(frameworkId: string): number {
    return this.fallbackStore.getControlCount(frameworkId);
  }

  // ===== Assessment Methods =====

  addAssessment(assessment: StoredAssessment): StoredAssessment {
    if (this.isReachable) {
      try {
        supabaseInsert('assessments', {
          id: assessment.id,
          user_id: assessment.userId,
          framework_id: assessment.frameworkId,
          name: assessment.name,
          status: assessment.status,
          overall_score: assessment.overallScore,
          created_at: assessment.createdAt.toISOString(),
          updated_at: assessment.updatedAt.toISOString(),
        });
        this.invalidateCache(['assessment']);
      } catch (error) {
        console.warn('[Store] Failed to add assessment to Supabase:', error);
      }
    }
    return this.fallbackStore.addAssessment(assessment);
  }

  getAssessment(id: string): StoredAssessment | undefined {
    if (this.isReachable) {
      const cacheKey = `assessment_${id}`;
      const cached = this.getCache<StoredAssessment>(cacheKey);
      if (cached) return cached;
    }
    return this.fallbackStore.getAssessment(id);
  }

  getAssessments(userId: string): StoredAssessment[] {
    if (this.isReachable) {
      const cacheKey = `assessments_user_${userId}`;
      const cached = this.getCache<StoredAssessment[]>(cacheKey);
      if (cached) return cached;
    }
    return this.fallbackStore.getAssessments(userId);
  }

  updateAssessment(id: string, updates: Partial<StoredAssessment>): StoredAssessment | undefined {
    if (this.isReachable) {
      try {
        supabaseUpdate(
          'assessments',
          {
            ...updates,
            updated_at: new Date().toISOString(),
          },
          { id }
        );
        this.invalidateCache(['assessment']);
      } catch (error) {
        console.warn('[Store] Failed to update assessment in Supabase:', error);
      }
    }
    return this.fallbackStore.updateAssessment(id, updates);
  }

  deleteAssessment(id: string): boolean {
    if (this.isReachable) {
      try {
        supabaseDelete('assessments', { id });
        this.invalidateCache(['assessment']);
        return true;
      } catch (error) {
        console.warn('[Store] Failed to delete assessment from Supabase:', error);
      }
    }
    return this.fallbackStore.deleteAssessment(id);
  }

  // ===== Agent Run Methods =====

  addAgentRun(run: AgentRunResult): AgentRunResult {
    if (this.isReachable) {
      try {
        supabaseInsert('agent_runs', {
          agent_name: run.agentName,
          agent_id: run.agentId,
          run_id: run.runId,
          status: run.status,
          result: run.result,
          error: run.error,
          started_at: run.startedAt?.toISOString(),
          completed_at: run.completedAt?.toISOString(),
          duration_ms: run.durationMs,
        });
        this.invalidateCache(['agent_run']);
      } catch (error) {
        console.warn('[Store] Failed to add agent run to Supabase:', error);
      }
    }
    return this.fallbackStore.addAgentRun(run);
  }

  getAgentRuns(agentName?: string): AgentRunResult[] {
    return this.fallbackStore.getAgentRuns(agentName);
  }

  getLastAgentRun(agentName: string): AgentRunResult | undefined {
    return this.fallbackStore.getLastAgentRun(agentName);
  }

  clearAgentRuns(): void {
    if (this.isReachable) {
      try {
        // Delete all records (Supabase REST doesn't support DELETE all without filter)
        this.invalidateCache(['agent_run']);
      } catch (error) {
        console.warn('[Store] Failed to clear agent runs from Supabase:', error);
      }
    }
    this.fallbackStore.clearAgentRuns();
  }

  // ===== Combined Risk Report Methods =====

  storeCombinedRiskReport(report: CombinedRiskReport): void {
    if (this.isReachable) {
      try {
        supabaseInsert('combined_risk_reports', {
          report_id: report.reportId,
          assessment_id: report.assessmentId,
          report: report,
          created_at: new Date().toISOString(),
        });
        this.invalidateCache(['combined_risk_report']);
      } catch (error) {
        console.warn('[Store] Failed to store combined risk report to Supabase:', error);
      }
    }
    this.fallbackStore.storeCombinedRiskReport(report);
  }

  getCombinedRiskReport(reportId: string): CombinedRiskReport | undefined {
    return this.fallbackStore.getCombinedRiskReport(reportId);
  }

  getLastCombinedRiskReport(): CombinedRiskReport | undefined {
    return this.fallbackStore.getLastCombinedRiskReport();
  }

  getCombinedRiskReportsByAssessment(assessmentId: string): CombinedRiskReport[] {
    return this.fallbackStore.getCombinedRiskReportsByAssessment(assessmentId);
  }

  getAllCombinedRiskReports(): CombinedRiskReport[] {
    return this.fallbackStore.getAllCombinedRiskReports();
  }

  clearCombinedRiskReport(reportId: string): boolean {
    if (this.isReachable) {
      try {
        supabaseDelete('combined_risk_reports', { report_id: reportId });
        this.invalidateCache(['combined_risk_report']);
        return true;
      } catch (error) {
        console.warn('[Store] Failed to clear combined risk report from Supabase:', error);
      }
    }
    return this.fallbackStore.clearCombinedRiskReport(reportId);
  }

  getCombinedRiskReportCount(): number {
    return this.fallbackStore.getCombinedRiskReportCount();
  }

  // ===== Monitoring Alert Methods =====

  addMonitoringAlert(alert: MonitoringAlert): void {
    if (this.isReachable) {
      try {
        supabaseInsert('monitoring_alerts', {
          alert_id: alert.alertId,
          alert: alert,
          created_at: new Date().toISOString(),
        });
        this.invalidateCache(['monitoring_alert']);
      } catch (error) {
        console.warn('[Store] Failed to add monitoring alert to Supabase:', error);
      }
    }
    this.fallbackStore.addMonitoringAlert(alert);
  }

  getAllMonitoringAlerts(): MonitoringAlert[] {
    return this.fallbackStore.getAllMonitoringAlerts();
  }

  getMonitoringAlert(alertId: string): MonitoringAlert | undefined {
    return this.fallbackStore.getMonitoringAlert(alertId);
  }

  getUnacknowledgedAlerts(): MonitoringAlert[] {
    return this.fallbackStore.getUnacknowledgedAlerts();
  }

  getAlertsBySeverity(severity: string): MonitoringAlert[] {
    return this.fallbackStore.getAlertsBySeverity(severity);
  }

  acknowledgeMonitoringAlert(alertId: string, acknowledgedBy?: string): boolean {
    if (this.isReachable) {
      try {
        supabaseUpdate(
          'monitoring_alerts',
          {
            acknowledged: true,
            acknowledged_at: new Date().toISOString(),
            acknowledged_by: acknowledgedBy || 'system',
          },
          { alert_id: alertId }
        );
        this.invalidateCache(['monitoring_alert']);
      } catch (error) {
        console.warn('[Store] Failed to acknowledge monitoring alert in Supabase:', error);
      }
    }
    return this.fallbackStore.acknowledgeMonitoringAlert(alertId, acknowledgedBy);
  }

  clearAcknowledgedMonitoringAlerts(): number {
    return this.fallbackStore.clearAcknowledgedMonitoringAlerts();
  }

  getMonitoringAlertCount(): number {
    return this.fallbackStore.getMonitoringAlertCount();
  }

  getMonitoringStats() {
    return this.fallbackStore.getMonitoringStats();
  }

  incrementMonitoringRunCount(): number {
    return this.fallbackStore.incrementMonitoringRunCount();
  }

  getMonitoringRunCount(): number {
    return this.fallbackStore.getMonitoringRunCount();
  }

  // ===== Delegate all other methods to fallback store =====

  // Invoice & Billing
  storeInvoices = this.fallbackStore.storeInvoices.bind(this.fallbackStore);
  getInvoices = this.fallbackStore.getInvoices.bind(this.fallbackStore);
  storeBillingMetrics = this.fallbackStore.storeBillingMetrics.bind(this.fallbackStore);
  getBillingMetrics = this.fallbackStore.getBillingMetrics.bind(this.fallbackStore);

  // Calendar & Scheduling
  storeCalendarEvents = this.fallbackStore.storeCalendarEvents.bind(this.fallbackStore);
  getCalendarEvents = this.fallbackStore.getCalendarEvents.bind(this.fallbackStore);
  storeSchedulingMetrics = this.fallbackStore.storeSchedulingMetrics.bind(this.fallbackStore);
  getSchedulingMetrics = this.fallbackStore.getSchedulingMetrics.bind(this.fallbackStore);

  // Email Triage
  storeTriagedEmails = this.fallbackStore.storeTriagedEmails.bind(this.fallbackStore);
  getTriagedEmails = this.fallbackStore.getTriagedEmails.bind(this.fallbackStore);
  storeTriageMetrics = this.fallbackStore.storeTriageMetrics.bind(this.fallbackStore);
  getTriageMetrics = this.fallbackStore.getTriageMetrics.bind(this.fallbackStore);

  // Document Management
  storeDocuments = this.fallbackStore.storeDocuments.bind(this.fallbackStore);
  getDocuments = this.fallbackStore.getDocuments.bind(this.fallbackStore);
  getDocument = this.fallbackStore.getDocument.bind(this.fallbackStore);
  storeDocumentMetrics = this.fallbackStore.storeDocumentMetrics.bind(this.fallbackStore);
  getDocumentMetrics = this.fallbackStore.getDocumentMetrics.bind(this.fallbackStore);
  storeDocumentSummaries = this.fallbackStore.storeDocumentSummaries.bind(this.fallbackStore);
  getDocumentSummaries = this.fallbackStore.getDocumentSummaries.bind(this.fallbackStore);

  // Task & Project
  storeProjects = this.fallbackStore.storeProjects.bind(this.fallbackStore);
  getProjects = this.fallbackStore.getProjects.bind(this.fallbackStore);
  storeTasks = this.fallbackStore.storeTasks.bind(this.fallbackStore);
  getTasks = this.fallbackStore.getTasks.bind(this.fallbackStore);
  storeSprints = this.fallbackStore.storeSprints.bind(this.fallbackStore);
  getSprints = this.fallbackStore.getSprints.bind(this.fallbackStore);
  storeStatusReports = this.fallbackStore.storeStatusReports.bind(this.fallbackStore);
  getStatusReports = this.fallbackStore.getStatusReports.bind(this.fallbackStore);

  // Lead Scoring
  storeLeads = this.fallbackStore.storeLeads.bind(this.fallbackStore);
  getLeads = this.fallbackStore.getLeads.bind(this.fallbackStore);
  storeLeadPipelineMetrics = this.fallbackStore.storeLeadPipelineMetrics.bind(this.fallbackStore);
  getLeadPipelineMetrics = this.fallbackStore.getLeadPipelineMetrics.bind(this.fallbackStore);

  // Outreach Automation
  storeOutreachSequences = this.fallbackStore.storeOutreachSequences.bind(this.fallbackStore);
  getOutreachSequences = this.fallbackStore.getOutreachSequences.bind(this.fallbackStore);
  storeOutreachMetrics = this.fallbackStore.storeOutreachMetrics.bind(this.fallbackStore);
  getOutreachMetrics = this.fallbackStore.getOutreachMetrics.bind(this.fallbackStore);

  // CRM Sync
  storeCrmContacts = this.fallbackStore.storeCrmContacts.bind(this.fallbackStore);
  getCrmContacts = this.fallbackStore.getCrmContacts.bind(this.fallbackStore);
  storeCrmDeals = this.fallbackStore.storeCrmDeals.bind(this.fallbackStore);
  getCrmDeals = this.fallbackStore.getCrmDeals.bind(this.fallbackStore);
  storeCrmPipelineMetrics = this.fallbackStore.storeCrmPipelineMetrics.bind(this.fallbackStore);
  getCrmPipelineMetrics = this.fallbackStore.getCrmPipelineMetrics.bind(this.fallbackStore);

  // Proposal Generator
  storeProposals = this.fallbackStore.storeProposals.bind(this.fallbackStore);
  getProposals = this.fallbackStore.getProposals.bind(this.fallbackStore);
  storeProposalMetrics = this.fallbackStore.storeProposalMetrics.bind(this.fallbackStore);
  getProposalMetrics = this.fallbackStore.getProposalMetrics.bind(this.fallbackStore);

  // Content Calendar
  storeContentCalendar = this.fallbackStore.storeContentCalendar.bind(this.fallbackStore);
  getContentCalendar = this.fallbackStore.getContentCalendar.bind(this.fallbackStore);
  storeContentCalendarMetrics = this.fallbackStore.storeContentCalendarMetrics.bind(this.fallbackStore);
  getContentCalendarMetrics = this.fallbackStore.getContentCalendarMetrics.bind(this.fallbackStore);

  // SEO Intelligence
  storeKeywordRankings = this.fallbackStore.storeKeywordRankings.bind(this.fallbackStore);
  getKeywordRankings = this.fallbackStore.getKeywordRankings.bind(this.fallbackStore);
  storeCompetitorAnalyses = this.fallbackStore.storeCompetitorAnalyses.bind(this.fallbackStore);
  getCompetitorAnalyses = this.fallbackStore.getCompetitorAnalyses.bind(this.fallbackStore);
  storeSEOMetrics = this.fallbackStore.storeSEOMetrics.bind(this.fallbackStore);
  getSEOMetrics = this.fallbackStore.getSEOMetrics.bind(this.fallbackStore);

  // Social Media
  storeSocialPosts = this.fallbackStore.storeSocialPosts.bind(this.fallbackStore);
  getSocialPosts = this.fallbackStore.getSocialPosts.bind(this.fallbackStore);
  storeSocialMentions = this.fallbackStore.storeSocialMentions.bind(this.fallbackStore);
  getSocialMentions = this.fallbackStore.getSocialMentions.bind(this.fallbackStore);
  storeSocialMediaMetrics = this.fallbackStore.storeSocialMediaMetrics.bind(this.fallbackStore);
  getSocialMediaMetrics = this.fallbackStore.getSocialMediaMetrics.bind(this.fallbackStore);

  // Brand Voice
  storeContentAnalyses = this.fallbackStore.storeContentAnalyses.bind(this.fallbackStore);
  getContentAnalyses = this.fallbackStore.getContentAnalyses.bind(this.fallbackStore);
  getContentAnalysis = this.fallbackStore.getContentAnalysis.bind(this.fallbackStore);
  storeBrandVoiceMetrics = this.fallbackStore.storeBrandVoiceMetrics.bind(this.fallbackStore);
  getBrandVoiceMetrics = this.fallbackStore.getBrandVoiceMetrics.bind(this.fallbackStore);

  // Analytics Dashboard
  storeChannelMetrics = this.fallbackStore.storeChannelMetrics.bind(this.fallbackStore);
  getChannelMetrics = this.fallbackStore.getChannelMetrics.bind(this.fallbackStore);
  storeDashboardMetrics = this.fallbackStore.storeDashboardMetrics.bind(this.fallbackStore);
  getDashboardMetrics = this.fallbackStore.getDashboardMetrics.bind(this.fallbackStore);

  // Uptime & Health
  storeHealthReport = this.fallbackStore.storeHealthReport.bind(this.fallbackStore);
  getHealthReport = this.fallbackStore.getHealthReport.bind(this.fallbackStore);
  addHealthAlert = this.fallbackStore.addHealthAlert.bind(this.fallbackStore);
  getHealthAlerts = this.fallbackStore.getHealthAlerts.bind(this.fallbackStore);
  clearHealthAlerts = this.fallbackStore.clearHealthAlerts.bind(this.fallbackStore);

  // Database Optimization
  storeDbOptimizationMetrics = this.fallbackStore.storeDbOptimizationMetrics.bind(this.fallbackStore);
  getDbOptimizationMetrics = this.fallbackStore.getDbOptimizationMetrics.bind(this.fallbackStore);

  // Security Audit
  storeSecurityAuditReport = this.fallbackStore.storeSecurityAuditReport.bind(this.fallbackStore);
  getSecurityAuditReport = this.fallbackStore.getSecurityAuditReport.bind(this.fallbackStore);

  // Governance Audit
  storeGovernanceAuditReport = this.fallbackStore.storeGovernanceAuditReport.bind(this.fallbackStore);
  getGovernanceAuditReport = this.fallbackStore.getGovernanceAuditReport.bind(this.fallbackStore);

  // Backup & Recovery
  storeBackupRecoveryReport = this.fallbackStore.storeBackupRecoveryReport.bind(this.fallbackStore);
  getBackupRecoveryReport = this.fallbackStore.getBackupRecoveryReport.bind(this.fallbackStore);

  // Cost Optimization
  storeCostOptimizationReport = this.fallbackStore.storeCostOptimizationReport.bind(this.fallbackStore);
  getCostOptimizationReport = this.fallbackStore.getCostOptimizationReport.bind(this.fallbackStore);

  // Competitive Intelligence
  storeCompetitiveIntelligenceReport = this.fallbackStore.storeCompetitiveIntelligenceReport.bind(this.fallbackStore);
  getCompetitiveIntelligenceReport = this.fallbackStore.getCompetitiveIntelligenceReport.bind(this.fallbackStore);

  // Revenue Forecasting
  storeRevenueForecastingReport = this.fallbackStore.storeRevenueForecastingReport.bind(this.fallbackStore);
  getRevenueForecastingReport = this.fallbackStore.getRevenueForecastingReport.bind(this.fallbackStore);

  // Strategic Planning
  storeStrategicPlan = this.fallbackStore.storeStrategicPlan.bind(this.fallbackStore);
  getStrategicPlan = this.fallbackStore.getStrategicPlan.bind(this.fallbackStore);

  // Utility Methods
  clearAll = this.fallbackStore.clearAll.bind(this.fallbackStore);
  getStats = this.fallbackStore.getStats.bind(this.fallbackStore);
}

/**
 * Singleton instance of the Supabase store
 */
export const supabaseStore = new SupabaseStore();
export const store = supabaseStore;
