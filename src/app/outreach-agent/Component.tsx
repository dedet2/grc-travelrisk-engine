'use client';

import { useState } from 'react';

const AUDIENCE_OPTIONS = [
  'Board of Directors',
  'Executive Leadership',
  'Legal & Compliance Team',
  'IT & Security Team',
  'HR Department',
  'External Auditors',
  'Regulatory Bodies',
  'Vendors & Partners',
];

const TONE_OPTIONS = ['Professional', 'Formal', 'Urgent', 'Informational', 'Collaborative'];

const FRAMEWORK_OPTIONS = [
  'NIST AI RMF',
  'EU AI Act',
  'ISO 42001',
  'SOC 2 Type II',
  'GDPR',
  'HIPAA',
  'CCPA',
  'Custom Framework',
];

interface OutreachFormData {
  audience: string;
  subject: string;
  context: string;
  tone: string;
  framework: string;
  includeDeadline: boolean;
  deadline: string;
  includeActionItems: boolean;
}

interface GeneratedMessage {
  subject: string;
  body: string;
  followUp: string;
  keyPoints: string[];
}

export default function Component() {
  const [formData, setFormData] = useState<OutreachFormData>({
    audience: '',
    subject: '',
    context: '',
    tone: 'Professional',
    framework: '',
    includeDeadline: false,
    deadline: '',
    includeActionItems: true,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedMessage | null>(null);
  const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');
  const [copySuccess, setCopySuccess] = useState('');

  const handleGenerate = async () => {
    if (!formData.audience || !formData.subject) return;
    setIsGenerating(true);
    setGenerated(null);

    // Simulated AI generation delay
    await new Promise((r) => setTimeout(r, 1800));

    const audienceLower = formData.audience.toLowerCase();
    const isExec = audienceLower.includes('executive') || audienceLower.includes('board');
    const frameworkRef = formData.framework ? [formData.framework] : ['our AI governance framework'];

    setGenerated({
      subject: [formData.tone === 'Urgent' ? 'URGENT: ' : '', formData.subject, ' - Action Required'].join(''),
      body: [
        'Dear ' + formData.audience + ',',
        '',
        isExec
          ? 'I am writing to provide a strategic update on our ' + frameworkRef[0] + ' compliance initiative. As we continue to advance our AI governance posture, your awareness and support are critical to our organizational risk management objectives.'
          : 'I am reaching out to coordinate our ' + frameworkRef[0] + ' compliance activities and ensure alignment across stakeholders.',
        '',
        formData.context
          ? formData.context
          : 'Our AI governance program requires coordinated action to ensure we meet regulatory requirements and maintain stakeholder trust.',
        '',
        formData.includeDeadline && formData.deadline
          ? 'Please note that this matter requires attention by ' + formData.deadline + '.'
          : '',
        '',
        formData.includeActionItems
          ? ['Action items required from your team:', '  1. Review and acknowledge the attached AI governance documentation', '  2. Identify and designate a point of contact for compliance coordination', '  3. Complete the required stakeholder assessment within the specified timeframe', '', 'Your prompt response will help ensure we maintain compliance and protect our organization.'].join('\n')
          : '',
        '',
        'Please do not hesitate to reach out if you have questions or require additional information.',
        '',
        'Best regards,',
        'AI Governance & Compliance Team',
        'Incluu GRC Platform',
      ].filter(Boolean).join('\n'),
      followUp: [
        'Following up on my previous communication regarding ' + formData.subject + '.',
        '',
        'I wanted to check in and ensure you received our initial outreach. If you have any questions or need clarification on any aspect of our ' + (formData.framework || 'AI governance') + ' compliance requirements, please let me know.',
        '',
        'Looking forward to your response.',
      ].join('\n'),
      keyPoints: [
        'Stakeholder: ' + formData.audience,
        'Framework: ' + (formData.framework || 'General AI Governance'),
        'Tone: ' + formData.tone,
        formData.includeDeadline && formData.deadline ? 'Deadline: ' + formData.deadline : '',
        'Action Items: ' + (formData.includeActionItems ? 'Included' : 'Not included'),
      ].filter(Boolean),
    });

    setIsGenerating(false);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(label);
    setTimeout(() => setCopySuccess(''), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-2xl">
              ✉️
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Outreach Agent</h1>
              <p className="text-gray-400 text-sm mt-0.5">
                Automated compliance outreach and stakeholder communication powered by AI governance intelligence
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6">
            {(['compose', 'history'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={[
                  'px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors',
                  activeTab === tab
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800',
                ].join(' ')}
              >
                {tab === 'compose' ? '✏️ Compose' : '📋 Templates'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'compose' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Compose Form */}
            <div className="space-y-6">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Outreach Configuration</h2>

                {/* Audience */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Target Audience <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.audience}
                    onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Select audience...</option>
                    {AUDIENCE_OPTIONS.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Communication Subject <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g., Q1 AI Governance Review, Policy Acknowledgment Required"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Framework */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Governance Framework
                  </label>
                  <select
                    value={formData.framework}
                    onChange={(e) => setFormData({ ...formData, framework: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Select framework...</option>
                    {FRAMEWORK_OPTIONS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                {/* Tone */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tone</label>
                  <div className="flex flex-wrap gap-2">
                    {TONE_OPTIONS.map((t) => (
                      <button
                        key={t}
                        onClick={() => setFormData({ ...formData, tone: t })}
                        className={[
                          'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                          formData.tone === t
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-800 text-gray-400 hover:text-gray-200 border border-gray-700',
                        ].join(' ')}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Context */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Additional Context
                  </label>
                  <textarea
                    value={formData.context}
                    onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                    rows={3}
                    placeholder="Provide any specific context, findings, or requirements to include..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                {/* Options */}
                <div className="space-y-3 mb-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.includeActionItems}
                      onChange={(e) => setFormData({ ...formData, includeActionItems: e.target.checked })}
                      className="w-4 h-4 rounded accent-emerald-500"
                    />
                    <span className="text-sm text-gray-300">Include action items</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.includeDeadline}
                      onChange={(e) => setFormData({ ...formData, includeDeadline: e.target.checked })}
                      className="w-4 h-4 rounded accent-emerald-500"
                    />
                    <span className="text-sm text-gray-300">Include deadline</span>
                  </label>

                  {formData.includeDeadline && (
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="ml-7 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-emerald-500 text-sm"
                    />
                  )}
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!formData.audience || !formData.subject || isGenerating}
                  className="w-full py-3 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white font-semibold rounded-xl transition-all"
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⚙️</span> Generating outreach...
                    </span>
                  ) : (
                    '✨ Generate Outreach Message'
                  )}
                </button>
              </div>
            </div>

            {/* Generated Output */}
            <div className="space-y-4">
              {!generated && !isGenerating && (
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 flex flex-col items-center justify-center text-center min-h-64">
                  <div className="text-4xl mb-3">📨</div>
                  <p className="text-gray-400 text-sm max-w-xs">
                    Configure your outreach parameters and generate a customized compliance communication message.
                  </p>
                </div>
              )}

              {isGenerating && (
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 flex flex-col items-center justify-center min-h-64">
                  <div className="text-3xl mb-4 animate-pulse">🤖</div>
                  <p className="text-emerald-400 font-medium">Generating stakeholder communication...</p>
                  <p className="text-gray-500 text-sm mt-2">Applying governance intelligence</p>
                </div>
              )}

              {generated && (
                <div className="space-y-4">
                  {/* Key Points */}
                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                    <h3 className="text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                      Message Parameters
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {generated.keyPoints.map((kp, i) => (
                        <span key={i} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-md border border-gray-700">
                          {kp}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Primary Message */}
                  <div className="bg-gray-900 rounded-xl border border-emerald-800 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
                        Primary Message
                      </h3>
                      <button
                        onClick={() => handleCopy(generated.subject + '\n\n' + generated.body, 'primary')}
                        className="text-xs text-gray-400 hover:text-gray-200 bg-gray-800 px-2 py-1 rounded"
                      >
                        {copySuccess === 'primary' ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3 mb-3">
                      <span className="text-xs text-gray-500 uppercase">Subject: </span>
                      <span className="text-sm text-white font-medium">{generated.subject}</span>
                    </div>
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed font-sans">
                      {generated.body}
                    </pre>
                  </div>

                  {/* Follow-up */}
                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                        Follow-up Template
                      </h3>
                      <button
                        onClick={() => handleCopy(generated.followUp, 'followup')}
                        className="text-xs text-gray-400 hover:text-gray-200 bg-gray-800 px-2 py-1 rounded"
                      >
                        {copySuccess === 'followup' ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                    <pre className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed font-sans">
                      {generated.followUp}
                    </pre>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setGenerated(null)}
                      className="flex-1 py-2 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl transition-colors text-sm"
                    >
                      ↩ Reset
                    </button>
                    <button
                      onClick={handleGenerate}
                      className="flex-1 py-2 px-4 bg-emerald-700 hover:bg-emerald-600 text-white font-medium rounded-xl transition-colors text-sm"
                    >
                      🔄 Regenerate
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Board AI Governance Update', audience: 'Board of Directors', framework: 'NIST AI RMF', date: '2024-01-15', status: 'Sent' },
              { title: 'Q4 Compliance Review', audience: 'Executive Leadership', framework: 'EU AI Act', date: '2024-01-10', status: 'Draft' },
              { title: 'Policy Acknowledgment Request', audience: 'IT and Security Team', framework: 'ISO 42001', date: '2024-01-08', status: 'Sent' },
              { title: 'Vendor Risk Assessment', audience: 'Vendors and Partners', framework: 'SOC 2 Type II', date: '2024-01-05', status: 'Sent' },
              { title: 'HR AI Policy Training', audience: 'HR Department', framework: 'GDPR', date: '2023-12-20', status: 'Draft' },
              { title: 'Audit Preparation Notice', audience: 'External Auditors', framework: 'HIPAA', date: '2023-12-15', status: 'Sent' },
            ].map((item, i) => (
              <div key={i} className="bg-gray-900 rounded-xl border border-gray-800 p-4 hover:border-gray-700 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white leading-tight">{item.title}</h3>
                  <span className={[
                    'text-xs px-2 py-0.5 rounded-full ml-2 shrink-0',
                    item.status === 'Sent' ? 'bg-emerald-900 text-emerald-300' : 'bg-yellow-900 text-yellow-300',
                  ].join(' ')}>
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-1">{item.audience}</p>
                <p className="text-xs text-emerald-600 mb-3">{item.framework}</p>
                <p className="text-xs text-gray-600">{item.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="border-t border-gray-800 bg-gray-900 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center">
          <p className="text-gray-400 text-sm mb-4">
            Unlock full AI outreach automation with personalized stakeholder profiles and campaign tracking
          </p>
          <a
            href="/billing"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl transition-all"
          >
            Upgrade to Pro
          </a>
        </div>
      </div>
    </div>
  );
}
