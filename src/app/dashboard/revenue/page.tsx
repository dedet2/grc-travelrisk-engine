'use client';

import { useState, useEffect } from 'react';

// SVG Icons as inline components
const IconTrendingUp = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const IconUsers = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconDollar = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const IconPercentage = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="7" cy="7" r="2" />
    <circle cx="17" cy="17" r="2" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </svg>
);

const IconCheck = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

interface BillingData {
  mrr: number;
  arr: number;
  subscriptions: number;
  churnRate: number;
  breakdown: Array<{ plan: string; monthly: number; seats: number }>;
  recentTransactions: Array<{
    date: string;
    customer: string;
    plan: string;
    amount: number;
    status: string;
  }>;
}

const mockBillingData: BillingData = {
  mrr: 12400,
  arr: 148800,
  subscriptions: 23,
  churnRate: 2.1,
  breakdown: [
    { plan: 'Enterprise', monthly: 8500, seats: 8 },
    { plan: 'Professional', monthly: 2900, seats: 12 },
    { plan: 'Starter', monthly: 1000, seats: 3 }
  ],
  recentTransactions: [
    { date: '2024-01-10', customer: 'Acme Corp', plan: 'Enterprise', amount: 2500, status: 'Completed' },
    { date: '2024-01-09', customer: 'TechFlow Inc', plan: 'Professional', amount: 290, status: 'Completed' },
    { date: '2024-01-08', customer: 'Global Solutions', plan: 'Enterprise', amount: 2500, status: 'Completed' },
    { date: '2024-01-07', customer: 'DataSys LLC', plan: 'Starter', amount: 100, status: 'Completed' },
    { date: '2024-01-06', customer: 'NextGen AI', plan: 'Professional', amount: 290, status: 'Completed' },
    { date: '2024-01-05', customer: 'SecureNet Corp', plan: 'Enterprise', amount: 2500, status: 'Completed' },
    { date: '2024-01-04', customer: 'CloudBase Inc', plan: 'Professional', amount: 290, status: 'Pending' },
    { date: '2024-01-03', customer: 'InnovateLabs', plan: 'Starter', amount: 100, status: 'Completed' }
  ]
};

export default function RevenuePage() {
  const [billingData, setBillingData] = useState<BillingData>(mockBillingData);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchBillingData = async () => {
    try {
      const response = await fetch('/api/billing/subscriptions');
      if (response.ok) {
        const data = await response.json();
        const apiData = data.data || data;
        if (
          apiData &&
          typeof apiData.mrr === 'number' &&
          Array.isArray(apiData.breakdown) &&
          Array.isArray(apiData.recentTransactions)
        ) {
          setBillingData(apiData);
          setLastUpdated(new Date());
        } else {
          setBillingData(mockBillingData);
        }
      } else {
        setBillingData(mockBillingData);
      }
    } catch (error) {
      console.error('Failed to fetch billing data:', error);
      setBillingData(mockBillingData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
    const interval = setInterval(fetchBillingData, 60000);
    return () => clearInterval(interval);
  }, []);

  const revenueData = [
    { month: 'Aug', value: 4200 },
    { month: 'Sep', value: 5800 },
    { month: 'Oct', value: 7200 },
    { month: 'Nov', value: 9600 },
    { month: 'Dec', value: 11100 },
    { month: 'Jan', value: 12400 }
  ];

  const maxValue = Math.max(...revenueData.map(d => d.value));
  const chartHeight = 200;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900 dark:to-violet-800 p-8">
      {/* Header */}
      <div className="mb-12 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-violet-950 dark:text-white mb-2">Subscription Revenue</h1>
          <p className="text-lg text-violet-600 dark:text-violet-200">Monitor your SaaS revenue and subscription metrics</p>
          {lastUpdated && (
            <p className="text-xs text-violet-500 dark:text-violet-300 mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={fetchBillingData}
          disabled={isLoading}
          className="px-4 py-2 bg-violet-600 dark:bg-violet-700 text-white rounded-lg hover:bg-violet-700 dark:hover:bg-violet-800 font-medium transition-colors disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* MRR Card */}
        <div className="bg-white dark:bg-violet-800 rounded-xl shadow-sm hover:shadow-md transition p-6 border border-violet-200 dark:border-violet-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-violet-600 dark:text-violet-300">Monthly Recurring Revenue</span>
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <IconDollar />
            </div>
          </div>
          <p className="text-3xl font-bold text-violet-950 dark:text-white mb-2">${billingData.mrr.toLocaleString()}</p>
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">+12% vs last month</p>
        </div>

        {/* ARR Card */}
        <div className="bg-white dark:bg-violet-800 rounded-xl shadow-sm hover:shadow-md transition p-6 border border-violet-200 dark:border-violet-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-violet-600 dark:text-violet-300">Annual Recurring Revenue</span>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
              <IconTrendingUp />
            </div>
          </div>
          <p className="text-3xl font-bold text-violet-950 dark:text-white mb-2">${billingData.arr.toLocaleString()}</p>
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">+144% YoY</p>
        </div>

        {/* Active Subscriptions Card */}
        <div className="bg-white dark:bg-violet-800 rounded-xl shadow-sm hover:shadow-md transition p-6 border border-violet-200 dark:border-violet-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-violet-600 dark:text-violet-300">Active Subscriptions</span>
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <IconUsers />
            </div>
          </div>
          <p className="text-3xl font-bold text-violet-950 dark:text-white mb-2">{billingData.subscriptions}</p>
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">+4 this month</p>
        </div>

        {/* Churn Rate Card */}
        <div className="bg-white dark:bg-violet-800 rounded-xl shadow-sm hover:shadow-md transition p-6 border border-violet-200 dark:border-violet-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-violet-600 dark:text-violet-300">Monthly Churn Rate</span>
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <IconPercentage />
            </div>
          </div>
          <p className="text-3xl font-bold text-violet-950 dark:text-white mb-2">{billingData.churnRate}%</p>
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">-0.3% improvement</p>
        </div>
      </div>

      {/* Revenue Breakdown and Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Revenue Breakdown Table */}
        <div className="lg:col-span-1 bg-white dark:bg-violet-800 rounded-xl shadow-sm p-6 border border-violet-200 dark:border-violet-700">
          <h2 className="text-lg font-bold text-violet-950 dark:text-white mb-6">Plan Breakdown</h2>
          <div className="space-y-4">
            {billingData.breakdown.map((plan, idx) => (
              <div key={idx} className="flex items-center justify-between pb-4 border-b border-violet-100 dark:border-violet-700 last:border-0">
                <div>
                  <p className="font-medium text-violet-950 dark:text-white">{plan.plan}</p>
                  <p className="text-sm text-violet-500 dark:text-violet-300">{plan.seats} seats</p>
                </div>
                <p className="font-bold text-violet-950 dark:text-white">${plan.monthly.toLocaleString()}/mo</p>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t-2 border-violet-200 dark:border-violet-700">
            <div className="flex justify-between items-center">
              <p className="font-semibold text-violet-950 dark:text-white">Total</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                ${billingData.breakdown.reduce((sum, p) => sum + p.monthly, 0).toLocaleString()}/mo
              </p>
            </div>
          </div>
        </div>

        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-violet-800 rounded-xl shadow-sm p-6 border border-violet-200 dark:border-violet-700">
          <h2 className="text-lg font-bold text-violet-950 dark:text-white mb-6">Revenue Trend (Last 6 Months)</h2>
          <div className="flex items-end justify-between gap-2" style={{ height: chartHeight }}>
            {revenueData.map((data, idx) => {
              const heightPercent = (data.value / maxValue) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 dark:from-blue-600 dark:to-blue-500 rounded-t-md transition-all group-hover:from-blue-600 group-hover:to-blue-500 relative"
                    style={{ height: `${heightPercent}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -tranviolet-x-1/2 bg-violet-950 dark:bg-violet-700 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                      ${data.value.toLocaleString()}
                    </div>
                  </div>
                  <span className="text-xs font-medium text-violet-600 dark:text-violet-300 mt-2">{data.month}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex items-center gap-2 text-sm text-violet-600 dark:text-violet-300">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Revenue growth: ${revenueData[0].value.toLocaleString()} → ${revenueData[revenueData.length - 1].value.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white dark:bg-violet-800 rounded-xl shadow-sm border border-violet-200 dark:border-violet-700 overflow-hidden">
        <div className="p-6 border-b border-violet-200 dark:border-violet-700">
          <h2 className="text-lg font-bold text-violet-950 dark:text-white">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-violet-50/30 dark:bg-violet-700/50">
              <tr className="border-b border-violet-200 dark:border-violet-700">
                <th className="text-left py-4 px-6 text-sm font-semibold text-violet-950 dark:text-violet-50">Date</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-violet-950 dark:text-violet-50">Customer</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-violet-950 dark:text-violet-50">Plan</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-violet-950 dark:text-violet-50">Amount</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-violet-950 dark:text-violet-50">Status</th>
              </tr>
            </thead>
            <tbody>
              {billingData.recentTransactions.map((transaction, idx) => (
                <tr key={idx} className="border-b border-violet-100 dark:border-violet-700 hover:bg-violet-50/30 dark:hover:bg-violet-700/30 transition">
                  <td className="py-4 px-6 text-sm text-violet-600 dark:text-violet-200">{transaction.date}</td>
                  <td className="py-4 px-6 text-sm font-medium text-violet-950 dark:text-white">{transaction.customer}</td>
                  <td className="py-4 px-6 text-sm text-violet-600 dark:text-violet-200">{transaction.plan}</td>
                  <td className="py-4 px-6 text-sm font-semibold text-violet-950 dark:text-white">${transaction.amount}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {transaction.status === 'Completed' ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">{transaction.status}</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                          <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">{transaction.status}</span>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
