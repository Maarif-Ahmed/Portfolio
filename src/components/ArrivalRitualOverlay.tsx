'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useAudio } from '@/context/AudioContext';
import { useMotionPreference } from '@/context/MotionContext';

const STORAGE_KEY = 'maarif.arrival-ritual.v1';

export default function ArrivalRitualOverlay() {
  const rootRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const noteRef = useRef<HTMLParagraphElement>(null);
  const [isActive, setIsActive] = useState(false);

  const { isUnlocked, playTransitionTone } = useAudio();
  const { motionReduced } = useMotionPreference();

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    if (motionReduced) {
      window.localStorage.setItem(STORAGE_KEY, 'seen');
      return undefined;
    }

    if (window.localStorage.getItem(STORAGE_KEY) === 'seen') {
      return undefined;
    }

    let cancelled = false;

    const beginRitual = () => {
      if (cancelled) return;
      window.localStorage.setItem(STORAGE_KEY, 'seen');
      setIsActive(true);
    };

    if (document.documentElement.dataset.bootReady === 'true') {
      beginRitual();
      return () => {
        cancelled = true;
      };
    }

    const handleBootReady = () => beginRitual();
    window.addEventListener('boot-sequence-complete', handleBootReady, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener('boot-sequence-complete', handleBootReady);
    };
  }, [motionReduced]);

  useEffect(() => {
    if (!isActive) return undefined;

    const rootNode = rootRef.current;
    const lineNode = lineRef.current;
    const eyebrowNode = eyebrowRef.current;
    const titleNode = titleRef.current;
    const noteNode = noteRef.current;

    if (!rootNode || !lineNode || !eyebrowNode || !titleNode || !noteNode) {
      return undefined;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const ritualSequence = gsap.timeline({
      onStart: () => {
        if (isUnlocked) {
          void playTransitionTone();
        }
      },
      onComplete: () => {
        document.body.style.overflow = previousBodyOverflow;
        document.documentElement.style.overflow = previousHtmlOverflow;
        setIsActive(false);
      },
    });

    gsap.set(rootNode, { autoAlpha: 1 });
    gsap.set(lineNode, { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set([eyebrowNode, titleNode, noteNode], {
      y: 16,
      opacity: 0,
      filter: 'blur(8px)',
    });

    ritualSequence
      .to(rootNode, { opacity: 1, duration: 0.28, ease: 'power2.out' })
      .to(eyebrowNode, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.24 }, 0.08)
      .to(titleNode, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.34 }, 0.14)
      .to(noteNode, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.3 }, 0.18)
      .to(lineNode, { scaleX: 1, duration: 0.52, ease: 'power2.inOut' }, 0.18)
      .to([eyebrowNode, titleNode, noteNode], { opacity: 0, y: -12, filter: 'blur(10px)', duration: 0.28 }, '+=0.72')
      .to(lineNode, { scaleX: 0, transformOrigin: '100% 50%', duration: 0.28, ease: 'power2.inOut' }, '<')
      .to(rootNode, { opacity: 0, duration: 0.22, ease: 'power1.out' }, '<');

    return () => {
      ritualSequence.kill();
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isActive, isUnlocked, playTransitionTone]);

  if (!isActive) {
    return null;
  }

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-[radial-gradient(circle_at_50%_38%,rgba(255,255,255,0.03),transparent_16%),linear-gradient(180deg,rgba(0,0,0,0.84)_0%,rgba(0,0,0,0.52)_48%,rgba(0,0,0,0.92)_100%)] opacity-0"
    >
      <div className="w-full max-w-xl px-6 text-center">
        <p
          ref={eyebrowRef}
          className="font-mono text-[10px] uppercase tracking-[0.42em] text-white/34 md:text-[11px]"
        >
          first arrival / chamber lock
        </p>
        <p
          ref={titleRef}
          className="mt-6 text-[clamp(2rem,7vw,4.6rem)] font-semibold uppercase tracking-[-0.08em] text-[#ebe6df]"
          style={{ fontFamily: '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif' }}
        >
          The chamber receives you.
        </p>
        <div className="mx-auto mt-8 h-px w-full max-w-sm bg-white/10">
          <div
            ref={lineRef}
            className="h-full scale-x-0 bg-[linear-gradient(90deg,rgba(224,224,224,0.16),rgba(224,224,224,0.7))]"
          />
        </div>
        <p
          ref={noteRef}
          className="mx-auto mt-6 max-w-md font-mono text-[10px] uppercase tracking-[0.28em] text-white/38 md:text-[11px]"
        >
          one quiet arrival, then the room remembers you
        </p>
      </div>
    </div>
  );
}
