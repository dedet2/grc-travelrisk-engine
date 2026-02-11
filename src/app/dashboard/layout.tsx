import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col md:flex-row" style={{ background: 'hsl(var(--background))' }}>
      {/* Sidebar - hidden on mobile, visible on desktop */}
      <div className="hidden md:block md:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8">{children}</div>
        </main>
      </div>

      {/* Mobile sidebar overlay - rendered at root for z-index management */}
      <div className="md:hidden">
        <Sidebar />
      </div>
    </div>
  );
}
