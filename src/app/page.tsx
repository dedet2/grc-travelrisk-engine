import Link from 'next/link';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';

/* ------------------------------------------------------------------ */
/*  Inline SVG Icons for the landing page (no emoji dependency)       */
/* ------------------------------------------------------------------ */

function IconShield({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
function IconAlert({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}
function IconClock({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
function IconTarget({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  );
}
function IconBarChart({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>
    </svg>
  );
}
function IconGlobe({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}
function IconCpu({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>
    </svg>
  );
}
function IconLock({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}
function IconSettings({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68 1.65 1.65 0 0 0 10 3.17V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}
function IconZap({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
}
function IconCheck({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function IconX({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

/* ------------------------------------------------------------------ */

export default async function Home() {
  const user = await currentUser();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-indigo-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            GRC TravelRisk
          </div>
          <div className="flex gap-4 items-center">
            {user ? (
              <>
                <span className="text-gray-300 text-sm hidden sm:inline">Welcome, {user.firstName}</span>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-500 hover:to-indigo-600 transition-all duration-200 text-sm font-medium"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="px-4 py-2 text-indigo-300 hover:text-indigo-100 transition-colors text-sm font-medium">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-500 hover:to-indigo-600 transition-all duration-200 text-sm font-medium">
                    Sign Up
                  </button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-indigo-500/20 border border-indigo-400/30 rounded-full">
            <p className="text-indigo-300 text-sm font-semibold">AI-Powered Risk Intelligence</p>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight">
            Unified Risk Scoring: GRC + Travel Risk in{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              Minutes, Not Months
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Instantly map compliance frameworks, assess organizational risks, and integrate travel intelligence with AI-powered automation. Reduce assessment time by 90%.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a
              href="https://www.dr-dede.com/contact"
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-xl hover:from-indigo-500 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-indigo-500/25 hover:shadow-2xl transform hover:scale-105"
            >
              Request Demo
            </a>
            <a
              href="https://www.dr-dede.com/contact"
              className="px-8 py-4 bg-emerald-600/20 border border-emerald-400/50 text-emerald-300 font-semibold rounded-xl hover:bg-emerald-600/30 transition-all duration-200"
            >
              Start Free Trial
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8">
            <div>
              <p className="text-3xl font-bold text-emerald-400">90%</p>
              <p className="text-gray-400 text-sm mt-2">Faster Assessment</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-400">500+</p>
              <p className="text-gray-400 text-sm mt-2">Controls Supported</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-400">15+</p>
              <p className="text-gray-400 text-sm mt-2">Frameworks</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-indigo-950/50 border-t border-indigo-500/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-4 text-center">The GRC + Travel Risk Disconnect</h2>
          <p className="text-xl text-gray-300 text-center mb-12">
            Security leaders struggle with siloed tools and manual processes that leave blind spots
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-800/50 border border-indigo-500/30 rounded-xl p-8 hover:border-indigo-400/60 transition-all">
              <div className="text-indigo-400 mb-4"><IconAlert className="text-indigo-400" /></div>
              <h3 className="text-xl font-bold text-white mb-3">Fragmented Data</h3>
              <p className="text-gray-300">GRC assessments, travel systems, and threat intelligence remain disconnected, creating gaps in organizational risk visibility.</p>
            </div>
            <div className="bg-slate-800/50 border border-indigo-500/30 rounded-xl p-8 hover:border-indigo-400/60 transition-all">
              <div className="text-indigo-400 mb-4"><IconClock className="text-indigo-400" /></div>
              <h3 className="text-xl font-bold text-white mb-3">Manual Processes</h3>
              <p className="text-gray-300">Spreadsheets, email chains, and manual mapping waste 200+ hours per assessment cycle per team.</p>
            </div>
            <div className="bg-slate-800/50 border border-indigo-500/30 rounded-xl p-8 hover:border-indigo-400/60 transition-all">
              <div className="text-indigo-400 mb-4"><IconTarget className="text-indigo-400" /></div>
              <h3 className="text-xl font-bold text-white mb-3">Hidden Risk</h3>
              <p className="text-gray-300">85% of security incidents involve human factors — policies often ignore critical traveler vulnerabilities.</p>
            </div>
            <div className="bg-slate-800/50 border border-indigo-500/30 rounded-xl p-8 hover:border-indigo-400/60 transition-all">
              <div className="text-indigo-400 mb-4"><IconBarChart className="text-indigo-400" /></div>
              <h3 className="text-xl font-bold text-white mb-3">Poor Visibility</h3>
              <p className="text-gray-300">Executives lack a unified risk dashboard, making board reporting and decision-making slow and incomplete.</p>
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-r from-indigo-500/20 to-emerald-500/20 border border-indigo-400/30 rounded-xl p-8 text-center">
            <p className="text-2xl font-semibold text-emerald-300">
              85% of security incidents involve human factors
            </p>
            <p className="text-gray-300 mt-2">Organizations need integrated risk intelligence — not disconnected assessments.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-4 text-center">How It Works</h2>
          <p className="text-xl text-gray-300 text-center mb-12">From framework upload to unified risk score in 5 minutes</p>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {[
              { step: 1, title: 'Upload GRC Framework', desc: 'Import ISO 27001, NIST, SOC 2, or CIS documents', color: 'indigo' },
              { step: 2, title: 'AI Maps Controls', desc: 'Automatic cross-framework control mapping', color: 'indigo' },
              { step: 3, title: 'Assess Travel Risk', desc: 'Integrate real-time traveler & geopolitical data', color: 'indigo' },
              { step: 4, title: 'Get Unified Report', desc: 'Actionable risk dashboard & recommendations', color: 'emerald' },
            ].map(({ step, title, desc, color }) => (
              <div key={step} className="relative">
                <div className={`bg-gradient-to-br from-${color}-600 to-${color}-700 rounded-full w-16 h-16 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4`}>
                  {step}
                </div>
                <div className={`bg-slate-800/50 border border-${color}-500/30 rounded-xl p-6 text-center`}>
                  <h3 className="text-white font-bold mb-3">{title}</h3>
                  <p className="text-gray-400 text-sm">{desc}</p>
                </div>
                {step < 4 && (
                  <div className="hidden md:block absolute top-8 -right-3 w-6 h-1 bg-gradient-to-r from-indigo-500 to-emerald-500"></div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12 p-6 bg-emerald-600/20 border border-emerald-400/30 rounded-xl flex items-center justify-center gap-3">
            <IconZap className="text-emerald-300" />
            <p className="text-2xl font-bold text-emerald-300">5 minutes from upload to score</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-indigo-950/50 border-t border-indigo-500/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-4 text-center">Enterprise-Grade Features</h2>
          <p className="text-xl text-gray-300 text-center mb-12">Everything you need to unify risk intelligence across your organization</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { Icon: IconTarget, title: 'Multi-Framework Support', desc: 'ISO 27001, SOC 2, NIST, CIS Controls, and custom frameworks' },
              { Icon: IconCpu, title: 'AI-Powered Scoring', desc: 'LLM-based control mapping, gap analysis, and risk recommendations' },
              { Icon: IconGlobe, title: 'Real-Time Travel Integration', desc: 'Live travel advisories, health risks, and geopolitical intelligence' },
              { Icon: IconLock, title: 'RBAC & Audit Trail', desc: 'Fine-grained permissions and complete compliance audit logging' },
              { Icon: IconSettings, title: 'API Access', desc: 'Integrate risk intelligence into your security infrastructure' },
              { Icon: IconBarChart, title: 'Executive Dashboards', desc: 'Board-ready reports and real-time risk visualization' },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="bg-slate-800/50 border border-indigo-500/30 rounded-xl p-8 hover:border-indigo-400/60 hover:bg-slate-800/70 transition-all group">
                <div className="text-indigo-400 mb-4 group-hover:scale-110 transition-transform"><Icon className="text-indigo-400" /></div>
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-gray-300">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-4 text-center">Trusted by Security Leaders</h2>

          <div className="grid md:grid-cols-3 gap-8 my-12">
            {[
              { value: '500+', label: 'Controls Assessed Daily' },
              { value: '15+', label: 'Frameworks Supported' },
              { value: '90%', label: 'Time Saved vs Manual' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-slate-800/50 border border-indigo-500/30 rounded-xl p-8 text-center">
                <p className="text-4xl font-bold text-emerald-400 mb-2">{value}</p>
                <p className="text-gray-300">{label}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-indigo-600/30 to-emerald-600/30 border border-indigo-400/30 rounded-xl p-12 text-center">
            <p className="text-gray-300 text-lg mb-6 italic">
              &ldquo;GRC TravelRisk transformed how we assess organizational and traveler risk. What used to take weeks now takes minutes, and our board finally has the visibility they need.&rdquo;
            </p>
            <p className="text-white font-semibold">Jane Smith, CISO</p>
            <p className="text-gray-400">Fortune 500 Financial Services</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-indigo-950/50 border-t border-indigo-500/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-4 text-center">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-300 text-center mb-12">Choose the plan that fits your organization&apos;s scale and needs</p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="bg-slate-800/50 border border-indigo-500/30 rounded-xl p-8 hover:border-indigo-400/60 hover:bg-slate-800/70 transition-all">
              <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
              <p className="text-gray-400 mb-6">For small security teams</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-emerald-400">$499</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {['Up to 100 controls', '2 frameworks', 'Basic travel integration', '1 user seat'].map((f) => (
                  <li key={f} className="flex items-center text-gray-300 gap-3">
                    <IconCheck className="text-emerald-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
                <li className="flex items-center text-gray-400 gap-3">
                  <IconX className="text-gray-600 flex-shrink-0" />
                  API access
                </li>
              </ul>
              <a href="https://www.dr-dede.com/contact" className="w-full block text-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold">
                Get Started
              </a>
            </div>

            {/* Professional */}
            <div className="bg-gradient-to-br from-indigo-600/40 to-emerald-600/40 border border-emerald-400/60 rounded-xl p-8 relative transform md:scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
              <p className="text-gray-300 mb-6">For growing teams</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-emerald-400">$1,499</span>
                <span className="text-gray-300">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {['Up to 500 controls', 'All frameworks', 'Advanced travel integration', 'Up to 10 user seats', 'API access'].map((f) => (
                  <li key={f} className="flex items-center text-gray-200 gap-3">
                    <IconCheck className="text-emerald-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="https://www.dr-dede.com/contact" className="w-full block text-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-emerald-600 text-white rounded-xl hover:from-indigo-500 hover:to-emerald-500 transition-all font-semibold">
                Request Demo
              </a>
            </div>

            {/* Enterprise */}
            <div className="bg-slate-800/50 border border-indigo-500/30 rounded-xl p-8 hover:border-indigo-400/60 hover:bg-slate-800/70 transition-all">
              <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
              <p className="text-gray-400 mb-6">For large organizations</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-emerald-400">$4,999</span>
                <span className="text-gray-400">+/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {['Unlimited controls', 'Custom frameworks', 'Premium travel integration', 'Unlimited user seats', 'Priority API access'].map((f) => (
                  <li key={f} className="flex items-center text-gray-300 gap-3">
                    <IconCheck className="text-emerald-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="https://www.dr-dede.com/contact" className="w-full block text-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold">
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-6">Ready to Unify Your Risk Intelligence?</h2>
          <p className="text-xl text-gray-300 mb-10">
            Join security leaders who&apos;ve eliminated the GRC + travel risk disconnect. Get started today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://www.dr-dede.com/contact"
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-xl hover:from-indigo-500 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-indigo-500/25 hover:shadow-2xl transform hover:scale-105"
            >
              Request a Demo
            </a>
            <a
              href="https://www.dr-dede.com/contact"
              className="px-8 py-4 bg-emerald-600/20 border border-emerald-400/50 text-emerald-300 font-semibold rounded-xl hover:bg-emerald-600/30 transition-all duration-200"
            >
              Start Free Trial
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-indigo-500/20 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">&copy; 2026 GRC TravelRisk Engine. Unified risk intelligence for security leaders.</p>
          <div className="flex gap-6 text-gray-400 text-sm">
            <a href="https://www.dr-dede.com" className="hover:text-indigo-300 transition-colors">dr-dede.com</a>
            <a href="https://www.dr-dede.com/contact" className="hover:text-indigo-300 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
