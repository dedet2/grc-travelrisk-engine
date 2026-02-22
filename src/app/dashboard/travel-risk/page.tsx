'use client';

import { useState, useEffect, useMemo } from 'react';

/* ------------------------------------------------------------------ */
/*  Types matching TravelDestination from advisory-fetcher             */
/* ------------------------------------------------------------------ */
interface SecurityThreat {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

interface HealthRisk {
  disease: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  recommended_vaccines?: string[];
}

interface NaturalDisasterRisk {
  type: string;
  probability: 'low' | 'medium' | 'high';
  season?: string;
  description: string;
}

interface TravelDestination {
  countryCode: string;
  countryName: string;
  advisoryLevel: 1 | 2 | 3 | 4;
  riskScore: number;
  securityThreats: SecurityThreat[];
  healthRisks: HealthRisk[];
  naturalDisasterRisk: NaturalDisasterRisk[];
  infrastructureScore: number;
  lastUpdated: string;
  advisoryText: string;
}

/* ------------------------------------------------------------------ */
/*  Country code → emoji flag                                          */
/* ------------------------------------------------------------------ */
function getFlag(code: string): string {
  const base = 0x1f1e6;
  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split('')
      .map((c) => base + c.charCodeAt(0) - 65)
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function getRiskLevelColor(level: 1 | 2 | 3 | 4) {
  switch (level) {
    case 1:
      return { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-400', label: 'Level 1: Exercise Normal Precautions' };
    case 2:
      return { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-400', label: 'Level 2: Exercise Increased Caution' };
    case 3:
      return { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-400', label: 'Level 3: Reconsider Travel' };
    case 4:
      return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', border: 'border-red-500', label: 'Level 4: Do Not Travel' };
  }
}

function getInfraColor(score: number): string {
  if (score >= 85) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 70) return 'text-amber-600 dark:text-amber-400';
  if (score >= 50) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}

function getSeverityBadge(severity: string) {
  switch (severity) {
    case 'critical':
      return 'bg-red-200 text-red-800 dark:bg-red-900/40 dark:text-red-300';
    case 'high':
      return 'bg-orange-200 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300';
    case 'medium':
      return 'bg-amber-200 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
    default:
      return 'bg-emerald-200 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
  }
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
export default function TravelRiskPage() {
  const [destinations, setDestinations] = useState<TravelDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<number | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ destination: '', departureDate: '', returnDate: '', purpose: 'business' });

  /* Fetch real destinations from API */
  const fetchData = async () => {
    try {
      setError(null);
      const levelParam = filterLevel ? `&level=${filterLevel}` : '';
      const searchParam = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
      const res = await fetch(`/api/travel/destinations?_=${Date.now()}${levelParam}${searchParam}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setDestinations(json.data);
          setLastUpdated(new Date());
        } else {
          setError(json.error || 'No data returned');
        }
      } else {
        setError(`API returned ${res.status}`);
      }
    } catch (err) {
      console.error('Error fetching travel destinations:', err);
      setError('Failed to load travel risk data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  /* Computed stats */
  const stats = useMemo(() => {
    const total = destinations.length;
    const activeAdvisories = destinations.filter(d => d.advisoryLevel >= 2).length;
    const highRisk = destinations.filter(d => d.advisoryLevel >= 3).length;
    const criticalAlerts = destinations.filter(d => d.advisoryLevel === 4).length;
    return { total, activeAdvisories, highRisk, criticalAlerts };
  }, [destinations]);

  /* Client-side filter (in addition to API filter) */
  const filtered = useMemo(() => {
    let list = destinations;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(d => d.countryName.toLowerCase().includes(q) || d.countryCode.toLowerCase().includes(q));
    }
    if (filterLevel) {
      list = list.filter(d => d.advisoryLevel === filterLevel);
    }
    return list;
  }, [destinations, searchQuery, filterLevel]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/travel-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: formData.destination, countryCode: formData.destination }),
      });
      if (res.ok) {
        setFormData({ destination: '', departureDate: '', returnDate: '', purpose: 'business' });
        setShowForm(false);
      }
    } catch (err) {
      console.error('Error creating assessment:', err);
    }
  };

  /* Loading skeleton */
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-12 bg-violet-200 dark:bg-violet-700 rounded animate-pulse w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-violet-200 dark:bg-violet-700 rounded-lg animate-pulse" />)}
        </div>
        <div className="h-64 bg-violet-200 dark:bg-violet-700 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-violet-950 dark:text-violet-50">Travel Risk Intelligence</h1>
          <p className="text-violet-600 dark:text-violet-300 mt-2">
            Real-time global travel advisories across {stats.total} destinations &mdash; security threats, health risks, natural disasters &amp; infrastructure scores
          </p>
          {lastUpdated && (
            <p className="text-xs text-violet-500 dark:text-violet-400 mt-1">
              Last refreshed: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} className="px-4 py-2 bg-violet-200 dark:bg-violet-700 text-violet-950 dark:text-violet-50 rounded-lg hover:bg-violet-300 dark:hover:bg-violet-600 font-medium transition-colors">
            Refresh
          </button>
          <button onClick={() => setShowForm(!showForm)} className="px-5 py-2 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-lg hover:opacity-90 font-medium transition-opacity">
            + New Trip Assessment
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-4 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* ── Risk Level Legend ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {([1, 2, 3, 4] as const).map(level => {
          const c = getRiskLevelColor(level);
          const count = destinations.filter(d => d.advisoryLevel === level).length;
          const isActive = filterLevel === level;
          return (
            <button
              key={level}
              onClick={() => setFilterLevel(isActive ? null : level)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${isActive ? `${c.border} ring-2 ring-offset-1 ring-violet-400` : 'border-transparent'} ${c.bg}`}
            >
              <p className={`font-bold text-sm ${c.text}`}>{c.label}</p>
              <p className="text-xs mt-1 text-violet-600 dark:text-violet-300">{count} destination{count !== 1 ? 's' : ''}</p>
            </button>
          );
        })}
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-violet-800 rounded-lg shadow-sm p-5 border-l-4 border-blue-500">
          <p className="text-xs font-medium text-violet-600 dark:text-violet-300 uppercase tracking-wider">Destinations Monitored</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-violet-800 rounded-lg shadow-sm p-5 border-l-4 border-amber-500">
          <p className="text-xs font-medium text-violet-600 dark:text-violet-300 uppercase tracking-wider">Active Advisories</p>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.activeAdvisories}</p>
        </div>
        <div className="bg-white dark:bg-violet-800 rounded-lg shadow-sm p-5 border-l-4 border-orange-500">
          <p className="text-xs font-medium text-violet-600 dark:text-violet-300 uppercase tracking-wider">High-Risk Zones</p>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">{stats.highRisk}</p>
        </div>
        <div className="bg-white dark:bg-violet-800 rounded-lg shadow-sm p-5 border-l-4 border-red-500">
          <p className="text-xs font-medium text-violet-600 dark:text-violet-300 uppercase tracking-wider">Do-Not-Travel</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.criticalAlerts}</p>
        </div>
      </div>

      {/* ── Trip Assessment Form ── */}
      {showForm && (
        <div className="bg-white dark:bg-violet-800 rounded-lg shadow-sm p-6 border border-violet-200 dark:border-violet-700">
          <h2 className="text-xl font-bold text-violet-950 dark:text-violet-50 mb-4">Create New Trip Assessment</h2>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-violet-700 dark:text-violet-200 mb-1">Destination</label>
                <select value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value })} className="w-full px-4 py-2 border border-violet-300 dark:border-violet-600 rounded-lg bg-white dark:bg-violet-700 text-violet-950 dark:text-violet-50" required>
                  <option value="">Select destination...</option>
                  {destinations.map(d => (
                    <option key={d.countryCode} value={d.countryCode}>{getFlag(d.countryCode)} {d.countryName} ({d.countryCode})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-violet-700 dark:text-violet-200 mb-1">Purpose</label>
                <select value={formData.purpose} onChange={e => setFormData({ ...formData, purpose: e.target.value })} className="w-full px-4 py-2 border border-violet-300 dark:border-violet-600 rounded-lg bg-white dark:bg-violet-700 text-violet-950 dark:text-violet-50">
                  <option value="business">Business</option>
                  <option value="leisure">Leisure</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-violet-700 dark:text-violet-200 mb-1">Departure Date</label>
                <input type="date" value={formData.departureDate} onChange={e => setFormData({ ...formData, departureDate: e.target.value })} className="w-full px-4 py-2 border border-violet-300 dark:border-violet-600 rounded-lg bg-white dark:bg-violet-700 text-violet-950 dark:text-violet-50" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-violet-700 dark:text-violet-200 mb-1">Return Date</label>
                <input type="date" value={formData.returnDate} onChange={e => setFormData({ ...formData, returnDate: e.target.value })} className="w-full px-4 py-2 border border-violet-300 dark:border-violet-600 rounded-lg bg-white dark:bg-violet-700 text-violet-950 dark:text-violet-50" required />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-violet-200 dark:border-violet-700">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-violet-200 dark:bg-violet-700 text-violet-950 dark:text-violet-50 rounded-lg hover:bg-violet-300 dark:hover:bg-violet-600 font-medium transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-lg hover:opacity-90 font-medium transition-opacity">Create Assessment</button>
            </div>
          </form>
        </div>
      )}

      {/* ── Search / Filter Bar ── */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search destinations by name or code..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-3 border border-violet-300 dark:border-violet-600 rounded-lg bg-white dark:bg-violet-800 text-violet-950 dark:text-violet-50 placeholder-violet-400"
        />
        {(searchQuery || filterLevel) && (
          <button onClick={() => { setSearchQuery(''); setFilterLevel(null); }} className="px-4 py-3 text-sm text-violet-600 dark:text-violet-300 hover:text-violet-800 dark:hover:text-violet-100 transition-colors whitespace-nowrap">
            Clear Filters
          </button>
        )}
      </div>

      {/* ── Destination Cards ── */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-violet-950 dark:text-violet-50">
          {filterLevel ? `Level ${filterLevel} Destinations` : 'All Destinations'}{' '}
          <span className="text-base font-normal text-violet-500 dark:text-violet-400">({filtered.length})</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.length > 0 ? filtered.map(dest => {
            const rc = getRiskLevelColor(dest.advisoryLevel);
            const isExpanded = expandedCard === dest.countryCode;
            return (
              <div
                key={dest.countryCode}
                className={`bg-white dark:bg-violet-800 rounded-lg shadow-sm border-l-4 ${rc.border} hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-violet-700/30 transition-shadow overflow-hidden`}
              >
                {/* Card Header */}
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{getFlag(dest.countryCode)}</span>
                      <div>
                        <h3 className="font-bold text-lg text-violet-950 dark:text-violet-50">{dest.countryName}</h3>
                        <p className="text-xs text-violet-500 dark:text-violet-400">{dest.countryCode}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${rc.bg} ${rc.text}`}>
                        Level {dest.advisoryLevel}
                      </div>
                    </div>
                  </div>

                  {/* Risk Score Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-violet-600 dark:text-violet-300">Risk Score</span>
                      <span className={`font-bold ${dest.riskScore >= 70 ? 'text-red-600 dark:text-red-400' : dest.riskScore >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{dest.riskScore}/100</span>
                    </div>
                    <div className="w-full h-2 bg-violet-200 dark:bg-violet-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${dest.riskScore >= 70 ? 'bg-red-500' : dest.riskScore >= 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${dest.riskScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Quick Stats Row */}
                  <div className="mt-3 flex items-center gap-4 text-xs">
                    <span className={`font-medium ${getInfraColor(dest.infrastructureScore)}`}>
                      Infra: {dest.infrastructureScore}/100
                    </span>
                    <span className="text-violet-500 dark:text-violet-400">
                      Threats: {dest.securityThreats.length}
                    </span>
                    <span className="text-violet-500 dark:text-violet-400">
                      Health: {dest.healthRisks.length}
                    </span>
                    <span className="text-violet-500 dark:text-violet-400">
                      Disasters: {dest.naturalDisasterRisk.length}
                    </span>
                  </div>

                  {/* Advisory Text */}
                  <p className="mt-3 text-sm text-violet-700 dark:text-violet-200 italic">&ldquo;{dest.advisoryText}&rdquo;</p>

                  {/* Expand Toggle */}
                  <button
                    onClick={() => setExpandedCard(isExpanded ? null : dest.countryCode)}
                    className="mt-3 w-full text-center text-sm font-medium text-violet-600 dark:text-violet-300 hover:text-violet-800 dark:hover:text-violet-100 transition-colors"
                  >
                    {isExpanded ? '▲ Collapse Details' : '▼ View Full Assessment'}
                  </button>
                </div>

                {/* Expanded Detail Panel */}
                {isExpanded && (
                  <div className="border-t border-violet-200 dark:border-violet-700 bg-violet-50/50 dark:bg-violet-900/30 p-5 space-y-4">
                    {/* Security Threats */}
                    <div>
                      <h4 className="text-sm font-bold text-violet-800 dark:text-violet-200 mb-2">Security Threats</h4>
                      <div className="space-y-2">
                        {dest.securityThreats.map((t, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase ${getSeverityBadge(t.severity)}`}>{t.severity}</span>
                            <div>
                              <span className="text-sm font-medium text-violet-900 dark:text-violet-100">{t.type}</span>
                              <p className="text-xs text-violet-600 dark:text-violet-300">{t.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Health Risks */}
                    <div>
                      <h4 className="text-sm font-bold text-violet-800 dark:text-violet-200 mb-2">Health Risks</h4>
                      <div className="space-y-2">
                        {dest.healthRisks.map((h, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase ${getSeverityBadge(h.severity)}`}>{h.severity}</span>
                            <div>
                              <span className="text-sm font-medium text-violet-900 dark:text-violet-100">{h.disease}</span>
                              <p className="text-xs text-violet-600 dark:text-violet-300">{h.description}</p>
                              {h.recommended_vaccines && h.recommended_vaccines.length > 0 && (
                                <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-0.5">Vaccines: {h.recommended_vaccines.join(', ')}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Natural Disaster Risks */}
                    <div>
                      <h4 className="text-sm font-bold text-violet-800 dark:text-violet-200 mb-2">Natural Disaster Risks</h4>
                      <div className="space-y-2">
                        {dest.naturalDisasterRisk.map((n, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase ${getSeverityBadge(n.probability === 'high' ? 'high' : n.probability === 'medium' ? 'medium' : 'low')}`}>{n.probability}</span>
                            <div>
                              <span className="text-sm font-medium text-violet-900 dark:text-violet-100">{n.type}</span>
                              {n.season && <span className="text-xs text-fuchsia-600 dark:text-fuchsia-400 ml-2">({n.season})</span>}
                              <p className="text-xs text-violet-600 dark:text-violet-300">{n.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          }) : (
            <p className="text-violet-500 dark:text-violet-300 col-span-full text-center py-8">
              No destinations match your search.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
