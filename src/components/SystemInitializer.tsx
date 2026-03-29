'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useAudio } from '@/context/AudioContext';
import { useChamber } from '@/context/ChamberContext';
import { useMotionPreference } from '@/context/MotionContext';
import ArrivalRitualOverlay from '@/components/ArrivalRitualOverlay';

gsap.registerPlugin(ScrollTrigger);

const HeroSignalScene = dynamic(() => import('@/components/HeroSignalScene'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(224,224,224,0.04),transparent_10%),radial-gradient(circle_at_50%_48%,rgba(0,240,255,0.05),transparent_20%),radial-gradient(circle_at_50%_100%,rgba(0,240,255,0.03),transparent_32%),linear-gradient(180deg,rgba(0,0,0,1)_0%,rgba(0,0,0,0.94)_46%,rgba(0,0,0,1)_100%)]" />
  ),
});

interface AxisVector {
  x: number;
  y: number;
}

const HERO_PHASES = [
  {
    key: 'invocation',
    title: 'INVOCATION',
    caption: 'the chamber opens and the object fixes its gaze',
  },
  {
    key: 'vigil',
    title: 'VIGIL',
    caption: 'the room holds its breath while the pressure gathers',
  },
  {
    key: 'release',
    title: 'RELEASE',
    caption: 'the flash lands, the shell breaks, and ash inherits the frame',
  },
] as const;

function clampValue(value: number, minValue: number, maxValue: number) {
  return Math.min(Math.max(value, minValue), maxValue);
}

function easeToward(currentValue: number, targetValue: number, easing: number) {
  return currentValue + (targetValue - currentValue) * easing;
}

function getHeroPhaseIndex(progressValue: number) {
  if (progressValue < 0.48) return 0;
  if (progressValue < 0.72) return 1;
  return 2;
}

export default function SystemInitializer() {
  const heroSectionRef = useRef<HTMLElement>(null);
  const heroViewportRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const phaseRailRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const leadRef = useRef<HTMLParagraphElement>(null);
  const sequenceRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const sceneProgressRef = useRef(0);
  const pointerTargetRef = useRef<AxisVector>({ x: 0, y: 0 });
  const pointerCurrentRef = useRef<AxisVector>({ x: 0, y: 0 });
  const tiltOffsetRef = useRef<AxisVector>({ x: 0, y: 0 });
  const phaseIndexRef = useRef(0);
  const cueStateRef = useRef({ bridge: false, expand: false, detonate: false });

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [sceneDeferredReady, setSceneDeferredReady] = useState(false);

  const { playHeroSwell, playTransitionTone, setHeroRoomTone } = useAudio();
  const { chamberMode } = useChamber();
  const { motionReduced } = useMotionPreference();

  useGSAP(
    () => {
      const heroSection = heroSectionRef.current;
      const heroViewport = heroViewportRef.current;
      const overlay = overlayRef.current;
      const meta = metaRef.current;
      const phaseRail = phaseRailRef.current;
      const eyebrow = eyebrowRef.current;
      const title = titleRef.current;
      const lead = leadRef.current;
      const sequence = sequenceRef.current;
      const progressFill = progressFillRef.current;

      if (
        !heroSection ||
        !heroViewport ||
        !overlay ||
        !meta ||
        !phaseRail ||
        !eyebrow ||
        !title ||
        !lead ||
        !sequence ||
        !progressFill
      ) {
        return;
      }

      const setOverlayX = gsap.quickSetter(overlay, 'x', 'px');
      const setOverlayY = gsap.quickSetter(overlay, 'y', 'px');
      const setProgressScale = gsap.quickSetter(progressFill, 'scaleX');

      gsap.set(overlay, {
        force3D: true,
        willChange: 'transform',
      });

      const syncOverlay = () => {
        const targetX = motionReduced ? 0 : pointerTargetRef.current.x + tiltOffsetRef.current.x * 0.6;
        const targetY = motionReduced ? 0 : pointerTargetRef.current.y + tiltOffsetRef.current.y * 0.6;

        pointerCurrentRef.current.x = easeToward(pointerCurrentRef.current.x, targetX, 0.08);
        pointerCurrentRef.current.y = easeToward(pointerCurrentRef.current.y, targetY, 0.08);

        setOverlayX(pointerCurrentRef.current.x * -14);
        setOverlayY(pointerCurrentRef.current.y * 10);
      };

      gsap.ticker.add(syncOverlay);
      setProgressScale(motionReduced ? 0.34 : 0);

      if (motionReduced) {
        sceneProgressRef.current = 0.34;
        void setHeroRoomTone(-1);
        gsap.set([meta, phaseRail, eyebrow, title, lead, sequence], {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
        });

        return () => {
          gsap.ticker.remove(syncOverlay);
          gsap.set(overlay, { clearProps: 'all' });
          gsap.set([meta, phaseRail, eyebrow, title, lead, sequence], { clearProps: 'all' });
        };
      }

      gsap.set(meta, { opacity: 0, y: -18, filter: 'blur(8px)' });
      gsap.set(phaseRail, { opacity: 0, y: -24, filter: 'blur(8px)' });
      gsap.set([eyebrow, title, lead, sequence], {
        opacity: 0,
        y: 36,
        filter: 'blur(10px)',
      });
      gsap.set(progressFill, {
        transformOrigin: '0% 50%',
        scaleX: 0,
      });

      const syncHeroState = (heroScene: ScrollTrigger) => {
        const progressValue = heroScene.progress;
        sceneProgressRef.current = progressValue;
        setProgressScale(progressValue);
        void setHeroRoomTone(progressValue);
        window.dispatchEvent(new CustomEvent('hero-sequence-progress', { detail: { progress: progressValue } }));

        const nextPhaseIndex = getHeroPhaseIndex(progressValue);
        if (nextPhaseIndex !== phaseIndexRef.current) {
          phaseIndexRef.current = nextPhaseIndex;
          setPhaseIndex(nextPhaseIndex);
        }

        if (progressValue > 0.32 && !cueStateRef.current.expand) {
          cueStateRef.current.expand = true;
          void playHeroSwell(0.92);
        }

        if (progressValue < 0.22) {
          cueStateRef.current.expand = false;
        }

        if (progressValue > 0.9 && !cueStateRef.current.bridge) {
          cueStateRef.current.bridge = true;
          void playTransitionTone();
        }

        if (progressValue < 0.8) {
          cueStateRef.current.bridge = false;
        }

        if (progressValue > 0.76 && !cueStateRef.current.detonate) {
          cueStateRef.current.detonate = true;
          void playHeroSwell(1.16);
        }

        if (progressValue < 0.6) {
          cueStateRef.current.detonate = false;
        }
      };

      const buildHeroTimeline = (endDistance: string) => {
        return gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: heroSection,
            start: 'top top',
            end: endDistance,
            pin: heroViewport,
            pinSpacing: true,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: syncHeroState,
          },
        })
          .to(sceneProgressRef, { current: 1, duration: 1 }, 0)
          .to(meta, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.12 }, 0.04)
          .to(phaseRail, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.14 }, 0.06)
          .to(eyebrow, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.12 }, 0.08)
          .to(title, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.18 }, 0.1)
          .to(lead, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.18 }, 0.16)
          .to(sequence, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.16 }, 0.2)
          .to(title, { y: -14, opacity: 0.74, duration: 0.16 }, 0.76)
          .to(lead, { y: -10, opacity: 0.34, duration: 0.14 }, 0.8)
          .to([eyebrow, phaseRail], { opacity: 0.24, duration: 0.12 }, 0.86)
          .to(sequence, { opacity: 0.16, duration: 0.1 }, 0.9);
      };

      const mediaContext = gsap.matchMedia();

      mediaContext.add('(min-width: 1024px)', () => {
        const desktopTimeline = buildHeroTimeline('+=3000');
        return () => {
          desktopTimeline.scrollTrigger?.kill();
          desktopTimeline.kill();
        };
      });

      mediaContext.add('(max-width: 1023px)', () => {
        const mobileTimeline = buildHeroTimeline('+=2050');
        return () => {
          mobileTimeline.scrollTrigger?.kill();
          mobileTimeline.kill();
        };
      });

      return () => {
        cueStateRef.current = { bridge: false, expand: false, detonate: false };
        void setHeroRoomTone(-1);
        gsap.ticker.remove(syncOverlay);
        mediaContext.revert();
        gsap.set(overlay, { clearProps: 'all' });
        gsap.set([meta, phaseRail, eyebrow, title, lead, sequence, progressFill], { clearProps: 'all' });
      };
    },
    { dependencies: [motionReduced, playHeroSwell, playTransitionTone, setHeroRoomTone], scope: heroSectionRef }
  );

  useEffect(() => {
    if (motionReduced) {
      pointerTargetRef.current = { x: 0, y: 0 };
      tiltOffsetRef.current = { x: 0, y: 0 };
      return undefined;
    }

    const compactViewport = window.matchMedia('(max-width: 1023px)');
    const orientationSource = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };
    let tiltArmed = false;

    const armTilt = async () => {
      if (!compactViewport.matches || tiltArmed) return;
      tiltArmed = true;

      if (typeof orientationSource.requestPermission === 'function') {
        try {
          const permissionState = await orientationSource.requestPermission();
          if (permissionState !== 'granted') {
            tiltArmed = false;
          }
        } catch {
          tiltArmed = false;
        }
      }
    };

    const handleTilt = (event: DeviceOrientationEvent) => {
      if (!compactViewport.matches) return;

      tiltOffsetRef.current = {
        x: clampValue((event.gamma ?? 0) / 22, -1, 1),
        y: clampValue((event.beta ?? 0) / 32, -1, 1),
      };
    };

    window.addEventListener('deviceorientation', handleTilt);
    window.addEventListener('touchstart', armTilt, { passive: true, once: true });

    return () => {
      tiltOffsetRef.current = { x: 0, y: 0 };
      window.removeEventListener('deviceorientation', handleTilt);
      window.removeEventListener('touchstart', armTilt);
    };
  }, [motionReduced]);

  useEffect(() => {
    let timeoutHandle: number | null = null;
    let idleHandle: number | null = null;
    const idleWindow = window as Window &
      typeof globalThis & {
        cancelIdleCallback?: (handle: number) => void;
        requestIdleCallback?: (
          callback: (deadline: IdleDeadline) => void,
          options?: { timeout: number }
        ) => number;
      };

    if (motionReduced) {
      return undefined;
    }

    const armScene = () => {
      timeoutHandle = window.setTimeout(() => setSceneDeferredReady(true), 120);
    };

    if (typeof idleWindow.requestIdleCallback === 'function') {
      idleHandle = idleWindow.requestIdleCallback(() => armScene(), { timeout: 900 });
    } else {
      armScene();
    }

    return () => {
      if (idleHandle !== null && typeof idleWindow.cancelIdleCallback === 'function') {
        idleWindow.cancelIdleCallback(idleHandle);
      }

      if (timeoutHandle !== null) {
        window.clearTimeout(timeoutHandle);
      }
    };
  }, [motionReduced]);

  const primeStage = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (motionReduced || !heroViewportRef.current || window.innerWidth < 1024) return;

    const viewportBounds = heroViewportRef.current.getBoundingClientRect();
    const normalizedX = ((event.clientX - viewportBounds.left) / viewportBounds.width) * 2 - 1;
    const normalizedY = ((event.clientY - viewportBounds.top) / viewportBounds.height) * 2 - 1;

    pointerTargetRef.current = {
      x: clampValue(normalizedX, -1, 1),
      y: clampValue(normalizedY, -1, 1),
    };
  };

  const settleStage = () => {
    pointerTargetRef.current = { x: 0, y: 0 };
  };

  const activePhase = HERO_PHASES[phaseIndex] ?? HERO_PHASES[0];
  const sceneArmed = motionReduced || sceneDeferredReady;

  return (
    <section
      id="hero"
      ref={heroSectionRef}
      className={motionReduced ? 'relative z-20 min-h-screen bg-black' : 'relative z-20 h-[215vh] bg-black lg:h-[320vh]'}
    >
      <div
        ref={heroViewportRef}
        className="relative z-10 h-screen overflow-hidden bg-black"
        onMouseMove={primeStage}
        onMouseLeave={settleStage}
      >
        <div className="absolute inset-0">
          {sceneArmed ? (
            <HeroSignalScene
              progressRef={sceneProgressRef}
              pointerRef={pointerCurrentRef}
              motionReduced={motionReduced}
              chamberMode={chamberMode}
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(224,224,224,0.06),transparent_12%),radial-gradient(circle_at_50%_50%,rgba(0,240,255,0.05),transparent_24%),linear-gradient(180deg,rgba(0,0,0,1)_0%,rgba(0,0,0,0.9)_100%)]" />
          )}
        </div>

        <div
          className={`pointer-events-none absolute inset-0 ${
            chamberMode === 'alternate'
              ? 'bg-[radial-gradient(circle_at_50%_36%,rgba(0,240,255,0.08),transparent_18%),radial-gradient(circle_at_50%_18%,rgba(255,0,255,0.04),transparent_18%),linear-gradient(180deg,rgba(0,0,0,0.94)_0%,rgba(0,0,0,0.18)_36%,rgba(0,0,0,1)_100%)]'
              : 'bg-[radial-gradient(circle_at_50%_36%,rgba(255,255,255,0.03),transparent_16%),radial-gradient(circle_at_50%_18%,rgba(255,0,255,0.025),transparent_16%),linear-gradient(180deg,rgba(0,0,0,0.94)_0%,rgba(0,0,0,0.22)_34%,rgba(0,0,0,1)_100%)]'
          }`}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_50%,rgba(0,0,0,0.76),transparent_26%),radial-gradient(circle_at_92%_50%,rgba(0,0,0,0.78),transparent_26%)]" />
        <div className="pointer-events-none absolute inset-x-[14%] bottom-12 h-28 bg-[linear-gradient(180deg,rgba(255,255,255,0.0)_0%,rgba(224,224,224,0.015)_28%,rgba(0,240,255,0.08)_54%,rgba(255,255,255,0.0)_100%)] blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-[linear-gradient(0deg,rgba(0,0,0,1),rgba(0,0,0,0.0))]" />
        <ArrivalRitualOverlay />

        <div ref={overlayRef} className="pointer-events-none absolute inset-0 z-20">
          <div
            ref={metaRef}
            className="absolute left-5 top-5 hidden max-w-[12rem] font-mono text-[10px] uppercase tracking-[0.34em] text-white/28 sm:block md:left-8 md:top-8 md:text-[11px]"
          >
            <p>maarif ahmed / {chamberMode === 'alternate' ? 'alternate chamber' : 'ritual chamber'}</p>
          </div>

          <div
            ref={phaseRailRef}
            className="absolute right-5 top-5 hidden max-w-[10rem] text-right md:block md:right-8 md:top-8"
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.34em] text-white/28">active phase</p>
            <p className="mt-3 font-mono text-sm uppercase tracking-[0.32em] text-white/68">
              {activePhase.title}
              {chamberMode === 'alternate' ? ' / ALT' : ''}
            </p>
          </div>

          <div className="absolute bottom-20 left-5 right-5 md:bottom-20 md:left-8 md:right-8">
            <div className="max-w-[19rem] md:max-w-[22rem]">
              <p
                ref={eyebrowRef}
                className="font-mono text-[10px] uppercase tracking-[0.45em] text-white/38 md:text-[11px]"
              >
                fullstack systems / ritual motion
              </p>
              <h1
                ref={titleRef}
                className="mt-5 max-w-[6ch] text-[clamp(3rem,15vw,5.8rem)] font-black uppercase leading-[0.8] tracking-[-0.1em] text-[#ebe6df] md:text-[clamp(3.4rem,8vw,8.2rem)]"
                style={{ fontFamily: 'var(--font-display), sans-serif' }}
              >
                MAARIF
                <br />
                AHMED<span className="text-white/88">.</span>
              </h1>
              <p ref={leadRef} className="mt-4 max-w-[18rem] text-[13px] leading-6 text-white/42 md:mt-5 md:max-w-[20rem] md:text-[14px] md:leading-7">
                Interfaces built to hold tension without losing clarity.
              </p>
            </div>
          </div>

          <div ref={sequenceRef} className="absolute inset-x-5 bottom-4 md:inset-x-8 md:bottom-8">
            <div className="border-t border-white/12 px-0 py-3">
              <div className="mx-auto max-w-[34rem]">
                <div className="mb-3 flex items-center justify-between gap-3 font-mono text-[9px] uppercase tracking-[0.28em] text-white/38">
                  {HERO_PHASES.map((phaseItem, currentIndex) => (
                    <span
                      key={phaseItem.key}
                      className={currentIndex <= phaseIndex ? 'text-[#E0E0E0]' : 'text-white/24'}
                    >
                      {phaseItem.title}
                    </span>
                  ))}
                </div>
                <div className="h-px bg-white/10">
                  <div
                    ref={progressFillRef}
                    className="h-full origin-left scale-x-0 bg-[linear-gradient(90deg,rgba(224,224,224,0.18),rgba(224,224,224,0.72))]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
