'use client';

interface RiskScoreCardProps {
  score: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  subtitle?: string;
}

const riskColors = {
  low: 'bg-green-50 border-green-200 text-green-700',
  medium: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  high: 'bg-orange-50 border-orange-200 text-orange-700',
  critical: 'bg-red-50 border-red-200 text-red-700',
};

export function RiskScoreCard({
  score,
  riskLevel,
  title,
  subtitle,
}: RiskScoreCardProps) {
  return (
    <div
      className={`p-6 rounded-lg border ${riskColors[riskLevel]}`}
    >
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold">{score}</span>
        <span className="text-sm opacity-75">/100</span>
      </div>
      <p className="text-sm mt-2 opacity-75 capitalize">{riskLevel} Risk</p>
      {subtitle && <p className="text-xs mt-3 opacity-60">{subtitle}</p>}
    </div>
  );
}
