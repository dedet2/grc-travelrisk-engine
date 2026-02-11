'use client';

import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { AlertBell } from '@/components/notifications/alert-bell';

export function Header() {
  const { user } = useUser();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    (window as any).__toggleSidebar?.();
  };

  return (
    <header className="bg-white" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
      <div className="px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
              aria-label="Toggle sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <div>
            <h1 className="text-xl font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
              {user ? `Welcome back, ${user.firstName}` : 'Loading...'}
            </h1>
            <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <AlertBell />
          <span
            className="text-xs font-medium px-3 py-1 rounded-full hidden sm:inline-block"
            style={{ background: 'hsl(190 60% 45% / 0.1)', color: 'hsl(190 60% 35%)' }}
          >
            Engine Active
          </span>
        </div>
      </div>
    </header>
  );
}
