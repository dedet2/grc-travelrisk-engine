import Link from 'next/link';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';

export default async function Home() {
  const user = await currentUser();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <div className="text-2xl font-bold text-indigo-600">
          GRC & TravelRisk Engine
        </div>
        <div className="flex gap-4">
          {user ? (
            <>
              <span className="text-gray-700">Welcome, {user.firstName}</span>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-indigo-600 hover:text-indigo-700">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                  Sign Up
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            AI-Powered Risk Assessment & Compliance
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Combine GRC frameworks with travel risk analysis for comprehensive
            organizational and business traveler assessment
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-8 rounded-lg shadow">
            <div className="text-3xl mb-4">📋</div>
            <h2 className="text-2xl font-bold mb-4">GRC Assessments</h2>
            <p className="text-gray-600 mb-4">
              Evaluate your organization against major compliance frameworks:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>ISO 27001 Information Security</li>
              <li>NIST Cybersecurity Framework</li>
              <li>CIS Controls</li>
              <li>SOC 2 Type II</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-lg shadow">
            <div className="text-3xl mb-4">✈️</div>
            <h2 className="text-2xl font-bold mb-4">Travel Risk Analysis</h2>
            <p className="text-gray-600 mb-4">
              Assess risks for business travelers with:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Travel advisories & security threats</li>
              <li>Health risk assessment</li>
              <li>GRC-based organizational risk</li>
              <li>Combined risk scoring</li>
            </ul>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow mb-12">
          <h2 className="text-2xl font-bold mb-4">Key Features</h2>
          <ul className="grid md:grid-cols-2 gap-4 text-gray-600">
            <li className="flex items-start">
              <span className="text-green-500 mr-3">✓</span>
              <span>AI-powered control mapping across frameworks</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-3">✓</span>
              <span>Real-time risk scoring and visualization</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-3">✓</span>
              <span>Comprehensive audit logging</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-3">✓</span>
              <span>Agent-based automation & insights</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-3">✓</span>
              <span>Combined GRC + Travel risk reports</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-3">✓</span>
              <span>Enterprise-grade security & compliance</span>
            </li>
          </ul>
        </div>

        <div className="text-center">
          {user ? (
            <Link
              href="/dashboard"
              className="inline-block px-8 py-3 bg-indigo-600 text-white text-lg rounded hover:bg-indigo-700"
            >
              Go to Dashboard
            </Link>
          ) : (
            <SignUpButton mode="modal">
              <button className="inline-block px-8 py-3 bg-indigo-600 text-white text-lg rounded hover:bg-indigo-700">
                Get Started
              </button>
            </SignUpButton>
          )}
        </div>
      </div>
    </main>
  );
}
