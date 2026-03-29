'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';

type BootTone = 'ok' | 'warn' | 'info' | 'prompt';

interface BootLine {
  text: string;
  tone: BootTone;
}

const BOOT_LINES: BootLine[] = [
  { text: '[ OK ] Mounting file systems................ done', tone: 'ok' },
  { text: '[ OK ] Initializing graphics pipeline....... done', tone: 'ok' },
  { text: '[ OK ] Attaching smooth-scroll daemon....... done', tone: 'ok' },
  { text: '[ OK ] Hydrating interface memory............ done', tone: 'ok' },
  { text: '[ OK ] Priming command palette............... done', tone: 'ok' },
  { text: '[ WARN ] Sudo privileges detected........... accepted', tone: 'warn' },
  { text: '[ INFO ] Parsing motion modules............. gsap/lenis', tone: 'info' },
  { text: '[ INFO ] Negotiating neon output............ plasma-cyan', tone: 'info' },
  { text: '[ OK ] Building portfolio runtime........... done', tone: 'ok' },
  { text: '[ OK ] Linking renderer..................... react-three-fiber', tone: 'ok' },
  { text: '[ INFO ] Finalizing shell environment....... root access', tone: 'info' },
  { text: 'root@maarif:~# ./start_portfolio.sh', tone: 'prompt' },
];

export default function BootSequence() {
  const [isBooting, setIsBooting] = useState(true);
  const [lineCount, setLineCount] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);
  const textBlockRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);

  const visibleLines = useMemo(() => BOOT_LINES.slice(0, lineCount), [lineCount]);

  useEffect(() => {
    if (!isBooting) return undefined;

    document.documentElement.dataset.bootReady = 'false';

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const markBootReady = () => {
      document.documentElement.dataset.bootReady = 'true';
      window.dispatchEvent(new CustomEvent('boot-sequence-complete'));
    };

    let exitTimeline: gsap.core.Timeline | null = null;
    const intervalId = window.setInterval(() => {
      setLineCount((current) => {
        if (current >= BOOT_LINES.length) {
          window.clearInterval(intervalId);
          return current;
        }
        return current + 1;
      });
    }, 54);

    const exitTimeout = window.setTimeout(() => {
      if (!containerRef.current || !textBlockRef.current || !beamRef.current || !flashRef.current) {
        setIsBooting(false);
        document.body.style.overflow = previousBodyOverflow;
        document.documentElement.style.overflow = previousHtmlOverflow;
        markBootReady();
        return;
      }

      exitTimeline = gsap.timeline({
        onComplete: () => {
          setIsBooting(false);
          document.body.style.overflow = previousBodyOverflow;
          document.documentElement.style.overflow = previousHtmlOverflow;
          markBootReady();
        },
      });

      exitTimeline
        .to(textBlockRef.current, {
          opacity: 0,
          y: -18,
          filter: 'blur(6px)',
          duration: 0.22,
          ease: 'power2.in',
        })
        .set(beamRef.current, {
          opacity: 1,
          scaleX: 0.08,
          scaleY: 1,
        })
        .to(beamRef.current, {
          scaleX: 1,
          duration: 0.18,
          ease: 'power2.out',
        })
        .to(
          flashRef.current,
          {
            opacity: 0.7,
            duration: 0.06,
            ease: 'power1.out',
          },
          '<'
        )
        .to(
          beamRef.current,
          {
            scaleY: Math.max(window.innerHeight / 2, 280),
            duration: 0.2,
            ease: 'power2.in',
          },
          '>-0.02'
        )
        .to(
          containerRef.current,
          {
            opacity: 0,
            duration: 0.18,
            ease: 'power1.out',
          },
          '<'
        );
    }, BOOT_LINES.length * 54 + 180);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(exitTimeout);
      exitTimeline?.kill();
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isBooting]);

  if (!isBooting) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999999] flex items-center justify-center overflow-hidden bg-black"
    >
      <div
        ref={beamRef}
        className="pointer-events-none absolute left-0 top-1/2 h-[2px] w-full origin-center bg-white opacity-0 shadow-[0_0_40px_rgba(255,255,255,0.95),0_0_90px_rgba(224,224,224,0.72)]"
      />
      <div
        ref={flashRef}
        className="pointer-events-none absolute inset-0 bg-white opacity-0 mix-blend-screen"
      />
      <div ref={textBlockRef} className="relative z-10 w-full max-w-3xl px-6 md:px-10">
        <div className="mb-5 flex items-center justify-between border-b border-[#E0E0E0]/18 pb-3 font-mono text-[10px] uppercase tracking-[0.35em] text-[#E0E0E0]/55 md:text-xs">
          <span>linux kernel boot</span>
          <span>tty0</span>
        </div>
        <div className="space-y-1 font-mono">
          {visibleLines.map((line, index) => {
            const toneClass =
              line.tone === 'ok'
                ? 'text-[#7af7d4]'
                : line.tone === 'warn'
                  ? 'text-[#ffd166]'
                  : line.tone === 'prompt'
                    ? 'text-white font-bold'
                    : 'text-[#E0E0E0]/72';

            return (
              <p key={`${line.text}-${index}`} className={`text-[11px] leading-relaxed md:text-sm ${toneClass}`}>
                {line.text}
              </p>
            );
          })}
          {lineCount < BOOT_LINES.length && (
            <span className="mt-2 inline-block h-4 w-2 bg-[#E0E0E0] animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}
