import 'leaflet/dist/leaflet.css';
import './globals.css';

const siteUrl = 'https://srakshitha0802.github.io/ISS-tracker';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: 'ISS Tracker — Live Real-Time Space Station Tracking',
  description:
    'Track the International Space Station (ISS) in real time. View live telemetry, interactive CARTO map, orbital trajectory prediction, crew profiles, and ask the ORBITAL AI Chatbot.',
  keywords: [
    'ISS Tracker',
    'International Space Station',
    'Live Satellite Tracking',
    'Where is the ISS',
    'NASA',
    'Space Station Telemetry',
    'Expedition 72',
    'Orbital Mechanics',
    'AI Chatbot',
    'CARTO Maps'
  ],
  authors: [{ name: 'ISS Tracker Team' }],
  icons: {
    icon: [
      { url: `${siteUrl}/icon.svg`, type: 'image/svg+xml' },
      { url: `${siteUrl}/logo.jpeg`, type: 'image/jpeg' }
    ],
    apple: [{ url: `${siteUrl}/logo.jpeg`, sizes: '180x180', type: 'image/jpeg' }]
  },
  openGraph: {
    title: 'ISS Tracker — Live Real-Time Space Station Tracking',
    description:
      'Live ISS telemetry, interactive CARTO map, AI-powered orbital analysis, and crew info. Production-ready.',
    url: siteUrl,
    siteName: 'ISS Tracker',
    images: [{ url: `${siteUrl}/logo.jpeg`, alt: 'ISS Tracker' }],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ISS Tracker — Live Real-Time Space Station Tracking',
    description: 'Live ISS telemetry, interactive CARTO map, and AI-powered orbital intelligence.',
    images: [`${siteUrl}/logo.jpeg`]
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#020617'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full dark">
      <head>
        {/* Soft Modern Google Fonts — Plus Jakarta Sans + Inter + JetBrains Mono */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#030a1c] text-slate-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
