'use client';

import { useUser } from '@clerk/nextjs';

export function Header() {
  const { user } = useUser();

  return (
    <header className="bg-white" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
      <div className="px-8 py-4 flex items-center justify-between">
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
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-medium px-3 py-1 rounded-full"
            style={{
              background: 'hsl(190 60% 45% / 0.1)',
              color: 'hsl(190 60% 35%)',
            }}
          >
            Engine Active
          </span>
        </div>
      </div>
    </header>
  );
}
