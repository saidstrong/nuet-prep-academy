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
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#2563eb' }
    ]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

