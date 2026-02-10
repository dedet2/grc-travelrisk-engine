'use client';

import type { AgentRun } from '@/types';

interface AgentMetricsTableProps {
  runs: AgentRun[];
}

export function AgentMetricsTable({ runs }: AgentMetricsTableProps) {
  if (runs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No agent runs yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-200">
          <tr className="text-left text-gray-600">
            <th className="px-4 py-3 font-semibold">Agent</th>
            <th className="px-4 py-3 font-semibold">Task</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold text-right">Tokens</th>
            <th className="px-4 py-3 font-semibold text-right">Cost</th>
            <th className="px-4 py-3 font-semibold text-right">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {runs.map((run) => (
            <tr key={run.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <span className="font-medium">{run.agentName}</span>
              </td>
              <td className="px-4 py-3 text-gray-600">{run.taskTitle}</td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    run.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : run.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {run.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right text-gray-600">
                {run.inputTokens + run.outputTokens}
              </td>
              <td className="px-4 py-3 text-right text-gray-600">
                ${run.costUsd.toFixed(4)}
              </td>
              <td className="px-4 py-3 text-right text-gray-600">
                {run.latencyMs}ms
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
