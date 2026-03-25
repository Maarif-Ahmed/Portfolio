'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Link from 'next/link';
import DecipherText from '@/components/DecipherText';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const linesRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      linesRef.current.forEach((line) => {
        if (!line) return;
        gsap.fromTo(line, 
          { y: "110%", opacity: 0 },
          {
            y: "0%",
            opacity: 1,
            duration: 1.2,
            ease: "power4.out",
            scrollTrigger: {
              trigger: line,
              start: "top 95%",
            }
          }
        );
      });
    });
    return () => ctx.revert();
  }, []);

  const textLines = [
    "I'm Maarif, a rogue",
    "Web Developer &", 
    "Terminal Wizard.",
    "Driven by neon,",
    "caffeine, and high-end",
    "keyboard clacking."
  ];

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-center">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full px-6 py-8 md:px-20 z-50 flex justify-between items-center mix-blend-difference text-white pointer-events-none">
        <Link href="/" className="font-bold text-2xl tracking-tighter uppercase pointer-events-auto glitch-link" data-text="[ SYS_ROOT ]">[ SYS_ROOT ]</Link>
        <span className="text-xs font-bold uppercase tracking-widest opacity-50">{">"} /about</span>
      </nav>

      <section className="pt-[40vh] pb-[20vh] px-6 md:px-20 max-w-6xl mx-auto">
        <div className="font-black text-4xl md:text-[6vw] leading-[1] uppercase tracking-tighter">
          {textLines.map((line, i) => (
            <div key={i} className="overflow-hidden pb-2">
              <div ref={(el) => { linesRef.current[i] = el; }}>{line}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-20 pb-40 grid grid-cols-1 md:grid-cols-2 gap-20 max-w-7xl mx-auto">
        <div>
          <h2 className="text-xs uppercase tracking-widest text-accent mb-8 border-b border-accent/30 pb-4">{">"} APPROACH.md</h2>
          <p className="text-xl md:text-2xl font-light opacity-80 leading-snug max-w-lg mb-8">
            <DecipherText text="Rejecting the ordinary template. Every interaction should feel intentional, slightly unhinged, yet elegant. I merge strict grids with neon accents to create web apps that probably work on the first try." delay={0.3} />
          </p>
          <a href="mailto:hello@maarif.digital" className="text-lg font-bold uppercase tracking-widest glitch-link inline-block border border-accent px-4 py-2" data-text="[ INIT_COFFEE() ]">[ INIT_COFFEE() ]</a>
        </div>
        <div>
          <h2 className="text-xs uppercase tracking-widest text-accent mb-8 border-b border-accent/30 pb-4">{">"} SKILLS.log</h2>
          <ul className="text-2xl md:text-4xl font-bold uppercase space-y-6 opacity-90">
            <li className="hover:text-background hover:bg-accent px-2 transition-all cursor-pointer" data-cursor="EXECUTE ()">{">"} Fullstack Dev</li>
            <li className="hover:text-background hover:bg-accent px-2 transition-all cursor-pointer" data-cursor="EXECUTE ()">{">"} WebGL / Three.js</li>
            <li className="hover:text-background hover:bg-accent px-2 transition-all cursor-pointer" data-cursor="EXECUTE ()">{">"} Motion Engineering</li>
            <li className="hover:text-background hover:bg-accent px-2 transition-all cursor-pointer" data-cursor="EXECUTE ()">{">"} Terminal Wizardry</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
