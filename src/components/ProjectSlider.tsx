'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRouter } from 'next/navigation';
import { useTransitionContext } from '@/context/TransitionContext';

gsap.registerPlugin(ScrollTrigger);

const projects = [
  { id: '1', title: 'Terminal Vibe', color: 'rgba(0,0,0,1)', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop' },
  { id: '2', title: 'Neon Tracker', color: 'rgba(0,20,0,1)', img: 'https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?q=80&w=2574&auto=format&fit=crop' },
  { id: '3', title: 'Syntax Error', color: 'rgba(20,0,0,1)', img: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2670&auto=format&fit=crop' },
  { id: '4', title: 'Git Pushed', color: 'rgba(0,0,20,1)', img: 'https://images.unsplash.com/photo-1470071131384-001b85755b36?q=80&w=2670&auto=format&fit=crop' }
];

export default function ProjectSlider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<(HTMLDivElement | null)[]>([]);
  const textsRef = useRef<(HTMLDivElement | null)[]>([]);
  const bgLayerRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();
  const { startFlipTransition, triggerLoader } = useTransitionContext();

  const handleProjectClick = (e: React.MouseEvent, index: number, project: typeof projects[0]) => {
    e.preventDefault();
    const el = imagesRef.current[index];
    const targetPath = `/work/${project.id}`;
    
    triggerLoader(targetPath, () => {
      if (el) {
        startFlipTransition(el, project.img, '0px');
      }
      router.push(targetPath);
    });
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Tight scroll: 0.5 viewport per project transition
      const scrollPerProject = window.innerHeight * 0.5;
      const totalScrollHeight = projects.length * scrollPerProject;
      
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: `+=${totalScrollHeight}`,
        pin: true,
        pinSpacing: true,
        scrub: true,
      });

      projects.forEach((_, i) => {
        const triggerStart = `+=${i * scrollPerProject}`;
        const triggerEnd = `+=${(i + 1) * scrollPerProject}`;

        gsap.to(bgLayerRef.current, {
          backgroundColor: projects[i].color,
          ease: "none",
          scrollTrigger: { trigger: containerRef.current, start: triggerStart, end: triggerEnd, scrub: true }
        });

        if (imagesRef.current[i]) {
          gsap.fromTo(imagesRef.current[i], 
            { scale: 0.8, opacity: 0, zIndex: 0 },
            { scale: 1, opacity: 1, zIndex: 10, ease: "power2.out",
              scrollTrigger: { trigger: containerRef.current, start: `+=${i * scrollPerProject - (scrollPerProject / 2)}`, end: triggerStart, scrub: true }
            }
          );
          
          if (i < projects.length - 1) {
            gsap.to(imagesRef.current[i], {
              scale: 1.2, opacity: 0, zIndex: 0, ease: "power2.in",
              scrollTrigger: { trigger: containerRef.current, start: triggerStart, end: triggerEnd, scrub: true }
            });
          }
        }

        if (textsRef.current[i]) {
           gsap.fromTo(textsRef.current[i],
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, ease: 'power2.out', scrollTrigger: { trigger: containerRef.current, start: `+=${i * scrollPerProject - (scrollPerProject / 3)}`, end: triggerStart, scrub: true } }
           );
           if (i < projects.length - 1) {
             gsap.to(textsRef.current[i], { y: -50, opacity: 0, ease: 'power2.in', scrollTrigger: { trigger: containerRef.current, start: triggerStart, end: triggerEnd, scrub: true } });
           }
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative h-screen w-full overflow-hidden flex items-center justify-center will-change-transform">
      <div ref={bgLayerRef} className="absolute inset-0 z-0 bg-background" />
      
      <div className="relative z-10 w-[85vw] h-[55vh] md:w-[55vw] md:h-[65vh] flex items-center justify-center" data-cursor="INITIALIZE ()">
        {projects.map((project, i) => (
          <div 
            key={project.id}
            onClick={(e) => handleProjectClick(e, i, project)}
            ref={(el) => { imagesRef.current[i] = el; }}
            className="absolute inset-0 w-full h-full opacity-0 will-change-transform border border-accent bg-background shadow-[0_0_20px_rgba(57,255,20,0.15)] flex flex-col cursor-pointer"
          >
            <div className="w-full h-7 border-b border-accent bg-background shrink-0 flex items-center px-3 relative z-20">
               <div className="flex gap-1.5">
                 <div className="w-2.5 h-2.5 border border-accent rounded-full" />
                 <div className="w-2.5 h-2.5 border border-accent rounded-full" />
                 <div className="w-2.5 h-2.5 bg-accent border border-accent rounded-full" />
               </div>
               <div className="mx-auto text-[8px] md:text-[10px] uppercase tracking-widest text-accent/70">
                 root@maarif:~/{project.title.toLowerCase().replace(' ', '_')}
               </div>
            </div>
            <div className="flex-1 w-full bg-cover bg-center mix-blend-screen opacity-20 hover:opacity-50 transition-opacity" style={{ backgroundImage: `url(${project.img})` }} />
          </div>
        ))}

        <div className="absolute inset-0 flex items-end p-6 md:p-10 pointer-events-none z-20">
          {projects.map((project, i) => (
             <div key={project.id} ref={(el) => { textsRef.current[i] = el; }} className="absolute bottom-6 left-6 md:bottom-10 md:left-10 opacity-0">
                <span className="text-accent text-xs mb-1 block">{'>'} EXECUTING:</span>
                <h2 className="text-3xl md:text-5xl font-black uppercase text-white drop-shadow-2xl">{project.title}</h2>
             </div>
          ))}
        </div>
      </div>
    </section>
  );
}
