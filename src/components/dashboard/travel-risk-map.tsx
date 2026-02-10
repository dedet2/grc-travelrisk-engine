'use client';

import type { TripRiskReport } from '@/types';

interface TravelRiskMapProps {
  reports: TripRiskReport[];
  onSelect?: (report: TripRiskReport) => void;
}

export function TravelRiskMap({ reports, onSelect }: TravelRiskMapProps) {
  if (reports.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No travel risk reports yet</p>
        <p className="text-sm">Create a new report to visualize travel risks</p>
      </div>
    );
  }

  const getRiskColor = (score: number) => {
    if (score <= 25) return 'bg-green-100 text-green-800 border-green-300';
    if (score <= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (score <= 75) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div
          key={report.id}
          className={`p-4 border rounded-lg cursor-pointer hover:shadow-md transition ${getRiskColor(report.combinedScore)}`}
          onClick={() => onSelect?.(report)}
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">
                {report.destinationCountry}
              </h3>
              <p className="text-sm opacity-75 mt-1">
                {new Date(report.departureDate).toLocaleDateString()} -
                {new Date(report.returnDate).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{report.combinedScore}</div>
              <p className="text-xs opacity-75">Combined Risk</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="opacity-75">GRC Score:</span>
              <span className="font-semibold ml-2">{report.grcScore}</span>
            </div>
            <div>
              <span className="opacity-75">Travel Score:</span>
              <span className="font-semibold ml-2">{report.travelScore}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
