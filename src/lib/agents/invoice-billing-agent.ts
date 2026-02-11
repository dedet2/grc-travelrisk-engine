/**
 * Invoice & Billing Agent (B-01)
 * Manages invoice generation, payment tracking, and revenue metrics
 * Lifecycle: collectData → processData → updateDashboard
 */

import { BaseAgent, type AgentConfig, type AgentRunResult } from './base-agent';
import { inMemoryStore } from '@/lib/store/in-memory-store';

export interface ClientData {
  clientId: string;
  clientName: string;
  email: string;
  billingAddress: string;
  rate: number;
}

export interface InvoiceData {
  invoiceId: string;
  clientId: string;
  clientName: string;
  amount: number;
  currency: string;
  issueDate: Date;
  dueDate: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BillingMetrics {
  totalInvoiced: number;
  totalPaid: number;
  totalOutstanding: number;
  averagePaymentDays: number;
  recurringRevenueMonthly: number;
  paymentCollectionRate: number;
  overduInvoiceCount: number;
  clientCount: number;
  invoiceCount: number;
  timestamp: Date;
}

export interface InvoiceBillingRawData {
  clients: ClientData[];
  invoices: InvoiceData[];
}

/**
 * Invoice & Billing Agent
 * Handles invoice generation, payment tracking, and financial metrics
 */
export class InvoiceBillingAgent extends BaseAgent<InvoiceBillingRawData, BillingMetrics> {
  private mockClients: ClientData[] = [];
  private mockInvoices: InvoiceData[] = [];

  constructor(config?: Partial<AgentConfig>) {
    super({
      name: 'Invoice & Billing Agent (B-01)',
      description: 'Manages invoicing, payment tracking, and revenue metrics',
      maxRetries: 2,
      timeoutMs: 30000,
      enabled: true,
      ...config,
    });

    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Initialize mock clients
    this.mockClients = [
      {
        clientId: 'client-001',
        clientName: 'Acme Corp',
        email: 'billing@acmecorp.com',
        billingAddress: '123 Business St, New York, NY 10001',
        rate: 150,
      },
      {
        clientId: 'client-002',
        clientName: 'TechStart Inc',
        email: 'finance@techstart.io',
        billingAddress: '456 Innovation Ave, San Francisco, CA 94105',
        rate: 200,
      },
      {
        clientId: 'client-003',
        clientName: 'Global Solutions Ltd',
        email: 'accounts@globalsol.uk',
        billingAddress: '789 Enterprise Way, London, UK W1A 1AA',
        rate: 175,
      },
    ];

    // Initialize mock invoices
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    this.mockInvoices = [
      {
        invoiceId: 'INV-2024-001',
        clientId: 'client-001',
        clientName: 'Acme Corp',
        amount: 4500,
        currency: 'USD',
        issueDate: ninetyDaysAgo,
        dueDate: new Date(ninetyDaysAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
        status: 'paid',
        items: [
          {
            description: 'Consulting Services - January',
            quantity: 30,
            unitPrice: 150,
            total: 4500,
          },
        ],
        createdAt: ninetyDaysAgo,
        updatedAt: new Date(ninetyDaysAgo.getTime() + 5 * 24 * 60 * 60 * 1000),
      },
      {
        invoiceId: 'INV-2024-002',
        clientId: 'client-002',
        clientName: 'TechStart Inc',
        amount: 6000,
        currency: 'USD',
        issueDate: sixtyDaysAgo,
        dueDate: new Date(sixtyDaysAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
        status: 'paid',
        items: [
          {
            description: 'Development Services - February',
            quantity: 30,
            unitPrice: 200,
            total: 6000,
          },
        ],
        createdAt: sixtyDaysAgo,
        updatedAt: new Date(sixtyDaysAgo.getTime() + 10 * 24 * 60 * 60 * 1000),
      },
      {
        invoiceId: 'INV-2024-003',
        clientId: 'client-001',
        clientName: 'Acme Corp',
        amount: 4500,
        currency: 'USD',
        issueDate: thirtyDaysAgo,
        dueDate: new Date(thirtyDaysAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
        status: 'sent',
        items: [
          {
            description: 'Consulting Services - March',
            quantity: 30,
            unitPrice: 150,
            total: 4500,
          },
        ],
        createdAt: thirtyDaysAgo,
        updatedAt: thirtyDaysAgo,
      },
      {
        invoiceId: 'INV-2024-004',
        clientId: 'client-003',
        clientName: 'Global Solutions Ltd',
        amount: 5250,
        currency: 'USD',
        issueDate: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
        dueDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        status: 'overdue',
        items: [
          {
            description: 'Audit Services - February',
            quantity: 30,
            unitPrice: 175,
            total: 5250,
          },
        ],
        createdAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
      },
    ];
  }

  /**
   * Collect client and invoice data
   */
  async collectData(): Promise<InvoiceBillingRawData> {
    // Simulate data collection delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      clients: this.mockClients,
      invoices: this.mockInvoices,
    };
  }

  /**
   * Process data to calculate billing metrics
   */
  async processData(rawData: InvoiceBillingRawData): Promise<BillingMetrics> {
    const { invoices } = rawData;

    // Calculate totals
    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalPaid = invoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.amount, 0);
    const totalOutstanding = invoices
      .filter((inv) => inv.status === 'sent' || inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.amount, 0);

    // Calculate average payment days
    const paidInvoices = invoices.filter((inv) => inv.status === 'paid');
    let averagePaymentDays = 0;
    if (paidInvoices.length > 0) {
      const totalDays = paidInvoices.reduce((sum, inv) => {
        const daysDiff = Math.floor(
          (inv.updatedAt.getTime() - inv.issueDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        return sum + daysDiff;
      }, 0);
      averagePaymentDays = Math.round(totalDays / paidInvoices.length);
    }

    // Calculate monthly recurring revenue (assume invoices are monthly)
    const recurringRevenueMonthly = invoices
      .filter((inv) => inv.status !== 'cancelled')
      .reduce((sum, inv) => sum + inv.amount / 30, 0); // Approximate daily rate

    // Calculate collection rate
    const paymentCollectionRate =
      totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0;

    // Count overdue invoices
    const overduInvoiceCount = invoices.filter((inv) => inv.status === 'overdue').length;

    return {
      totalInvoiced,
      totalPaid,
      totalOutstanding,
      averagePaymentDays,
      recurringRevenueMonthly: Math.round(recurringRevenueMonthly),
      paymentCollectionRate,
      overduInvoiceCount,
      clientCount: rawData.clients.length,
      invoiceCount: invoices.length,
      timestamp: new Date(),
    };
  }

  /**
   * Store processed metrics in the data store
   */
  async updateDashboard(processedData: BillingMetrics): Promise<void> {
    // Store invoices in the store
    inMemoryStore.storeInvoices(this.mockInvoices);
    inMemoryStore.storeBillingMetrics(processedData);

    // Simulate dashboard update delay
    await new Promise((resolve) => setTimeout(resolve, 50));

    console.log('[InvoiceBillingAgent] Dashboard updated with billing metrics');
  }

  /**
   * Create a new invoice
   */
  async createInvoice(
    clientId: string,
    items: { description: string; quantity: number; unitPrice: number }[]
  ): Promise<InvoiceData> {
    const client = this.mockClients.find((c) => c.clientId === clientId);
    if (!client) {
      throw new Error(`Client ${clientId} not found`);
    }

    const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const now = new Date();
    const invoiceId = `INV-${now.getFullYear()}-${String(this.mockInvoices.length + 1).padStart(3, '0')}`;

    const invoice: InvoiceData = {
      invoiceId,
      clientId,
      clientName: client.clientName,
      amount: total,
      currency: 'USD',
      issueDate: now,
      dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      status: 'draft',
      items: items.map((item) => ({
        ...item,
        total: item.quantity * item.unitPrice,
      })),
      createdAt: now,
      updatedAt: now,
    };

    this.mockInvoices.push(invoice);
    inMemoryStore.storeInvoices(this.mockInvoices);

    return invoice;
  }

  /**
   * Update invoice status
   */
  async updateInvoiceStatus(
    invoiceId: string,
    status: InvoiceData['status']
  ): Promise<InvoiceData | null> {
    const invoice = this.mockInvoices.find((inv) => inv.invoiceId === invoiceId);
    if (!invoice) {
      return null;
    }

    invoice.status = status;
    invoice.updatedAt = new Date();
    inMemoryStore.storeInvoices(this.mockInvoices);

    return invoice;
  }

  /**
   * Get all invoices
   */
  getInvoices(): InvoiceData[] {
    return [...this.mockInvoices];
  }

  /**
   * Get invoices by client
   */
  getInvoicesByClient(clientId: string): InvoiceData[] {
    return this.mockInvoices.filter((inv) => inv.clientId === clientId);
  }

  /**
   * Get invoices by status
   */
  getInvoicesByStatus(status: InvoiceData['status']): InvoiceData[] {
    return this.mockInvoices.filter((inv) => inv.status === status);
  }

  /**
   * Get a single invoice
   */
  getInvoice(invoiceId: string): InvoiceData | null {
    return this.mockInvoices.find((inv) => inv.invoiceId === invoiceId) || null;
  }

  /**
   * Get all clients
   */
  getClients(): ClientData[] {
    return [...this.mockClients];
  }

  /**
   * Add a client
   */
  addClient(client: ClientData): void {
    this.mockClients.push(client);
  }
}

/**
 * Factory function to create an InvoiceBillingAgent instance
 */
export function createInvoiceBillingAgent(
  config?: Partial<AgentConfig>
): InvoiceBillingAgent {
  return new InvoiceBillingAgent(config);
}
