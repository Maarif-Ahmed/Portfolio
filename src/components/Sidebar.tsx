'use client';

import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const SECTIONS = [
  { id: 'hero', label: 'SYS_INIT' },
  { id: 'marquee', label: 'BUS_SYNC' },
  { id: 'ascii', label: 'LOGO_LOAD' },
  { id: 'work', label: 'WORK_GALLERY' },
  { id: 'footer', label: 'SYS_SHUTDOWN' }
];

export default function Sidebar() {
  const [status, setStatus] = useState('SYS_READY');

  useEffect(() => {
    SECTIONS.forEach((section) => {
      ScrollTrigger.create({
        trigger: `#${section.id}`,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => setStatus(section.label),
        onEnterBack: () => setStatus(section.label),
      });
    });
  }, []);

  return (
    <div className="fixed right-0 top-0 h-full w-8 md:w-16 border-l border-accent/20 flex flex-col items-center justify-center z-[99970] pointer-events-none select-none">
      <div className="rotate-90 whitespace-nowrap text-[8px] md:text-xs font-mono tracking-[0.3em] text-accent/40 flex items-center gap-4">
        <span className="hidden md:inline text-accent/60 font-bold">[ SYSTEM_STATUS: {status} ]</span>
        <div className="flex gap-2">
          <div className={`w-1 md:w-1.5 h-1 md:h-1.5 rounded-full ${status === 'SYS_SHUTDOWN' ? 'bg-red-500' : 'bg-accent animate-pulse'}`} />
          <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full border border-accent/30" />
          <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full border border-accent/30" />
        </div>
      </div>
      
      {/* Scroll percentage indicator */}
      <div className="absolute bottom-10 flex flex-col items-center gap-2">
         <div className="w-[1px] h-20 bg-accent/20 relative overflow-hidden">
            <div id="scroll-bar-vertical" className="absolute top-0 left-0 w-full bg-accent/60 h-0" />
         </div>
         <span className="text-[8px] text-accent/40 opacity-50 rotate-90">SRL_POS</span>
      </div>
    </div>
  );
}
