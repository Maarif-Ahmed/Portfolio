'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: fine)');
    const updateEnabled = () => setIsEnabled(mediaQuery.matches);

    updateEnabled();
    mediaQuery.addEventListener('change', updateEnabled);
    return () => mediaQuery.removeEventListener('change', updateEnabled);
  }, []);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!isEnabled || !cursor) {
      document.body.style.cursor = 'auto';
      return undefined;
    }

    document.body.style.cursor = 'none';

    let pointerX = 0;
    let pointerY = 0;
    let activeTarget: HTMLElement | null = null;

    const moveX = gsap.quickTo(cursor, 'x', { duration: 0.18, ease: 'power3.out' });
    const moveY = gsap.quickTo(cursor, 'y', { duration: 0.18, ease: 'power3.out' });
    const resizeW = gsap.quickTo(cursor, 'width', { duration: 0.2, ease: 'power3.out' });
    const resizeH = gsap.quickTo(cursor, 'height', { duration: 0.2, ease: 'power3.out' });

    const syncToPointer = () => {
      moveX(pointerX - 10);
      moveY(pointerY - 10);
      resizeW(20);
      resizeH(20);
      gsap.to(cursor, {
        borderColor: '#E0E0E0',
        backgroundColor: 'rgba(224,224,224,0.04)',
        boxShadow: '0 0 18px rgba(224,224,224,0.15)',
        duration: 0.2,
        overwrite: 'auto',
      });
    };

    const syncToTarget = () => {
      if (!activeTarget) {
        syncToPointer();
        return;
      }

      const rect = activeTarget.getBoundingClientRect();
      moveX(rect.left - 6);
      moveY(rect.top - 6);
      resizeW(rect.width + 12);
      resizeH(rect.height + 12);
      gsap.to(cursor, {
        borderColor: '#FF00FF',
        backgroundColor: 'rgba(255,0,255,0.04)',
        boxShadow: '0 0 24px rgba(255,0,255,0.22), inset 0 0 0 1px rgba(57,255,20,0.22)',
        duration: 0.18,
        overwrite: 'auto',
      });
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (activeTarget) {
        syncToTarget();
      } else {
        syncToPointer();
      }
    };

    const handleMouseOver = (event: MouseEvent) => {
      const target = (event.target as HTMLElement).closest('a, button, [data-cursor-target]') as HTMLElement | null;
      if (!target) return;
      activeTarget = target;
      syncToTarget();
    };

    const handleMouseOut = (event: MouseEvent) => {
      if (!activeTarget) return;
      const related = event.relatedTarget as Node | null;
      if (related && activeTarget.contains(related)) return;
      activeTarget = null;
      syncToPointer();
    };

    const handlePointerDown = () => {
      gsap.to(cursor, { scale: 0.94, duration: 0.12, overwrite: 'auto' });
    };

    const handlePointerUp = () => {
      gsap.to(cursor, { scale: 1, duration: 0.2, overwrite: 'auto' });
    };

    const handleViewportChange = () => {
      if (activeTarget) {
        syncToTarget();
      }
    };

    syncToPointer();

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mouseout', handleMouseOut);
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('scroll', handleViewportChange, { passive: true });
    window.addEventListener('resize', handleViewportChange);

    return () => {
      document.body.style.cursor = 'auto';
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('scroll', handleViewportChange);
      window.removeEventListener('resize', handleViewportChange);
    };
  }, [isEnabled]);

  if (!isEnabled) return null;

  return (
    <div ref={cursorRef} className="pointer-events-none fixed left-0 top-0 z-[100003] flex h-5 w-5 items-center justify-center border border-[#E0E0E0] bg-[rgba(224,224,224,0.04)] mix-blend-screen">
      <span className="absolute -left-2 top-1/2 -translate-y-1/2 text-[10px] text-[#39FF14]">[</span>
      <span className="absolute -right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#39FF14]">]</span>
      <span className="h-1.5 w-1.5 bg-[#E0E0E0] shadow-[0_0_8px_rgba(224,224,224,0.45)]" />
    </div>
  );
}
