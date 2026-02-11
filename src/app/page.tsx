import Link from 'next/link';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';

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
                <span className="text-gray-300 text-sm">Welcome, {user.firstName}</span>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-500 hover:to-indigo-600 transition-all duration-200"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="px-4 py-2 text-indigo-300 hover:text-indigo-100 transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-500 hover:to-indigo-600 transition-all duration-200">
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
        {/* Gradient background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-indigo-500/20 border border-indigo-400/30 rounded-full">
            <p className="text-indigo-300 text-sm font-semibold">AI-Powered Risk Intelligence</p>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight">
            Unified Risk Scoring: GRC + Travel Risk in <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">Minutes, Not Months</span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Instantly map compliance frameworks, assess organizational risks, and integrate travel intelligence with AI-powered automation. Reduce assessment time by 90%.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a
              href="https://calendly.com/dede-incluu"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-lg hover:from-indigo-500 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-indigo-500/25 hover:shadow-2xl transform hover:scale-105"
            >
              Request Demo
            </a>
            <Link
              href="/auth/sign-up"
              className="px-8 py-4 bg-emerald-600/20 border border-emerald-400/50 text-emerald-300 font-semibold rounded-lg hover:bg-emerald-600/30 transition-all duration-200"
            >
              Start Free Trial
            </Link>
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
          <h2 className="text-4xl font-bold text-white mb-4 text-center">
            The GRC + Travel Risk Disconnect
          </h2>
          <p className="text-xl text-gray-300 text-center mb-12">
            Security leaders struggle with siloed tools and manual processes that leave blind spots
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-800/50 border border-indigo-500/30 rounded-xl p-8 hover:border-indigo-400/60 transition-all">
              <div className="text-indigo-400 mb-4 text-3xl">⚠️</div>
              <h3 className="text-xl font-bold text-white mb-3">Fragmented Data</h3>
              <p className="text-gray-300">GRC assessments, travel systems, and threat intelligence remain disconnected, creating gaps in organizational risk visibility.</p>
            </div>

            <div className="bg-slate-800/50 border border-indigo-500/30 rounded-xl p-8 hover:border-indigo-400/60 transition-all">
              <div className="text-indigo-400 mb-4 text-3xl">⏱️</div>
              <h3 className="text-xl font-bold text-white mb-3">Manual Processes</h3>
              <p className="text-gray-300">Spreadsheets, email chains, and manual mapping waste 200+ hours per assessment cycle per team.</p>
            </div>

            <div className="bg-slate-800/50 border border-indigo-500/30 rounded-xl p-8 hover:border-indigo-400/60 transition-all">
              <div className="text-indigo-400 mb-4 text-3xl">🎯</div>
              <h3 className="text-xl font-bold text-white mb-3">Hidden Risk</h3>
              <p className="text-gray-300">85% of security incidents involve human factors—policies often ignore critical traveler vulnerabilities.</p>
            </div>

            <div className="bg-slate-800/50 border border-indigo-500/30 rounded-xl p-8 hover:border-indigo-400/60 transition-all">
              <div className="text-indigo-400 mb-4 text-3xl">📊</div>
              <h3 className="text-xl font-bold text-white mb-3">Poor Visibility</h3>
              <p className="text-gray-300">Executives lack a unified risk dashboard, making board reporting and decision-making slow and incomplete.</p>
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-r from-indigo-500/20 to-emerald-500/20 border border-indigo-400/30 rounded-xl p-8 text-center">
            <p className="text-2xl font-semibold text-emerald-300">
              85% of security incidents involve human factors
            </p>
            <p className="text-gray-300 mt-2">Organizations need integrated risk intelligence—not disconnected assessments.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-4 text-center">
            How It Works
          </h2>
          <p className="text-xl text-gray-300 text-center mb-12">
            From framework upload to unified risk score in 5 minutes
          </p>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-full w-16 h-16 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                1
              </div>
              <div className="bg-slate-800/50 border border-indigo-500/30 rounded-xl p-6 text-center">
                <h3 className="text-white font-bold mb-3">Upload GRC Framework</h3>
                <p className="text-gray-400 text-sm">Import ISO 27001, NIST, SOC 2, or CIS documents</p>
              </div>
              <div className="hidden md:block absolute top-8 -right-3 w-6 h-1 bg-gradient-to-r from-indigo-500 to-emerald-500"></div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-full w-16 h-16 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                2
              </div>
              <div className="bg-slate-800/50 border border-indigo-500/30 rounded-xl p-6 text-center">
                <h3 className="text-white font-bold mb-3">AI Maps Controls</h3>
                <p className="text-gray-400 text-sm">Automatic cross-framework control mapping</p>
              </div>
              <div className="hidden md:block absolute top-8 -right-3 w-6 h-1 bg-gradient-to-r from-indigo-500 to-emerald-500"></div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-full w-16 h-16 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                3
              </div>
              <div className="bg-slate-800/50 border border-indigo-500/30 rounded-xl p-6 text-center">
                <h3 className="text-white font-bold mb-3">Assess Travel Risk</h3>
                <p className="text-gray-400 text-sm">Integrate real-time traveler & geopolitical data</p>
              </div>
              <div className="hidden md:block absolute top-8 -right-3 w-6 h-1 bg-gradient-to-r from-indigo-500 to-emerald-500"></div>
            </div>

            {/* Step 4 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-full w-16 h-16 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                4
              </div>
              <div className="bg-slate-800/50 border border-emerald-500/30 rounded-xl p-6 text-center">
                <h3 className="text-white font-bold mb-3">Get Unified Report</h3>
                <p className="text-gray-400 text-sm">Actionable risk dashboard & recommendations</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12 p-6 bg-emerald-600/20 border border-emerald-400/30 rounded-xl">
            <p className="text-2xl font-bold text-emerald-300">
              ⚡ 5 minutes from upload to score
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-indigo-950/50 border-t border-indigo-500/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-4 text-center">
            Enterprise-Grade Features
          </h2>
          <p className="text-xl text-gray-300 text-center mb-12">
            Everything you need to unify risk intelligence across your organization
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-800/50 border border-indigo-500/30 rounded-xl p-8 hover:border-indigo-400/60 hover:bg-slate-800/70 transition-all group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🎯</div>
              <h3 className="text-xl font-bold text-white mb-3">Multi-Framework Support</h3>
              <p className="text-gray-300">ISO 27001 • SOC 2 • NIST • CIS Controls • Custom frameworks</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-800/50 border border-indigo-500/30 rounded-xl p-8 hover:border-indigo-400/60 hover:bg-slate-800/70 transition-all group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🤖</div>
              <h3 className="text-xl font-bold text-white mb-3">AI-Powered Scoring</h3>
              <p className="text-gray-300">LLM-based control mapping, gap analysis, and risk recommendations</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-800/50 border border-indigo-500/30 rounded-xl p-8 hover:border-indigo-400/60 hover:bg-slate-800/70 transition-all group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🌍</div>
              <h3 className="text-xl font-bold text-white mb-3">Real-Time Travel Integration</h3>
              <p className="text-gray-300">Live travel advisories, health risks, and geopolitical intelligence</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-800/50 border border-indigo-500/30 rounded-xl p-8 hover:border-indigo-400/60 hover:bg-slate-800/70 transition-all group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🔐</div>
              <h3 className="text-xl font-bold text-white mb-3">RBAC & Audit Trail</h3>
              <p className="text-gray-300">Fine-grained permissions and complete compliance audit logging</p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-800/50 border border-indigo-500/30 rounded-xl p-8 hover:border-indigo-400/60 hover:bg-slate-800/70 transition-all group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">⚙️</div>
              <h3 className="text-xl font-bold text-white mb-3">API Access</h3>
              <p className="text-gray-300">Integrate risk intelligence into your security infrastructure</p>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-800/50 border border-indigo-500/30 rounded-xl p-8 hover:border-indigo-400/60 hover:bg-slate-800/70 transition-all group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📊</div>
              <h3 className="text-xl font-bold text-white mb-3">Executive Dashboards</h3>
              <p className="text-gray-300">Board-ready reports and real-time risk visualization</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-4 text-center">
            Trusted by Security Leaders
          </h2>

          <div className="grid md:grid-cols-3 gap-8 my-12">
            <div className="bg-slate-800/50 border border-indigo-500/30 rounded-xl p-8 text-center">
              <p className="text-4xl font-bold text-emerald-400 mb-2">500+</p>
              <p className="text-gray-300">Controls Assessed Daily</p>
            </div>
            <div className="bg-slate-800/50 border border-indigo-500/30 rounded-xl p-8 text-center">
              <p className="text-4xl font-bold text-emerald-400 mb-2">15+</p>
              <p className="text-gray-300">Frameworks Supported</p>
            </div>
            <div className="bg-slate-800/50 border border-indigo-500/30 rounded-xl p-8 text-center">
              <p className="text-4xl font-bold text-emerald-400 mb-2">90%</p>
              <p className="text-gray-300">Time Saved vs Manual</p>
            </div>
          </div>

          {/* Testimonial Placeholder */}
          <div className="bg-gradient-to-br from-indigo-600/30 to-emerald-600/30 border border-indigo-400/30 rounded-xl p-12 text-center">
            <p className="text-gray-300 text-lg mb-6 italic">
              "GRC TravelRisk transformed how we assess organizational and traveler risk. What used to take weeks now takes minutes, and our board finally has the visibility they need."
            </p>
            <p className="text-white font-semibold">Jane Smith, CISO</p>
            <p className="text-gray-400">Fortune 500 Financial Services</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-indigo-950/50 border-t border-indigo-500/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-4 text-center">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-300 text-center mb-12">
            Choose the plan that fits your organization's scale and needs
          </p>

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
                <li className="flex items-center text-gray-300">
                  <span className="text-emerald-400 mr-3">✓</span>
                  Up to 100 controls
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-emerald-400 mr-3">✓</span>
                  2 frameworks
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-emerald-400 mr-3">✓</span>
                  Basic travel integration
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-emerald-400 mr-3">✓</span>
                  1 user seat
                </li>
                <li className="flex items-center text-gray-400">
                  <span className="text-gray-600 mr-3">✗</span>
                  API access
                </li>
              </ul>
              <SignUpButton mode="modal">
                <button className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold">
                  Get Started
                </button>
              </SignUpButton>
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
                <li className="flex items-center text-gray-200">
                  <span className="text-emerald-400 mr-3">✓</span>
                  Up to 500 controls
                </li>
                <li className="flex items-center text-gray-200">
                  <span className="text-emerald-400 mr-3">✓</span>
                  All frameworks
                </li>
                <li className="flex items-center text-gray-200">
                  <span className="text-emerald-400 mr-3">✓</span>
                  Advanced travel integration
                </li>
                <li className="flex items-center text-gray-200">
                  <span className="text-emerald-400 mr-3">✓</span>
                  Up to 10 user seats
                </li>
                <li className="flex items-center text-gray-200">
                  <span className="text-emerald-400 mr-3">✓</span>
                  API access
                </li>
              </ul>
              <a
                href="https://calendly.com/dede-incluu"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block text-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-emerald-600 text-white rounded-lg hover:from-indigo-500 hover:to-emerald-500 transition-all font-semibold"
              >
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
                <li className="flex items-center text-gray-300">
                  <span className="text-emerald-400 mr-3">✓</span>
                  Unlimited controls
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-emerald-400 mr-3">✓</span>
                  Custom frameworks
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-emerald-400 mr-3">✓</span>
                  Premium travel integration
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-emerald-400 mr-3">✓</span>
                  Unlimited user seats
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-emerald-400 mr-3">✓</span>
                  Priority API access
                </li>
              </ul>
              <a
                href="https://calendly.com/dede-incluu"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block text-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
              >
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
          <h2 className="text-5xl font-bold text-white mb-6">
            Ready to Unify Your Risk Intelligence?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Join security leaders who've eliminated the GRC + travel risk disconnect. Get started today—no credit card required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/dede-incluu"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold rounded-lg hover:from-indigo-500 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-indigo-500/25 hover:shadow-2xl transform hover:scale-105"
            >
              Request a Demo
            </a>
            <Link
              href="/auth/sign-up"
              className="px-8 py-4 bg-emerald-600/20 border border-emerald-400/50 text-emerald-300 font-semibold rounded-lg hover:bg-emerald-600/30 transition-all duration-200"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-indigo-500/20 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center text-gray-400">
          <p>&copy; 2024 GRC TravelRisk Engine. Unified risk intelligence for security leaders.</p>
        </div>
      </footer>
    </main>
  );
}
