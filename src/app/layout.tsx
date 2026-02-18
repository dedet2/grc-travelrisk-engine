import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI GRC & Compliance Services | Dr. Dédé Tetsubayashi',
  description: 'Enterprise AI governance, risk, and compliance assessments. Expert advisory from Dr. Dédé Tetsubayashi — board-level GRC strategy, compliance playbooks, and executive consulting.',
  metadataBase: new URL('https://grc.incluu.us'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'AI GRC & Compliance Services | Dr. Dédé Tetsubayashi',
    description: 'Enterprise AI governance, risk, and compliance assessments. Expert advisory from Dr. Dédé Tetsubayashi.',
    url: 'https://grc.incluu.us',
    siteName: 'Dr. Dédé — AI GRC Services',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
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
        <body className="bg-slate-50 text-gray-900 dark:bg-slate-900 dark:text-gray-100">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
