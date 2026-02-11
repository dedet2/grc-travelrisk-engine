'use client';

const IconTrendingUp = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>);
const IconPlus = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>);

export default function RevenuePage() {
  // KPI Cards Data
  const kpiCards = [
    {
      title: 'Current Month',
      value: '$0.0K',
      progress: 56,
      change: '+0%'
    },
    {
      title: 'YTD Revenue',
      value: '$0K',
      change: '+0%'
    },
    {
      title: 'Pipeline Value',
      value: '$0K',
      change: '+0%'
    },
    {
      title: 'Hot Deals',
      value: '0',
      change: '+0%'
    }
  ];

  // Growth Milestones Data
  const milestones = [
    { label: '3-Week Target', value: '$0.0M' },
    { label: 'Year 2 Target', value: '$2.0M' },
    { label: 'Year 3 Target', value: '$10.0M' },
    { label: 'Year 4 Target', value: '$50.0M' },
    { label: 'Acquisition Target', value: '$500.0M' }
  ];

  // Revenue Projections Data
  const projections = [
    { label: 'Week 1', value: '$0K' },
    { label: 'Week 2', value: '$0K' },
    { label: 'Week 3', value: '$0K' },
    { label: 'Month', value: '$0K' },
    { label: 'Quarter', value: '$0K' },
    { label: 'Year', value: '$0K' }
  ];

  // Revenue Streams Data
  const revenueStreams = [
    { name: 'AI GRC Consulting', current: 0, target: 500, currency: 'K' },
    { name: 'Retreats', current: 0, target: 200, currency: 'K' },
    { name: 'Board Compensation', current: 0, target: 150, currency: 'K' },
    { name: 'Speaking', current: 0, target: 100, currency: 'K' },
    { name: 'SaaS', current: 0, target: 1000, currency: 'K' }
  ];

  // Client Pipeline Data
  const pipelineData = [
    {
      id: 1,
      company: 'Acme Corp',
      contact: 'John Smith',
      stage: 'Qualified',
      value: '$250K',
      stageColor: 'bg-blue-100 text-blue-800'
    },
    {
      id: 2,
      company: 'TechFlow Inc',
      contact: 'Sarah Johnson',
      stage: 'Proposal',
      value: '$150K',
      stageColor: 'bg-purple-100 text-purple-800'
    },
    {
      id: 3,
      company: 'Global Solutions',
      contact: 'Mike Davis',
      stage: 'Negotiation',
      value: '$500K',
      stageColor: 'bg-orange-100 text-orange-800'
    },
    {
      id: 4,
      company: 'Enterprise Plus',
      contact: 'Lisa Chen',
      stage: 'Closed',
      value: '$350K',
      stageColor: 'bg-green-100 text-green-800'
    },
    {
      id: 5,
      company: 'Future Systems',
      contact: 'James Wilson',
      stage: 'Lead',
      value: '$75K',
      stageColor: 'bg-gray-100 text-gray-800'
    }
  ];

  const getProgressPercentage = (current: number, target: number) => {
    return Math.round((current / target) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Revenue & Analytics</h1>
        <p className="text-lg text-gray-600">Track progress toward your $50M+ acquisition target</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-2">{card.title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-4">{card.value}</p>
            {card.progress !== undefined && (
              <div className="mb-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                    style={{ width: `${card.progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{card.progress}% toward goal</p>
              </div>
            )}
            <p className="text-sm text-green-600 font-medium">{card.change}</p>
          </div>
        ))}
      </div>

      {/* Growth Milestones Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="mr-2 text-blue-600"><IconTrendingUp /></span>
          Growth Milestones
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {milestones.map((milestone, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 text-center hover:border-blue-300 transition">
              <p className="text-sm text-gray-600 mb-2">{milestone.label}</p>
              <p className="text-2xl font-bold text-gray-900">{milestone.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Projections */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Projections</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {projections.map((projection, index) => (
            <div key={index} className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">{projection.label}</p>
              <p className="text-xl font-bold text-gray-900">{projection.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Streams Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Streams</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
          {revenueStreams.map((stream, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <p className="text-sm font-medium text-gray-700 mb-4">{stream.name}</p>
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">${stream.current}/{stream.target}{stream.currency}</span>
                  <span className="text-sm font-semibold text-gray-900">{getProgressPercentage(stream.current, stream.target)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all"
                    style={{ width: `${getProgressPercentage(stream.current, stream.target)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
          <IconPlus />
          Add Revenue Stream
        </button>
      </div>

      {/* Client Pipeline Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Client Pipeline</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Company</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Contact</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Stage</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Value</th>
              </tr>
            </thead>
            <tbody>
              {pipelineData.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium">{row.company}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{row.contact}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${row.stageColor}`}>
                      {row.stage}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
