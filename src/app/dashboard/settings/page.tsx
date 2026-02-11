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

export default function SettingsPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'organization' | 'account' | 'api' | 'integrations'>('organization');

  useEffect(() => {
    fetchTenant();
  }, []);

  async function fetchTenant() {
    try {
      setLoading(true);
      const response = await fetch('/api/tenants');
      if (!response.ok) throw new Error('Failed to fetch tenant');
      const result = await response.json();
      setTenant(result.data);
    } catch (err) {
      console.error('Error fetching tenant:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tenant');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-gray-200 rounded animate-pulse w-1/2" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-2">
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
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account, organization, and integrations</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <nav className="space-y-1 p-2">
              {[
                { id: 'organization', label: 'Organization', icon: 'Org' },
                { id: 'account', label: 'Account', icon: 'Acc' },
                { id: 'api', label: 'API Keys', icon: 'API' },
                { id: 'integrations', label: 'Integrations', icon: 'Int' },
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

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Organization Settings */}
          {activeTab === 'organization' && tenant && (
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Organization Settings</h2>

                {/* Organization Info Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Organization Name</p>
                    <p className="text-lg font-bold text-gray-900">{tenant.name}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Slug</p>
                    <p className="text-lg font-bold text-gray-900">{tenant.slug}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Plan</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">{tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)}</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        tenant.plan === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                        tenant.plan === 'professional' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        Active
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Team Members</p>
                    <p className="text-lg font-bold text-gray-900">{tenant.memberCount || 1}</p>
                  </div>
                </div>

                {/* Plan Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Your Plan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`border rounded-lg p-4 ${tenant.plan === 'starter' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}>
                      <h4 className="font-bold text-gray-900 mb-2">Starter</h4>
                      <p className="text-sm text-gray-600 mb-4">For teams just getting started</p>
                      {tenant.plan === 'starter' && (
                        <span className="inline-block px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded">Current Plan</span>
                      )}
                    </div>
                    <div className={`border rounded-lg p-4 ${tenant.plan === 'professional' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}>
                      <h4 className="font-bold text-gray-900 mb-2">Professional</h4>
                      <p className="text-sm text-gray-600 mb-4">For growing organizations</p>
                      {tenant.plan === 'professional' && (
                        <span className="inline-block px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded">Current Plan</span>
                      )}
                    </div>
                    <div className={`border rounded-lg p-4 ${tenant.plan === 'enterprise' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}>
                      <h4 className="font-bold text-gray-900 mb-2">Enterprise</h4>
                      <p className="text-sm text-gray-600 mb-4">For large enterprises</p>
                      {tenant.plan === 'enterprise' && (
                        <span className="inline-block px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded">Current Plan</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Upgrade CTA */}
                {tenant.plan !== 'enterprise' && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                    <h4 className="font-bold text-gray-900 mb-2">Unlock More Features</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Upgrade to Professional or Enterprise to get advanced SIEM integration, custom frameworks, and more.
                    </p>
                    <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                      View Upgrade Options
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Account Settings */}
          {activeTab === 'account' && (
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      placeholder="Your email"
                    />
                    <p className="text-xs text-gray-500 mt-1">Managed by Clerk authentication</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Theme Preference</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="theme"
                          value="light"
                          defaultChecked
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Light</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="theme"
                          value="dark"
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Dark</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="theme"
                          value="system"
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">System</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">Enable email notifications</span>
                    </label>
                  </div>

                  <button className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* API Keys */}
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
                      sk-proj-[masked for security]
                    </div>
                    <div className="flex space-x-3">
                      <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Reveal</button>
                      <button className="text-sm text-red-600 hover:text-red-700 font-medium">Revoke</button>
                    </div>
                  </div>

                  <button className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors">
                    + Generate New API Key
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Integrations */}
          {activeTab === 'integrations' && (
            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Integrations</h2>
                <p className="text-gray-600 mb-6">Configure and manage SIEM integrations for event streaming and monitoring</p>

                <div className="space-y-4">
                  {['Splunk', 'QRadar', 'Azure Sentinel'].map((name) => (
                    <div key={name} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {name === 'Splunk' && 'Send security events to Splunk via HTTP Event Collector'}
                            {name === 'QRadar' && 'Stream events to IBM QRadar in LEEF format'}
                            {name === 'Azure Sentinel' && 'Integrate with Azure Sentinel for advanced threat detection'}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded">Not Connected</span>
                      </div>
                      <div className="flex space-x-3 mt-4">
                        <button className="px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 transition-colors">
                          Configure
                        </button>
                        <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition-colors">
                          Test Connection
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Need to integrate with a different SIEM platform? Contact support for custom integrations.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
