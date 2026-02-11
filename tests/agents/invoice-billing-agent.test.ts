/**
 * Invoice & Billing Agent Tests (B-01)
 * Tests for agent instantiation, data collection, processing, and factory function
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  InvoiceBillingAgent,
  createInvoiceBillingAgent,
  type BillingMetrics,
  type InvoiceBillingRawData,
} from '@/lib/agents/invoice-billing-agent';
import type { AgentRunResult } from '@/lib/agents/base-agent';

describe('InvoiceBillingAgent', () => {
  let agent: InvoiceBillingAgent;

  beforeEach(() => {
    agent = new InvoiceBillingAgent();
  });

  describe('Agent Instantiation', () => {
    it('should create an instance with default config', () => {
      expect(agent).toBeDefined();
      expect(agent.getConfig().name).toBe('Invoice & Billing Agent (B-01)');
      expect(agent.getConfig().enabled).toBe(true);
    });

    it('should create an instance with custom config', () => {
      const customAgent = new InvoiceBillingAgent({
        maxRetries: 1,
        timeoutMs: 15000,
      });
      expect(customAgent.getConfig().maxRetries).toBe(1);
      expect(customAgent.getConfig().timeoutMs).toBe(15000);
    });

    it('should have idle status on creation', () => {
      expect(agent.getStatus()).toBe('idle');
    });
  });

  describe('collectData()', () => {
    it('should return expected data shape', async () => {
      const data = await agent.collectData();

      expect(data).toBeDefined();
      expect(data).toHaveProperty('clients');
      expect(data).toHaveProperty('invoices');
    });

    it('should return valid client data', async () => {
      const data = await agent.collectData();

      expect(Array.isArray(data.clients)).toBe(true);
      expect(data.clients.length).toBeGreaterThan(0);

      const client = data.clients[0];
      expect(client).toHaveProperty('clientId');
      expect(client).toHaveProperty('clientName');
      expect(client).toHaveProperty('email');
      expect(client).toHaveProperty('rate');
    });

    it('should return valid invoice data', async () => {
      const data = await agent.collectData();

      expect(Array.isArray(data.invoices)).toBe(true);
      expect(data.invoices.length).toBeGreaterThan(0);

      const invoice = data.invoices[0];
      expect(invoice).toHaveProperty('invoiceId');
      expect(invoice).toHaveProperty('clientId');
      expect(invoice).toHaveProperty('amount');
      expect(invoice).toHaveProperty('status');
      expect(['draft', 'sent', 'paid', 'overdue', 'cancelled']).toContain(invoice.status);
    });
  });

  describe('processData()', () => {
    let rawData: InvoiceBillingRawData;

    beforeEach(async () => {
      rawData = await agent.collectData();
    });

    it('should transform raw data correctly', async () => {
      const metrics = await agent.processData(rawData);

      expect(metrics).toHaveProperty('totalInvoiced');
      expect(metrics).toHaveProperty('totalPaid');
      expect(metrics).toHaveProperty('totalOutstanding');
      expect(metrics).toHaveProperty('averagePaymentDays');
      expect(metrics).toHaveProperty('paymentCollectionRate');
    });

    it('should calculate billing metrics correctly', async () => {
      const metrics = await agent.processData(rawData);

      expect(metrics.totalInvoiced).toBeGreaterThanOrEqual(0);
      expect(metrics.totalPaid).toBeGreaterThanOrEqual(0);
      expect(metrics.totalOutstanding).toBeGreaterThanOrEqual(0);
      expect(metrics.clientCount).toBe(rawData.clients.length);
      expect(metrics.invoiceCount).toBe(rawData.invoices.length);
    });

    it('should calculate collection rate between 0-100', async () => {
      const metrics = await agent.processData(rawData);

      expect(metrics.paymentCollectionRate).toBeGreaterThanOrEqual(0);
      expect(metrics.paymentCollectionRate).toBeLessThanOrEqual(100);
    });

    it('should have timestamp in processed data', async () => {
      const metrics = await agent.processData(rawData);

      expect(metrics.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Agent Factory Function', () => {
    it('should create valid agent instance', () => {
      const newAgent = createInvoiceBillingAgent();

      expect(newAgent).toBeInstanceOf(InvoiceBillingAgent);
      expect(newAgent.getConfig().name).toBe('Invoice & Billing Agent (B-01)');
    });

    it('should allow config customization via factory', () => {
      const customAgent = createInvoiceBillingAgent({
        maxRetries: 5,
      });

      expect(customAgent.getConfig().maxRetries).toBe(5);
    });
  });

  describe('Agent Methods', () => {
    it('should get all clients', () => {
      const clients = agent.getClients();

      expect(Array.isArray(clients)).toBe(true);
      expect(clients.length).toBeGreaterThan(0);
    });

    it('should get all invoices', () => {
      const invoices = agent.getInvoices();

      expect(Array.isArray(invoices)).toBe(true);
      expect(invoices.length).toBeGreaterThan(0);
    });

    it('should get invoices by status', () => {
      const paidInvoices = agent.getInvoicesByStatus('paid');

      expect(Array.isArray(paidInvoices)).toBe(true);
      paidInvoices.forEach((invoice) => {
        expect(invoice.status).toBe('paid');
      });
    });

    it('should add a new client', () => {
      const initialCount = agent.getClients().length;
      const newClient = {
        clientId: 'test-client',
        clientName: 'Test Corp',
        email: 'test@test.com',
        billingAddress: '123 Test St',
        rate: 100,
      };

      agent.addClient(newClient);
      const clients = agent.getClients();

      expect(clients.length).toBe(initialCount + 1);
      expect(clients.some((c) => c.clientId === 'test-client')).toBe(true);
    });
  });

  describe('Configuration', () => {
    it('should have correct agent name', () => {
      expect(agent.getConfig().name).toBe('Invoice & Billing Agent (B-01)');
    });

    it('should have description', () => {
      const config = agent.getConfig();
      expect(config.description).toBeDefined();
      expect(config.description.length).toBeGreaterThan(0);
    });

    it('should have reasonable timeout settings', () => {
      const config = agent.getConfig();
      expect(config.timeoutMs).toBeGreaterThan(0);
      expect(config.maxRetries).toBeGreaterThanOrEqual(0);
    });
  });
});
