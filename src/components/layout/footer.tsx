'use client';

import { useState } from 'react';

/* ── SVG Icon Components (matching dr-dede.com exactly) ── */

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function BlogIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function BlueSkyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.785 2.627 3.6 3.496 6.158 3.16-3.82.569-7.167 2.609-4.27 7.334C5.012 24.263 8.26 21.23 10.12 18.44c.603-.907 1.096-1.807 1.88-1.807.784 0 1.277.9 1.88 1.807 1.86 2.79 5.108 5.823 7.608 2.301 2.897-4.725-.45-6.765-4.27-7.334 2.558.336 5.373-.533 6.158-3.16.246-.829.624-5.789.624-6.479 0-.688-.139-1.86-.902-2.203-.659-.299-1.664-.621-4.3 1.24C16.046 4.747 13.087 8.686 12 10.8z"/>
    </svg>
  );
}

/* ── Newsletter Form (self-contained for GRC project) ── */

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('idle');

    try {
      // Post to dr-dede.com leads API
      const response = await fetch('https://www.dr-dede.com/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'grc-footer' }),
      });

      if (response.ok) {
        setStatus('success');
        setMessage('Successfully subscribed!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2 bg-violet-200 hover:bg-violet-100 text-violet-950 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isLoading ? '...' : 'Subscribe'}
        </button>
      </form>
      {status !== 'idle' && (
        <p className={`text-sm mt-2 ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}
    </div>
  );
}

/* ── Footer Component (exact match of dr-dede.com global footer) ── */

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-violet-950 via-violet-800 to-violet-950 text-white border-t border-violet-700 mt-20">
      {/* Newsletter Section */}
      <div className="border-b border-violet-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-3">Stay Updated</h3>
            <p className="text-violet-300 mb-6">Get the latest insights on AI governance, tech equity, and inclusive innovation delivered to your inbox.</p>
            <NewsletterForm />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 lg:col-span-1">
            <div className="text-2xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-purple-500 bg-clip-text text-transparent mb-4">
              Dr. Dédé Tetsubayashi
            </div>
            <p className="text-sm text-violet-300 leading-relaxed mb-6">
              AI Governance Expert | Digital Equity Pioneer | Tech Ethics Thought Leader
            </p>
            <p className="text-xs text-violet-400 leading-relaxed">
              Transforming tech equity into competitive advantage through strategic AI governance and disability
              advocacy.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Services</h3>
            <ul className="space-y-3 text-sm text-violet-300">
              <li>
                <a href="https://www.dr-dede.com/incluu" className="hover:text-blue-400 transition-colors duration-200 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full group-hover:w-2 transition-all duration-200" />
                  AI GRC Consulting
                </a>
              </li>
              <li>
                <a href="https://www.dr-dede.com/incluu" className="hover:text-blue-400 transition-colors duration-200 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full group-hover:w-2 transition-all duration-200" />
                  Tech Equity Solutions
                </a>
              </li>
              <li>
                <a href="https://www.dr-dede.com/dr-dede" className="hover:text-purple-400 transition-colors duration-200 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-purple-400 rounded-full group-hover:w-2 transition-all duration-200" />
                  Disability Advocacy
                </a>
              </li>
              <li>
                <a href="https://www.dr-dede.com/dr-dede" className="hover:text-purple-400 transition-colors duration-200 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-purple-400 rounded-full group-hover:w-2 transition-all duration-200" />
                  Luxury Retreats
                </a>
              </li>
              <li>
                <a href="https://www.dr-dede.com/dr-dede/speaking" className="hover:text-purple-400 transition-colors duration-200 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-purple-400 rounded-full group-hover:w-2 transition-all duration-200" />
                  Speaking & Events
                </a>
              </li>
              <li>
                <a href="https://grc.incluu.us" className="hover:text-cyan-400 transition-colors duration-200 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-cyan-400 rounded-full group-hover:w-2 transition-all duration-200" />
                  GRC TravelRisk Engine
                </a>
              </li>
              <li>
                <a href="https://v0-dr-dede-executive-summary.vercel.app" className="hover:text-cyan-400 transition-colors duration-200 flex items-center gap-2 group" target="_blank" rel="noopener noreferrer">
                  <span className="w-1 h-1 bg-cyan-400 rounded-full group-hover:w-2 transition-all duration-200" />
                  Executive Summary
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Company</h3>
            <ul className="space-y-3 text-sm text-violet-300">
              <li>
                <a href="https://www.dr-dede.com/dr-dede" className="hover:text-blue-400 transition-colors duration-200 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full group-hover:w-2 transition-all duration-200" />
                  About Dr. Dédé
                </a>
              </li>
              <li>
                <a href="https://www.dr-dede.com/resources" className="hover:text-blue-400 transition-colors duration-200 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full group-hover:w-2 transition-all duration-200" />
                  Resources
                </a>
              </li>
              <li>
                <a href="https://www.dr-dede.com/contact" className="hover:text-blue-400 transition-colors duration-200 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full group-hover:w-2 transition-all duration-200" />
                  Contact
                </a>
              </li>
              <li>
                <a href="https://www.dr-dede.com/admin" className="hover:text-blue-400 transition-colors duration-200 flex items-center gap-2 group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full group-hover:w-2 transition-all duration-200" />
                  Admin
                </a>
              </li>
            </ul>
          </div>

          {/* Connect - Enhanced social media section */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Connect With Us</h3>
            <p className="text-sm text-violet-300 mb-6 leading-relaxed">
              Follow Dr. Dédé for insights on AI governance, tech equity, and inclusive innovation.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://www.linkedin.com/in/dr-dede/"
                className="h-10 w-10 rounded-lg bg-violet-800 hover:bg-blue-600 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-tranviolet-y-1 group"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkedinIcon className="h-5 w-5 text-violet-300 group-hover:text-white transition-colors" />
              </a>
              <a
                href="https://www.youtube.com/@the_drdede"
                className="h-10 w-10 rounded-lg bg-violet-800 hover:bg-red-600 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-tranviolet-y-1 group"
                aria-label="YouTube"
                target="_blank"
                rel="noopener noreferrer"
              >
                <YoutubeIcon className="h-5 w-5 text-violet-300 group-hover:text-white transition-colors" />
              </a>
              <a
                href="https://www.dr-dede.com/blog"
                className="h-10 w-10 rounded-lg bg-violet-800 hover:bg-purple-600 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-tranviolet-y-1 group"
                aria-label="Dr. Dédé Blog"
                target="_blank"
                rel="noopener noreferrer"
              >
                <BlogIcon className="h-5 w-5 text-violet-300 group-hover:text-white transition-colors" />
              </a>
              <a
                href="https://www.instagram.com/the_drdede/"
                className="h-10 w-10 rounded-lg bg-violet-800 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-tranviolet-y-1 group"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramIcon className="h-5 w-5 text-violet-300 group-hover:text-white transition-colors" />
              </a>
              <a
                href="https://www.facebook.com/thedrdede/"
                className="h-10 w-10 rounded-lg bg-violet-800 hover:bg-blue-700 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-tranviolet-y-1 group"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FacebookIcon className="h-5 w-5 text-violet-300 group-hover:text-white transition-colors" />
              </a>
              <a
                href="https://bsky.app/profile/drdede.bsky.social"
                className="h-10 w-10 rounded-lg bg-violet-800 hover:bg-sky-500 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-tranviolet-y-1 group"
                aria-label="BlueSky"
                target="_blank"
                rel="noopener noreferrer"
              >
                <BlueSkyIcon className="h-5 w-5 text-violet-300 group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom section with copyright and additional links */}
        <div className="pt-8 border-t border-violet-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-violet-400">&copy; {currentYear} Dr. Dédé Tetsubayashi. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-violet-400">
              <a href="https://www.dr-dede.com/resources/privacy-policy" className="hover:text-blue-400 transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="https://www.dr-dede.com/resources/terms-of-service" className="hover:text-blue-400 transition-colors duration-200">
                Terms of Service
              </a>
              <a href="https://www.dr-dede.com/accessibility" className="hover:text-blue-400 transition-colors duration-200">
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
