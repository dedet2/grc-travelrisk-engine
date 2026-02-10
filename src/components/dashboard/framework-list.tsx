'use client';

import type { Framework } from '@/types';

interface FrameworkListProps {
  frameworks: Framework[];
  onSelect?: (framework: Framework) => void;
}

export function FrameworkList({ frameworks, onSelect }: FrameworkListProps) {
  if (frameworks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No frameworks available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {frameworks.map((framework) => (
        <div
          key={framework.id}
          className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition cursor-pointer"
          onClick={() => onSelect?.(framework)}
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{framework.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{framework.description}</p>
              <div className="flex gap-4 mt-3 text-xs text-gray-500">
                <span>v{framework.version}</span>
                <span className="capitalize">{framework.status}</span>
              </div>
            </div>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
              {framework.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
