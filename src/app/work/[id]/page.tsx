'use client';

import { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Flip from 'gsap/Flip';
import Link from 'next/link';
import { useTransitionContext } from '@/context/TransitionContext';
import DecipherText from '@/components/DecipherText';

gsap.registerPlugin(ScrollTrigger, Flip);

const projectData: Record<string, string> = {
  '1': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
  '2': 'https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?q=80&w=2574&auto=format&fit=crop',
  '3': 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2670&auto=format&fit=crop',
  '4': 'https://images.unsplash.com/photo-1470071131384-001b85755b36?q=80&w=2670&auto=format&fit=crop',
};

export default function CaseStudy() {
  const params = useParams();
  const id = params.id as string;
  const imgSrc = projectData[id] || projectData['1'];
  
  const { transitionState, completeFlipTransition } = useTransitionContext();
  const { isActive, rect } = transitionState;
  const imgRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const imageInnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {});

    const initParallaxAndEnter = () => {
      ctx.add(() => {
        gsap.to(titleRef.current, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.2 });

        if (imageInnerRef.current && imgRef.current) {
          gsap.to(imageInnerRef.current, {
            yPercent: 20,
            ease: 'none',
            scrollTrigger: {
              trigger: imgRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            }
          });
        }
      });
    };

    if (isActive && rect) {
      const clone = document.getElementById('flip-clone');
      if (clone && imgRef.current) {
        gsap.set(imgRef.current, { opacity: 1, visibility: 'visible' });

        const state = Flip.getState(clone, { props: "borderRadius,opacity" });
        gsap.set(clone, { display: 'none' });

        Flip.from(state, {
          targets: imgRef.current,
          duration: 1.2,
          ease: "expo.inOut",
          absolute: true,
          onComplete: () => {
             completeFlipTransition();
             initParallaxAndEnter();
          }
        });
      } else {
        gsap.set(imgRef.current, { opacity: 1 });
        completeFlipTransition();
        initParallaxAndEnter();
      }
    } else {
      gsap.set(imgRef.current, { opacity: 1 });
      initParallaxAndEnter();
    }

    return () => ctx.revert();
  }, [isActive, rect, completeFlipTransition]); 

  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="fixed top-0 w-full px-6 py-8 md:px-20 z-50 flex justify-between items-center mix-blend-difference text-white pointer-events-none">
        <Link href="/" className="font-bold text-2xl tracking-tighter uppercase pointer-events-auto glitch-link" data-text="[ RETURN ]">[ RETURN ]</Link>
        <Link href="/about" className="text-xs font-bold uppercase tracking-widest pointer-events-auto glitch-link" data-text="[ ARCHIVE ]">[ ARCHIVE ]</Link>
      </nav>

      {/* Hero Terminal Bound */}
      <header className="h-[70vh] md:h-[85vh] w-full relative flex items-center justify-center p-6 md:p-12 pt-28">
        
        <div ref={imgRef} className="w-full h-full opacity-0 border border-accent bg-background flex flex-col relative z-10 shadow-[0_0_40px_rgba(57,255,20,0.15)]">
            {/* Terminal Top Bar strictly matching slider/gallery to enable proper morph dimensions */}
            <div className="w-full h-8 border-b border-accent bg-background shrink-0 flex items-center px-4 relative z-20">
                 <div className="flex gap-2">
                   <div className="w-3 h-3 border border-accent rounded-full" />
                   <div className="w-3 h-3 border border-accent rounded-full" />
                   <div className="w-3 h-3 bg-accent border border-accent rounded-full" />
                 </div>
                 <div className="mx-auto text-[10px] md:text-xs uppercase tracking-widest text-accent">
                   bash — /work/{id} -- view-only
                 </div>
            </div>

            <div className="relative flex-1 w-full overflow-hidden">
               {/* Parallax Image Target */}
               <div 
                 ref={imageInnerRef}
                 className="absolute inset-[-10%] w-[120%] h-[120%] bg-cover bg-center opacity-40 mix-blend-screen"
                 style={{ backgroundImage: `url(${imgSrc})` }} 
               />
               
               <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
               <div className="absolute bottom-8 left-8 md:bottom-16 md:left-16 z-20 overflow-hidden text-white">
                  <h1 ref={titleRef} className="text-5xl md:text-8xl font-black uppercase leading-[0.85] tracking-tight translate-y-[100%] opacity-0">
                    <DecipherText text={`PROJECT_${id}`} delay={1.2} />
                  </h1>
                  <p className="text-xl md:text-2xl mt-4 opacity-80 font-mono">Quirky Web App / Sandbox</p>
               </div>
            </div>
        </div>
      </header>

      <section className="py-12 md:py-16 px-6 md:px-20 border-b border-accent/30">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <h2 className="text-3xl md:text-4xl font-bold uppercase mb-8 border-b border-accent pb-4 inline-block">The Spaghetti Code</h2>
            <p className="text-lg md:text-xl leading-relaxed opacity-90 max-w-2xl">
              <DecipherText text="This project explores the intersection of energy drinks and late-night StackOverflow scrolling, resulting in a strangely functional web experience." delay={0.2} />
            </p>
          </div>
          <div>
            <h4 className="text-xs text-accent uppercase tracking-widest mb-4 border-l border-accent pl-2">Role</h4>
            <ul className="text-md opacity-90 space-y-2">
              <li>{">"} Server Admin</li>
              <li>{">"} UI Architect</li>
              <li>{">"} Matrix Enjoyer</li>
            </ul>
          </div>
          <div>
             <h4 className="text-xs text-accent uppercase tracking-widest mb-4 border-l border-accent pl-2">Tech</h4>
             <ul className="text-md opacity-90 space-y-2">
               <li>{">"} Next.js</li>
               <li>{">"} Bash scripting</li>
               <li>{">"} GSAP flip.js</li>
             </ul>
             <h4 className="text-xs text-accent uppercase tracking-widest mb-4 border-l border-accent pl-2 mt-8">Year</h4>
             <p className="text-md opacity-90">{">"} 2026</p>
          </div>
        </div>
      </section>

      <footer className="py-12 md:py-16 text-background flex flex-col justify-center items-center px-6 md:px-20 relative z-20">
        <Link href="/" className="text-2xl md:text-4xl font-black uppercase tracking-widest text-accent glitch-link" data-text="[ TERMINATE_PROCESS ]">
          [ TERMINATE_PROCESS ]
        </Link>
      </footer>
    </main>
  );
}
