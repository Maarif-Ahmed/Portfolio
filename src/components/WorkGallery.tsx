'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { useAudio } from '@/context/AudioContext';
import { useMotionPreference } from '@/context/MotionContext';
import { useSudo } from '@/context/SudoContext';
import { useTransitionContext } from '@/context/TransitionContext';
import { getVisibleProjects } from '@/lib/projects';

/* ─── Floating image preview ─────────────────────────────── */

type FloatState = {
  x: number;
  y: number;
  visible: boolean;
  projectId: string;
  img: string;
};

function FloatingPreview({ state }: { state: FloatState }) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef<number>(0);
  const target = useRef({ x: state.x, y: state.y });
  const current = useRef({ x: state.x, y: state.y });

  // Sync target whenever state changes
  useEffect(() => {
    target.current = { x: state.x, y: state.y };
  }, [state.x, state.y]);

  // Smooth-follow loop
  useEffect(() => {
    const loop = () => {
      current.current.x += (target.current.x - current.current.x) * 0.1;
      current.current.y += (target.current.y - current.current.y) * 0.1;
      if (ref.current) {
        ref.current.style.transform = `translate(${current.current.x}px, ${current.current.y}px)`;
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="work-float-preview"
      style={{
        opacity: state.visible ? 1 : 0,
        pointerEvents: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9000,
        width: '22rem',
        aspectRatio: '4/5',
        borderRadius: '1rem',
        overflow: 'hidden',
        willChange: 'transform, opacity',
        transition: 'opacity 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
        background: 'rgba(16,21,28,0.04)',
      }}
    >
      {state.img && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={state.img}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      )}
      {/* inner vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(240,242,245,0.02) 0%, rgba(240,242,245,0.24) 100%)',
        }}
      />
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────── */

export default function WorkGallery() {
  const router = useRouter();
  const { playBlip } = useAudio();
  const { motionReduced } = useMotionPreference();
  const { sudoMode } = useSudo();
  const { startFlipTransition } = useTransitionContext();
  const sectionRef = useRef<HTMLElement>(null);
  const imgRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const projects = useMemo(() => getVisibleProjects(sudoMode), [sudoMode]);
  const [activeId, setActiveId] = useState<string>('');

  const [float, setFloat] = useState<FloatState>({
    x: 0,
    y: 0,
    visible: false,
    projectId: '',
    img: '',
  });

  /* Stagger-in animation on scroll */
  useEffect(() => {
    const root = sectionRef.current;
    if (!root || motionReduced) return;

    const rows = root.querySelectorAll<HTMLElement>('[data-work-row]');
    gsap.set(rows, { y: 28, opacity: 0 });

    const timeline = gsap.timeline({
      scrollTrigger: { trigger: root, start: 'top 82%' },
    });
    timeline.to(rows, {
      y: 0,
      opacity: 1,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.07,
    });

    return () => {
      timeline.scrollTrigger?.kill();
      timeline.kill();
      gsap.killTweensOf(rows);
      gsap.set(rows, { clearProps: 'all' });
    };
  }, [motionReduced]);

  /* Mouse move → update floating preview position */
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // offset so image appears to upper-right of cursor
    setFloat((prev) => ({
      ...prev,
      x: e.clientX + 24,
      y: e.clientY - 40,
    }));
  }, []);

  const handleMouseEnter = useCallback(
    (projectId: string, img: string) => {
      setActiveId(projectId);
      playBlip();
      setFloat((prev) => ({ ...prev, visible: true, projectId, img }));
    },
    [playBlip],
  );

  const handleMouseLeave = useCallback(() => {
    setActiveId('');
    setFloat((prev) => ({ ...prev, visible: false }));
  }, []);

  const openProject = useCallback(
    (projectId: string, imageUrl: string) => {
      const imageRef = imgRefs.current[projectId];
      if (imageRef) {
        startFlipTransition(imageRef, imageUrl, '0px');
      }
      router.push(`/work/${projectId}`);
    },
    [router, startFlipTransition],
  );

  return (
    <>
      <FloatingPreview state={float} />

      <section
        id="work"
        ref={sectionRef}
        onMouseMove={handleMouseMove}
        className="relative z-10 px-5 py-24 text-[#10151c] md:px-20 md:py-40"
      >
        <div className="mx-auto max-w-[1440px]">
          {/* ── Section header ── */}
          <div className="mb-16 border-t border-[#10151c]/10 pt-8 md:mb-20 md:pt-10">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.38em] text-[#10151c]/38 md:text-[11px]">
                  selected work
                </p>
                <h2
                  className="mt-4 max-w-[10ch] text-[clamp(2.8rem,7vw,5.6rem)] font-semibold leading-[0.9] tracking-[-0.075em] text-[#10151c]"
                  style={{ fontFamily: 'var(--font-display), sans-serif' }}
                >
                  Recovered work, held in the cold light
                  <span className="text-[#00F0FF]">.</span>
                </h2>
              </div>

              <p className="max-w-[22rem] text-sm leading-7 text-[#10151c]/50 md:text-right md:text-base md:leading-8">
                A strict index. Hover a row to surface the image. Open to enter
                the full project space.
              </p>
            </div>
          </div>

          {/* ── Project index list ── */}
          <ul className="border-t border-[#10151c]/10">
            {projects.map((project, i) => {
              const isActive = activeId === project.id;

              return (
                <li
                  key={project.id}
                  data-work-row
                  className="border-b border-[#10151c]/10"
                >
                  <button
                    type="button"
                    onMouseEnter={() =>
                      handleMouseEnter(project.id, project.img)
                    }
                    onMouseLeave={handleMouseLeave}
                    onFocus={() => setActiveId(project.id)}
                    onBlur={() => setActiveId('')}
                    onClick={() => openProject(project.id, project.img)}
                    className="group flex w-full cursor-pointer items-center justify-between gap-6 py-6 text-left md:py-8"
                    style={{ background: 'none', border: 'none', padding: undefined }}
                  >
                    {/* Left — title */}
                    <div className="flex items-baseline gap-5 md:gap-8">
                      <span
                        className="font-mono text-[10px] uppercase tracking-[0.26em] text-[#10151c]/32 md:text-[11px]"
                        aria-hidden="true"
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>

                      <h3
                        className="text-[clamp(2.4rem,5.5vw,5.8rem)] font-semibold uppercase leading-[0.88] tracking-[-0.07em] transition-colors duration-300"
                        style={{
                          fontFamily: 'var(--font-display), sans-serif',
                          color: isActive
                            ? 'var(--foreground)'
                            : 'rgba(16,21,28,0.48)',
                        }}
                      >
                        {project.title}
                      </h3>
                    </div>

                    {/* Right — meta */}
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-[#10151c]/40 md:text-[11px]">
                        {project.year}
                      </span>
                      <span className="max-w-[9rem] text-right font-mono text-[10px] uppercase tracking-[0.22em] text-[#10151c]/30 md:text-[11px]">
                        {project.category}
                      </span>
                      {/* Arrow */}
                      <span
                        className="mt-1 font-mono text-[10px] text-[#10151c]/0 transition-colors duration-300 group-hover:text-[#00F0FF]"
                        aria-hidden="true"
                      >
                        →
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}
