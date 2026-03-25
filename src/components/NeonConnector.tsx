'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function NeonConnector() {
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lineRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: lineRef.current,
            start: 'top 90%',
            end: 'bottom 10%',
            scrub: true,
          }
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="flex justify-center py-0">
      <div
        ref={lineRef}
        className="w-[1px] h-20 md:h-32 bg-accent origin-top shadow-[0_0_8px_#39ff14]"
        style={{ transformOrigin: 'top center' }}
      />
    </div>
  );
}
