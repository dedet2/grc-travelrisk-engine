'use client';

import { useState, useEffect } from 'react';
import type { Alert } from '@/lib/notifications/alert-manager';

interface AlertToastProps {
  alert: Alert;
  onDismiss: () => void;
  autoDismissMs?: number;
}

function getPriorityBgColor(priority: string): string {
  switch (priority) {
    case 'critical':
      return 'bg-red-600';
    case 'high':
      return 'bg-orange-600';
    case 'medium':
      return 'bg-yellow-600';
    case 'low':
      return 'bg-blue-600';
    default:
      return 'bg-gray-600';
  }
}

function getPriorityIcon(priority: string): React.ReactNode {
  switch (priority) {
    case 'critical':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'high':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'medium':
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      );
  }
}

export default function AlertToast({
  alert,
  onDismiss,
  autoDismissMs = 5000,
}: AlertToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onDismiss();
    }, autoDismissMs);

    return () => clearTimeout(timer);
  }, [autoDismissMs, onDismiss]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 w-96 rounded-lg shadow-lg overflow-hidden animate-in slide-in-from-bottom-4 fade-in z-50`}
      style={{
        animation: 'slideInUp 0.3s ease-out',
      }}
    >
      <style>{`
        @keyframes slideInUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>

      <div className={`${getPriorityBgColor(alert.priority)} text-white`}>
        <div className="flex items-start gap-4 p-4">
          <div className="flex-shrink-0 mt-0.5">
            {getPriorityIcon(alert.priority)}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight">
              {alert.title}
            </h3>
            <p className="text-sm opacity-90 mt-1 line-clamp-2">
              {alert.message}
            </p>

            {alert.actionUrl && (
              <a
                href={alert.actionUrl}
                className="text-xs font-medium mt-2 inline-block opacity-90 hover:opacity-100 underline"
              >
                View Details →
              </a>
            )}
          </div>

          <button
            onClick={() => {
              setIsVisible(false);
              onDismiss();
            }}
            className="flex-shrink-0 text-white opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-white opacity-30 overflow-hidden">
          <div
            className="h-full bg-white"
            style={{
              animation: `shrink ${autoDismissMs}ms linear`,
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
