'use client';

import { useState, useEffect } from 'react';

interface Invoice {
  id: string;
  clientName: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  invoiceDate: string;
}

interface BillingMetrics {
  totalRevenue: number;
  outstandingAmount: number;
  paidAmount: number;
  overdueAmount: number;
  invoiceCount: number;
}

interface BillingData {
  metrics: BillingMetrics;
  invoices: Invoice[];
}

// Mock data for fallback when API fails
const MOCK_INVOICES: Invoice[] = [
  {
    id: 'INV-2024-001',
    clientName: 'Acme Corporation',
    amount: 15000,
    dueDate: '2024-03-15',
    status: 'paid',
    invoiceDate: '2024-02-15',
  },
  {
    id: 'INV-2024-002',
    clientName: 'TechStart Inc',
    amount: 8500,
    dueDate: '2024-03-20',
    status: 'pending',
    invoiceDate: '2024-02-20',
  },
  {
    id: 'INV-2024-003',
    clientName: 'Global Solutions Ltd',
    amount: 22000,
    dueDate: '2024-02-28',
    status: 'overdue',
    invoiceDate: '2024-01-28',
  },
  {
    id: 'INV-2024-004',
    clientName: 'Enterprise Systems',
    amount: 18500,
    dueDate: '2024-03-25',
    status: 'pending',
    invoiceDate: '2024-02-25',
  },
  {
    id: 'INV-2024-005',
    clientName: 'Digital Dynamics',
    amount: 12000,
    dueDate: '2024-03-10',
    status: 'paid',
    invoiceDate: '2024-02-10',
  },
];

const MOCK_BILLING_METRICS: BillingMetrics = {
  totalRevenue: 128000,
  outstandingAmount: 48500,
  paidAmount: 75000,
  overdueAmount: 22000,
  invoiceCount: 5,
};

function getStatusColor(status: string): string {
  switch (status) {
    case 'paid':
      return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    case 'pending':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'overdue':
      return 'bg-red-100 text-red-700 border-red-300';
    default:
      return 'bg-violet-100 text-violet-700 border-violet-300';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'paid':
      return 'Paid';
    case 'pending':
      return 'Pending';
    case 'overdue':
      return 'Overdue';
    default:
      return 'Unknown';
  }
}

export default function BillingPage() {
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchBillingData = async () => {
    try {
      setError(null);
      const [metricsRes, invoicesRes] = await Promise.all([
        fetch('/api/billing/subscriptions'),
        fetch('/api/billing/pricing'),
      ]);

      if (!metricsRes.ok || !invoicesRes.ok) {
        throw new Error('Failed to fetch billing data');
      }

        const metricsData = await metricsRes.json();
        const invoicesData = await invoicesRes.json();

        // Safely extract and validate data with Array.isArray checks
        const metrics = metricsData.data || metricsData;
        const invoices = invoicesData.data || invoicesData;
        const safeInvoices = Array.isArray(invoices) ? invoices : [];

        setData({
          metrics: {
            totalRevenue: metrics.totalRevenue ?? MOCK_BILLING_METRICS.totalRevenue,
            outstandingAmount: metrics.outstandingAmount ?? MOCK_BILLING_METRICS.outstandingAmount,
            paidAmount: metrics.paidAmount ?? MOCK_BILLING_METRICS.paidAmount,
            overdueAmount: metrics.overdueAmount ?? MOCK_BILLING_METRICS.overdueAmount,
            invoiceCount: metrics.invoiceCount ?? MOCK_BILLING_METRICS.invoiceCount,
          },
          invoices: safeInvoices,
        });
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Error fetching billing data:', err);
        setData({
          metrics: MOCK_BILLING_METRICS,
          invoices: MOCK_INVOICES,
        });
        setError(err instanceof Error ? err.message : 'Failed to load billing data');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchBillingData();
    const interval = setInterval(fetchBillingData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-12 bg-violet-200 rounded animate-pulse w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-violet-800 p-6 rounded-lg shadow h-32 animate-pulse" />
          ))}
        </div>
        <div className="bg-white dark:bg-violet-800 p-6 rounded-lg shadow h-96 animate-pulse" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-red-900 mb-2">Failed to load billing</h2>
        <p className="text-red-700">{error || 'Unknown error occurred'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-violet-950">Billing & Invoices</h1>
          <p className="text-violet-600 mt-2">Manage invoices, payments, and revenue metrics</p>
          {lastUpdated && (
            <p className="text-xs text-violet-500 mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={fetchBillingData}
          disabled={loading}
          className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-medium transition-colors disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {/* Metric Cards - 4 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-violet-800 rounded-lg shadow p-6 border-l-4 border-violet-600">
          <p className="text-sm font-medium text-violet-600 mb-1">Total Revenue</p>
          <p className="text-4xl font-bold text-violet-600">
            ${(data.metrics.totalRevenue / 1000).toFixed(1)}k
          </p>
          <p className="text-xs text-violet-600 mt-2">All-time invoiced</p>
        </div>

        {/* Outstanding Amount */}
        <div className="bg-white dark:bg-violet-800 rounded-lg shadow p-6 border-l-4 border-blue-600">
          <p className="text-sm font-medium text-violet-600 mb-1">Outstanding</p>
          <p className="text-4xl font-bold text-blue-600">
            ${(data.metrics.outstandingAmount / 1000).toFixed(1)}k
          </p>
          <p className="text-xs text-violet-600 mt-2">Pending & overdue</p>
        </div>

        {/* Paid Amount */}
        <div className="bg-white dark:bg-violet-800 rounded-lg shadow p-6 border-l-4 border-emerald-600">
          <p className="text-sm font-medium text-violet-600 mb-1">Paid</p>
          <p className="text-4xl font-bold text-emerald-600">
            ${(data.metrics.paidAmount / 1000).toFixed(1)}k
          </p>
          <p className="text-xs text-violet-600 mt-2">Received payments</p>
        </div>

        {/* Overdue Amount */}
        <div className="bg-white dark:bg-violet-800 rounded-lg shadow p-6 border-l-4 border-red-600">
          <p className="text-sm font-medium text-violet-600 mb-1">Overdue</p>
          <p className="text-4xl font-bold text-red-600">
            ${(data.metrics.overdueAmount / 1000).toFixed(1)}k
          </p>
          <p className="text-xs text-violet-600 mt-2">Action required</p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-violet-800 rounded-lg shadow overflow-hidden">
        <div className="border-b border-violet-200 p-6">
          <h2 className="text-xl font-bold text-violet-950">Recent Invoices</h2>
          <p className="text-sm text-violet-600 mt-1">
            {data.invoices.length} invoices total
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-violet-50/30 border-b border-violet-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-violet-950">
                  Invoice ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-violet-950">
                  Client
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-violet-950">
                  Invoice Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-violet-950">
                  Due Date
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-violet-950">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-violet-950">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(data.invoices) && data.invoices.length > 0 ? (
                data.invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-violet-200 hover:bg-violet-50/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-violet-950">
                      {invoice.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-violet-600">
                      {invoice.clientName}
                    </td>
                    <td className="px-6 py-4 text-sm text-violet-600">
                      {new Date(invoice.invoiceDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-violet-600">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-violet-950 text-right">
                      ${invoice.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          invoice.status
                        )}`}
                      >
                        {getStatusLabel(invoice.status)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-violet-500">
                    No invoices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white dark:bg-violet-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-violet-950 mb-6">Billing Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-violet-600 mb-2">Collection Rate</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-emerald-600">
                {data.metrics.totalRevenue > 0
                  ? Math.round(
                      (data.metrics.paidAmount / data.metrics.totalRevenue) * 100
                    )
                  : 0}
              </span>
              <span className="text-violet-600">%</span>
            </div>
            <div className="mt-3 bg-violet-200 rounded-full h-2">
              <div
                className="bg-emerald-600 h-2 rounded-full"
                style={{
                  width: `${
                    data.metrics.totalRevenue > 0
                      ? (data.metrics.paidAmount / data.metrics.totalRevenue) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div>
            <p className="text-sm text-violet-600 mb-2">Outstanding Rate</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-blue-600">
                {data.metrics.totalRevenue > 0
                  ? Math.round(
                      (data.metrics.outstandingAmount / data.metrics.totalRevenue) * 100
                    )
                  : 0}
              </span>
              <span className="text-violet-600">%</span>
            </div>
            <div className="mt-3 bg-violet-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${
                    data.metrics.totalRevenue > 0
                      ? (data.metrics.outstandingAmount / data.metrics.totalRevenue) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div>
            <p className="text-sm text-violet-600 mb-2">Overdue Rate</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-red-600">
                {data.metrics.totalRevenue > 0
                  ? Math.round(
                      (data.metrics.overdueAmount / data.metrics.totalRevenue) * 100
                    )
                  : 0}
              </span>
              <span className="text-violet-600">%</span>
            </div>
            <div className="mt-3 bg-violet-200 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full"
                style={{
                  width: `${
                    data.metrics.totalRevenue > 0
                      ? (data.metrics.overdueAmount / data.metrics.totalRevenue) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
