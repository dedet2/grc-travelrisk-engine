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
