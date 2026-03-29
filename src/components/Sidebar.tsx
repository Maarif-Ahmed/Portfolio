'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const HOME_SECTIONS = [
  { id: 'hero', label: 'SYS_INIT' },
  { id: 'shell', label: 'INTERACTIVE_SHELL' },
  { id: 'manual', label: 'MAN_PAGE' },
  { id: 'graph', label: 'GRAPH_RENDER' },
  { id: 'marquee', label: 'BUS_SYNC' },
  { id: 'ascii', label: 'LOGO_LOAD' },
  { id: 'work', label: 'WORK_GALLERY' },
  { id: 'footer', label: 'SYS_SHUTDOWN' },
];

const ABOUT_SECTIONS = [{ id: 'about-manual', label: 'MAN_PAGE' }];

export default function Sidebar() {
  const pathname = usePathname();
  const [status, setStatus] = useState('SYS_READY');

  const sections = useMemo(
    () => (pathname === '/about' ? ABOUT_SECTIONS : HOME_SECTIONS),
    [pathname]
  );

  useEffect(() => {
    const triggers = sections
      .map((section) => {
        const element = document.getElementById(section.id);
        if (!element) return null;

        return ScrollTrigger.create({
          trigger: element,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => setStatus(section.label),
          onEnterBack: () => setStatus(section.label),
        });
      })
      .filter(Boolean) as ScrollTrigger[];

    return () => {
      triggers.forEach((trigger) => trigger.kill());
    };
  }, [sections]);

  return (
    <div className="pointer-events-none fixed right-0 top-0 z-[99970] flex h-full w-8 select-none flex-col items-center justify-center border-l border-accent/20 md:w-16">
      <div className="flex rotate-90 items-center gap-4 whitespace-nowrap text-[8px] tracking-[0.3em] text-accent/40 md:text-xs">
        <span className="hidden font-bold text-accent/60 md:inline">[ SYSTEM_STATUS: {status} ]</span>
        <div className="flex gap-2">
          <div className={`h-1 w-1 rounded-full md:h-1.5 md:w-1.5 ${status === 'SYS_SHUTDOWN' ? 'bg-red-500' : 'bg-accent animate-pulse'}`} />
          <div className="h-1 w-1 rounded-full border border-accent/30 md:h-1.5 md:w-1.5" />
          <div className="h-1 w-1 rounded-full border border-accent/30 md:h-1.5 md:w-1.5" />
        </div>
      </div>

      <div className="absolute bottom-10 flex flex-col items-center gap-2">
        <div className="relative h-20 w-[1px] overflow-hidden bg-accent/20">
          <div id="scroll-bar-vertical" className="absolute left-0 top-0 h-0 w-full bg-accent/60" />
        </div>
        <span className="rotate-90 text-[8px] text-accent/40 opacity-50">SRL_POS</span>
      </div>
    </div>
  );
}
