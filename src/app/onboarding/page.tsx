'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface FormData {
  step1: {
    companyName: string;
    industry: string;
    companySize: string;
    complianceNeeds: string;
  };
  step2: {
    frameworks: string[];
  };
  step3: {
    integrations: Record<string, boolean>;
  };
  step4: {
    teamMembers: Array<{ email: string; role: string }>;
  };
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    step1: { companyName: '', industry: '', companySize: '', complianceNeeds: '' },
    step2: { frameworks: [] },
    step3: { integrations: { airtable: false, slack: false, make: false } },
    step4: { teamMembers: [{ email: '', role: 'analyst' }] }
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch('/api/onboarding');
        if (res.ok) {
          const data = await res.json();
          setCurrentStep(data.currentStep || 1);
          setFormData(data.formData || formData);
        }
      } catch (err) {
        console.error('Failed to fetch onboarding progress:', err);
      }
    };

    fetchProgress();
  }, []);

  const saveProgress = async (step: number) => {
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step,
          formData
        })
      });

      if (!res.ok) {
        throw new Error('Failed to save progress');
      }

      setCurrentStep(step);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleStep1Change = (field: string, value: string) => {
    setFormData({
      ...formData,
      step1: { ...formData.step1, [field]: value }
    });
  };

  const handleStep2Toggle = (framework: string) => {
    setFormData({
      ...formData,
      step2: {
        frameworks: formData.step2.frameworks.includes(framework)
          ? formData.step2.frameworks.filter((f) => f !== framework)
          : [...formData.step2.frameworks, framework]
      }
    });
  };

  const handleStep3Toggle = (integration: string) => {
    setFormData({
      ...formData,
      step3: {
        integrations: {
          ...formData.step3.integrations,
          [integration]: !formData.step3.integrations[integration]
        }
      }
    });
  };

  const handleStep4Change = (index: number, field: string, value: string) => {
    const updated = [...formData.step4.teamMembers];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({
      ...formData,
      step4: { teamMembers: updated }
    });
  };

  const addTeamMember = () => {
    setFormData({
      ...formData,
      step4: {
        teamMembers: [...formData.step4.teamMembers, { email: '', role: 'analyst' }]
      }
    });
  };

  const removeTeamMember = (index: number) => {
    setFormData({
      ...formData,
      step4: {
        teamMembers: formData.step4.teamMembers.filter((_, i) => i !== index)
      }
    });
  };

  const handleComplete = async () => {
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/onboarding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData })
      });

      if (!res.ok) {
        throw new Error('Failed to complete onboarding');
      }

      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSaving(false);
    }
  };

  const progressPercent = (currentStep / 5) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to GRC TravelRisk</h1>
          <p className="text-gray-300 text-lg">Let us get your organization set up in 5 quick steps</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-300">Step {currentStep} of 5</span>
            <span className="text-sm font-medium text-gray-300">{progressPercent.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-100">
            {error}
          </div>
        )}

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 mb-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-6">Organization Setup</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Name</label>
                    <input
                      type="text"
                      placeholder="Acme Corporation"
                      value={formData.step1.companyName}
                      onChange={(e) => handleStep1Change('companyName', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Industry</label>
                    <select
                      value={formData.step1.industry}
                      onChange={(e) => handleStep1Change('industry', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select an industry</option>
                      <option value="finance">Finance</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="technology">Technology</option>
                      <option value="retail">Retail</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Company Size</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['startup', 'small', 'medium', 'enterprise'].map((size) => (
                        <button
                          key={size}
                          onClick={() => handleStep1Change('companySize', size)}
                          className={`py-2 px-4 rounded-lg border transition ${
                            formData.step1.companySize === size
                              ? 'bg-blue-600 border-blue-400'
                              : 'bg-slate-700 border-slate-600 hover:border-slate-500'
                          }`}
                        >
                          {size.charAt(0).toUpperCase() + size.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Primary Compliance Need</label>
                    <input
                      type="text"
                      placeholder="e.g., GDPR, SOC 2, HIPAA compliance"
                      value={formData.step1.complianceNeeds}
                      onChange={(e) => handleStep1Change('complianceNeeds', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-6">Select Compliance Frameworks</h2>
                <p className="text-gray-300 mb-6">Choose the frameworks most relevant to your organization</p>
                <div className="space-y-3">
                  {['NIST', 'ISO 27001', 'SOC 2', 'GDPR', 'CCPA', 'HIPAA'].map((framework) => (
                    <label key={framework} className="flex items-center p-4 bg-slate-700 rounded-lg border border-slate-600 hover:border-blue-500 cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={formData.step2.frameworks.includes(framework)}
                        onChange={() => handleStep2Toggle(framework)}
                        className="w-5 h-5 rounded accent-blue-500"
                      />
                      <span className="ml-3">{framework}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-6">Integration Setup</h2>
                <p className="text-gray-300 mb-6">Connect your favorite tools</p>
                <div className="space-y-4">
                  {[
                    { id: 'airtable', name: 'Airtable', desc: 'Sync compliance data' },
                    { id: 'slack', name: 'Slack', desc: 'Get notifications' },
                    { id: 'make', name: 'Make.com', desc: 'Automation workflows' }
                  ].map((integration) => (
                    <div key={integration.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg border border-slate-600">
                      <div>
                        <div className="font-medium">{integration.name}</div>
                        <div className="text-sm text-gray-400">{integration.desc}</div>
                      </div>
                      <button
                        onClick={() => handleStep3Toggle(integration.id)}
                        className={`w-12 h-6 rounded-full transition ${
                          formData.step3.integrations[integration.id]
                            ? 'bg-blue-600'
                            : 'bg-slate-600'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition transform ${
                            formData.step3.integrations[integration.id]
                              ? 'translate-x-6'
                              : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-6">Invite Team Members</h2>
                <div className="space-y-4">
                  {formData.step4.teamMembers.map((member, index) => (
                    <div key={index} className="flex gap-3">
                      <input
                        type="email"
                        placeholder="colleague@company.com"
                        value={member.email}
                        onChange={(e) => handleStep4Change(index, 'email', e.target.value)}
                        className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                      <select
                        value={member.role}
                        onChange={(e) => handleStep4Change(index, 'role', e.target.value)}
                        className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
                      >
                        <option value="admin">Admin</option>
                        <option value="analyst">Analyst</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      {formData.step4.teamMembers.length > 1 && (
                        <button
                          onClick={() => removeTeamMember(index)}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={addTeamMember}
                  className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition"
                >
                  + Add Team Member
                </button>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-6">Review & Launch</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-700 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Company</div>
                    <div className="font-medium">{formData.step1.companyName || '(Not provided)'}</div>
                  </div>
                  <div className="p-4 bg-slate-700 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Frameworks</div>
                    <div className="font-medium">{formData.step2.frameworks.join(', ') || '(None selected)'}</div>
                  </div>
                  <div className="p-4 bg-slate-700 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Integrations</div>
                    <div className="font-medium">
                      {Object.entries(formData.step3.integrations)
                        .filter(([, enabled]) => enabled)
                        .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1))
                        .join(', ') || 'None'}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-700 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Team Members</div>
                    <div className="font-medium">{formData.step4.teamMembers.filter((m) => m.email).length} invited</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div>
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={saving}
                className="px-6 py-2 text-gray-300 hover:text-white transition disabled:opacity-50"
              >
                Back
              </button>
            )}
            {currentStep < 5 && (
              <button
                onClick={() => {
                  if (currentStep === 1 && !formData.step1.companyName) {
                    setError('Please enter a company name');
                    return;
                  }
                  saveProgress(currentStep + 1);
                }}
                disabled={saving}
                className="px-6 py-2 text-gray-300 hover:text-white transition disabled:opacity-50"
              >
                Skip
              </button>
            )}
          </div>

          <div>
            {currentStep < 5 && (
              <button
                onClick={() => {
                  if (currentStep === 1 && !formData.step1.companyName) {
                    setError('Please enter a company name');
                    return;
                  }
                  saveProgress(currentStep + 1);
                }}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Next'}
              </button>
            )}
            {currentStep === 5 && (
              <button
                onClick={handleComplete}
                disabled={saving}
                className="px-8 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition disabled:opacity-50"
              >
                {saving ? 'Launching...' : 'Launch Dashboard'}
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>
            Already set up?{' '}
            <Link href="/dashboard" className="text-blue-400 hover:text-blue-300">
              Go to Dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
