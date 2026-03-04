import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI GRC & Compliance Services | Dr. Dédé Tetsubayashi',
  description: 'Enterprise AI governance, risk, and compliance assessments. Expert advisory from Dr. Dédé Tetsubayashi — board-level GRC strategy, compliance playbooks, and executive consulting.',
  metadataBase: new URL('https://dr-dede.com'),
  alternates: {
    canonical: 'https://dr-dede.com',
  },
  openGraph: {
    title: 'AI GRC & Compliance Services | Dr. Dédé Tetsubayashi',
    description: 'Enterprise AI governance, risk, and compliance assessments. Expert advisory from Dr. Dédé Tetsubayashi — board-level GRC strategy, compliance playbooks, and executive consulting.',
    url: 'https://dr-dede.com',
    siteName: 'Dr. Dédé Tetsubayashi — AI Governance & GRC',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Dr. Dédé Tetsubayashi — AI Governance, Risk & Compliance',
      },
    ],
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
        <body className="bg-violet-50/30 text-gray-900 dark:bg-[hsl(265,35%,12%)] dark:text-gray-100">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
