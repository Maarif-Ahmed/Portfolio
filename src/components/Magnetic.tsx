'use client';

import { useRef, useEffect, ReactNode } from 'react';
import gsap from 'gsap';

export default function Magnetic({ children }: { children: ReactNode }) {
  const magneticRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = magneticRef.current;
    if (!el) return;

    const xTo = gsap.quickTo(el, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
    const yTo = gsap.quickTo(el, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = el.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      
      // Calculate distance
      const distance = Math.hypot(x, y);
      const threshold = 100;

      if (distance < threshold) {
        xTo(x * 0.4); // 15-20px max pull
        yTo(y * 0.4);
      } else {
        xTo(0);
        yTo(0);
      }
    };

    const handleMouseLeave = () => {
      xTo(0);
      yTo(0);
    };

    window.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return <div ref={magneticRef} className="inline-block">{children}</div>;
}
