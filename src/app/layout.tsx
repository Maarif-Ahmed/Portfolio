import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import BootSequence from '@/components/BootSequence';
import Providers from '@/components/Providers';
import DeferredSiteChrome from '@/components/DeferredSiteChrome';

const jetbrains = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
});

const displayFont = localFont({
  src: '../../public/fonts/SpaceGrotesk.ttf',
  variable: '--font-display',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

const terminalFont = localFont({
  src: '../../public/fonts/CascadiaMono.ttf',
  variable: '--font-terminal',
  display: 'swap',
  preload: false,
  fallback: ['Consolas', 'Lucida Console', 'Courier New', 'monospace'],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: 'Maarif - ROOT_ACCESS',
  description: 'TERMINAL PORTFOLIO. STATUS: ONLINE.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetbrains.variable} ${displayFont.variable} ${terminalFont.variable} h-full`}>
      <body className="relative flex min-h-full flex-col font-mono">
        <div className="noise-overlay" />
        <div className="crt-overlay" />
        <Providers>
          <BootSequence />
          <div id="site-shell" className="relative pb-10">
            <DeferredSiteChrome />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
