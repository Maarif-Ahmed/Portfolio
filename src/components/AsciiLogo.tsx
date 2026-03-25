'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ASCII art representation of "MRF" — styled to look like a terminal logo
const ASCII_LINES = [
  '███╗   ███╗ ██████╗  ███████╗',
  '████╗ ████║ ██╔══██╗ ██╔════╝',
  '██╔████╔██║ ██████╔╝ █████╗  ',
  '██║╚██╔╝██║ ██╔══██╗ ██╔══╝  ',
  '██║ ╚═╝ ██║ ██║  ██║ ██║     ',
  '╚═╝     ╚═╝ ╚═╝  ╚═╝ ╚═╝     ',
];

export default function AsciiLogo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const charsRef = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const chars = charsRef.current;
    if (chars.length === 0) return;

    const ctx = gsap.context(() => {
      // Set initial state: chars scattered above
      gsap.set(chars, {
        y: () => gsap.utils.random(-600, -200),
        x: () => gsap.utils.random(-40, 40),
        opacity: 0,
        rotationZ: () => gsap.utils.random(-90, 90),
      });

      // Fall into place on scroll
      gsap.to(chars, {
        y: 0,
        x: 0,
        opacity: 1,
        rotationZ: 0,
        stagger: { each: 0.003, from: 'random' },
        ease: 'bounce.out',
        duration: 1,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          end: 'top 30%',
          scrub: 1.5,
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  let charIndex = 0;

  return (
    <div id="ascii" ref={containerRef} className="py-16 md:py-20 flex justify-center overflow-hidden">
      <pre className="text-accent text-[6px] sm:text-[8px] md:text-xs lg:text-sm leading-tight tracking-wider select-none">
        {ASCII_LINES.map((line, lineIdx) => (
          <div key={lineIdx} className="whitespace-pre">
            {line.split('').map((char, cIdx) => {
              const idx = charIndex++;
              return (
                <span
                  key={`${lineIdx}-${cIdx}`}
                  ref={(el) => { if (el) charsRef.current[idx] = el; }}
                  className="inline-block will-change-transform"
                  style={{ minWidth: char === ' ' ? '0.6ch' : undefined }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              );
            })}
          </div>
        ))}
      </pre>
    </div>
  );
}
