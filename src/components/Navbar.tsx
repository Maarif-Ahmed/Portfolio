'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAudio } from '@/context/AudioContext';

const NAV_ITEMS = [
  { label: 'CONTACT', homeHref: '#footer', routeHref: '/contact' },
  { label: 'ABOUT', homeHref: '#who', routeHref: '/about' },
  { label: 'WORK', homeHref: '#work', routeHref: '/#work' },
  { label: 'HOME', homeHref: '#hero', routeHref: '/' },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const { playBlip } = useAudio();
  const isHome = pathname === '/';

  return (
    <nav className="pointer-events-none fixed inset-x-0 top-0 z-[99990] px-5 py-5 text-[#10151c] md:px-20 md:py-7">
      <div className="flex items-start justify-between gap-6">
        <Link
          href="/"
          className="pointer-events-auto font-mono text-[10px] uppercase tracking-[0.32em] text-[#10151c]/58 transition-colors hover:text-[#00F0FF] md:text-[11px]"
          onMouseEnter={playBlip}
        >
          maarif ahmed
        </Link>

        <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-right font-mono text-[10px] uppercase tracking-[0.28em] text-[#10151c]/72 md:gap-x-6 md:text-[11px]">
          {NAV_ITEMS.map((item) => {
            const isActive =
              (!isHome && pathname === item.routeHref) ||
              (isHome && item.label === 'HOME');

            return (
              <Link
                key={item.label}
                href={isHome ? item.homeHref : item.routeHref}
                onMouseEnter={playBlip}
                className={`transition-colors ${isActive ? 'text-[#10151c]' : 'hover:text-[#00F0FF]'}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
