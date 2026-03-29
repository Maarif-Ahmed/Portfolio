'use client';

import { useEffect, useMemo, useState } from 'react';

interface Diagnostics {
  fps: number;
  uptime: string;
  scroll: number;
  userAgent: string;
}

function formatUptime(totalSeconds: number) {
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export default function ViewportHUD() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [diagnostics, setDiagnostics] = useState<Diagnostics>({
    fps: 0,
    uptime: '00:00:00',
    scroll: 0,
    userAgent: 'UA_TTY',
  });

  const topRightLabel = useMemo(
    () => `[ FPS ${String(diagnostics.fps).padStart(2, '0')} | ${diagnostics.userAgent} ]`,
    [diagnostics.fps, diagnostics.userAgent]
  );

  useEffect(() => {
    const startTime = performance.now();
    let rafId = 0;
    let initRafId = 0;
    let frameCount = 0;
    let lastSampleTime = performance.now();

    const browserInfo = window.navigator.userAgent.match(/(Chrome|Firefox|Safari|Edg)/);
    const userAgent = browserInfo ? `UA_${browserInfo[0].toUpperCase()}` : 'UA_WEBKIT';

    const getScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      return totalHeight > 0 ? Math.round((window.scrollY / totalHeight) * 100) : 0;
    };

    const handleMouseMove = (event: MouseEvent) => {
      setMousePos({ x: Math.round(event.clientX), y: Math.round(event.clientY) });
    };

    const handleScroll = () => {
      const scroll = getScroll();
      setDiagnostics((current) => ({ ...current, scroll }));
    };

    const tick = (time: number) => {
      frameCount += 1;
      const sampleElapsed = time - lastSampleTime;

      if (sampleElapsed >= 500) {
        const fps = Math.round((frameCount * 1000) / sampleElapsed);
        const uptimeSeconds = Math.floor((time - startTime) / 1000);
        setDiagnostics((current) => ({
          ...current,
          fps,
          uptime: formatUptime(uptimeSeconds),
          scroll: getScroll(),
          userAgent,
        }));
        frameCount = 0;
        lastSampleTime = time;
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    initRafId = window.requestAnimationFrame(() => {
      setDiagnostics((current) => ({ ...current, userAgent, scroll: getScroll() }));
    });

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.cancelAnimationFrame(rafId);
      window.cancelAnimationFrame(initRafId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[100000] select-none p-4 font-mono text-[8px] uppercase text-[#E0E0E0]/40 md:p-6 md:text-[10px]">
      <div className="flex h-full flex-col justify-between">
        <div className="hidden md:flex items-start justify-between">
          <div className="space-y-1">
            <span>[ MAARIF.OS ]</span>
            <span>[ VIEWPORT_DIAGNOSTICS ]</span>
          </div>
          <span>{topRightLabel}</span>
        </div>

        <div className="flex items-end justify-between">
          <div className="space-y-1 text-left">
            <div className="hidden md:block">
              <span>{'>'} UPTIME {diagnostics.uptime}</span>
            </div>
            <div className="hidden md:block">
              <span>{'>'} X:{String(mousePos.x).padStart(4, '0')}</span>
            </div>
            <div className="hidden md:block">
              <span>{'>'} Y:{String(mousePos.y).padStart(4, '0')}</span>
            </div>
            <div className="text-[9px] md:text-[10px] text-[#E0E0E0]/55">[ BOT-L: CURSOR_TELEMETRY ]</div>
          </div>

          <div className="text-right">
            <p className="mb-1 text-sm font-black opacity-25 md:text-2xl">{diagnostics.scroll}%</p>
            <span>[ BOT-R: SCROLL ]</span>
          </div>
        </div>
      </div>
    </div>
  );
}
