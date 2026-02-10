'use client';

import { useUser } from '@clerk/nextjs';

export function Header() {
  const { user } = useUser();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {user ? `Welcome back, ${user.firstName}` : 'Loading...'}
          </h1>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>
    </header>
  );
}
