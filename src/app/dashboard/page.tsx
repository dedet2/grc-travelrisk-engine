export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome to your GRC & Travel Risk assessment dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Risk Score Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500 mb-2">
            Overall Risk Score
          </div>
          <div className="text-3xl font-bold text-orange-500">--</div>
          <div className="text-xs text-gray-500 mt-2">
            Complete an assessment to see your score
          </div>
        </div>

        {/* Assessments Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500 mb-2">
            Active Assessments
          </div>
          <div className="text-3xl font-bold text-indigo-600">0</div>
          <div className="text-xs text-gray-500 mt-2">In progress</div>
        </div>

        {/* Travel Risks Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500 mb-2">
            Travel Risks
          </div>
          <div className="text-3xl font-bold text-green-600">0</div>
          <div className="text-xs text-gray-500 mt-2">Reports generated</div>
        </div>

        {/* Agent Runs Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500 mb-2">
            Agent Runs
          </div>
          <div className="text-3xl font-bold text-blue-600">0</div>
          <div className="text-xs text-gray-500 mt-2">Automated tasks</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-4 text-gray-900">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm">
              + New Assessment
            </button>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
              + Travel Risk Report
            </button>
            <button className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm">
              + Import Framework
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-4 text-gray-900">Recent Activity</h2>
          <div className="text-gray-500 text-center py-8">
            <p>No recent activity yet</p>
            <p className="text-sm">
              Create your first assessment to get started
            </p>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="font-bold text-blue-900 mb-2">Getting Started</h3>
          <p className="text-sm text-blue-800">
            Start by creating a new GRC assessment or travel risk report. Our
            AI-powered agents will help you evaluate controls and risks.
          </p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h3 className="font-bold text-green-900 mb-2">Learn More</h3>
          <p className="text-sm text-green-800">
            Explore our documentation to understand how to use assessments,
            travel risk analysis, and automated agents.
          </p>
        </div>
      </div>
    </div>
  );
}
