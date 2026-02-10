'use client';

import type { AgentRun } from '@/types';

interface AgentStatusCardProps {
  run: AgentRun;
}

export function AgentStatusCard({ run }: AgentStatusCardProps) {
  const statusColors = {
    pending: 'bg-gray-100 text-gray-800',
    running: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };

  return (
    <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{run.agentName}</h3>
          <p className="text-sm text-gray-600 mt-1">{run.taskTitle}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[run.status]}`}
        >
          {run.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-600">Progress</p>
          <p className="text-lg font-semibold">
            {run.tasksCompleted}/{run.totalTasks}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Latency</p>
          <p className="text-lg font-semibold">{run.latencyMs}ms</p>
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded text-xs space-y-1">
        <div className="flex justify-between">
          <span>Input Tokens:</span>
          <span className="font-medium">{run.inputTokens}</span>
        </div>
        <div className="flex justify-between">
          <span>Output Tokens:</span>
          <span className="font-medium">{run.outputTokens}</span>
        </div>
        <div className="flex justify-between text-blue-600 font-medium">
          <span>Cost:</span>
          <span>${run.costUsd.toFixed(4)}</span>
        </div>
      </div>

      {run.errorMessage && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          {run.errorMessage}
        </div>
      )}
    </div>
  );
}
