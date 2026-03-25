'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useRouter } from 'next/navigation';
import { useTransitionContext } from '@/context/TransitionContext';
import { useAudio } from '@/context/AudioContext';
import Magnetic from './Magnetic';

gsap.registerPlugin(ScrollTrigger);

const CODE_SNIPPETS: Record<string, string[]> = {
  '1': [
    'import { Terminal } from "./core";',
    'const shell = new Terminal({',
    '  theme: "hacker",',
    '  fontSize: 14,',
    '  cursorBlink: true,',
    '});',
    '',
    'shell.on("input", (cmd) => {',
    '  const result = exec(cmd);',
    '  shell.write(result);',
    '});',
    '',
    'export const dashboard = {',
    '  cpu: getCpuUsage(),',
    '  mem: getMemUsage(),',
    '  net: getNetStats(),',
    '};',
  ],
  '2': [
    'interface Bug {',
    '  id: string;',
    '  severity: "low" | "high";',
    '  assignee: string;',
    '  glow: boolean;',
    '}',
    '',
    'const tracker = new BugTracker({',
    '  darkMode: true,',
    '  neonAccent: "#39ff14",',
    '});',
    '',
    'tracker.on("resolve", (bug) => {',
    '  confetti.launch();',
    '  notify(bug.assignee);',
    '});',
  ],
  '3': [
    'try {',
    '  const app = await build({',
    '    entry: "./src/index.ts",',
    '    target: "es2024",',
    '    minify: true,',
    '  });',
    '  deploy(app);',
    '} catch (e) {',
    '  console.error("debug_night");',
    '  debugger;',
    '  // 6 hours later...',
    '  fixIt(e);',
    '  celebrate();',
    '}',
  ],
  '4': [
    'const commits = await git.log({',
    '  maxCount: 1000,',
    '  format: "%H %s",',
    '});',
    '',
    'const graph = commits.map(c => ({',
    '  hash: c.hash.slice(0, 7),',
    '  message: c.message,',
    '  time: c.date,',
    '  branch: c.refs,',
    '}));',
    '',
    'render(<CommitGraph',
    '  data={graph}',
    '  animate={true}',
    '/>);',
  ],
};

const projects = [
  { id: '1', title: 'Terminal Vibe', desc: 'A CLI-based hacker dashboard simulator.', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop' },
  { id: '2', title: 'Neon Tracker', desc: 'A dark-mode bug tracker that glows.', img: 'https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?q=80&w=2574&auto=format&fit=crop' },
  { id: '3', title: 'Syntax Error', desc: 'A portfolio showcasing my longest debugging sessions.', img: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2670&auto=format&fit=crop' },
  { id: '4', title: 'Git Pushed', desc: 'A visual graph of my commit history.', img: 'https://images.unsplash.com/photo-1470071131384-001b85755b36?q=80&w=2670&auto=format&fit=crop' },
];

export default function WorkGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const desktopImagesRef = useRef<(HTMLDivElement | null)[]>([]);
  const mobileImagesRef = useRef<(HTMLDivElement | null)[]>([]);
  const numbersRef = useRef<(HTMLDivElement | null)[]>([]);

  const router = useRouter();
  const { startFlipTransition, triggerLoader } = useTransitionContext();
  const { playBlip } = useAudio();

  const handleProjectClick = (index: number, project: typeof projects[0], source: 'mobile' | 'desktop') => {
    playBlip();
    const el = source === 'mobile' ? mobileImagesRef.current[index] : desktopImagesRef.current[index];
    const targetPath = `/work/${project.id}`;

    triggerLoader(targetPath, () => {
      if (el) {
        startFlipTransition(el, project.img, '0px');
      }
      router.push(targetPath);
    });
  };

  const handleMouseEnter = (index: number) => {
    const el = desktopImagesRef.current[index];
    if (el) {
      gsap.to(el, {
        filter: 'contrast(120%) brightness(120%) drop-shadow(2px 0px 0px #f00) drop-shadow(-2px 0px 0px #0ff)',
        duration: 0.1,
        repeat: 3,
        yoyo: true,
        ease: 'power2.inOut',
      });
    }
  };

  const handleMouseLeave = (index: number) => {
    const el = desktopImagesRef.current[index];
    if (el) {
      gsap.to(el, {
        filter: 'contrast(100%) brightness(100%) drop-shadow(0px 0px 0px transparent)',
        duration: 0.3,
      });
    }
  };

  useEffect(() => {
    let mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      const container = containerRef.current;
      const track = trackRef.current;
      if (!container || !track) return;

      let getScrollAmount = () => track.scrollWidth - window.innerWidth;

      const horizontalTween = gsap.to(track, {
        x: () => -getScrollAmount(),
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          pin: true,
          pinSpacing: true,
          scrub: 1,
          end: () => '+=' + getScrollAmount(),
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            numbersRef.current.forEach((num) => {
              if (num) {
                gsap.set(num, { x: self.progress * 100 - 50 });
              }
            });
          },
        },
      });

      return () => {
        horizontalTween.kill();
        horizontalTween.scrollTrigger?.kill();
      };
    });

    const handleLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', handleLoad);
    const timer = setTimeout(() => ScrollTrigger.refresh(), 500);

    return () => {
      mm.revert();
      window.removeEventListener('load', handleLoad);
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <section className="lg:hidden w-full bg-background px-4 py-12 sm:py-16 flex flex-col items-center">
        <div className="flex w-[90vw] max-w-2xl flex-col gap-16">
          {projects.map((project, index) => (
            <article
              key={`mobile-${project.id}`}
              className="bg-black border border-accent/40 shadow-[0_0_15px_rgba(224,224,224,0.05)]"
            >
              <div className="w-full h-7 border-b border-accent/40 bg-background flex items-center px-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 border border-accent/40 rounded-full" />
                  <div className="w-2.5 h-2.5 border border-accent/40 rounded-full" />
                  <div className="w-2.5 h-2.5 bg-accent border border-accent rounded-full" />
                </div>
                <div className="mx-auto text-[8px] uppercase tracking-widest text-accent/70">bash - /work/{project.id}</div>
              </div>

              <div
                ref={(el) => {
                  mobileImagesRef.current[index] = el;
                }}
                className="relative aspect-video w-full bg-cover bg-center opacity-45"
                style={{ backgroundImage: `url(${project.img})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="text-[10px] tracking-widest uppercase text-accent/70 block mb-1">{'>'} SYS_ID: 0{project.id}</span>
                  <h3 className="text-2xl font-black uppercase text-foreground leading-tight">{project.title}</h3>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <p className="text-sm opacity-80 mb-5 leading-relaxed">{project.desc}</p>
                <button
                  onClick={() => handleProjectClick(index, project, 'mobile')}
                  className="w-full text-xs font-bold uppercase tracking-widest border border-accent px-4 py-3 hover:bg-accent hover:text-black transition-all"
                >
                  [ OPEN_PROJECT ]
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Desktop horizontal scroll */}
      <section
        ref={containerRef}
        className="hidden lg:flex h-screen w-full bg-background relative items-center overflow-hidden"
      >
        <div ref={trackRef} className="flex h-full items-center gap-16 pl-[10vw] pr-[10vw]" style={{ width: 'max-content' }}>
          {projects.map((project, index) => (
            <div
              key={`desktop-${project.id}`}
              className="w-[45vw] h-[65vh] flex-shrink-0 bg-black flex flex-col relative overflow-hidden group border border-accent/40 hover:border-accent opacity-90 hover:opacity-100 transition-all shadow-[0_0_15px_rgba(224,224,224,0.05)] hover:shadow-[0_0_30px_rgba(224,224,224,0.1)]"
              data-cursor="EXECUTE ()"
            >
              <div
                ref={(el) => {
                  numbersRef.current[index] = el;
                }}
                className="absolute -bottom-6 -right-6 md:-bottom-10 md:-right-10 text-[25vw] md:text-[20vw] font-black text-accent/5 select-none pointer-events-none z-0"
              >
                0{index + 1}
              </div>

              <div className="w-full h-7 border-b border-accent/40 group-hover:border-accent bg-background shrink-0 flex items-center px-3 relative z-20 transition-colors">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 border border-accent/40 rounded-full group-hover:bg-accent group-hover:border-accent transition-colors" />
                  <div className="w-2.5 h-2.5 border border-accent/40 rounded-full group-hover:border-accent transition-colors" />
                  <div className="w-2.5 h-2.5 bg-accent border border-accent rounded-full" />
                </div>
                <div className="mx-auto text-[8px] md:text-[10px] uppercase tracking-widest text-accent/50 group-hover:text-accent/80 transition-colors">
                  bash - /work/{project.id}
                </div>
              </div>

              <div
                ref={(el) => {
                  desktopImagesRef.current[index] = el;
                }}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={() => handleMouseLeave(index)}
                className="absolute inset-0 top-7 w-full h-[calc(100%-1.75rem)] bg-cover bg-center opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none"
                style={{ backgroundImage: `url(${project.img})` }}
              />

              <div className="absolute inset-0 top-7 w-full h-[calc(100%-1.75rem)] overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-[15]">
                <div className="code-scroll-overlay p-4 text-[10px] leading-relaxed" style={{ color: 'rgba(224, 224, 224, 0.25)' }}>
                  {[...Array(3)].map((_, rep) => (
                    <div key={rep}>
                      {(CODE_SNIPPETS[project.id] || []).map((line, li) => (
                        <div key={`${rep}-${li}`} className="whitespace-pre font-mono">
                          {line || '\u00A0'}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 p-6 md:p-10 h-full flex flex-col justify-end pointer-events-none">
                <span className="text-[10px] md:text-xs tracking-widest uppercase mb-2 block text-accent/60 group-hover:text-accent transition-colors">
                  {'>'} SYS_ID: 0{project.id}
                </span>
                <h3 className="text-3xl md:text-5xl font-black leading-none mb-2 uppercase text-foreground">{project.title}</h3>
                <p className="text-sm md:text-base max-w-md opacity-50 group-hover:opacity-80 transition-opacity">{project.desc}</p>

                <div className="mt-6 pointer-events-auto">
                  <Magnetic>
                    <button
                      onClick={() => handleProjectClick(index, project, 'desktop')}
                      onMouseEnter={playBlip}
                      className="text-[10px] md:text-xs font-bold uppercase tracking-widest border border-accent px-4 py-1.5 hover:bg-accent hover:text-black transition-all cursor-pointer relative z-20"
                    >
                      [ MORE ]
                    </button>
                  </Magnetic>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

