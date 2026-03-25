'use client';

import { useEffect, useState, useRef } from 'react';

export default function HUD() {
  const [scrollPercent, setScrollPercent] = useState(0);
  const [time, setTime] = useState('00:00:00:000');
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      const ms = String(now.getMilliseconds()).padStart(3, '0');
      setTime(`${h}:${m}:${s}:${ms}`);
      rafRef.current = requestAnimationFrame(updateTime);
    };
    rafRef.current = requestAnimationFrame(updateTime);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
      setScrollPercent(percent);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[99980]">
      {/* Scroll Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-accent/10">
        <div 
          className="h-full bg-accent shadow-[0_0_8px_#39ff14] transition-all duration-100"
          style={{ width: `${scrollPercent}%` }}
        />
      </div>

      {/* Left Column — Scroll % */}
      <div className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
        <div className="w-[1px] h-16 bg-accent/20" />
        <span className="text-[9px] md:text-[10px] text-accent/60 uppercase tracking-widest -rotate-90 whitespace-nowrap origin-center">
          SCROLL {String(scrollPercent).padStart(3, '0')}%
        </span>
        <div className="w-[1px] h-16 bg-accent/20" />
      </div>

      {/* Right Column — Clock */}
      <div className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
        <div className="w-[1px] h-16 bg-accent/20" />
        <span className="text-[9px] md:text-[10px] text-accent/60 uppercase tracking-widest -rotate-90 whitespace-nowrap origin-center tabular-nums">
          {time}
        </span>
        <div className="w-[1px] h-16 bg-accent/20" />
      </div>
    </div>
  );
}
