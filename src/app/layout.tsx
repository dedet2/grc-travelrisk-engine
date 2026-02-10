import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI GRC & TravelRisk Engine',
  description: 'Advanced risk assessment and compliance management platform',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
