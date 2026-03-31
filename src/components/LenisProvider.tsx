'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { ReactLenis, useLenis } from 'lenis/react';
import { useMotionPreference } from '@/context/MotionContext';

gsap.registerPlugin(ScrollTrigger);

function LenisScrollSync() {
  const lenis = useLenis(() => {
    ScrollTrigger.update();
  }, []);

  useEffect(() => {
    if (!lenis) return undefined;

    const syncLenisGeometry = () => lenis.resize();
    const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());

    ScrollTrigger.addEventListener('refresh', syncLenisGeometry);

    return () => {
      window.cancelAnimationFrame(refreshFrame);
      ScrollTrigger.removeEventListener('refresh', syncLenisGeometry);
    };
  }, [lenis]);

  return null;
}

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  const { motionReady, motionReduced } = useMotionPreference();

  if (motionReady && motionReduced) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.085,
        duration: 1.1,
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: 0.95,
        touchMultiplier: 1,
        overscroll: true,
      }}
    >
      <LenisScrollSync />
      {children}
    </ReactLenis>
  );
}
