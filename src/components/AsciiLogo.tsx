'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ASCII_LINES = [
  ' __  __ ____  _____ ',
  '|  \\/  |  _ \\|  ___|',
  '| |\\/| | |_) | |_   ',
  '| |  | |  _ <|  _|  ',
  '|_|  |_|_| \\_\\_|    ',
];

const LINE_OFFSETS = ASCII_LINES.reduce<number[]>((offsets, line, index) => {
  const previousOffset = index === 0 ? 0 : offsets[index - 1] + ASCII_LINES[index - 1].length;
  offsets.push(previousOffset);
  return offsets;
}, []);

export default function AsciiLogo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const charsRef = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    if (!containerRef.current) return undefined;

    const chars = charsRef.current;
    if (chars.length === 0) return undefined;

    const ctx = gsap.context(() => {
      gsap.set(chars, {
        y: () => gsap.utils.random(-320, -80),
        x: () => gsap.utils.random(-24, 24),
        opacity: 0,
        rotationZ: () => gsap.utils.random(-60, 60),
      });

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
          end: 'top 32%',
          scrub: 1.4,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div id="ascii" ref={containerRef} className="flex justify-center overflow-hidden px-6 py-16 md:px-20 md:py-20">
      <div className="w-full max-w-6xl border border-[#E0E0E0]/15 bg-[#0a0d10]/80 px-4 py-6 shadow-[0_0_22px_rgba(224,224,224,0.05)] md:px-8 md:py-8">
        <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.35em] text-[#E0E0E0]/45 md:text-xs">identity_banner</p>
        <pre className="select-none text-[#E0E0E0] text-[0.48rem] leading-tight tracking-[0.28em] sm:text-[0.7rem] md:text-[0.82rem] lg:text-[1rem]">
          {ASCII_LINES.map((line, lineIndex) => (
            <div key={lineIndex} className="whitespace-pre">
              {line.split('').map((char, charIndexInLine) => {
                const index = LINE_OFFSETS[lineIndex] + charIndexInLine;

                return (
                  <span
                    key={`${lineIndex}-${charIndexInLine}`}
                    ref={(el) => {
                      if (el) charsRef.current[index] = el;
                    }}
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
    </div>
  );
}
