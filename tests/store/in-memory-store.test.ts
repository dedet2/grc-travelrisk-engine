/**
 * In-Memory Store Tests
 * Tests for CRUD operations on the in-memory data store
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { inMemoryStore } from '@/lib/store/in-memory-store';
import type { InvoiceData, BillingMetrics } from '@/lib/agents/invoice-billing-agent';
import type { ScoredLead, LeadPipelineMetrics } from '@/lib/agents/lead-scoring-agent';
import type { HealthReport, HealthAlert } from '@/lib/agents/uptime-health-agent';
import type { AgentRunResult } from '@/lib/agents/base-agent';

describe('In-Memory Store', () => {
  // Note: The store is a singleton, so we clear agent runs in beforeEach
  beforeEach(() => {
    inMemoryStore.clearAgentRuns();
  });

  describe('Invoice and Billing Operations', () => {
    it('should store and retrieve invoices', () => {
      const mockInvoices: InvoiceData[] = [
        {
          invoiceId: 'INV-001',
          clientId: 'client-1',
          clientName: 'Test Client',
          amount: 1000,
          currency: 'USD',
          issueDate: new Date(),
          dueDate: new Date(),
          status: 'sent',
          items: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      inMemoryStore.storeInvoices(mockInvoices);
      const retrieved = inMemoryStore.getInvoices();

      expect(Array.isArray(retrieved)).toBe(true);
      expect(retrieved.length).toBeGreaterThan(0);
    });

    it('should store and retrieve billing metrics', () => {
      const mockMetrics: BillingMetrics = {
        totalInvoiced: 10000,
        totalPaid: 5000,
        totalOutstanding: 5000,
        averagePaymentDays: 30,
        recurringRevenueMonthly: 1000,
        paymentCollectionRate: 50,
        overduInvoiceCount: 1,
        clientCount: 5,
        invoiceCount: 10,
        timestamp: new Date(),
      };

      inMemoryStore.storeBillingMetrics(mockMetrics);
      const retrieved = inMemoryStore.getBillingMetrics();

      expect(retrieved).toBeDefined();
      expect(retrieved?.totalInvoiced).toBe(10000);
      expect(retrieved?.paymentCollectionRate).toBe(50);
    });

    it('should have timestamp in billing metrics', () => {
      const mockMetrics: BillingMetrics = {
        totalInvoiced: 5000,
        totalPaid: 2500,
        totalOutstanding: 2500,
        averagePaymentDays: 25,
        recurringRevenueMonthly: 500,
        paymentCollectionRate: 50,
        overduInvoiceCount: 0,
        clientCount: 3,
        invoiceCount: 5,
        timestamp: new Date(),
      };

      inMemoryStore.storeBillingMetrics(mockMetrics);
      const retrieved = inMemoryStore.getBillingMetrics();

      expect(retrieved?.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Lead Scoring Operations', () => {
    it('should store and retrieve leads', () => {
      const mockLeads: ScoredLead[] = [
        {
          leadId: 'lead-1',
          companyName: 'Tech Corp',
          industry: 'Technology',
          companySize: 'medium',
          contactEmail: 'contact@techcorp.com',
          contactName: 'John Doe',
          createdAt: new Date(),
          updatedAt: new Date(),
          score: 85,
          icpFit: 90,
          industrySuitability: 80,
          sizeMatch: 85,
          stage: 'qualified',
          scoredAt: new Date(),
        },
      ];

      inMemoryStore.storeLeads(mockLeads);
      const retrieved = inMemoryStore.getLeads();

      expect(Array.isArray(retrieved)).toBe(true);
      expect(retrieved.length).toBeGreaterThan(0);
    });

    it('should store and retrieve lead pipeline metrics', () => {
      const mockMetrics: LeadPipelineMetrics = {
        totalLeads: 50,
        coldLeads: 20,
        warmLeads: 15,
        hotLeads: 10,
        qualifiedLeads: 5,
        nurtureCampaignLeads: 0,
        averageScore: 65,
        conversionRate: 10,
        topIndustries: [{ industry: 'Technology', count: 25 }],
        topCompanySizes: [{ size: 'medium', count: 30 }],
        timestamp: new Date(),
      };

      inMemoryStore.storeLeadPipelineMetrics(mockMetrics);
      const retrieved = inMemoryStore.getLeadPipelineMetrics();

      expect(retrieved).toBeDefined();
      expect(retrieved?.totalLeads).toBe(50);
      expect(retrieved?.conversionRate).toBe(10);
    });

    it('should have valid lead scores', () => {
      const mockLeads: ScoredLead[] = [
        {
          leadId: 'lead-1',
          companyName: 'Tech Corp',
          industry: 'Technology',
          companySize: 'medium',
          contactEmail: 'contact@techcorp.com',
          contactName: 'John Doe',
          createdAt: new Date(),
          updatedAt: new Date(),
          score: 85,
          icpFit: 90,
          industrySuitability: 80,
          sizeMatch: 85,
          stage: 'qualified',
          scoredAt: new Date(),
        },
      ];

      inMemoryStore.storeLeads(mockLeads);
      const retrieved = inMemoryStore.getLeads();

      if (retrieved.length > 0) {
        const lead = retrieved[0];
        expect(lead.score).toBeGreaterThanOrEqual(0);
        expect(lead.score).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('Health Check Operations', () => {
    it('should store and retrieve health report', () => {
      const mockReport: HealthReport = {
        reportId: 'report-1',
        timestamp: new Date(),
        totalEndpoints: 5,
        healthyEndpoints: 4,
        degradedEndpoints: 1,
        downEndpoints: 0,
        overallUptime: 99.8,
        averageLatency: 150,
        metrics: [],
        alerts: [],
      };

      inMemoryStore.storeHealthReport(mockReport);
      const retrieved = inMemoryStore.getHealthReport();

      expect(retrieved).toBeDefined();
      expect(retrieved?.reportId).toBe('report-1');
      expect(retrieved?.overallUptime).toBe(99.8);
    });

    it('should store and retrieve health alerts', () => {
      const mockAlert: HealthAlert = {
        alertId: 'alert-1',
        endpoint: '/api/health',
        severity: 'high',
        message: 'Endpoint degraded',
        timestamp: new Date(),
        resolved: false,
      };

      inMemoryStore.addHealthAlert(mockAlert);
      const retrieved = inMemoryStore.getHealthAlerts();

      expect(Array.isArray(retrieved)).toBe(true);
      expect(retrieved.length).toBeGreaterThan(0);
    });

    it('should have valid health uptime percentage', () => {
      const mockReport: HealthReport = {
        reportId: 'report-2',
        timestamp: new Date(),
        totalEndpoints: 3,
        healthyEndpoints: 3,
        degradedEndpoints: 0,
        downEndpoints: 0,
        overallUptime: 100,
        averageLatency: 100,
        metrics: [],
        alerts: [],
      };

      inMemoryStore.storeHealthReport(mockReport);
      const retrieved = inMemoryStore.getHealthReport();

      if (retrieved) {
        expect(retrieved.overallUptime).toBeGreaterThanOrEqual(0);
        expect(retrieved.overallUptime).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('Agent Run Operations', () => {
    it('should store and retrieve agent runs', () => {
      const mockRun: AgentRunResult = {
        agentName: 'Test Agent',
        status: 'completed',
        startedAt: new Date(),
        completedAt: new Date(),
        latencyMs: 100,
        tasksCompleted: 1,
        totalTasks: 1,
      };

      inMemoryStore.addAgentRun(mockRun);
      const runs = inMemoryStore.getAgentRuns();

      expect(Array.isArray(runs)).toBe(true);
      expect(runs.length).toBeGreaterThan(0);
    });

    it('should filter agent runs by name', () => {
      const mockRun1: AgentRunResult = {
        agentName: 'Agent A',
        status: 'completed',
        startedAt: new Date(),
        completedAt: new Date(),
        latencyMs: 100,
        tasksCompleted: 1,
        totalTasks: 1,
      };

      const mockRun2: AgentRunResult = {
        agentName: 'Agent B',
        status: 'completed',
        startedAt: new Date(),
        completedAt: new Date(),
        latencyMs: 200,
        tasksCompleted: 1,
        totalTasks: 1,
      };

      inMemoryStore.addAgentRun(mockRun1);
      inMemoryStore.addAgentRun(mockRun2);

      const agentARuns = inMemoryStore.getAgentRuns('Agent A');
      expect(agentARuns.length).toBeGreaterThan(0);
      agentARuns.forEach((run) => {
        expect(run.agentName).toBe('Agent A');
      });
    });

    it('should clear agent runs', () => {
      const mockRun: AgentRunResult = {
        agentName: 'Test Agent',
        status: 'completed',
        startedAt: new Date(),
        completedAt: new Date(),
        latencyMs: 100,
        tasksCompleted: 1,
        totalTasks: 1,
      };

      inMemoryStore.addAgentRun(mockRun);
      let runs = inMemoryStore.getAgentRuns();
      expect(runs.length).toBeGreaterThan(0);

      inMemoryStore.clearAgentRuns();
      runs = inMemoryStore.getAgentRuns();
      expect(runs).toHaveLength(0);
    });
  });

  describe('Store API Validation', () => {
    it('should have proper method signatures', () => {
      expect(typeof inMemoryStore.storeInvoices).toBe('function');
      expect(typeof inMemoryStore.getInvoices).toBe('function');
      expect(typeof inMemoryStore.storeBillingMetrics).toBe('function');
      expect(typeof inMemoryStore.getBillingMetrics).toBe('function');
      expect(typeof inMemoryStore.storeLeads).toBe('function');
      expect(typeof inMemoryStore.getLeads).toBe('function');
      expect(typeof inMemoryStore.storeHealthReport).toBe('function');
      expect(typeof inMemoryStore.getHealthReport).toBe('function');
      expect(typeof inMemoryStore.addHealthAlert).toBe('function');
      expect(typeof inMemoryStore.getHealthAlerts).toBe('function');
      expect(typeof inMemoryStore.addAgentRun).toBe('function');
      expect(typeof inMemoryStore.getAgentRuns).toBe('function');
      expect(typeof inMemoryStore.clearAgentRuns).toBe('function');
    });
  });
});
