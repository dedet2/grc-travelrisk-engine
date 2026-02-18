'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';

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

function IconBarChart({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>
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

function IntegrationLogo({ name, initials }: { name: string; initials: string }) {
  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500', 'bg-indigo-500', 'bg-cyan-500'];
  const colorIndex = name.charCodeAt(0) % colors.length;

  return (
    <div className={`${colors[colorIndex]} rounded-lg w-12 h-12 flex items-center justify-center text-white font-bold text-xs shadow-md`}>
      {initials}
    </div>
  );
}

export default function Home() {
  const [pricingData, setPricingData] = useState<any[]>([]);
  const [loadingPricing, setLoadingPricing] = useState(true);

  useEffect(() => {
    async function fetchPricing() {
      try {
        const response = await fetch('/api/billing/pricing');
        if (response.ok) {
          const data = await response.json();
          setPricingData(data.tiers || []);
        }
      } catch (err) {
        console.error('Error fetching pricing:', err);
      } finally {
        setLoadingPricing(false);
      }
    }
    fetchPricing();
  }, []);

  const integrations = [
    { name: 'Airtable', initials: 'AT' },
    { name: 'Make.com', initials: 'MC' },
    { name: 'Slack', initials: 'SK' },
    { name: 'VibeKanban', initials: 'VK' },
    { name: 'Podia', initials: 'PD' },
    { name: 'Perplexity Pro', initials: 'PP' },
    { name: 'Calendly', initials: 'CY' },
    { name: 'Klenty', initials: 'KT' },
    { name: 'Apollo', initials: 'AP' },
    { name: 'LinkedIn Sales Nav', initials: 'LN' },
    { name: 'Supabase', initials: 'SB' },
    { name: 'Vercel', initials: 'VL' },
  ];

  const features = [
    { Icon: IconShield, title: 'GRC Automation', description: 'Automate compliance across NIST, ISO 27001, SOC 2, and GDPR' },
    { Icon: IconGlobe, title: 'Travel Risk Assessment', description: 'Real-time country risk scoring and traveler safety monitoring' },
    { Icon: IconCpu, title: 'AI Agent Fleet', description: '34 specialized agents handling compliance, risk, sales, and operations' },
    { Icon: IconBarChart, title: 'Executive Dashboard', description: 'Live KPIs, risk trends, compliance scores, and pipeline metrics' },
    { Icon: IconAlert, title: 'Risk Scoring Engine', description: 'Entity, travel, and portfolio risk calculations on a 0-100 scale' },
    { Icon: IconLock, title: 'Workflow Automation', description: '8 automated workflows from vendor onboarding to incident response' },
  ];

  const testimonials = [
    { text: 'GRC TravelRisk transformed how we manage organizational and travel risk. What used to take weeks now takes minutes.', author: 'Sarah Chen', company: 'Fortune 500 Tech' },
    { text: 'The unified risk dashboard has given our board the visibility they needed. Compliance is now proactive, not reactive.', author: 'Michael Rodriguez', company: 'Global Financial Services' },
    { text: 'Integration with our existing tools was seamless. Our security team loves the AI-powered insights and automation.', author: 'Jessica Liu', company: 'Startup SaaS Leader' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-indigo-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              GRC TravelRisk Engine
            </div>
          </div>
          <div className="hidden md:flex gap-8 items-center text-sm text-gray-300">
            <a href="#features" className="hover:text-indigo-300 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-indigo-300 transition-colors">Pricing</a>
            <a href="#integrations" className="hover:text-indigo-300 transition-colors">Integrations</a>
            <a href="#testimonials" className="hover:text-indigo-300 transition-colors">About</a>
          </div>
          <div className="flex gap-4 items-center">
            <SignedIn>
              <Link href="/dashboard" className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-500 hover:to-indigo-600 transition-all text-sm font-medium">
                Dashboard
              </Link>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-indigo-300 hover:text-indigo-100 transition-colors text-sm font-medium">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-500 hover:to-indigo-600 transition-all text-sm font-medium">
                  Get Started
                </button>
              </SignUpButton>
            </SignedOut>
          </div>
        </div>
      </nav>

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
            AI-Powered GRC & Travel Risk Intelligence
          </h1>

          <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Automate compliance, assess travel risk, and manage governance with 34 AI agents working 24/7
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a href="#" className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-xl hover:from-indigo-500 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-indigo-500/25 hover:shadow-2xl transform hover:scale-105">
              Start Free Trial
            </a>
            <a href="#" className="px-8 py-4 bg-emerald-600/20 border border-emerald-400/50 text-emerald-300 font-semibold rounded-xl hover:bg-emerald-600/30 transition-all duration-200">
              Book a Demo
            </a>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8 text-center">
            <div>
              <p className="text-3xl font-bold text-emerald-400">111+</p>
              <p className="text-gray-400 text-sm mt-2">API Endpoints</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-400">34</p>
              <p className="text-gray-400 text-sm mt-2">AI Agents</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-400">6</p>
              <p className="text-gray-400 text-sm mt-2">Frameworks</p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-indigo-950/50 border-t border-indigo-500/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-4 text-center">Enterprise-Grade Features</h2>
          <p className="text-xl text-gray-300 text-center mb-12">Everything you need to unify risk intelligence across your organization</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(({ Icon, title, description }) => (
              <div key={title} className="bg-slate-800/50 border border-indigo-500/30 rounded-xl p-8 hover:border-indigo-400/60 hover:bg-slate-800/70 transition-all group">
                <div className="text-indigo-400 mb-4 group-hover:scale-110 transition-transform"><Icon className="text-indigo-400" /></div>
                <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                <p className="text-gray-300">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="integrations" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-4 text-center">Integrates with Your Entire Tech Stack</h2>
          <p className="text-xl text-gray-300 text-center mb-12">Connect to your favorite tools and services</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {integrations.map((integration) => (
              <div key={integration.name} className="flex flex-col items-center gap-3 p-4 bg-slate-800/50 border border-indigo-500/30 rounded-lg hover:border-indigo-400/60 transition-colors group">
                <IntegrationLogo name={integration.name} initials={integration.initials} />
                <span className="text-sm font-medium text-gray-300 text-center group-hover:text-white transition-colors">{integration.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-indigo-950/50 border-t border-indigo-500/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-4 text-center">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-300 text-center mb-12">Choose the plan that fits your organization's scale and needs</p>

          {loadingPricing ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-800/50 border border-indigo-500/30 rounded-xl p-8 h-96 animate-pulse" />
              ))}
            </div>
          ) : pricingData.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {pricingData.map((tier, idx) => (
                <div
                  key={tier.name}
                  className={`${
                    tier.name === 'Professional' || idx === 1
                      ? 'bg-gradient-to-br from-indigo-600/40 to-emerald-600/40 border border-emerald-400/60 relative transform md:scale-105'
                      : 'bg-slate-800/50 border border-indigo-500/30 hover:border-indigo-400/60 hover:bg-slate-800/70'
                  } rounded-xl p-8 transition-all group`}
                >
                  {(tier.name === 'Professional' || idx === 1) && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <p className={idx === 1 ? 'text-gray-300 mb-6' : 'text-gray-400 mb-6'}>{tier.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-emerald-400">${tier.price}</span>
                    <span className={idx === 1 ? 'text-gray-300' : 'text-gray-400'}>/month</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {(tier.features || []).map((feature: string) => (
                      <li key={feature} className={`flex items-center ${idx === 1 ? 'text-gray-200' : 'text-gray-300'} gap-3`}>
                        <IconCheck className={`${idx === 1 ? 'text-emerald-400' : 'text-emerald-400'} flex-shrink-0`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#"
                    className={`w-full block text-center px-6 py-3 rounded-xl transition-all font-semibold ${
                      idx === 1
                        ? 'bg-gradient-to-r from-indigo-600 to-emerald-600 text-white hover:from-indigo-500 hover:to-emerald-500'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {tier.name === 'Enterprise' ? 'Contact Sales' : tier.name === 'Professional' ? 'Request Demo' : 'Get Started'}
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-slate-800/50 border border-indigo-500/30 rounded-xl p-8 hover:border-indigo-400/60 hover:bg-slate-800/70 transition-all">
                <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
                <p className="text-gray-400 mb-6">For small security teams</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-emerald-400">$299</span>
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
                <a href="#" className="w-full block text-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold">
                  Get Started
                </a>
              </div>

              <div className="bg-gradient-to-br from-indigo-600/40 to-emerald-600/40 border border-emerald-400/60 rounded-xl p-8 relative transform md:scale-105">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                  Most Popular
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
                <p className="text-gray-300 mb-6">For growing teams</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-emerald-400">$799</span>
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
                <a href="#" className="w-full block text-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-emerald-600 text-white rounded-xl hover:from-indigo-500 hover:to-emerald-500 transition-all font-semibold">
                  Request Demo
                </a>
              </div>

              <div className="bg-slate-800/50 border border-indigo-500/30 rounded-xl p-8 hover:border-indigo-400/60 hover:bg-slate-800/70 transition-all">
                <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
                <p className="text-gray-400 mb-6">For large organizations</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-emerald-400">$2,499</span>
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
                <a href="#" className="w-full block text-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold">
                  Contact Sales
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-4 text-center">Trusted by Security Leaders</h2>
          <p className="text-xl text-gray-300 text-center mb-12">Organizations worldwide rely on GRC TravelRisk</p>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-slate-800/50 border border-indigo-500/30 rounded-xl p-8 hover:border-indigo-400/60 transition-all">
                <p className="text-gray-300 mb-6 italic">"{testimonial.text}"</p>
                <div>
                  <p className="text-white font-semibold">{testimonial.author}</p>
                  <p className="text-gray-400 text-sm">{testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-6">Ready to Transform Your GRC Operations?</h2>
          <p className="text-xl text-gray-300 mb-10">
            Join security leaders who have eliminated the GRC and travel risk disconnect.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#" className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-xl hover:from-indigo-500 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-indigo-500/25 hover:shadow-2xl transform hover:scale-105">
              Start Your Free Trial
            </a>
            <a href="#" className="px-8 py-4 bg-emerald-600/20 border border-emerald-400/50 text-emerald-300 font-semibold rounded-xl hover:bg-emerald-600/30 transition-all duration-200">
              Book a Demo
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-indigo-500/20 py-8 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-indigo-300 transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-indigo-300 transition-colors">Pricing</a></li>
                <li><a href="#integrations" className="hover:text-indigo-300 transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-indigo-300 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-indigo-300 transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-indigo-300 transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-indigo-300 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-indigo-300 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-indigo-300 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Follow</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-indigo-300 transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-indigo-300 transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-indigo-300 transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-indigo-500/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">&copy; 2026 GRC TravelRisk Engine. All rights reserved.</p>
            <div className="flex gap-6 text-gray-400 text-sm">
              <a href="#" className="hover:text-indigo-300 transition-colors">Status</a>
              <a href="#" className="hover:text-indigo-300 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
