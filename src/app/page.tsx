'use client';

import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { ArrowRight, Shield, TrendingUp, Globe, Lock, Users, CheckCircle, Zap } from 'lucide-react';
import { Footer } from '@/components/layout/footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-fuchsia-950 text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-violet-950/60 border-b border-violet-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="https://dr-dede.com" className="text-sm text-violet-300 hover:text-white transition flex items-center gap-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              dr-dede.com
            </Link>
            <Link href="/" className="font-bold text-2xl bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              AI GRC Engine
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#pricing" className="text-sm hover:text-cyan-300 transition">
              Pricing
            </a>
            <Link href="https://dr-dede.com/incluu" className="text-sm hover:text-cyan-300 transition">
              incluu
            </Link>
            <Link href="https://dr-dede.com/dr-dede" className="text-sm hover:text-cyan-300 transition">
              About Dr. Dédé
            </Link>
            <Link href="https://dr-dede.com/speaking" className="text-sm hover:text-cyan-300 transition">
              Speaking
            </Link>
            <Link href="https://dr-dede.com/contact" className="text-sm hover:text-cyan-300 transition">
              Contact
            </Link>
            <Link href="https://dr-dede.com/contact" className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-sm font-semibold transition">
              Schedule Consultation
            </Link>
            
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-sm text-violet-200 hover:text-white transition">
                  Admin
                </button>
              </SignInButton>
            </SignedOut>
            
            <SignedIn>
              <Link href="/dashboard" className="text-sm text-violet-200 hover:text-white transition">
                Dashboard
              </Link>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-24 max-w-7xl mx-auto text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 to-transparent rounded-full blur-3xl -z-10"></div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-fuchsia-300 to-violet-400 bg-clip-text text-transparent leading-tight">
          AI Governance, Risk & Compliance
        </h1>
        
        <p className="text-xl md:text-2xl text-violet-200 mb-8 max-w-3xl mx-auto leading-relaxed">
          Dr. Dédé's premium consulting service for enterprises navigating AI regulation, compliance frameworks, and governance at scale. Transform your organizational risk into competitive advantage.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="https://dr-dede.com/contact" className="px-8 py-3 bg-violet-600 hover:bg-violet-700 rounded-lg font-semibold inline-flex items-center justify-center gap-2 transition">
            Schedule Consultation <ArrowRight size={20} />
          </Link>
          <Link href="https://dr-dede.com/speaking" className="px-8 py-3 border border-violet-400 hover:bg-violet-600/10 rounded-lg font-semibold transition">
            Book Speaking Engagement
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center mt-16 max-w-2xl mx-auto">
          <div>
            <div className="text-3xl font-bold text-cyan-400">$1.5B+</div>
            <div className="text-sm text-violet-300">Proven Business Impact</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-violet-400">Fortune 500</div>
            <div className="text-sm text-violet-300">Enterprise Track Record</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-cyan-400">TEDx</div>
            <div className="text-sm text-violet-300">Keynote Speaker</div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold mb-4 text-center">
          What You Get
        </h2>
        <p className="text-center text-violet-300 mb-16 max-w-2xl mx-auto">
          Comprehensive AI governance and compliance solutions tailored to your enterprise's unique risk profile and regulatory landscape.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Service 1 */}
          <div className="bg-gradient-to-br from-violet-900/40 to-purple-900/30 border border-violet-500/30 rounded-lg p-8 hover:border-cyan-400/60 transition">
            <Shield className="w-12 h-12 text-violet-400 mb-4" />
            <h3 className="text-2xl font-bold mb-3">
              AI Governance & Regulatory Compliance Assessments
            </h3>
            <p className="text-violet-200 mb-4">
              Deep-dive analysis of your AI systems, data practices, and regulatory exposure across GDPR, HIPAA, SOC2, and emerging AI-specific frameworks.
            </p>
            <div className="text-fuchsia-300 font-semibold">
              $100K — $500K engagement
            </div>
          </div>

          {/* Service 2 */}
          <div className="bg-gradient-to-br from-violet-900/40 to-purple-900/30 border border-violet-500/30 rounded-lg p-8 hover:border-cyan-400/60 transition">
            <Users className="w-12 h-12 text-violet-400 mb-4" />
            <h3 className="text-2xl font-bold mb-3">
              Executive Advisory Retainers
            </h3>
            <p className="text-violet-200 mb-4">
              Ongoing strategic guidance for your C-suite and board. Monthly advisory calls, regulatory intelligence updates, and governance roadmap refinement.
            </p>
            <div className="text-fuchsia-300 font-semibold">
              Custom quarterly retainers
            </div>
          </div>

          {/* Service 3 */}
          <div className="bg-gradient-to-br from-violet-900/40 to-purple-900/30 border border-violet-500/30 rounded-lg p-8 hover:border-cyan-400/60 transition">
            <Zap className="w-12 h-12 text-violet-400 mb-4" />
            <h3 className="text-2xl font-bold mb-3">
              Done-For-You Compliance AI Agent Licensing
            </h3>
            <p className="text-violet-200 mb-4">
              License Dr. Dédé's proprietary AI agents that automate compliance monitoring, documentation, and audit preparation for your organization.
            </p>
            <div className="text-fuchsia-300 font-semibold">
              Annual licensing models
            </div>
          </div>

          {/* Service 4 */}
          <div className="bg-gradient-to-br from-violet-900/40 to-purple-900/30 border border-violet-500/30 rounded-lg p-8 hover:border-cyan-400/60 transition">
            <Lock className="w-12 h-12 text-violet-400 mb-4" />
            <h3 className="text-2xl font-bold mb-3">
              AI GRC VIP Strategy Days
            </h3>
            <p className="text-violet-200 mb-4">
              Intensive 2-3 day off-site workshop with your leadership team to design your multi-year AI governance and compliance roadmap.
            </p>
            <div className="text-fuchsia-300 font-semibold">
              $25K — $50K per engagement
            </div>
          </div>

          {/* Service 5 */}
          <div className="bg-gradient-to-br from-violet-900/40 to-purple-900/30 border border-violet-500/30 rounded-lg p-8 hover:border-cyan-400/60 transition">
            <Globe className="w-12 h-12 text-violet-400 mb-4" />
            <h3 className="text-2xl font-bold mb-3">
              Travel Risk Intelligence for Enterprises
            </h3>
            <p className="text-violet-200 mb-4">
              Real-time travel risk assessments and geopolitical intelligence for enterprises managing global workforces. Mitigate exposure in high-risk regions.
            </p>
            <div className="text-fuchsia-300 font-semibold">
              Custom deployment pricing
            </div>
          </div>

          {/* Service 6 */}
          <div className="bg-gradient-to-br from-violet-900/40 to-purple-900/30 border border-violet-500/30 rounded-lg p-8 hover:border-cyan-400/60 transition">
            <TrendingUp className="w-12 h-12 text-violet-400 mb-4" />
            <h3 className="text-2xl font-bold mb-3">
              Accessible Travel Risk Consulting
            </h3>
            <p className="text-violet-200 mb-4">
              Specialized risk assessment for employees with disabilities traveling globally. Ensure equitable access, safety, and compliance with accessibility standards.
            </p>
            <div className="text-fuchsia-300 font-semibold">
              Included in enterprise packages
            </div>
          </div>
        </div>
      </section>

      {/* Full GRC Hybrid Model Pricing */}
      <section id="pricing" className="px-6 py-20 bg-violet-900/20 border-y border-violet-500/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-center">
            Engagement & Pricing Tiers
          </h2>
          <p className="text-center text-violet-300 mb-16 max-w-2xl mx-auto">
            From self-serve compliance playbooks to bespoke enterprise engagements — choose the level that fits your organization.
          </p>

          {/* Tier Row 1: Compliance Playbooks (Entry) */}
          <h3 className="text-2xl font-bold mb-8 text-fuchsia-300">Compliance Playbooks</h3>
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Playbook Lite */}
            <div className="bg-gradient-to-br from-violet-900/40 to-purple-900/30 border border-violet-500/30 rounded-lg p-8 hover:border-cyan-400/60 transition">
              <h4 className="text-xl font-bold mb-2">Starter Kit</h4>
              <p className="text-violet-300 text-sm mb-6">Self-serve templates kit designed to jumpstart your AI governance implementation.</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-cyan-400">$497</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Compliance Conversation Playbook (PDF)', 'Core Compliance Templates', 'Basic Email Template Library', 'Email Support', '30-Day Access to Updates'].map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-violet-200">
                    <CheckCircle className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="https://buy.stripe.com/14A4gz8S07fD7KK5P37kc07" className="w-full block text-center px-6 py-3 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 rounded-lg font-semibold transition text-sm">
                Buy Now — $497
              </Link>
            </div>

            {/* Playbook Standard */}
            <div className="bg-gradient-to-br from-violet-600/30 to-cyan-600/20 border border-cyan-400/50 rounded-lg p-8 relative transform md:scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                Most Popular
              </div>
              <h4 className="text-xl font-bold mb-2">Standard</h4>
              <p className="text-violet-200 text-sm mb-6">Full implementation toolkit with editable templates and video walkthrough.</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-cyan-400">$997</span>
                <span className="text-violet-400/70 text-sm ml-2 line-through">$1,297</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Everything in Lite', 'Decision Decoder Templates (Sheets + Airtable)', 'Tutorial Video Walkthrough', 'Implementation Checklist', 'Editable Workflows', 'Email & Slack Support', '90-Day Access to Updates'].map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-violet-100">
                    <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="https://dr-dede.com/contact" className="w-full block text-center px-6 py-3 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 rounded-lg font-semibold transition text-sm">
                Upgrade to Standard
              </Link>
            </div>

            {/* Playbook Premium */}
            <div className="bg-gradient-to-br from-violet-900/40 to-purple-900/30 border border-violet-500/30 rounded-lg p-8 hover:border-cyan-400/60 transition">
              <h4 className="text-xl font-bold mb-2">Premium</h4>
              <p className="text-violet-300 text-sm mb-6">Full strategic implementation with live consulting from Dr. Dédé.</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-cyan-400">$2,497</span>
                <span className="text-violet-400/70 text-sm ml-2 line-through">$3,497</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Everything in Standard', '45-Minute Live Q&A with Dr. Dédé', 'Custom Implementation Strategy', 'Executive Alignment Consulting', 'Trust Pressure Test Assessment', 'Priority Support', '1-Year Access to Updates', 'Quarterly Check-in Calls'].map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-violet-200">
                    <CheckCircle className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="https://dr-dede.com/contact" className="w-full block text-center px-6 py-3 border border-violet-400 hover:bg-violet-600/10 rounded-lg font-semibold transition text-sm">
                Get Premium Access
              </Link>
            </div>
          </div>

          {/* Tier Row 2: DFY AI Agent Licensing */}
          <h3 className="text-2xl font-bold mb-8 text-fuchsia-300">Done-For-You AI Agent Licensing</h3>
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            <div className="bg-gradient-to-br from-violet-900/40 to-purple-900/30 border border-violet-500/30 rounded-lg p-6 hover:border-cyan-400/60 transition">
              <h4 className="text-lg font-bold mb-2">Starter Agent Kit</h4>
              <p className="text-violet-300 text-xs mb-4">Essential AI agents for compliance monitoring and basic automation.</p>
              <div className="mb-4">
                <span className="text-3xl font-bold text-cyan-400">$5K</span>
                <span className="text-violet-300 text-sm"> — $10K</span>
              </div>
              <ul className="space-y-2 mb-6">
                {['2-3 Core Compliance Agents', 'Basic Monitoring Dashboard', 'Email Alerts & Notifications', 'Monthly Agent Reports', 'Standard Support'].map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs text-violet-200">
                    <CheckCircle className="w-3 h-3 text-violet-400 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="https://dr-dede.com/contact" className="w-full block text-center px-4 py-2 border border-violet-400 hover:bg-violet-600/10 rounded-lg font-semibold transition text-xs">
                Get Started
              </Link>
            </div>

            <div className="bg-gradient-to-br from-violet-600/30 to-cyan-600/20 border border-cyan-400/50 rounded-lg p-6 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white px-3 py-0.5 rounded-full text-[10px] font-bold">
                Best Value
              </div>
              <h4 className="text-lg font-bold mb-2">Pro AI Stack</h4>
              <p className="text-violet-200 text-xs mb-4">Advanced multi-agent system with workflow automation and integrations.</p>
              <div className="mb-4">
                <span className="text-3xl font-bold text-cyan-400">$15K</span>
                <span className="text-violet-300 text-sm"> — $25K</span>
              </div>
              <ul className="space-y-2 mb-6">
                {['5-8 Specialized Agents', 'Multi-Agent Orchestration', 'CRM & Tool Integrations', 'Custom Workflow Automation', 'Priority Support & Training'].map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs text-violet-100">
                    <CheckCircle className="w-3 h-3 text-cyan-400 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="https://dr-dede.com/contact" className="w-full block text-center px-4 py-2 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 rounded-lg font-semibold transition text-xs">
                Upgrade to Pro
              </Link>
            </div>

            <div className="bg-gradient-to-br from-violet-900/40 to-purple-900/30 border border-violet-500/30 rounded-lg p-6 hover:border-cyan-400/60 transition">
              <h4 className="text-lg font-bold mb-2">Compliance Vault</h4>
              <p className="text-violet-300 text-xs mb-4">Full-suite enterprise compliance automation with white-glove setup.</p>
              <div className="mb-4">
                <span className="text-3xl font-bold text-cyan-400">$35K</span>
                <span className="text-violet-300 text-sm"> — $50K+</span>
              </div>
              <ul className="space-y-2 mb-6">
                {['Full 28+ Agent Fleet', 'Enterprise Orchestration', 'Custom API Integrations', 'White-Glove Onboarding', 'Dedicated Account Manager'].map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs text-violet-200">
                    <CheckCircle className="w-3 h-3 text-violet-400 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="https://dr-dede.com/contact" className="w-full block text-center px-4 py-2 border border-violet-400 hover:bg-violet-600/10 rounded-lg font-semibold transition text-xs">
                Request Proposal
              </Link>
            </div>

            <div className="bg-gradient-to-br from-violet-900/40 to-purple-900/30 border border-violet-500/30 rounded-lg p-6 hover:border-cyan-400/60 transition">
              <h4 className="text-lg font-bold mb-2">Annual Licensing</h4>
              <p className="text-violet-300 text-xs mb-4">Ongoing agent licensing with continuous updates and support.</p>
              <div className="mb-4">
                <span className="text-3xl font-bold text-cyan-400">$10K</span>
                <span className="text-violet-300 text-sm">/year</span>
              </div>
              <ul className="space-y-2 mb-6">
                {['All Agent Updates Included', 'New Agent Releases', 'Quarterly Strategy Reviews', 'SLA-backed Uptime', 'Renewal Discounts'].map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs text-violet-200">
                    <CheckCircle className="w-3 h-3 text-violet-400 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="https://dr-dede.com/contact" className="w-full block text-center px-4 py-2 border border-violet-400 hover:bg-violet-600/10 rounded-lg font-semibold transition text-xs">
                License Agents
              </Link>
            </div>
          </div>

          {/* Tier Row 3: Enterprise Consulting */}
          <h3 className="text-2xl font-bold mb-8 text-fuchsia-300">Enterprise Consulting & Advisory</h3>
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-violet-900/40 to-purple-900/30 border border-violet-500/30 rounded-lg p-8 hover:border-cyan-400/60 transition">
              <h4 className="text-xl font-bold mb-2">AI GRC Assessment</h4>
              <p className="text-violet-300 text-sm mb-4">Deep-dive governance, risk, and compliance assessment across your AI portfolio.</p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-cyan-400">$100K</span>
                <span className="text-violet-300 text-sm"> — $500K</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Full AI Systems Audit', 'Regulatory Gap Analysis', 'Risk Scoring & Prioritization', 'Board-Ready Executive Report', 'Implementation Roadmap', 'GDPR/HIPAA/SOC2/EU AI Act'].map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-violet-200">
                    <CheckCircle className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="https://dr-dede.com/contact" className="w-full block text-center px-6 py-3 border border-violet-400 hover:bg-violet-600/10 rounded-lg font-semibold transition text-sm">
                Request Assessment
              </Link>
            </div>

            <div className="bg-gradient-to-br from-violet-600/30 to-cyan-600/20 border border-cyan-400/50 rounded-lg p-8 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                High Impact
              </div>
              <h4 className="text-xl font-bold mb-2">VIP Strategy Day</h4>
              <p className="text-violet-200 text-sm mb-4">Intensive 2-3 day off-site with your leadership team for AI governance roadmap design.</p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-cyan-400">$25K</span>
                <span className="text-violet-300 text-sm"> — $50K</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['2-3 Day Intensive Workshop', 'C-Suite & Board Participation', 'Multi-Year Governance Roadmap', 'Custom Policy Drafting', 'Stakeholder Alignment Sessions', 'Post-Workshop Action Plan'].map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-violet-100">
                    <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="https://dr-dede.com/contact" className="w-full block text-center px-6 py-3 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 rounded-lg font-semibold transition text-sm">
                Book VIP Day
              </Link>
            </div>

            <div className="bg-gradient-to-br from-violet-900/40 to-purple-900/30 border border-violet-500/30 rounded-lg p-8 hover:border-cyan-400/60 transition">
              <h4 className="text-xl font-bold mb-2">Executive Advisory Retainer</h4>
              <p className="text-violet-300 text-sm mb-4">Ongoing strategic counsel for your C-suite and board on AI governance.</p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-cyan-400">Custom</span>
                <span className="text-violet-300 text-sm"> quarterly</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Monthly Advisory Calls', 'Regulatory Intelligence Briefings', 'Board Meeting Preparation', 'Policy Review & Updates', 'Crisis Response Support', 'Priority Access to Dr. Dédé'].map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-violet-200">
                    <CheckCircle className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="https://dr-dede.com/contact" className="w-full block text-center px-6 py-3 border border-violet-400 hover:bg-violet-600/10 rounded-lg font-semibold transition text-sm">
                Discuss Retainer
              </Link>
            </div>
          </div>

          {/* Tier Row 4: Speaking & Retreats */}
          <h3 className="text-2xl font-bold mb-8 text-fuchsia-300">Speaking & Retreats</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-violet-900/40 to-purple-900/30 border border-violet-500/30 rounded-lg p-8 hover:border-cyan-400/60 transition">
              <h4 className="text-xl font-bold mb-2">Keynote & Conference Speaking</h4>
              <p className="text-violet-300 text-sm mb-4">TEDx-caliber keynotes on AI governance, disability advocacy, and systems disruption.</p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-cyan-400">$50K+</span>
                <span className="text-violet-300 text-sm"> per engagement</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Custom Keynote Development', 'Pre-Event Audience Analysis', 'Interactive Workshop Option', 'Post-Event Follow-Up Resources', 'Media & Press Coordination'].map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-violet-200">
                    <CheckCircle className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="https://dr-dede.com/speaking" className="w-full block text-center px-6 py-3 border border-violet-400 hover:bg-violet-600/10 rounded-lg font-semibold transition text-sm">
                Book Dr. Dédé
              </Link>
            </div>

            <div className="bg-gradient-to-br from-violet-900/40 to-purple-900/30 border border-violet-500/30 rounded-lg p-8 hover:border-cyan-400/60 transition">
              <h4 className="text-xl font-bold mb-2">Executive AI Governance Retreats</h4>
              <p className="text-violet-300 text-sm mb-4">Exclusive multi-day retreats combining strategic planning, wellness, and transformational leadership.</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-cyan-400">From $11,500</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Curated Destination Experience', 'Strategic Planning Workshops', 'Wellness & Recovery Integration', 'Peer Executive Networking', 'Post-Retreat Implementation Support'].map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-violet-200">
                    <CheckCircle className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="https://dr-dede.com/retreats-advocacy" className="w-full block text-center px-6 py-3 border border-violet-400 hover:bg-violet-600/10 rounded-lg font-semibold transition text-sm">
                View Retreat Calendar
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-6 py-20 bg-violet-900/20 border-y border-violet-500/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-16 text-center">
            Our Engagement Process
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-violet-600/20 border border-violet-500/50 rounded-lg p-8 text-center">
                <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  1
                </div>
                <h3 className="font-bold text-lg mb-2">Enterprise Assessment</h3>
                <p className="text-violet-200 text-sm">
                  Initial discovery and audit of your current AI systems, governance maturity, and compliance gaps.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-violet-500 to-transparent"></div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-violet-600/20 border border-violet-500/50 rounded-lg p-8 text-center">
                <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  2
                </div>
                <h3 className="font-bold text-lg mb-2">AI-Powered Analysis</h3>
                <p className="text-violet-200 text-sm">
                  Proprietary AI agents analyze your risk landscape across governance, compliance, and operational domains.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-violet-500 to-transparent"></div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-violet-600/20 border border-violet-500/50 rounded-lg p-8 text-center">
                <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  3
                </div>
                <h3 className="font-bold text-lg mb-2">Custom Roadmap</h3>
                <p className="text-violet-200 text-sm">
                  Dr. Dédé delivers actionable compliance and governance roadmap with prioritized initiatives and timelines.
                </p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-violet-500 to-transparent"></div>
            </div>

            {/* Step 4 */}
            <div className="relative">
              <div className="bg-violet-600/20 border border-violet-500/50 rounded-lg p-8 text-center">
                <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  4
                </div>
                <h3 className="font-bold text-lg mb-2">Ongoing Monitoring</h3>
                <p className="text-violet-200 text-sm">
                  Continuous compliance tracking, regulatory intelligence, and quarterly governance reviews with your team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold mb-4 text-center">
          Proven Results
        </h2>
        <p className="text-center text-violet-300 mb-16 max-w-2xl mx-auto">
          Real outcomes for Fortune 500 organizations across regulated industries.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Case Study 1 */}
          <div className="bg-gradient-to-br from-violet-900/40 to-purple-900/30 border border-violet-500/30 rounded-lg p-8">
            <div className="flex items-baseline gap-2 mb-4">
              <div className="text-4xl font-bold text-cyan-400">$50M</div>
              <div className="text-violet-300">impact</div>
            </div>
            <h3 className="font-bold text-lg mb-3">AI Governance Framework Implementation</h3>
            <p className="text-violet-200 text-sm mb-4">
              Fortune 500 financial services firm established enterprise-wide AI governance standards, reducing compliance risk and accelerating AI deployment across business units.
            </p>
            <div className="text-xs text-fuchsia-300 font-semibold">Financial Services / 18-month engagement</div>
          </div>

          {/* Case Study 2 */}
          <div className="bg-gradient-to-br from-violet-900/40 to-purple-900/30 border border-violet-500/30 rounded-lg p-8">
            <div className="flex items-baseline gap-2 mb-4">
              <div className="text-4xl font-bold text-cyan-400">$75M</div>
              <div className="text-violet-300">impact</div>
            </div>
            <h3 className="font-bold text-lg mb-3">FinTech Compliance & Regulatory Alignment</h3>
            <p className="text-violet-200 text-sm mb-4">
              Leading FinTech platform redesigned AI algorithms for regulatory compliance across 12 jurisdictions, enabling expansion into new markets.
            </p>
            <div className="text-xs text-fuchsia-300 font-semibold">FinTech / 24-month engagement</div>
          </div>

          {/* Case Study 3 */}
          <div className="bg-gradient-to-br from-violet-900/40 to-purple-900/30 border border-violet-500/30 rounded-lg p-8">
            <div className="flex items-baseline gap-2 mb-4">
              <div className="text-4xl font-bold text-cyan-400">$200M</div>
              <div className="text-violet-300">impact</div>
            </div>
            <h3 className="font-bold text-lg mb-3">Enterprise AI Risk Mitigation Program</h3>
            <p className="text-violet-200 text-sm mb-4">
              Healthcare enterprise implemented comprehensive AI governance, reduced model bias, and achieved industry-leading compliance certifications.
            </p>
            <div className="text-xs text-fuchsia-300 font-semibold">Healthcare / Ongoing retainer</div>
          </div>
        </div>
      </section>

      {/* Credibility Section */}
      <section className="px-6 py-20 bg-violet-900/20 border-y border-violet-500/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-16 text-center">
            Dr. Dédé's Expertise
          </h2>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <CheckCircle className="w-6 h-6 text-violet-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg">TEDx Speaker</h3>
                    <p className="text-violet-300 text-sm">"You've Been Coded Out" — keynoting on AI governance, disability advocacy, and equitable design</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <CheckCircle className="w-6 h-6 text-violet-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg">AI Governance & Disability Advocate</h3>
                    <p className="text-violet-300 text-sm">Leading expert in accessible AI and inclusive governance frameworks for enterprise</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <CheckCircle className="w-6 h-6 text-violet-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg">Principal Consultant at incluu</h3>
                    <p className="text-violet-300 text-sm">Leading strategic AI governance initiatives for Fortune 500 organizations</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <CheckCircle className="w-6 h-6 text-violet-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg">$1.5B+ Business Impact</h3>
                    <p className="text-violet-300 text-sm">Proven track record of enabling major business outcomes across regulated industries</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <CheckCircle className="w-6 h-6 text-violet-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg">Deep Regulatory Expertise</h3>
                    <p className="text-violet-300 text-sm">GDPR, HIPAA, SOC2, EU AI Act, and emerging AI-specific compliance frameworks</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-violet-500/20 to-cyan-500/10 border border-violet-500/40 rounded-lg p-8 text-center">
              <div className="inline-block px-4 py-2 bg-violet-600/20 border border-violet-400 rounded-full text-sm font-semibold text-fuchsia-300 mb-6">
                Consulting Excellence
              </div>
              <h3 className="text-2xl font-bold mb-4">
                Transform Your AI Governance
              </h3>
              <p className="text-violet-200 mb-6">
                Dr. Dédé's proven methodology has helped enterprises navigate the most complex AI governance and compliance challenges. Ready to reimagine your approach?
              </p>
              <Link href="https://dr-dede.com/contact" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 rounded-lg font-semibold transition">
                Schedule Your Consultation <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6">
          Ready to Transform Your AI Governance?
        </h2>
        <p className="text-xl text-violet-200 mb-8">
          Let Dr. Dédé's team conduct a comprehensive assessment of your AI systems and create a custom roadmap for compliance and governance excellence.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="https://dr-dede.com/contact" className="px-8 py-3 bg-violet-600 hover:bg-violet-700 rounded-lg font-semibold inline-flex items-center justify-center gap-2 transition">
            Schedule Consultation <ArrowRight size={20} />
          </Link>
          <Link href="https://dr-dede.com" className="px-8 py-3 border border-violet-400 hover:bg-violet-600/10 rounded-lg font-semibold transition">
            Visit Dr. Dédé's Main Site
          </Link>
        </div>
      </section>

      {/* Footer - matching dr-dede.com global footer */}
      <Footer />
    </div>
  );
}
