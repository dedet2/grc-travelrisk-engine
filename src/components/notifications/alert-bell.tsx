'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Alert } from '@/lib/notifications/alert-manager';

interface AlertResponse {
  success: boolean;
  data: {
    alerts: Alert[];
    stats: {
      total: number;
      critical: number;
      high: number;
      medium: number;
      low: number;
      info: number;
    };
  };
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'low':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

function getPriorityIconColor(priority: string): string {
  switch (priority) {
    case 'critical':
      return 'text-red-600';
    case 'high':
      return 'text-orange-600';
    case 'medium':
      return 'text-yellow-600';
    case 'low':
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
}

export default function AlertBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState({ total: 0, critical: 0, high: 0, medium: 0, low: 0, info: 0 });
  const [loading, setLoading] = useState(false);

  // Fetch alerts on mount and periodically
  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/notifications?limit=10');
        if (response.ok) {
          const data = (await response.json()) as AlertResponse;
          setAlerts(data.data.alerts);
          setStats(data.data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();

    // Refresh every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = async (alertId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'dismiss',
          alertId,
        }),
      });

      // Refresh alerts
      setAlerts(alerts.filter((a) => a.id !== alertId));
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="View notifications"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge */}
        {stats.total > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
            {Math.min(stats.total, 9)}
            {stats.total > 9 ? '+' : ''}
          </span>
        )}
      </button>

      {/* Dropdown Popup */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Alert Stats Summary */}
          {stats.total > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 grid grid-cols-5 gap-2 text-center text-xs">
              <div>
                <div className="font-bold text-red-600">{stats.critical}</div>
                <div className="text-gray-600">Critical</div>
              </div>
              <div>
                <div className="font-bold text-orange-600">{stats.high}</div>
                <div className="text-gray-600">High</div>
              </div>
              <div>
                <div className="font-bold text-yellow-600">{stats.medium}</div>
                <div className="text-gray-600">Medium</div>
              </div>
              <div>
                <div className="font-bold text-blue-600">{stats.low}</div>
                <div className="text-gray-600">Low</div>
              </div>
              <div>
                <div className="font-bold text-gray-600">{stats.info}</div>
                <div className="text-gray-600">Info</div>
              </div>
            </div>
          )}

          {/* Alerts List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-6 py-8 text-center text-gray-600">
                <div className="animate-spin inline-block w-4 h-4 border-2 border-gray-300 border-t-indigo-600 rounded-full"></div>
                <p className="mt-2">Loading alerts...</p>
              </div>
            ) : alerts.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`px-6 py-4 hover:bg-gray-50 transition-colors border-l-4 ${
                      alert.priority === 'critical'
                        ? 'border-red-500'
                        : alert.priority === 'high'
                          ? 'border-orange-500'
                          : alert.priority === 'medium'
                            ? 'border-yellow-500'
                            : alert.priority === 'low'
                              ? 'border-blue-500'
                              : 'border-gray-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(
                              alert.priority
                            )} border`}
                          >
                            {alert.priority.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-900 text-sm">{alert.title}</h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{alert.message}</p>
                      </div>
                      <button
                        onClick={() => handleDismiss(alert.id)}
                        className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 text-lg"
                        title="Dismiss alert"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Action Link */}
                    {alert.actionUrl && (
                      <div className="mt-2">
                        <Link
                          href={alert.actionUrl}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
                        >
                          View Details →
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-8 text-center text-gray-600">
                <svg
                  className="mx-auto w-12 h-12 text-gray-300 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <p className="text-sm">No notifications</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {alerts.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                View all notifications →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
