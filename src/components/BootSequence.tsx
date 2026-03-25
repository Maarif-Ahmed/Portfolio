'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

const BOOT_LINES = [
  '[BIOS] POST check... OK',
  '[BIOS] Memory: 32GB DDR5 @ 6400MHz',
  '[BOOT] Loading kernel v4.2.0-maarif...',
  '[INIT] Mounting filesystem /dev/portfolio',
  '[SYS]  Setting timezone: UTC+5',
  '[PKG]  npm install gsap@latest ✓',
  '[PKG]  npm install framer-motion ✓',
  '[PKG]  npm install next@latest ✓',
  '[NET]  Establishing socket connection...',
  '[AUTH] Validating credentials... BYPASSED',
  '[GPU]  WebGL context initialized',
  '[FONT] Loading JetBrains Mono... OK',
  '[CSS]  Compiling 269 rules... OK',
  '[GSAP] ScrollTrigger registered',
  '[LENIS] Smooth scrolling enabled',
  '[SYS]  Starting dev server on :3000',
  '',
  '> SYSTEM READY.',
  '> Welcome, root.',
];

export default function BootSequence() {
  const [isBooting, setIsBooting] = useState(true);
  const [lines, setLines] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const textBlockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isBooting) return;

    // Prevent scrolling during boot
    document.body.style.overflow = 'hidden';

    let lineIndex = 0;
    const interval = setInterval(() => {
      if (lineIndex < BOOT_LINES.length) {
        setLines(prev => [...prev, BOOT_LINES[lineIndex]]);
        lineIndex++;
      } else {
        clearInterval(interval);
        
        // Zoom out animation
        setTimeout(() => {
          if (textBlockRef.current && containerRef.current) {
            const tl = gsap.timeline({
              onComplete: () => {
                setIsBooting(false);
                document.body.style.overflow = '';
              }
            });
            
            tl.to(textBlockRef.current, {
              scale: 0.01,
              opacity: 0,
              duration: 0.8,
              ease: 'power4.in',
            })
            .to(containerRef.current, {
              yPercent: -100,
              duration: 0.5,
              ease: 'power2.inOut',
            }, '-=0.3');
          }
        }, 600);
      }
    }, 65);

    return () => {
      clearInterval(interval);
      document.body.style.overflow = '';
    };
  }, [isBooting]);

  if (!isBooting) return null;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[9999999] bg-background flex items-center justify-center"
    >
      <div ref={textBlockRef} className="max-w-lg w-full px-6">
        <div className="space-y-0.5 font-mono">
          {lines.map((line, i) => (
            <p 
              key={i} 
              className={`text-[10px] md:text-xs leading-relaxed ${
                (line && line.startsWith('[')) ? 'text-accent/70' : 
                (line && line.startsWith('>')) ? 'text-accent font-bold' : 
                'text-foreground/40'
              }`}
            >
              {line}
            </p>
          ))}
          {lines.length < BOOT_LINES.length && (
            <span className="inline-block w-2 h-3.5 bg-accent animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}
