'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import HeroTerrainFallback from '@/components/hero-terrain/HeroTerrainFallback';
import HeroTerrainOverlay from '@/components/hero-terrain/HeroTerrainOverlay';
import { useMotionPreference } from '@/context/MotionContext';

const HeroTerrainScene = dynamic(() => import('@/components/HeroTerrainScene'), {
  ssr: false,
  loading: () => <HeroTerrainFallback />,
});

export default function SystemInitializer() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [sceneActive, setSceneActive] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const { motionReduced } = useMotionPreference();

  useEffect(() => {
    const contentNode = contentRef.current;
    if (!contentNode) return undefined;

    const revealItems = contentNode.querySelectorAll<HTMLElement>('[data-hero-reveal]');
    gsap.set(revealItems, { y: 18, opacity: 0, filter: 'blur(10px)' });
    gsap.to(revealItems, {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      duration: motionReduced ? 0 : 1.05,
      ease: 'power3.out',
      stagger: motionReduced ? 0 : 0.06,
      delay: motionReduced ? 0 : 0.08,
    });

    return () => {
      gsap.killTweensOf(revealItems);
      gsap.set(revealItems, { clearProps: 'all' });
    };
  }, [motionReduced]);

  useEffect(() => {
    const sectionNode = sectionRef.current;
    if (!sectionNode) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setSceneActive(entry.isIntersecting);
      },
      { threshold: 0.12, rootMargin: '30% 0px' }
    );

    observer.observe(sectionNode);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative isolate min-h-screen overflow-hidden bg-[#d7dde2] text-[#10151c]"
    >
      <div className="absolute inset-0">
        <HeroTerrainScene
          motionReduced={motionReduced}
          sceneActive={sceneActive}
          onInputDetected={() => setHasInteracted(true)}
        />
      </div>

      <div ref={contentRef}>
        <HeroTerrainOverlay hasInteracted={hasInteracted} />
      </div>
    </section>
  );
}
