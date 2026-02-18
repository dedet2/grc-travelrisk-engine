'use client';

import { useState, useEffect } from 'react';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: 'starter' | 'professional' | 'enterprise';
  memberCount?: number;
  createdAt: string;
}

interface Integration {
  id: string;
  name: string;
  status: 'connected' | 'disconnected';
  lastSync?: string;
  enabled: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

interface UsageMetrics {
  apiCalls: {
    used: number;
    limit: number;
    percentage: number;
  };
  storage: {
    used: number;
    limit: number;
    percentage: number;
  };
  agentRuns: {
    used: number;
    limit: number;
    percentage: number;
  };
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'integrations' | 'api' | 'notifications' | 'team' | 'usage'>('general');
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics | null>(null);
  const [notificationPrefs, setNotificationPrefs] = useState({
    email: true,
    slack: false,
    inApp: true,
    sms: false,
  });

  useEffect(() => {
    fetchTenant();
    fetchIntegrations();
    fetchTeamMembers();
    fetchUsageMetrics();
  }, []);

  async function fetchTenant() {
    try {
      setLoading(true);
      const response = await fetch('/api/tenants');
      if (response.ok) {
        const result = await response.json();
        setTenant(result.data);
      }
    } catch (err) {
      console.error('Error fetching tenant:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchIntegrations() {
    try {
      const response = await fetch('/api/integrations');
      if (response.ok) {
        const result = await response.json();
        const integrationsList = [
          { id: 'airtable', name: 'Airtable', status: 'connected' as const, lastSync: '2 hours ago', enabled: true },
          { id: 'slack', name: 'Slack', status: 'connected' as const, lastSync: '5 minutes ago', enabled: true },
          { id: 'make', name: 'Make.com', status: 'connected' as const, lastSync: '30 minutes ago', enabled: true },
          { id: 'calendly', name: 'Calendly', status: 'disconnected' as const, enabled: false },
          { id: 'klenty', name: 'Klenty', status: 'connected' as const, lastSync: '1 hour ago', enabled: true },
          { id: 'perplexity', name: 'Perplexity Pro', status: 'connected' as const, lastSync: '15 minutes ago', enabled: true },
          { id: 'podia', name: 'Podia', status: 'disconnected' as const, enabled: false },
          { id: 'vibekanban', name: 'VibeKanban', status: 'connected' as const, lastSync: '3 hours ago', enabled: true },
          { id: 'apollo', name: 'Apollo', status: 'connected' as const, lastSync: '45 minutes ago', enabled: true },
          { id: 'linkedin', name: 'LinkedIn Sales Nav', status: 'connected' as const, lastSync: '20 minutes ago', enabled: true },
          { id: 'supabase', name: 'Supabase', status: 'connected' as const, lastSync: 'Real-time', enabled: true },
          { id: 'vercel', name: 'Vercel', status: 'connected' as const, lastSync: 'Real-time', enabled: true },
        ];
        setIntegrations(integrationsList);
      }
    } catch (err) {
      console.error('Error fetching integrations:', err);
    }
  }

  async function fetchTeamMembers() {
    try {
      setTeamMembers([
        { id: '1', name: 'You', email: 'your@email.com', role: 'owner', joinedAt: '2024-01-15' },
        { id: '2', name: 'Alice Smith', email: 'alice@company.com', role: 'admin', joinedAt: '2024-02-01' },
        { id: '3', name: 'Bob Johnson', email: 'bob@company.com', role: 'member', joinedAt: '2024-02-10' },
      ]);
    } catch (err) {
      console.error('Error fetching team members:', err);
    }
  }

  async function fetchUsageMetrics() {
    try {
      const response = await fetch('/api/usage');
      if (response.ok) {
        const result = await response.json();
        setUsageMetrics({
          apiCalls: { used: 45230, limit: 100000, percentage: 45 },
          storage: { used: 2.3, limit: 10, percentage: 23 },
          agentRuns: { used: 1250, limit: 5000, percentage: 25 },
        });
      }
    } catch (err) {
      console.error('Error fetching usage metrics:', err);
    }
  }

  function toggleIntegration(id: string) {
    setIntegrations(integrations.map(int =>
      int.id === id ? { ...int, enabled: !int.enabled } : int
    ));
  }

  function toggleNotification(key: keyof typeof notificationPrefs) {
    setNotificationPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-gray-200 rounded animate-pulse w-1/2" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account, organization, and integrations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <nav className="space-y-1 p-2">
              {[
                { id: 'general', label: 'General', icon: '⚙️' },
                { id: 'integrations', label: 'Integrations', icon: '🔗' },
                { id: 'api', label: 'API Keys', icon: '🔑' },
                { id: 'notifications', label: 'Notifications', icon: '🔔' },
                { id: 'team', label: 'Team', icon: '👥' },
                { id: 'usage', label: 'Usage & Billing', icon: '📊' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors font-medium text-sm ${
                    activeTab === item.id
                      ? 'bg-indigo-100 text-indigo-900 border-l-4 border-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'general' && tenant && (
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">General Settings</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Organization Name</p>
                    <p className="text-lg font-bold text-gray-900">{tenant.name}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Current Plan</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">{tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)}</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        tenant.plan === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                        tenant.plan === 'professional' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-200 text-gray-700'
                      }`}>Active</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Team Members</p>
                    <p className="text-lg font-bold text-gray-900">{tenant.memberCount || teamMembers.length}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Organization Slug</p>
                    <p className="text-lg font-bold text-gray-900 font-mono">{tenant.slug}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Organization Plan</h3>
                  <p className="text-gray-600 mb-4">Your current plan includes all features suitable for your organization size.</p>
                  {tenant.plan !== 'enterprise' && (
                    <button className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                      Upgrade Plan
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Integrations</h2>
                <p className="text-gray-600 mb-6">Connect and manage all your integrated tools</p>

                <div className="grid gap-4">
                  {integrations.map((integration) => (
                    <div key={integration.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{integration.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {integration.status === 'connected' ? `Last synced ${integration.lastSync}` : 'Not connected'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            integration.status === 'connected'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {integration.status === 'connected' ? 'Connected' : 'Disconnected'}
                          </span>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={integration.enabled}
                              onChange={() => toggleIntegration(integration.id)}
                              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="ml-2 text-sm text-gray-600">Enable</span>
                          </label>
                        </div>
                      </div>
                      <div className="flex space-x-3 mt-4">
                        <button className="px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 transition-colors">
                          Configure
                        </button>
                        <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition-colors">
                          Test
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">API Key Management</h2>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-amber-800">
                    API keys grant full access to your account. Keep them confidential and never share them publicly.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">Production API Key</h4>
                        <p className="text-xs text-gray-500 mt-1">Created 90 days ago</p>
                      </div>
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded">Active</span>
                    </div>
                    <div className="bg-gray-100 p-3 rounded font-mono text-xs text-gray-600 mb-3 truncate">
                      sk-proj-abc123xyz789...
                    </div>
                    <div className="flex space-x-3">
                      <button onClick={() => copyToClipboard('sk-proj-abc123xyz789')} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                        Copy
                      </button>
                      <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                        Regenerate
                      </button>
                      <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                        Revoke
                      </button>
                    </div>
                  </div>

                  <button className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors font-medium text-gray-700">
                    + Generate New API Key
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences</h2>

                <div className="space-y-4">
                  {[
                    { key: 'email', label: 'Email Notifications', description: 'Receive alerts and updates via email' },
                    { key: 'slack', label: 'Slack Notifications', description: 'Post alerts to your Slack workspace' },
                    { key: 'inApp', label: 'In-App Notifications', description: 'Show notifications in the application' },
                    { key: 'sms', label: 'SMS Notifications', description: 'Receive critical alerts via SMS' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <h4 className="font-medium text-gray-900">{item.label}</h4>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      </div>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationPrefs[item.key as keyof typeof notificationPrefs]}
                          onChange={() => toggleNotification(item.key as keyof typeof notificationPrefs)}
                          className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </label>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Notification Triggers</h3>
                  <div className="space-y-3">
                    {[
                      'Compliance assessment completed',
                      'Travel risk alert issued',
                      'New vulnerability detected',
                      'Policy violation occurred',
                      'AI agent error or failure',
                    ].map((trigger) => (
                      <label key={trigger} className="flex items-center">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-indigo-600" />
                        <span className="ml-2 text-sm text-gray-700">{trigger}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button className="mt-6 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
                  <p className="text-gray-600 mt-1">Manage team members and their roles</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                  Invite Member
                </button>
              </div>

              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{member.name}</h4>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      <p className="text-xs text-gray-500 mt-1">Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        member.role === 'owner' ? 'bg-purple-100 text-purple-700' :
                        member.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </span>
                      {member.id !== '1' && (
                        <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'usage' && usageMetrics && (
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Usage & Billing</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {[
                    { label: 'Current Plan', value: tenant?.plan.charAt(0).toUpperCase() + tenant?.plan.slice(1) },
                    { label: 'Billing Cycle', value: 'Monthly' },
                    { label: 'Next Billing Date', value: 'Mar 15, 2026' },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">{item.label}</p>
                      <p className="text-lg font-bold text-gray-900">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Usage Metrics</h3>

                  <div className="space-y-6">
                    {[
                      { name: 'API Calls', metric: usageMetrics.apiCalls, unit: 'calls' },
                      { name: 'Storage', metric: usageMetrics.storage, unit: 'GB' },
                      { name: 'Agent Runs', metric: usageMetrics.agentRuns, unit: 'runs' },
                    ].map((item) => (
                      <div key={item.name}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <span className="text-sm text-gray-600">
                            {item.metric.used} / {item.metric.limit} {item.unit}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${item.metric.percentage > 80 ? 'bg-red-500' : 'bg-emerald-500'}`}
                            style={{ width: `${item.metric.percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{item.metric.percentage}% used</p>
                      </div>
                    ))}
                  </div>
                </div>

                {tenant?.plan !== 'enterprise' && (
                  <div className="mt-8 p-6 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <h4 className="font-bold text-gray-900 mb-2">Approaching Usage Limits?</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Upgrade your plan to get higher limits and more features.
                    </p>
                    <button className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                      View Upgrade Options
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
