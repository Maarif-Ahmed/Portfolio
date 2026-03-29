'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const HOME_PATHS = [
  { id: 'hero', path: '~/root/init' },
  { id: 'shell', path: '~/root/shell/interactive' },
  { id: 'manual', path: '~/root/docs/man.1' },
  { id: 'graph', path: '~/root/render/contributions' },
  { id: 'marquee', path: '~/root/modules/runtime' },
  { id: 'ascii', path: '~/root/assets/logo' },
  { id: 'work', path: '~/root/work/projects' },
  { id: 'footer', path: '~/root/exit' },
];

const ABOUT_PATHS = [{ id: 'about-manual', path: '~/root/docs/man.1/about' }];

export default function Breadcrumb() {
  const pathname = usePathname();
  const [currentPath, setCurrentPath] = useState('~/root');
  const [displayText, setDisplayText] = useState('~/root');

  const paths = useMemo(() => (pathname === '/about' ? ABOUT_PATHS : HOME_PATHS), [pathname]);

  useEffect(() => {
    const triggers = paths
      .map((entry) => {
        const element = document.getElementById(entry.id);
        if (!element) return null;

        return ScrollTrigger.create({
          trigger: element,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => setCurrentPath(entry.path),
          onEnterBack: () => setCurrentPath(entry.path),
        });
      })
      .filter(Boolean) as ScrollTrigger[];

    return () => {
      triggers.forEach((trigger) => trigger.kill());
    };
  }, [paths]);

  useEffect(() => {
    let current = 0;
    const interval = window.setInterval(() => {
      if (current <= currentPath.length) {
        setDisplayText(currentPath.slice(0, current));
        current += 1;
      } else {
        window.clearInterval(interval);
      }
    }, 32);

    return () => window.clearInterval(interval);
  }, [currentPath]);

  return (
    <div className="pointer-events-none fixed left-1/2 top-6 z-[100001] hidden -translate-x-1/2 select-none border border-accent/20 bg-background/80 px-4 py-1 shadow-[0_0_15px_rgba(57,255,20,0.1)] backdrop-blur-sm lg:block">
      <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-accent md:text-xs">
        <span className="opacity-40">PATH:</span>
        <span className="font-bold">{displayText}</span>
        <span className="inline-block h-3 w-1 animate-pulse bg-accent" />
      </div>
    </div>
  );
}
