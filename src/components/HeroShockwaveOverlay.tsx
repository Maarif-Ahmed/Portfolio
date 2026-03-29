'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface HeroProgressEventDetail {
  progress: number;
}

interface HeroDetonationEventDetail {
  intensity: number;
  progress: number;
  x: number;
  y: number;
}

export default function HeroShockwaveOverlay() {
  const shellRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    const shell = shellRef.current;
    const ring = ringRef.current;
    const pulse = pulseRef.current;

    if (!shell || !ring || !pulse) return undefined;

    const triggerShockwave = (detonationPoint: HeroDetonationEventDetail) => {
      gsap.killTweensOf([shell, ring, pulse]);

      gsap.set(shell, { opacity: 1 });
      gsap.set(ring, {
        opacity: 0.16 * detonationPoint.intensity,
        scale: 0.18,
        filter: 'blur(1px)',
        x: detonationPoint.x,
        xPercent: -50,
        y: detonationPoint.y,
        yPercent: -50,
      });
      pulse.style.background = `radial-gradient(circle at ${detonationPoint.x}px ${detonationPoint.y}px, rgba(224,224,224,0.1) 0%, rgba(0,240,255,0.06) 8%, rgba(0,240,255,0.02) 16%, rgba(0,0,0,0) 28%)`;
      gsap.set(pulse, { opacity: 0.08 * detonationPoint.intensity, scale: 0.76, filter: 'blur(0px)' });

      gsap.timeline()
        .to(
          ring,
          {
            scale: 2.4,
            opacity: 0,
            filter: 'blur(9px)',
            duration: 0.82,
            ease: 'power3.out',
          },
          0
        )
        .to(
          pulse,
          {
            scale: 1.12,
            opacity: 0,
            filter: 'blur(10px)',
            duration: 0.72,
            ease: 'power2.out',
          },
          0
        )
        .to(
          shell,
          {
            opacity: 0,
            duration: 0.42,
            ease: 'power2.out',
          },
          0.18
        );
    };

    const handleDetonation = (event: Event) => {
      const detonationEvent = event as CustomEvent<HeroDetonationEventDetail>;

      if (!hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        triggerShockwave(detonationEvent.detail);
      }
    };

    const handleHeroProgress = (event: Event) => {
      const heroEvent = event as CustomEvent<HeroProgressEventDetail>;
      const progressValue = heroEvent.detail?.progress ?? 0;

      if (progressValue < 0.58) {
        hasTriggeredRef.current = false;
      }
    };

    window.addEventListener('hero-detonation', handleDetonation as EventListener);
    window.addEventListener('hero-sequence-progress', handleHeroProgress as EventListener);

    return () => {
      window.removeEventListener('hero-detonation', handleDetonation as EventListener);
      window.removeEventListener('hero-sequence-progress', handleHeroProgress as EventListener);
      gsap.killTweensOf([shell, ring, pulse]);
    };
  }, []);

  return (
    <div ref={shellRef} className="pointer-events-none fixed inset-0 z-[25] opacity-0">
      <div
        ref={ringRef}
        className="absolute left-0 top-0 h-[24rem] w-[24rem] rounded-full border border-[#00F0FF]/60"
        style={{
          boxShadow: '0 0 48px rgba(0,240,255,0.1), inset 0 0 12px rgba(224,224,224,0.08)',
        }}
      />
      <div
        ref={pulseRef}
        className="absolute inset-0"
        style={{ background: 'radial-gradient(circle at 50% 38%, rgba(224,224,224,0.12) 0%, rgba(0,240,255,0.08) 8%, rgba(0,240,255,0.03) 16%, rgba(0,0,0,0) 30%)' }}
      />
    </div>
  );
}
