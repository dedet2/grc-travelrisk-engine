/**
 * Continuous Monitoring Agent (A-06)
 * Monitors for changes in advisory data, score deviations, and framework updates
 * Generates alerts when thresholds are breached
 *
 * Lifecycle:
 * - collectData(): Gathers monitoring data from advisories, risk scores, and frameworks
 * - processData(): Detects deviations, changes, and triggers alert generation
 * - updateDashboard(): Stores alerts and monitoring state
 */

import { BaseAgent, type AgentConfig, type AgentRunResult } from './base-agent';
import { supabaseStore } from '@/lib/store'; // Uses Supabase with in-memory fallback

/**
 * Alert severity levels
 */
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

/**
 * Alert source types
 */
export type AlertSource = 'advisory' | 'scoring' | 'framework' | 'system';

/**
 * Monitoring alert structure
 */
export interface MonitoringAlert {
  alertId: string;
  timestamp: Date;
  severity: AlertSeverity;
  source: AlertSource;
  title: string;
  message: string;
  details: Record<string, unknown>;
  recommendations: string[];
  acknowledged: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
}

/**
 * Monitoring run data
 */
export interface MonitoringRunData {
  assessmentIds: string[];
  previousGrcScores: Map<string, number>;
  previousAdvisoryLevels: Map<string, number>;
  previousFrameworkVersions: Map<string, string>;
}

/**
 * Processed monitoring results
 */
export interface MonitoringResult {
  runId: string;
  timestamp: Date;
  alertsGenerated: number;
  totalAlerts: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  deviationsDetected: string[];
  frameworkUpdatesDetected: string[];
  advisoryChanges: string[];
}

/**
 * Configuration for monitoring thresholds
 */
export interface MonitoringThresholds {
  scoreDriftThreshold: number; // % change that triggers alert (default 10)
  advisoryChangeThreshold: number; // Advisory level change threshold (default 1)
  criticalAdvisoryLevel: number; // Levels 3-4 are critical (default 3)
  frameworkCheckInterval: number; // Minutes between framework checks (default 60)
}

/**
 * Continuous Monitoring Agent
 * Extends BaseAgent to monitor for changes and generate alerts
 */
export class ContinuousMonitoringAgent extends BaseAgent<
  MonitoringRunData,
  MonitoringResult
> {
  private thresholds: MonitoringThresholds = {
    scoreDriftThreshold: 10,
    advisoryChangeThreshold: 1,
    criticalAdvisoryLevel: 3,
    frameworkCheckInterval: 60,
  };

  private previousGrcScores: Map<string, number> = new Map();
  private previousAdvisoryLevels: Map<string, number> = new Map();
  private previousFrameworkVersions: Map<string, string> = new Map();
  private lastMonitoringRun?: MonitoringResult;

  constructor(config?: Partial<AgentConfig> & Partial<MonitoringThresholds>) {
    super({
      name: 'Continuous Monitoring Agent (A-06)',
      description:
        'Monitors GRC and travel risk data for changes, deviations, and framework updates. Generates alerts when thresholds are breached.',
      maxRetries: 2,
      timeoutMs: 45000,
      enabled: true,
      ...config,
    });

    // Set monitoring thresholds
    if (config?.scoreDriftThreshold !== undefined) {
      this.thresholds.scoreDriftThreshold = config.scoreDriftThreshold;
    }
    if (config?.advisoryChangeThreshold !== undefined) {
      this.thresholds.advisoryChangeThreshold = config.advisoryChangeThreshold;
    }
    if (config?.criticalAdvisoryLevel !== undefined) {
      this.thresholds.criticalAdvisoryLevel = config.criticalAdvisoryLevel;
    }
    if (config?.frameworkCheckInterval !== undefined) {
      this.thresholds.frameworkCheckInterval = config.frameworkCheckInterval;
    }

    this.initializeBaselines();
  }

  /**
   * Initialize baseline values from existing data in store
   */
  private initializeBaselines(): void {
    // Initialize GRC score baselines
    const results = supabaseStore.getAllResults();
    for (const result of results) {
      this.previousGrcScores.set(result.assessmentId, result.result.overallScore);
    }

    // Initialize framework versions
    const frameworks = supabaseStore.getFrameworks();
    for (const framework of frameworks) {
      this.previousFrameworkVersions.set(framework.id, framework.version);
    }
  }

  /**
   * Collect monitoring data from multiple sources
   * Implements abstract method from BaseAgent
   */
  async collectData(): Promise<MonitoringRunData> {
    // Simulate data collection delay
    await new Promise((resolve) => setTimeout(resolve, 150));

    const results = supabaseStore.getAllResults();
    const assessmentIds = results.map((r) => r.assessmentId);

    return {
      assessmentIds,
      previousGrcScores: new Map(this.previousGrcScores),
      previousAdvisoryLevels: new Map(this.previousAdvisoryLevels),
      previousFrameworkVersions: new Map(this.previousFrameworkVersions),
    };
  }

  /**
   * Process collected data and detect deviations/changes
   * Implements abstract method from BaseAgent
   */
  async processData(rawData: MonitoringRunData): Promise<MonitoringResult> {
    const runId = `monitoring-run-${Date.now()}`;
    const timestamp = new Date();
    const deviationsDetected: string[] = [];
    const frameworkUpdatesDetected: string[] = [];
    const advisoryChanges: string[] = [];
    let alertCount = 0;

    // Check for GRC score deviations
    for (const assessmentId of rawData.assessmentIds) {
      const currentResult = supabaseStore.getScoringResult(assessmentId);
      if (!currentResult) continue;

      const currentScore = currentResult.result.overallScore;
      const previousScore = rawData.previousGrcScores.get(assessmentId);

      if (previousScore !== undefined) {
        const percentChange = Math.abs(
          ((currentScore - previousScore) / previousScore) * 100
        );

        if (percentChange > this.thresholds.scoreDriftThreshold) {
          const deviation = `Assessment ${assessmentId}: Score changed from ${previousScore} to ${currentScore} (${percentChange.toFixed(1)}% change)`;
          deviationsDetected.push(deviation);

          // Generate alert
          const direction = currentScore > previousScore ? 'increased' : 'decreased';
          const severity: AlertSeverity =
            percentChange > 20
              ? 'critical'
              : percentChange > 15
                ? 'high'
                : 'medium';

          supabaseStore.addMonitoringAlert({
            alertId: `alert-${runId}-${assessmentId}`,
            timestamp,
            severity,
            source: 'scoring',
            title: `GRC Score Deviation Detected`,
            message: `Risk score ${direction} significantly for assessment ${assessmentId}: ${percentChange.toFixed(1)}% change (${previousScore} → ${currentScore})`,
            details: {
              assessmentId,
              previousScore,
              currentScore,
              percentChange: Math.round(percentChange * 100) / 100,
              threshold: this.thresholds.scoreDriftThreshold,
            },
            recommendations: [
              'Review controls and assess compliance status for changes',
              'Investigate root causes of score deviation',
              'Update mitigation strategies if score decreased',
              'Validate assessment responses for accuracy',
            ],
            acknowledged: false,
          });

          alertCount++;
          this.previousGrcScores.set(assessmentId, currentScore);
        }
      } else {
        // First time seeing this assessment
        this.previousGrcScores.set(assessmentId, currentScore);
      }
    }

    // Check for framework updates
    const frameworks = supabaseStore.getFrameworks();
    for (const framework of frameworks) {
      const previousVersion = rawData.previousFrameworkVersions.get(framework.id);

      if (previousVersion && previousVersion !== framework.version) {
        const update = `Framework ${framework.name}: Version changed from ${previousVersion} to ${framework.version}`;
        frameworkUpdatesDetected.push(update);

        // Generate framework update alert
        supabaseStore.addMonitoringAlert({
          alertId: `alert-${runId}-framework-${framework.id}`,
          timestamp,
          severity: 'high',
          source: 'framework',
          title: `Framework Update Detected`,
          message: `${framework.name} has been updated from v${previousVersion} to v${framework.version}. Review new requirements and controls.`,
          details: {
            frameworkId: framework.id,
            frameworkName: framework.name,
            previousVersion,
            currentVersion: framework.version,
          },
          recommendations: [
            `Review ${framework.name} v${framework.version} release notes`,
            'Assess impact on existing controls',
            'Update assessments to reflect new controls',
            'Schedule review meeting with stakeholders',
          ],
          acknowledged: false,
        });

        alertCount++;
        this.previousFrameworkVersions.set(framework.id, framework.version);
      } else if (!previousVersion) {
        // First time seeing this framework
        this.previousFrameworkVersions.set(framework.id, framework.version);
      }
    }

    // Simulate advisory monitoring (in production, would fetch from API)
    const advisorySimulation = this.simulateAdvisoryMonitoring();
    if (advisorySimulation.changes.length > 0) {
      advisoryChanges.push(...advisorySimulation.changes);
      alertCount += advisorySimulation.alertsGenerated;
    }

    // Get all alerts to count by severity
    const allAlerts = supabaseStore.getAllMonitoringAlerts();
    const criticalCount = allAlerts.filter((a) => a.severity === 'critical').length;
    const highCount = allAlerts.filter((a) => a.severity === 'high').length;
    const mediumCount = allAlerts.filter((a) => a.severity === 'medium').length;
    const lowCount = allAlerts.filter((a) => a.severity === 'low').length;
    const infoCount = allAlerts.filter((a) => a.severity === 'info').length;

    return {
      runId,
      timestamp,
      alertsGenerated: alertCount,
      totalAlerts: allAlerts.length,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      infoCount,
      deviationsDetected,
      frameworkUpdatesDetected,
      advisoryChanges,
    };
  }

  /**
   * Update dashboard by storing monitoring results
   * Implements abstract method from BaseAgent
   */
  async updateDashboard(processedData: MonitoringResult): Promise<void> {
    // Store monitoring run result
    this.lastMonitoringRun = processedData;

    // Store in agent runs for audit trail
    supabaseStore.addAgentRun({
      agentName: this.config.name,
      status: 'completed',
      startedAt: new Date(processedData.timestamp.getTime() - 5000),
      completedAt: processedData.timestamp,
      latencyMs: 5000,
      tasksCompleted: 1,
      totalTasks: 1,
      data: processedData,
    });

    // Simulate dashboard update delay
    await new Promise((resolve) => setTimeout(resolve, 50));

    console.log(
      `[ContinuousMonitoringAgent] Monitoring completed: ${processedData.alertsGenerated} new alerts generated, ${processedData.totalAlerts} total alerts`
    );
  }

  /**
   * Simulate advisory monitoring (in production, would integrate with travel advisory APIs)
   */
  private simulateAdvisoryMonitoring(): {
    changes: string[];
    alertsGenerated: number;
  } {
    const changes: string[] = [];
    let alertCount = 0;

    // Mock advisory simulation - in production would fetch from APIs
    const advisoryData = [
      { country: 'US', level: 1 },
      { country: 'UK', level: 1 },
      { country: 'Mexico', level: 2 },
      { country: 'Russia', level: 4 },
    ];

    for (const advisory of advisoryData) {
      const previous = this.previousAdvisoryLevels.get(advisory.country);

      if (previous && Math.abs(advisory.level - previous) >= this.thresholds.advisoryChangeThreshold) {
        const change = `Advisory level for ${advisory.country}: ${previous} → ${advisory.level}`;
        changes.push(change);

        // Generate advisory alert
        const severity: AlertSeverity =
          advisory.level >= this.thresholds.criticalAdvisoryLevel
            ? 'critical'
            : 'high';

        supabaseStore.addMonitoringAlert({
          alertId: `alert-advisory-${advisory.country}-${Date.now()}`,
          timestamp: new Date(),
          severity,
          source: 'advisory',
          title: `Travel Advisory Updated`,
          message: `Travel advisory level for ${advisory.country} changed from level ${previous} to level ${advisory.level}. Review travel policies and trip plans.`,
          details: {
            country: advisory.country,
            previousLevel: previous,
            currentLevel: advisory.level,
            levelDescriptions: {
              1: 'Exercise Normal Precautions',
              2: 'Exercise Increased Caution',
              3: 'Reconsider Travel',
              4: 'Do Not Travel',
            },
          },
          recommendations: [
            `Review ${advisory.country} advisory details immediately`,
            'Notify all travelers with trips to this destination',
            'Assess impact on planned business travel',
            advisory.level >= 3
              ? 'Consider postponing non-essential travel'
              : 'Implement enhanced safety protocols',
          ],
          acknowledged: false,
        });

        alertCount++;
        this.previousAdvisoryLevels.set(advisory.country, advisory.level);
      } else if (!previous) {
        this.previousAdvisoryLevels.set(advisory.country, advisory.level);
      }
    }

    return { changes, alertsGenerated: alertCount };
  }

  /**
   * Get last monitoring run result
   */
  getLastMonitoringRun(): MonitoringResult | undefined {
    return this.lastMonitoringRun;
  }

  /**
   * Get current monitoring thresholds
   */
  getThresholds(): MonitoringThresholds {
    return { ...this.thresholds };
  }

  /**
   * Update monitoring thresholds
   */
  setThresholds(
    thresholds: Partial<MonitoringThresholds>
  ): void {
    this.thresholds = {
      ...this.thresholds,
      ...thresholds,
    };
  }

  /**
   * Get all monitoring alerts
   */
  getAllAlerts(): MonitoringAlert[] {
    return supabaseStore.getAllMonitoringAlerts();
  }

  /**
   * Get alerts for a specific severity
   */
  getAlertsBySeverity(severity: AlertSeverity): MonitoringAlert[] {
    return supabaseStore
      .getAllMonitoringAlerts()
      .filter((a) => a.severity === severity);
  }

  /**
   * Get unacknowledged alerts
   */
  getUnacknowledgedAlerts(): MonitoringAlert[] {
    return supabaseStore
      .getAllMonitoringAlerts()
      .filter((a) => !a.acknowledged);
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string, acknowledgedBy?: string): boolean {
    return supabaseStore.acknowledgeMonitoringAlert(
      alertId,
      acknowledgedBy
    );
  }

  /**
   * Clear acknowledged alerts
   */
  clearAcknowledgedAlerts(): number {
    return supabaseStore.clearAcknowledgedMonitoringAlerts();
  }

  /**
   * Get monitoring metrics
   */
  override getMetrics() {
    const baseMetrics = super.getMetrics();
    const alerts = this.getAllAlerts();
    const unacknowledged = this.getUnacknowledgedAlerts();

    return {
      ...baseMetrics,
      monitoring: {
        totalAlerts: alerts.length,
        unacknowledgedAlerts: unacknowledged.length,
        criticalAlerts: alerts.filter((a) => a.severity === 'critical').length,
        lastRun: this.lastMonitoringRun,
      },
    };
  }
}

/**
 * Create and export a default instance of the Continuous Monitoring Agent
 */
export function createContinuousMonitoringAgent(
  config?: Partial<AgentConfig> & Partial<MonitoringThresholds>
): ContinuousMonitoringAgent {
  return new ContinuousMonitoringAgent(config);
}
