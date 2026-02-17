/**
 * Agents module - Export all agent-related classes and utilities
 */

export {
  BaseAgent,
  type AgentStatus,
  type AgentRunResult,
  type AgentConfig,
  type ExecutionLog,
} from './base-agent';

export {
  AgentManager,
  getAgentManager,
  resetAgentManager,
  type AgentMetrics,
  type AgentManagerStatus,
} from './agent-manager';

export {
  UnifiedRiskCombinerAgent,
  createUnifiedRiskCombinerAgent,
  type RiskCombinerConfig,
  type CombinedRiskReport,
} from './unified-risk-combiner-agent';

export {
  ContinuousMonitoringAgent,
  createContinuousMonitoringAgent,
  type MonitoringAlert,
  type MonitoringResult,
  type MonitoringThresholds,
  type AlertSeverity,
  type AlertSource,
} from './continuous-monitoring-agent';

// B-Category Agents
export {
  InvoiceBillingAgent,
  createInvoiceBillingAgent,
  type InvoiceData,
  type BillingMetrics,
  type ClientData,
} from './invoice-billing-agent';

export {
  CalendarSchedulingAgent,
  createCalendarSchedulingAgent,
  type CalendarEvent,
  type Attendee,
  type AvailabilityWindow,
  type SchedulingProcessedData,
} from './calendar-scheduling-agent';

export {
  EmailTriageAgent,
  createEmailTriageAgent,
  type EmailMessage,
  type TriagedEmail,
  type TriageMetrics,
  type ResponseTemplate,
} from './email-triage-agent';

export {
  DocumentManagementAgent,
  createDocumentManagementAgent,
  type ComplianceDocument,
  type DocumentTag,
  type DocumentVersion,
  type DocumentMetrics,
  type DocumentSummary,
} from './document-management-agent';

export {
  TaskProjectAgent,
  createTaskProjectAgent,
  type ProjectTask,
  type Project,
  type Sprint,
  type StatusReport,
  type SprintMetrics,
} from './task-project-agent';

// C-Category Agents
export {
  LeadScoringAgent,
  createLeadScoringAgent,
  type ScoredLead,
  type LeadData,
  type LeadPipelineMetrics,
} from './lead-scoring-agent';

export {
  OutreachAutomationAgent,
  createOutreachAutomationAgent,
  type OutreachSequence,
  type OutreachEmail,
  type OutreachMetrics,
} from './outreach-automation-agent';

export {
  CrmSyncAgent,
  createCrmSyncAgent,
  type CrmContact,
  type CrmDeal,
  type CrmPipelineMetrics,
} from './crm-sync-agent';

export {
  ProposalGeneratorAgent,
  createProposalGeneratorAgent,
  type ProposalDocument,
  type ProposalTemplate,
  type ProposalSection,
  type ProposalMetrics,
} from './proposal-generator-agent';

// E-Category Agents (Content & Marketing)
export {
  ContentCalendarAgent,
  createContentCalendarAgent,
  type ContentIdea,
  type ScheduledContent,
  type ContentCalendarMetrics,
} from './content-calendar-agent';

export {
  SEOIntelligenceAgent,
  createSEOIntelligenceAgent,
  type KeywordRanking,
  type CompetitorAnalysis,
  type SEOMetrics,
} from './seo-intelligence-agent';

export {
  SocialMediaAgent,
  createSocialMediaAgent,
  type SocialPost,
  type SocialMention,
  type SocialMetrics,
} from './social-media-agent';

export {
  BrandVoiceAgent,
  createBrandVoiceAgent,
  type ContentAnalysis,
  type BrandVoiceMetrics,
} from './brand-voice-agent';

export {
  AnalyticsDashboardAgent,
  createAnalyticsDashboardAgent,
  type ChannelMetrics,
  type KPI,
  type DashboardMetrics,
} from './analytics-dashboard-agent';

// D-Category Agents (Infrastructure)
export {
  UptimeHealthAgent,
  createUptimeHealthAgent,
  type HealthReport,
  type HealthAlert,
  type HealthCheckResult,
  type HealthMetrics,
} from './uptime-health-agent';

export {
  DatabaseOptimizationAgent,
  createDatabaseOptimizationAgent,
  type DatabaseMetrics,
  type OptimizationRecommendation,
  type QueryMetrics,
  type TableStats,
} from './database-optimization-agent';

export {
  SecurityAuditAgent,
  createSecurityAuditAgent,
  type SecurityAuditReport,
  type Vulnerability,
  type SecurityCheck,
  type ComplianceGap,
} from './security-audit-agent';

export {
  BackupRecoveryAgent,
  createBackupRecoveryAgent,
  type BackupRecoveryReport,
  type BackupJob,
  type BackupLocation,
  type RecoveryTest,
} from './backup-recovery-agent';

export {
  CostOptimizationAgent,
  createCostOptimizationAgent,
  type CostOptimizationReport,
  type CostSavingsOpportunity,
  type ServiceCost,
  type BudgetTracking,
} from './cost-optimization-agent';

// F-Category Agents (Strategic Planning)
export {
  CompetitiveIntelligenceAgent,
  createCompetitiveIntelligenceAgent,
  type CompetitiveIntelligenceReport,
  type Competitor,
  type FeatureLaunch,
  type CompetitiveThreat,
  type CompetitiveOpportunity,
  type MarketPositionScore,
} from './competitive-intelligence-agent';

export {
  RevenueForecastingAgent,
  createRevenueForecastingAgent,
  type RevenueForecastingReport,
  type RevenueForecast,
  type RevenueRiskFactor,
  type RevenueScenarioModel,
  type SalesMetric,
  type PipelineStage,
} from './revenue-forecasting-agent';

export {
  StrategicPlanningAgent,
  createStrategicPlanningAgent,
  type StrategicPlan,
  type StrategicInitiative,
  type QuarterlyObjective,
  type StrategicTheme,
  type RiskMitigationStrategy,
  type ResourceAllocationPlan,
} from './strategic-planning-agent';

// Agent Orchestrator
export {
  AgentOrchestrator,
  getOrchestrator,
  resetOrchestrator,
  type AgentCategory,
  type AgentInfo,
  type ExecutionTracker,
  type CategoryExecutionResult,
  type OrchestrationResult,
} from './orchestrator';
