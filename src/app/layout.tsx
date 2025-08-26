import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NUET Prep Academy | NUET Preparation in Kazakhstan',
  description:
    'NUET Prep Academy in Astana offers Full Prep, Crash Course, and 1‑on‑1 tutoring for the Nazarbayev University Entrance Test. Weekday lessons, Saturday sample tests, Sunday solution reviews.',
  keywords: [
    'NUET prep',
    'Nazarbayev University Entrance Test',
    'Nazarbayev University',
    'Astana',
    'Kazakhstan',
    'NUET courses',
    'NUET tutoring',
    'NUET Crash Course',
    'NUET Full Prep'
  ],
  openGraph: {
    title: 'NUET Prep Academy',
    description:
      'Full Prep, Crash Course, and 1‑on‑1 tutoring for NUET. Weekday lessons, Saturday tests, Sunday solution reviews.',
    url: 'https://nuet-prep-academy.vercel.app',
    siteName: 'NUET Prep Academy',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'NUET Prep Academy'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  icons: { icon: '/favicon.ico' }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

