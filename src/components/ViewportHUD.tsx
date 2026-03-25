'use client';

import { useEffect, useState } from 'react';

export default function ViewportHUD() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollPos, setScrollPos] = useState(0);
  const [userAgent, setUserAgent] = useState('UA_772');

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: Math.round(e.clientX), y: Math.round(e.clientY) });
    };

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollPos(Math.round(currentScroll));
    };

    const rafId = window.requestAnimationFrame(() => {
      const browserInfo = window.navigator.userAgent.match(/(Chrome|Firefox|Safari)/);
      if (browserInfo) {
        setUserAgent(`UA_${browserInfo[0].toUpperCase()}`);
      }
    });

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100000] pointer-events-none select-none p-4 md:p-6 text-[8px] md:text-[10px] uppercase font-mono text-accent/40 flex flex-col justify-between">
      {/* Top HUD */}
      <div className="hidden md:flex justify-between">
        <span>[ TOP-L: MAARIF_V1.0 ]</span>
        <span>[ TOP-R: {userAgent} ]</span>
      </div>

      {/* Bottom HUD */}
      <div className="flex justify-between items-end">
        <div className="hidden md:flex flex-col gap-1">
          <span>{'>'} X:{mousePos.x}</span>
          <span>{'>'} Y:{mousePos.y}</span>
          <span className="font-bold">[ BOT-L: MOUSE_X/Y ]</span>
        </div>
        <div className="text-right">
          <p className="text-sm md:text-2xl font-black mb-1 opacity-20">{scrollPos}%</p>
          <span>[ BOT-R: SCROLL ]</span>
        </div>
      </div>
    </div>
  );
}
