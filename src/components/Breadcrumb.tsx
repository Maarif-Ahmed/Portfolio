'use client';

import { useState, useEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const PATHS = [
  { id: 'hero', path: '~/root/init' },
  { id: 'marquee', path: '~/root/modules' },
  { id: 'ascii', path: '~/root/assets/logo' },
  { id: 'work', path: '~/root/work/projects' },
  { id: 'footer', path: '~/root/exit' }
];

export default function Breadcrumb() {
  const [currentPath, setCurrentPath] = useState('~/root');
  const [displayText, setDisplayText] = useState('~/root');

  useEffect(() => {
    PATHS.forEach((p) => {
      ScrollTrigger.create({
        trigger: `#${p.id}`,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => setCurrentPath(p.path),
        onEnterBack: () => setCurrentPath(p.path),
      });
    });
  }, []);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      if (current <= currentPath.length) {
        setDisplayText(currentPath.slice(0, current));
        current++;
      } else {
        clearInterval(interval);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [currentPath]);

  return (
    <div className="hidden lg:block fixed top-6 left-1/2 -translate-x-1/2 z-[100001] pointer-events-none select-none px-4 py-1 border border-accent/20 bg-background/80 backdrop-blur-sm shadow-[0_0_15px_rgba(57,255,20,0.1)]">
      <div className="text-[10px] md:text-xs font-mono tracking-widest text-accent flex items-center gap-2">
        <span className="opacity-40">PATH:</span>
        <span className="font-bold">{displayText}</span>
        <span className="inline-block w-1 h-3 bg-accent animate-pulse" />
      </div>
    </div>
  );
}
