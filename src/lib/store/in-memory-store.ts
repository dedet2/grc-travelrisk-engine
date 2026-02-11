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
import type { BackupRecoveryReport } from '../agents/backup-recovery-agent';
import type { CostOptimizationReport } from '../agents/cost-optimization-agent';
import type { CompetitiveIntelligenceReport } from '../agents/competitive-intelligence-agent';
import type { RevenueForecastingReport } from '../agents/revenue-forecasting-agent';
import type { StrategicPlan } from '../agents/strategic-planning-agent';

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
  private monitoringAlerts: Map<string, MonitoringAlert> = new Map();
  private lastMonitoringAlert?: MonitoringAlert;
  private monitoringRunCount: number = 0;

  // B-Category Agent Storage
  private invoices: InvoiceData[] = [];
  private billingMetrics?: BillingMetrics;
  private calendarEvents: CalendarEvent[] = [];
  private schedulingMetrics?: SchedulingProcessedData;
  private triagedEmails: TriagedEmail[] = [];
  private triageMetrics?: TriageMetrics;
  private documents: Map<string, ComplianceDocument> = new Map();
  private documentMetrics?: DocumentMetrics;
  private documentSummaries: Map<string, DocumentSummary> = new Map();
  private projects: Project[] = [];
  private tasks: ProjectTask[] = [];
  private sprints: Sprint[] = [];
  private statusReports: StatusReport[] = [];

  // C-Category Agent Storage
  private leads: ScoredLead[] = [];
  private leadPipelineMetrics?: LeadPipelineMetrics;
  private outreachSequences: OutreachSequence[] = [];
  private outreachMetrics?: OutreachMetrics;
  private crmContacts: CrmContact[] = [];
  private crmDeals: CrmDeal[] = [];
  private crmPipelineMetrics?: CrmPipelineMetrics;
  private proposals: ProposalDocument[] = [];
  private proposalMetrics?: ProposalMetrics;

  // E-Category Agent Storage (Content & Marketing)
  private scheduledContent: ScheduledContent[] = [];
  private contentCalendarMetrics?: ContentCalendarMetrics;
  private keywordRankings: KeywordRanking[] = [];
  private competitorAnalyses: CompetitorAnalysis[] = [];
  private seoMetrics?: SEOMetrics;
  private socialPosts: SocialPost[] = [];
  private socialMentions: SocialMention[] = [];
  private socialMediaMetrics?: SocialMetrics;
  private contentAnalyses: Map<string, ContentAnalysis> = new Map();
  private brandVoiceMetrics?: BrandVoiceMetrics;
  private channelMetrics: ChannelMetrics[] = [];
  private dashboardMetrics?: DashboardMetrics;

  // D-Category Agent Storage (Infrastructure)
  private healthReport?: HealthReport;
  private healthAlerts: HealthAlert[] = [];
  private dbOptimizationMetrics?: DatabaseMetrics;
  private securityAuditReport?: SecurityAuditReport;
  private backupRecoveryReport?: BackupRecoveryReport;
  private costOptimizationReport?: CostOptimizationReport;

  // F-Category Agent Storage (Strategic Planning)
  private competitiveIntelligenceReport?: CompetitiveIntelligenceReport;
  private revenueForecastingReport?: RevenueForecastingReport;
  private strategicPlan?: StrategicPlan;

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

  // ===== Invoice & Billing Storage (B-01) =====

  /**
   * Store invoices
   */
  storeInvoices(invoices: InvoiceData[]): void {
    this.invoices = invoices;
  }

  /**
   * Get all invoices
   */
  getInvoices(): InvoiceData[] {
    return [...this.invoices];
  }

  /**
   * Store billing metrics
   */
  storeBillingMetrics(metrics: BillingMetrics): void {
    this.billingMetrics = metrics;
  }

  /**
   * Get billing metrics
   */
  getBillingMetrics(): BillingMetrics | undefined {
    return this.billingMetrics;
  }

  // ===== Calendar & Scheduling Storage (B-02) =====

  /**
   * Store calendar events
   */
  storeCalendarEvents(events: CalendarEvent[]): void {
    this.calendarEvents = events;
  }

  /**
   * Get all calendar events
   */
  getCalendarEvents(): CalendarEvent[] {
    return [...this.calendarEvents];
  }

  /**
   * Store scheduling metrics
   */
  storeSchedulingMetrics(metrics: SchedulingProcessedData): void {
    this.schedulingMetrics = metrics;
  }

  /**
   * Get scheduling metrics
   */
  getSchedulingMetrics(): SchedulingProcessedData | undefined {
    return this.schedulingMetrics;
  }

  // ===== Email Triage Storage (B-03) =====

  /**
   * Store triaged emails
   */
  storeTriagedEmails(emails: TriagedEmail[]): void {
    this.triagedEmails = emails;
  }

  /**
   * Get all triaged emails
   */
  getTriagedEmails(): TriagedEmail[] {
    return [...this.triagedEmails];
  }

  /**
   * Store triage metrics
   */
  storeTriageMetrics(metrics: TriageMetrics): void {
    this.triageMetrics = metrics;
  }

  /**
   * Get triage metrics
   */
  getTriageMetrics(): TriageMetrics | undefined {
    return this.triageMetrics;
  }

  // ===== Document Management Storage (B-04) =====

  /**
   * Store documents
   */
  storeDocuments(documents: ComplianceDocument[]): void {
    this.documents.clear();
    for (const doc of documents) {
      this.documents.set(doc.documentId, doc);
    }
  }

  /**
   * Get all documents
   */
  getDocuments(): ComplianceDocument[] {
    return Array.from(this.documents.values());
  }

  /**
   * Get a document by ID
   */
  getDocument(documentId: string): ComplianceDocument | undefined {
    return this.documents.get(documentId);
  }

  /**
   * Store document metrics
   */
  storeDocumentMetrics(metrics: DocumentMetrics): void {
    this.documentMetrics = metrics;
  }

  /**
   * Get document metrics
   */
  getDocumentMetrics(): DocumentMetrics | undefined {
    return this.documentMetrics;
  }

  /**
   * Store document summaries
   */
  storeDocumentSummaries(summaries: DocumentSummary[]): void {
    this.documentSummaries.clear();
    for (const summary of summaries) {
      this.documentSummaries.set(summary.documentId, summary);
    }
  }

  /**
   * Get document summaries
   */
  getDocumentSummaries(): DocumentSummary[] {
    return Array.from(this.documentSummaries.values());
  }

  // ===== Task & Project Storage (B-05) =====

  /**
   * Store projects
   */
  storeProjects(projects: Project[]): void {
    this.projects = projects;
  }

  /**
   * Get all projects
   */
  getProjects(): Project[] {
    return [...this.projects];
  }

  /**
   * Store tasks
   */
  storeTasks(tasks: ProjectTask[]): void {
    this.tasks = tasks;
  }

  /**
   * Get all tasks
   */
  getTasks(): ProjectTask[] {
    return [...this.tasks];
  }

  /**
   * Store sprints
   */
  storeSprints(sprints: Sprint[]): void {
    this.sprints = sprints;
  }

  /**
   * Get all sprints
   */
  getSprints(): Sprint[] {
    return [...this.sprints];
  }

  /**
   * Store status reports
   */
  storeStatusReports(reports: StatusReport[]): void {
    this.statusReports = reports;
  }

  /**
   * Get status reports
   */
  getStatusReports(): StatusReport[] {
    return [...this.statusReports];
  }

  // ===== Lead Scoring Storage (C-01) =====

  /**
   * Store leads
   */
  storeLeads(leads: ScoredLead[]): void {
    this.leads = leads;
  }

  /**
   * Get all leads
   */
  getLeads(): ScoredLead[] {
    return [...this.leads];
  }

  /**
   * Store lead pipeline metrics
   */
  storeLeadPipelineMetrics(metrics: LeadPipelineMetrics): void {
    this.leadPipelineMetrics = metrics;
  }

  /**
   * Get lead pipeline metrics
   */
  getLeadPipelineMetrics(): LeadPipelineMetrics | undefined {
    return this.leadPipelineMetrics;
  }

  // ===== Outreach Automation Storage (C-02) =====

  /**
   * Store outreach sequences
   */
  storeOutreachSequences(sequences: OutreachSequence[]): void {
    this.outreachSequences = sequences;
  }

  /**
   * Get all outreach sequences
   */
  getOutreachSequences(): OutreachSequence[] {
    return [...this.outreachSequences];
  }

  /**
   * Store outreach metrics
   */
  storeOutreachMetrics(metrics: OutreachMetrics): void {
    this.outreachMetrics = metrics;
  }

  /**
   * Get outreach metrics
   */
  getOutreachMetrics(): OutreachMetrics | undefined {
    return this.outreachMetrics;
  }

  // ===== CRM Sync Storage (C-03) =====

  /**
   * Store CRM contacts
   */
  storeCrmContacts(contacts: CrmContact[]): void {
    this.crmContacts = contacts;
  }

  /**
   * Get all CRM contacts
   */
  getCrmContacts(): CrmContact[] {
    return [...this.crmContacts];
  }

  /**
   * Store CRM deals
   */
  storeCrmDeals(deals: CrmDeal[]): void {
    this.crmDeals = deals;
  }

  /**
   * Get all CRM deals
   */
  getCrmDeals(): CrmDeal[] {
    return [...this.crmDeals];
  }

  /**
   * Store CRM pipeline metrics
   */
  storeCrmPipelineMetrics(metrics: CrmPipelineMetrics): void {
    this.crmPipelineMetrics = metrics;
  }

  /**
   * Get CRM pipeline metrics
   */
  getCrmPipelineMetrics(): CrmPipelineMetrics | undefined {
    return this.crmPipelineMetrics;
  }

  // ===== Proposal Generator Storage (C-04) =====

  /**
   * Store proposals
   */
  storeProposals(proposals: ProposalDocument[]): void {
    this.proposals = proposals;
  }

  /**
   * Get all proposals
   */
  getProposals(): ProposalDocument[] {
    return [...this.proposals];
  }

  /**
   * Store proposal metrics
   */
  storeProposalMetrics(metrics: ProposalMetrics): void {
    this.proposalMetrics = metrics;
  }

  /**
   * Get proposal metrics
   */
  getProposalMetrics(): ProposalMetrics | undefined {
    return this.proposalMetrics;
  }

  // ===== Content Calendar Storage (E-01) =====

  /**
   * Store scheduled content
   */
  storeContentCalendar(content: ScheduledContent[]): void {
    this.scheduledContent = content;
  }

  /**
   * Get scheduled content
   */
  getContentCalendar(): ScheduledContent[] {
    return [...this.scheduledContent];
  }

  /**
   * Store content calendar metrics
   */
  storeContentCalendarMetrics(metrics: ContentCalendarMetrics): void {
    this.contentCalendarMetrics = metrics;
  }

  /**
   * Get content calendar metrics
   */
  getContentCalendarMetrics(): ContentCalendarMetrics | undefined {
    return this.contentCalendarMetrics;
  }

  // ===== SEO Intelligence Storage (E-02) =====

  /**
   * Store keyword rankings
   */
  storeKeywordRankings(keywords: KeywordRanking[]): void {
    this.keywordRankings = keywords;
  }

  /**
   * Get keyword rankings
   */
  getKeywordRankings(): KeywordRanking[] {
    return [...this.keywordRankings];
  }

  /**
   * Store competitor analyses
   */
  storeCompetitorAnalyses(analyses: CompetitorAnalysis[]): void {
    this.competitorAnalyses = analyses;
  }

  /**
   * Get competitor analyses
   */
  getCompetitorAnalyses(): CompetitorAnalysis[] {
    return [...this.competitorAnalyses];
  }

  /**
   * Store SEO metrics
   */
  storeSEOMetrics(metrics: SEOMetrics): void {
    this.seoMetrics = metrics;
  }

  /**
   * Get SEO metrics
   */
  getSEOMetrics(): SEOMetrics | undefined {
    return this.seoMetrics;
  }

  // ===== Social Media Storage (E-03) =====

  /**
   * Store social posts
   */
  storeSocialPosts(posts: SocialPost[]): void {
    this.socialPosts = posts;
  }

  /**
   * Get social posts
   */
  getSocialPosts(): SocialPost[] {
    return [...this.socialPosts];
  }

  /**
   * Store social mentions
   */
  storeSocialMentions(mentions: SocialMention[]): void {
    this.socialMentions = mentions;
  }

  /**
   * Get social mentions
   */
  getSocialMentions(): SocialMention[] {
    return [...this.socialMentions];
  }

  /**
   * Store social media metrics
   */
  storeSocialMediaMetrics(metrics: SocialMetrics): void {
    this.socialMediaMetrics = metrics;
  }

  /**
   * Get social media metrics
   */
  getSocialMediaMetrics(): SocialMetrics | undefined {
    return this.socialMediaMetrics;
  }

  // ===== Brand Voice Storage (E-04) =====

  /**
   * Store content analyses
   */
  storeContentAnalyses(analyses: ContentAnalysis[]): void {
    this.contentAnalyses.clear();
    for (const analysis of analyses) {
      this.contentAnalyses.set(analysis.contentId, analysis);
    }
  }

  /**
   * Get content analyses
   */
  getContentAnalyses(): ContentAnalysis[] {
    return Array.from(this.contentAnalyses.values());
  }

  /**
   * Get content analysis by ID
   */
  getContentAnalysis(contentId: string): ContentAnalysis | undefined {
    return this.contentAnalyses.get(contentId);
  }

  /**
   * Store brand voice metrics
   */
  storeBrandVoiceMetrics(metrics: BrandVoiceMetrics): void {
    this.brandVoiceMetrics = metrics;
  }

  /**
   * Get brand voice metrics
   */
  getBrandVoiceMetrics(): BrandVoiceMetrics | undefined {
    return this.brandVoiceMetrics;
  }

  // ===== Analytics Dashboard Storage (E-05) =====

  /**
   * Store channel metrics
   */
  storeChannelMetrics(metrics: ChannelMetrics[]): void {
    this.channelMetrics = metrics;
  }

  /**
   * Get channel metrics
   */
  getChannelMetrics(): ChannelMetrics[] {
    return [...this.channelMetrics];
  }

  /**
   * Store dashboard metrics
   */
  storeDashboardMetrics(metrics: DashboardMetrics): void {
    this.dashboardMetrics = metrics;
  }

  /**
   * Get dashboard metrics
   */
  getDashboardMetrics(): DashboardMetrics | undefined {
    return this.dashboardMetrics;
  }

  // ===== Uptime & Health Storage (D-01) =====

  /**
   * Store health report
   */
  storeHealthReport(report: HealthReport): void {
    this.healthReport = report;
  }

  /**
   * Get health report
   */
  getHealthReport(): HealthReport | undefined {
    return this.healthReport;
  }

  /**
   * Add health alert
   */
  addHealthAlert(alert: HealthAlert): void {
    this.healthAlerts.push(alert);
    // Keep last 100 alerts
    if (this.healthAlerts.length > 100) {
      this.healthAlerts = this.healthAlerts.slice(-100);
    }
  }

  /**
   * Get health alerts
   */
  getHealthAlerts(): HealthAlert[] {
    return [...this.healthAlerts];
  }

  /**
   * Clear health alerts
   */
  clearHealthAlerts(): void {
    this.healthAlerts = [];
  }

  // ===== Database Optimization Storage (D-02) =====

  /**
   * Store database optimization metrics
   */
  storeDbOptimizationMetrics(metrics: DatabaseMetrics): void {
    this.dbOptimizationMetrics = metrics;
  }

  /**
   * Get database optimization metrics
   */
  getDbOptimizationMetrics(): DatabaseMetrics | undefined {
    return this.dbOptimizationMetrics;
  }

  // ===== Security Audit Storage (D-03) =====

  /**
   * Store security audit report
   */
  storeSecurityAuditReport(report: SecurityAuditReport): void {
    this.securityAuditReport = report;
  }

  /**
   * Get security audit report
   */
  getSecurityAuditReport(): SecurityAuditReport | undefined {
    return this.securityAuditReport;
  }

  // ===== Backup & Recovery Storage (D-04) =====

  /**
   * Store backup recovery report
   */
  storeBackupRecoveryReport(report: BackupRecoveryReport): void {
    this.backupRecoveryReport = report;
  }

  /**
   * Get backup recovery report
   */
  getBackupRecoveryReport(): BackupRecoveryReport | undefined {
    return this.backupRecoveryReport;
  }

  // ===== Cost Optimization Storage (D-05) =====

  /**
   * Store cost optimization report
   */
  storeCostOptimizationReport(report: CostOptimizationReport): void {
    this.costOptimizationReport = report;
  }

  /**
   * Get cost optimization report
   */
  getCostOptimizationReport(): CostOptimizationReport | undefined {
    return this.costOptimizationReport;
  }

  // ===== Competitive Intelligence Storage (F-01) =====

  /**
   * Store competitive intelligence report
   */
  storeCompetitiveIntelligenceReport(report: CompetitiveIntelligenceReport): void {
    this.competitiveIntelligenceReport = report;
  }

  /**
   * Get competitive intelligence report
   */
  getCompetitiveIntelligenceReport(): CompetitiveIntelligenceReport | undefined {
    return this.competitiveIntelligenceReport;
  }

  // ===== Revenue Forecasting Storage (F-02) =====

  /**
   * Store revenue forecasting report
   */
  storeRevenueForecastingReport(report: RevenueForecastingReport): void {
    this.revenueForecastingReport = report;
  }

  /**
   * Get revenue forecasting report
   */
  getRevenueForecastingReport(): RevenueForecastingReport | undefined {
    return this.revenueForecastingReport;
  }

  // ===== Strategic Planning Storage (F-03) =====

  /**
   * Store strategic plan
   */
  storeStrategicPlan(plan: StrategicPlan): void {
    this.strategicPlan = plan;
  }

  /**
   * Get strategic plan
   */
  getStrategicPlan(): StrategicPlan | undefined {
    return this.strategicPlan;
  }

  // ===== Utility Methods =====

  // ============================================================
  // Monitoring Alert Methods (A-06)
  // ============================================================

  /**
   * Add a monitoring alert
   */
  addMonitoringAlert(alert: MonitoringAlert): void {
    this.monitoringAlerts.set(alert.alertId, alert);
    this.lastMonitoringAlert = alert;
  }

  /**
   * Get all monitoring alerts
   */
  getAllMonitoringAlerts(): MonitoringAlert[] {
    return Array.from(this.monitoringAlerts.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Get a monitoring alert by ID
   */
  getMonitoringAlert(alertId: string): MonitoringAlert | undefined {
    return this.monitoringAlerts.get(alertId);
  }

  /**
   * Get unacknowledged monitoring alerts
   */
  getUnacknowledgedAlerts(): MonitoringAlert[] {
    return this.getAllMonitoringAlerts().filter((a) => !a.acknowledged);
  }

  /**
   * Get alerts by severity
   */
  getAlertsBySeverity(severity: string): MonitoringAlert[] {
    return this.getAllMonitoringAlerts().filter((a) => a.severity === severity);
  }

  /**
   * Acknowledge a monitoring alert
   */
  acknowledgeMonitoringAlert(alertId: string, acknowledgedBy?: string): boolean {
    const alert = this.monitoringAlerts.get(alertId);
    if (!alert) return false;

    alert.acknowledged = true;
    alert.acknowledgedAt = new Date();
    alert.acknowledgedBy = acknowledgedBy || 'system';
    this.monitoringAlerts.set(alertId, alert);
    return true;
  }

  /**
   * Clear acknowledged monitoring alerts
   */
  clearAcknowledgedMonitoringAlerts(): number {
    let cleared = 0;
    for (const [id, alert] of this.monitoringAlerts.entries()) {
      if (alert.acknowledged) {
        this.monitoringAlerts.delete(id);
        cleared++;
      }
    }
    return cleared;
  }

  /**
   * Get monitoring alert count
   */
  getMonitoringAlertCount(): number {
    return this.monitoringAlerts.size;
  }

  /**
   * Get monitoring alert statistics
   */
  getMonitoringStats(): {
    total: number;
    unacknowledged: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  } {
    const alerts = this.getAllMonitoringAlerts();
    return {
      total: alerts.length,
      unacknowledged: alerts.filter((a) => !a.acknowledged).length,
      critical: alerts.filter((a) => a.severity === 'critical').length,
      high: alerts.filter((a) => a.severity === 'high').length,
      medium: alerts.filter((a) => a.severity === 'medium').length,
      low: alerts.filter((a) => a.severity === 'low').length,
      info: alerts.filter((a) => a.severity === 'info').length,
    };
  }

  /**
   * Increment monitoring run count
   */
  incrementMonitoringRunCount(): number {
    return ++this.monitoringRunCount;
  }

  /**
   * Get monitoring run count
   */
  getMonitoringRunCount(): number {
    return this.monitoringRunCount;
  }

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
    this.monitoringAlerts.clear();
    this.lastMonitoringAlert = undefined;
    this.invoices = [];
    this.billingMetrics = undefined;
    this.calendarEvents = [];
    this.schedulingMetrics = undefined;
    this.triagedEmails = [];
    this.triageMetrics = undefined;
    this.documents.clear();
    this.documentMetrics = undefined;
    this.documentSummaries.clear();
    this.projects = [];
    this.tasks = [];
    this.sprints = [];
    this.statusReports = [];
    this.leads = [];
    this.leadPipelineMetrics = undefined;
    this.outreachSequences = [];
    this.outreachMetrics = undefined;
    this.crmContacts = [];
    this.crmDeals = [];
    this.crmPipelineMetrics = undefined;
    this.proposals = [];
    this.proposalMetrics = undefined;
    this.scheduledContent = [];
    this.contentCalendarMetrics = undefined;
    this.keywordRankings = [];
    this.competitorAnalyses = [];
    this.seoMetrics = undefined;
    this.socialPosts = [];
    this.socialMentions = [];
    this.socialMediaMetrics = undefined;
    this.contentAnalyses.clear();
    this.brandVoiceMetrics = undefined;
    this.channelMetrics = [];
    this.dashboardMetrics = undefined;
    this.healthReport = undefined;
    this.healthAlerts = [];
    this.dbOptimizationMetrics = undefined;
    this.securityAuditReport = undefined;
    this.backupRecoveryReport = undefined;
    this.costOptimizationReport = undefined;
    this.competitiveIntelligenceReport = undefined;
    this.revenueForecastingReport = undefined;
    this.strategicPlan = undefined;
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
    invoices: number;
    calendarEvents: number;
    triagedEmails: number;
    documents: number;
    projects: number;
    tasks: number;
    sprints: number;
    monitoringAlerts: number;
    leads: number;
    outreachSequences: number;
    crmContacts: number;
    crmDeals: number;
    proposals: number;
    scheduledContent: number;
    keywordRankings: number;
    competitorAnalyses: number;
    socialPosts: number;
    socialMentions: number;
    contentAnalyses: number;
    channelMetrics: number;
    healthAlerts: number;
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
      invoices: this.invoices.length,
      calendarEvents: this.calendarEvents.length,
      triagedEmails: this.triagedEmails.length,
      documents: this.documents.size,
      projects: this.projects.length,
      tasks: this.tasks.length,
      sprints: this.sprints.length,
      monitoringAlerts: this.monitoringAlerts.size,
      leads: this.leads.length,
      outreachSequences: this.outreachSequences.length,
      crmContacts: this.crmContacts.length,
      crmDeals: this.crmDeals.length,
      proposals: this.proposals.length,
      scheduledContent: this.scheduledContent.length,
      keywordRankings: this.keywordRankings.length,
      competitorAnalyses: this.competitorAnalyses.length,
      socialPosts: this.socialPosts.length,
      socialMentions: this.socialMentions.length,
      contentAnalyses: this.contentAnalyses.size,
      channelMetrics: this.channelMetrics.length,
      healthAlerts: this.healthAlerts.length,
    };
  }
}

/**
 * Singleton instance of the in-memory store
 */
export const inMemoryStore = new InMemoryStore();
export const store = inMemoryStore;
