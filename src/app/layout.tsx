import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';

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
    <html lang="en" className={`${jetbrains.variable} ${displayFont.variable} h-full`}>
      <body className="relative flex min-h-full flex-col">
        <div className="site-grain" />
        <Providers>
          <div id="site-shell" className="relative">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
