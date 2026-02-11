'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/frameworks', label: 'Frameworks', icon: '📋' },
  { href: '/dashboard/assessments', label: 'Assessments', icon: '✓' },
  { href: '/dashboard/travel-risk', label: 'Travel Risk', icon: '✈️' },
  { href: '/dashboard/reports', label: 'Reports', icon: '📄' },
  { href: '/dashboard/agents', label: 'Agents', icon: '🤖' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 flex flex-col" style={{
      background: 'linear-gradient(180deg, hsl(250 30% 12%) 0%, hsl(265 35% 15%) 100%)',
      color: 'white',
    }}>
      {/* Logo */}
      <div className="p-6" style={{ borderBottom: '1px solid hsl(265 20% 22%)' }}>
        <div className="brand-gradient-text text-xl font-bold tracking-tight">
          GRC TravelRisk Engine
        </div>
        <p className="text-xs mt-1" style={{ color: 'hsl(190 40% 65%)' }}>
          AI-Powered Risk Intelligence
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
          const isExactDashboard = item.href === '/dashboard' && pathname === '/dashboard';
          const active = isActive || isExactDashboard;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-4 py-2.5 rounded-lg transition-all duration-200"
              style={active ? {
                background: 'linear-gradient(90deg, hsl(265 60% 45% / 0.3), hsl(190 70% 45% / 0.2))',
                borderLeft: '3px solid hsl(190 70% 55%)',
                color: 'white',
              } : {
                color: 'hsl(250 15% 70%)',
                borderLeft: '3px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'hsl(265 20% 20%)';
                  e.currentTarget.style.color = 'hsl(0 0% 95%)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'hsl(250 15% 70%)';
                }
              }}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Button */}
      <div className="p-6" style={{ borderTop: '1px solid hsl(265 20% 22%)' }}>
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: 'w-8 h-8',
            }
          }}
        />
      </div>
    </div>
  );
}
