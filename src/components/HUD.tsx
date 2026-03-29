'use client';

import { useEffect, useRef, useState } from 'react';
import { useMotionPreference } from '@/context/MotionContext';

export default function HUD() {
  const [scrollLoad, setScrollLoad] = useState(0);
  const [systemClock, setSystemClock] = useState('00:00:00');
  const intervalRef = useRef<number>(0);
  const { motionReduced, toggleMotionReduced } = useMotionPreference();

  useEffect(() => {
    const syncClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setSystemClock(`${hours}:${minutes}:${seconds}`);
    };

    syncClock();
    intervalRef.current = window.setInterval(syncClock, 250);

    return () => window.clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    const syncScrollLoad = () => {
      const currentScroll = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const nextLoad = maxScroll > 0 ? Math.round((currentScroll / maxScroll) * 100) : 0;
      setScrollLoad(nextLoad);
    };

    window.addEventListener('scroll', syncScrollLoad, { passive: true });
    syncScrollLoad();

    return () => window.removeEventListener('scroll', syncScrollLoad);
  }, []);

  return (
    <div className="fixed left-0 top-0 z-[99980] h-full w-full pointer-events-none">
      <div className="absolute left-0 top-0 h-[2px] w-full bg-accent/10">
        <div
          className="h-full bg-accent shadow-[0_0_8px_#00f0ff] transition-all duration-100"
          style={{ width: `${scrollLoad}%` }}
        />
      </div>

      <div className="absolute left-3 top-1/2 flex -translate-y-1/2 flex-col items-center gap-2 md:left-6">
        <div className="h-16 w-[1px] bg-accent/20" />
        <span className="origin-center -rotate-90 whitespace-nowrap text-[9px] uppercase tracking-widest text-accent/60 md:text-[10px]">
          SCROLL {String(scrollLoad).padStart(3, '0')}%
        </span>
        <div className="h-16 w-[1px] bg-accent/20" />
      </div>

      <div className="absolute right-3 top-1/2 flex -translate-y-1/2 flex-col items-center gap-2 md:right-6">
        <div className="h-16 w-[1px] bg-accent/20" />
        <span className="origin-center -rotate-90 whitespace-nowrap text-[9px] uppercase tracking-widest text-accent/60 tabular-nums md:text-[10px]">
          {systemClock}
        </span>
        <div className="h-16 w-[1px] bg-accent/20" />
      </div>

      <div className="pointer-events-auto absolute bottom-14 left-1/2 -translate-x-1/2 md:bottom-6">
        <button
          type="button"
          onClick={toggleMotionReduced}
          aria-pressed={motionReduced}
          className="border border-accent/60 bg-black/88 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.35em] text-accent transition-colors hover:bg-accent hover:text-black md:text-xs"
        >
          [ {motionReduced ? 'MOTION_REDUCED' : 'MOTION_FULL'} ]
        </button>
      </div>
    </div>
  );
}
