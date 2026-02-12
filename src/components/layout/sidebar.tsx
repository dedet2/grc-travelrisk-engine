'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';

/* ------------------------------------------------------------------ */
/*  SVG Icon Components — replacing emojis with branded vector icons  */
/* ------------------------------------------------------------------ */

function IconDashboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  );
}

function IconAgents() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect x="2" y="2" width="20" height="8" rx="2"/><path d="M2 14h20"/><rect x="2" y="14" width="20" height="8" rx="2"/><path d="M6 18h.01"/><path d="M6 6h.01"/></svg>
  );
}

function IconWorkflows() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10h10M7 14h10"/><rect x="3" y="5" width="5" height="5" rx="1"/><rect x="16" y="5" width="5" height="5" rx="1"/><rect x="10" y="14" width="4" height="4" rx="1"/><path d="M10.5 10v2M10.5 14v1"/></svg>
  );
}

function IconLeadPipeline() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h5v8H3z"/><path d="M10 5h5v15h-5z"/><path d="M17 9h4v11h-4z"/></svg>
  );
}

function IconCampaigns() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/><path d="M8 5L5 2M16 5l3-3M8 19l-3 3M16 19l3 3"/></svg>
  );
}

function IconOpportunities() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
  );
}

function IconSpeaking() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2s2-.9 2-2V4c0-1.1-.9-2-2-2z"/><path d="M4 9a8 8 0 0 0 16 0"/><rect x="9" y="15" width="6" height="6" rx="1"/><path d="M8 21h8"/></svg>
  );
}

function IconFoundations() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  );
}

function IconHealth() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M12 6v12M6 12h12"/></svg>
  );
}

function IconRevenue() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="8"/><path d="M12 6v12M8 10v4M16 10v4"/></svg>
  );
}

function IconReports() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
  );
}

function IconFrameworks() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 12h6"/><path d="M9 16h6"/></svg>
  );
}

function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
  );
}

/* ------------------------------------------------------------------ */

function IconRoadmap() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M3 12h12M3 18h8"/><circle cx="20" cy="12" r="2"/><circle cx="16" cy="18" r="2"/></svg>
  );
}

function IconIntegrations() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="6" r="2"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="18" r="2"/><circle cx="15" cy="18" r="2"/><line x1="9" y1="8" x2="9" y2="16"/><line x1="15" y1="8" x2="15" y2="16"/><line x1="6" y1="12" x2="18" y2="12"/><path d="M6 6h3M15 6h3M6 18h3M15 18h3"/></svg>
  );
}

function IconTravelRisk() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 2v6M12 16v6M2 12h6M16 12h6"/><path d="M7 7l4.24 4.24M16.97 7.03l-4.24 4.24M7.03 16.97l4.24-4.24M17 17l-4.24-4.24"/></svg>
  );
}

function IconCRM() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  );
}

function IconContent() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/><path d="M10 13l2 2 4-4"/></svg>
  );
}

function IconBilling() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><circle cx="12" cy="15" r="1.5"/></svg>
  );
}

function IconAssessments() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
  );
}

function IconStrategic() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="5" r="1"/><circle cx="5" cy="19" r="1"/><path d="M12 13v8M11 11H3M13 11h8M12 11l7-7M12 11l-7 7"/></svg>
  );
}

function IconInfrastructure() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="8" height="5" rx="1"/><rect x="14" y="4" width="8" height="5" rx="1"/><rect x="2" y="13" width="8" height="5" rx="1"/><rect x="14" y="13" width="8" height="5" rx="1"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="18" y1="2" x2="18" y2="4"/><line x1="6" y1="11" x2="6" y2="13"/><line x1="18" y1="11" x2="18" y2="13"/></svg>
  );
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', Icon: IconDashboard },
  { href: '/dashboard/agents', label: 'AI Agents', Icon: IconAgents },
  { href: '/dashboard/travel-risk', label: 'Travel Risk', Icon: IconTravelRisk },
  { href: '/dashboard/workflows', label: 'Workflows', Icon: IconWorkflows },
  { href: '/dashboard/lead-pipeline', label: 'Lead Pipeline', Icon: IconLeadPipeline },
  { href: '/dashboard/crm', label: 'CRM', Icon: IconCRM },
  { href: '/dashboard/campaigns', label: 'Campaigns', Icon: IconCampaigns },
  { href: '/dashboard/content', label: 'Content', Icon: IconContent },
  { href: '/dashboard/opportunities', label: 'Opportunities', Icon: IconOpportunities },
  { href: '/dashboard/speaking', label: 'Speaking', Icon: IconSpeaking },
  { href: '/dashboard/foundations', label: 'Foundations', Icon: IconFoundations },
  { href: '/dashboard/health', label: 'Health', Icon: IconHealth },
  { href: '/dashboard/revenue', label: 'Revenue', Icon: IconRevenue },
  { href: '/dashboard/roadmap', label: 'Roadmap', Icon: IconRoadmap },
  { href: '/dashboard/reports', label: 'Reports', Icon: IconReports },
  { href: '/dashboard/strategic', label: 'Strategic', Icon: IconStrategic },
  { href: '/dashboard/frameworks', label: 'Frameworks', Icon: IconFrameworks },
  { href: '/dashboard/assessments', label: 'Assessments', Icon: IconAssessments },
  { href: '/dashboard/integrations', label: 'Integrations', Icon: IconIntegrations },
  { href: '/dashboard/infrastructure', label: 'Infrastructure', Icon: IconInfrastructure },
  { href: '/dashboard/billing', label: 'Billing', Icon: IconBilling },
  { href: '/dashboard/settings', label: 'Settings', Icon: IconSettings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(isOpen);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [pathname, isMobile]);

  const handleClose = () => {
    setSidebarOpen(false);
    onClose?.();
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    (window as any).__toggleSidebar = toggleSidebar;
  }, []);

  if (isMobile) {
    return (
      <>
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={handleClose} aria-hidden="true" />
        )}
        {sidebarOpen && (
          <div
            className="fixed left-0 top-0 h-screen w-64 flex flex-col z-50 overflow-y-auto md:hidden"
            style={{ background: 'linear-gradient(180deg, hsl(250 30% 12%) 0%, hsl(265 35% 15%) 100%)', color: 'white' }}
          >
            <SidebarContent pathname={pathname} isMobile onClose={handleClose} />
          </div>
        )}
      </>
    );
  }

  return (
    <div
      className="w-64 flex flex-col hidden md:flex"
      style={{ background: 'linear-gradient(180deg, hsl(250 30% 12%) 0%, hsl(265 35% 15%) 100%)', color: 'white' }}
    >
      <SidebarContent pathname={pathname} />
    </div>
  );
}

function SidebarContent({
  pathname,
  isMobile = false,
  onClose,
}: {
  pathname: string;
  isMobile?: boolean;
  onClose?: () => void;
}) {
  return (
    <>
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
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
          const isExactDashboard = item.href === '/dashboard' && pathname === '/dashboard';
          const active = isActive || isExactDashboard;

          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              onClick={isMobile ? onClose : undefined}
              className="flex items-center px-4 py-2 rounded-lg transition-all duration-200"
              style={
                active
                  ? {
                      background: 'linear-gradient(90deg, hsl(265 60% 45% / 0.3), hsl(190 70% 45% / 0.2))',
                      borderLeft: '3px solid hsl(190 70% 55%)',
                      color: 'white',
                    }
                  : {
                      color: 'hsl(250 15% 70%)',
                      borderLeft: '3px solid transparent',
                    }
              }
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
              <span className="mr-3 flex-shrink-0"><item.Icon /></span>
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Button */}
      <div className="p-6" style={{ borderTop: '1px solid hsl(265 20% 22%)' }}>
        <UserButton appearance={{ elements: { userButtonAvatarBox: 'w-8 h-8' } }} />
      </div>
    </>
  );
}
