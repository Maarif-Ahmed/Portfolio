'use client';

import { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Flip from 'gsap/Flip';
import CurrentBackdrop from '@/components/CurrentBackdrop';
import DecipherText from '@/components/DecipherText';
import { useAudio } from '@/context/AudioContext';
import { useSudo } from '@/context/SudoContext';
import { useTransitionContext } from '@/context/TransitionContext';
import { getVisibleProjects } from '@/lib/projects';

gsap.registerPlugin(ScrollTrigger, Flip);

const DOSSIER_ANCHORS = [
  { id: 'overview', label: 'overview' },
  { id: 'evidence', label: 'evidence' },
  { id: 'build-log', label: 'build_log' },
  { id: 'signal-log', label: 'signal_log' },
  { id: 'outcome', label: 'outcome' },
] as const;

export default function CaseStudy() {
  const params = useParams();
  const caseId = params.id as string;
  const { sudoMode } = useSudo();
  const { playBlip } = useAudio();
  const visibleCaseFiles = useMemo(() => getVisibleProjects(sudoMode), [sudoMode]);
  const caseFile = visibleCaseFiles.find((archiveEntry) => archiveEntry.id === caseId);
  const { transitionState, completeFlipTransition } = useTransitionContext();
  const { isActive, rect } = transitionState;

  const heroMediaRef = useRef<HTMLDivElement>(null);
  const imageInnerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const introRef = useRef<HTMLParagraphElement>(null);
  const heroCalloutRef = useRef<HTMLDivElement>(null);
  const dossierRailRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!caseFile) {
      return;
    }

      const animationContext = gsap.context(() => {
        const bootCasefile = () => {
          gsap.fromTo(
            [titleRef.current, introRef.current, heroCalloutRef.current, '.hero-stat'],
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.78,
            ease: 'power3.out',
            stagger: 0.06,
          }
        );

        if (dossierRailRef.current) {
          gsap.fromTo(
            dossierRailRef.current,
            { x: -18, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.72,
              ease: 'power3.out',
              delay: 0.1,
            }
          );
        }

        gsap.utils.toArray<HTMLElement>('.case-strip').forEach((caseStrip) => {
          gsap.fromTo(
            caseStrip,
            { y: 36, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.78,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: caseStrip,
                start: 'top 84%',
              },
            }
          );
        });

        gsap.utils.toArray<HTMLElement>('.signal-row').forEach((signalRow) => {
          gsap.fromTo(
            signalRow,
            { x: -16, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.52,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: signalRow,
                start: 'top 88%',
              },
            }
          );
        });

        if (imageInnerRef.current && heroMediaRef.current) {
          gsap.set(imageInnerRef.current, {
            filter: 'grayscale(1) saturate(0.52) contrast(0.82) brightness(0.7)',
            opacity: 0.34,
          });

          gsap.to(imageInnerRef.current, {
            yPercent: 8,
            filter: 'grayscale(0.08) saturate(1) contrast(1.04) brightness(0.96)',
            opacity: 0.58,
            ease: 'none',
            scrollTrigger: {
              trigger: heroMediaRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          });
        }
      };

      if (isActive && rect) {
        const flipClone = document.getElementById('flip-clone');

        if (flipClone && heroMediaRef.current) {
          gsap.set(heroMediaRef.current, { opacity: 1, visibility: 'visible' });
          const flipState = Flip.getState(flipClone, { props: 'borderRadius,opacity' });
          gsap.set(flipClone, { display: 'none' });

          Flip.from(flipState, {
            targets: heroMediaRef.current,
            duration: 1.05,
            ease: 'expo.inOut',
            absolute: true,
            onComplete: () => {
              completeFlipTransition();
              bootCasefile();
            },
          });
        } else {
          gsap.set(heroMediaRef.current, { opacity: 1 });
          completeFlipTransition();
          bootCasefile();
        }
      } else {
        gsap.set(heroMediaRef.current, { opacity: 1 });
        bootCasefile();
      }
    });

    return () => animationContext.revert();
  }, [caseFile, completeFlipTransition, isActive, rect]);

  if (!caseFile) {
    return (
      <main className="relative isolate flex min-h-screen items-center justify-center overflow-x-hidden bg-black px-6 text-white md:px-20">
        <CurrentBackdrop variant="page" />
        <div className="flow-card relative z-10 max-w-2xl px-8 py-10 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/42 md:text-xs">casefile unavailable</p>
          <h1
            className="mt-6 text-[clamp(3rem,8vw,6rem)] font-black uppercase leading-[0.86] tracking-[-0.08em] text-white"
            style={{ fontFamily: 'var(--font-display), sans-serif' }}
          >
            ACCESS_DENIED<span className="text-white/82">.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-white/64 md:text-lg">
            This casefile is either hidden behind sudo mode or the requested address does not exist anymore.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] md:text-xs">
            <Link href="/" className="border border-white/14 px-4 py-3 text-white/72 transition-colors hover:border-[#00F0FF]/28 hover:text-[#00F0FF] focus-visible:border-[#00F0FF]/28 focus-visible:text-[#00F0FF]">
              return home
            </Link>
            <Link href="/about" className="border border-white/14 px-4 py-3 text-white/72 transition-colors hover:border-white/30 hover:text-white">
              open archive
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const cycleCaseFiles = visibleCaseFiles;
  const currentIndex = cycleCaseFiles.findIndex((archiveEntry) => archiveEntry.id === caseFile.id);
  const nextCaseFile = cycleCaseFiles[(currentIndex + 1) % cycleCaseFiles.length] ?? cycleCaseFiles[0];
  const headline = caseFile.title.toUpperCase();
  const outcomeNote = caseFile.buildNotes[caseFile.buildNotes.length - 1];
  const heroAnnotations = caseFile.annotations ?? [];
  const hoverAccentClass = caseFile.isSecret
    ? 'hover:text-[#FF00FF] focus-visible:text-[#FF00FF]'
    : 'hover:text-[#00F0FF] focus-visible:text-[#00F0FF]';
  const hoverAccentSoftClass = caseFile.isSecret
    ? 'hover:text-[#FF00FF]/76 focus-visible:text-[#FF00FF]/76'
    : 'hover:text-[#00F0FF]/76 focus-visible:text-[#00F0FF]/76';
  const hoverBorderClass = caseFile.isSecret
    ? 'hover:border-[#FF00FF]/28 focus-visible:border-[#FF00FF]/28'
    : 'hover:border-[#00F0FF]/28 focus-visible:border-[#00F0FF]/28';

  return (
    <main className="relative isolate min-h-screen overflow-x-hidden bg-black text-[#E0E0E0]">
      <CurrentBackdrop variant="page" />

      <div className="relative z-10">
        <nav className="pointer-events-none fixed top-0 z-50 flex w-full items-center justify-between px-5 py-6 text-white/88 md:px-20 md:py-8">
          <Link
            href="/"
            className={`pointer-events-auto font-bold text-2xl uppercase tracking-tighter glitch-link transition-colors ${hoverAccentClass}`}
            data-text="[ RETURN ]"
            onMouseEnter={playBlip}
          >
            [ RETURN ]
          </Link>
          <Link
            href="/about"
            className={`pointer-events-auto text-xs font-bold uppercase tracking-widest glitch-link transition-colors ${hoverAccentClass}`}
            data-text="[ ARCHIVE ]"
            onMouseEnter={playBlip}
          >
            [ ARCHIVE ]
          </Link>
        </nav>

        <header className="relative overflow-hidden px-5 pb-14 pt-24 md:px-20 md:pb-24 md:pt-32">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_25%_18%,rgba(224,224,224,0.08),transparent_26%),radial-gradient(circle_at_86%_14%,rgba(255,255,255,0.05),transparent_20%),linear-gradient(180deg,rgba(0,0,0,0.0)_0%,rgba(0,0,0,0.88)_100%)]" />

          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.84fr_1.16fr] lg:items-end lg:gap-10">
            <div className="relative z-10 lg:pb-10">
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.36em] text-white/42 md:text-xs">
                {caseFile.fileName} / {caseFile.manifest.mode}
              </p>
              <h1
                ref={titleRef}
                className="text-[clamp(2.8rem,12vw,5.2rem)] font-black uppercase leading-[0.86] tracking-[-0.08em] opacity-0 text-white md:text-[clamp(3.3rem,7vw,6.5rem)]"
                style={{ fontFamily: 'var(--font-display), sans-serif' }}
              >
                {headline}
                <span className="text-white/82">.</span>
              </h1>
              <p ref={introRef} className="mt-5 max-w-2xl text-[15px] leading-7 text-white/72 opacity-0 md:mt-6 md:text-xl md:leading-8">
                <DecipherText text={caseFile.subtitle} delay={0.18} />
              </p>

              <div ref={heroCalloutRef} className="flow-card mt-6 max-w-2xl px-5 py-5 opacity-0 md:mt-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/54">
                  signal briefing
                </p>
                <p className="mt-4 text-sm leading-7 text-white/68 md:text-base">{caseFile.desc}</p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3 md:mt-8">
                {caseFile.metrics.map((metricPatch) => (
                  <div key={metricPatch.label} className="hero-stat flow-card px-4 py-4 opacity-0">
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/54">
                      {metricPatch.label}
                    </p>
                    <p className="mt-3 text-lg font-black uppercase tracking-tight text-white md:text-xl">{metricPatch.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div ref={heroMediaRef} className="terminal-window flow-card overflow-hidden opacity-0">
              <div className="terminal-header justify-between px-4 py-3">
                <div className="flex items-center">
                  <span className="terminal-btn" />
                  <span className="terminal-btn" />
                  <span className="terminal-btn fill" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/48 md:text-xs">
                  dossier://work/{caseFile.id}
                </span>
              </div>

              <div className="relative min-h-[20rem] overflow-hidden md:min-h-[39rem]">
                <div
                  ref={imageInnerRef}
                  className="absolute inset-[-8%] bg-cover bg-center mix-blend-screen will-change-[transform,filter,opacity]"
                  style={{ backgroundImage: `url(${caseFile.img})` }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: caseFile.isSecret
                      ? 'radial-gradient(circle at top left, rgba(255,255,255,0.1), transparent 38%)'
                      : 'radial-gradient(circle at top left, rgba(255,255,255,0.08), transparent 38%)',
                  }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0.38)_44%,rgba(0,0,0,0.92)_100%)]" />
                <div className="absolute inset-x-8 top-8 flex items-start justify-between gap-6 font-mono text-[10px] uppercase tracking-[0.28em] text-white/48">
                  <div>
                    <p>{caseFile.manifest.client}</p>
                    <p className="mt-2">{caseFile.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/72">{caseFile.manifest.status}</p>
                    <p className="mt-2">{caseFile.manifest.duration}</p>
                  </div>
                </div>
                {heroAnnotations.length > 0 && (
                  <div className="pointer-events-none absolute inset-0 hidden md:block">
                    {heroAnnotations.map((annotation) => (
                      <div
                        key={annotation.label}
                        className="absolute"
                        style={{ left: `${annotation.x}%`, top: `${annotation.y}%` }}
                      >
                        <div className="relative">
                          <span className="absolute left-0 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/24 bg-black/88" />
                          <span className="absolute left-0 top-0 h-12 w-px -translate-x-1/2 bg-white/14" />
                          <div
                            className={`absolute top-2 w-40 border border-white/10 bg-black/62 px-3 py-3 font-mono text-[9px] uppercase tracking-[0.22em] text-white/42 backdrop-blur-sm ${
                              annotation.align === 'right' ? 'right-4 text-right' : 'left-4 text-left'
                            }`}
                          >
                            <p className="text-white/62">{annotation.label} / {annotation.title}</p>
                            <p className="mt-2 text-[8px] leading-5 tracking-[0.18em] text-white/68">{annotation.detail}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col gap-4 md:bottom-8 md:left-8 md:right-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/54">
                    evidence snapshot
                  </p>
                  <div className="grid gap-3 md:grid-cols-3">
                    {caseFile.evidence.slice(0, 3).map((evidenceCard) => (
                      <div key={evidenceCard.label} className="border border-white/10 bg-black/40 px-3 py-3 backdrop-blur-sm">
                        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">{evidenceCard.label}</p>
                        <p className="mt-2 text-sm font-bold uppercase tracking-[0.14em] text-white/92">{evidenceCard.title}</p>
                      </div>
                    ))}
                  </div>
                  {heroAnnotations.length > 0 && (
                    <div className="grid gap-2 border-t border-white/10 pt-3 md:hidden">
                      {heroAnnotations.map((annotation) => (
                        <div key={`mobile-${annotation.label}`} className="border border-white/8 bg-black/34 px-3 py-3">
                          <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/54">
                            {annotation.label} / {annotation.title}
                          </p>
                          <p className="mt-2 text-xs leading-5 text-white/68">{annotation.detail}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="px-5 pb-16 md:px-20 md:pb-24">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-12">
            <aside ref={dossierRailRef} className="case-strip flow-card self-start p-5 opacity-0 lg:sticky lg:top-24">
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/54">
                dossier manifest
              </p>

              <div className="mt-5 space-y-4 border-t border-white/8 pt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">
                <div>
                  <p className="text-white/34">client</p>
                  <p className="mt-2 text-white/82">{caseFile.manifest.client}</p>
                </div>
                <div>
                  <p className="text-white/34">duration</p>
                  <p className="mt-2 text-white/82">{caseFile.manifest.duration}</p>
                </div>
                <div>
                  <p className="text-white/34">status</p>
                  <p className="mt-2 text-white/82">{caseFile.manifest.status}</p>
                </div>
                <div>
                  <p className="text-white/34">mode</p>
                  <p className="mt-2 text-white/82">{caseFile.manifest.mode}</p>
                </div>
              </div>

              <div className="mt-6 border-t border-white/8 pt-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/54">
                  jump points
                </p>
                <div className="mt-4 space-y-2 font-mono text-[10px] uppercase tracking-[0.28em] text-white/62">
                  {DOSSIER_ANCHORS.map((anchorPoint) => (
                    <a
                      key={anchorPoint.id}
                      href={`#${anchorPoint.id}`}
                      className={`block border border-white/8 px-3 py-3 transition-colors ${hoverBorderClass} ${hoverAccentSoftClass}`}
                      onMouseEnter={playBlip}
                    >
                      [ {anchorPoint.label} ]
                    </a>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-white/8 pt-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/54">
                  role stack
                </p>
                <div className="mt-4 space-y-2 text-sm uppercase tracking-[0.16em] text-white/72">
                  {caseFile.role.map((rolePatch) => (
                    <p key={rolePatch}>{rolePatch}</p>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-white/8 pt-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/54">
                  stack
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {caseFile.tech.map((techPatch) => (
                    <span
                      key={techPatch}
                      className="flow-chip font-mono text-[10px] uppercase tracking-[0.2em] text-white/68"
                    >
                      {techPatch}
                    </span>
                  ))}
                </div>
              </div>
            </aside>

            <div className="space-y-8 lg:space-y-12">
              <section id="overview" className="case-strip border-y border-white/10 py-10 opacity-0 md:py-12">
                <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/48">
                      overview
                    </p>
                    <h2
                      className="mt-4 text-[clamp(2rem,10vw,3.6rem)] font-black uppercase leading-[0.9] tracking-[-0.07em] text-white md:mt-5 md:text-[clamp(2.4rem,4.8vw,4.75rem)]"
                      style={{ fontFamily: 'var(--font-display), sans-serif' }}
                    >
                      Why this casefile
                      <br />
                      matters<span className="text-white/82">.</span>
                    </h2>
                  </div>

                  <div className="space-y-5 text-[15px] leading-7 text-white/76 md:space-y-6 md:text-lg md:leading-8">
                    <blockquote className="border-l-2 border-white/18 pl-5 text-xl leading-8 text-white/86 md:text-2xl md:leading-10">
                      {caseFile.desc}
                    </blockquote>
                    {caseFile.overview.map((overviewLine) => (
                      <p key={overviewLine}>{overviewLine}</p>
                    ))}
                  </div>
                </div>
              </section>

              <section id="evidence" className="case-strip opacity-0">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/48">
                      evidence
                    </p>
                    <h2
                      className="mt-4 text-[clamp(1.9rem,9vw,3.3rem)] font-black uppercase leading-[0.92] tracking-[-0.06em] text-white md:text-[clamp(2.2rem,4.2vw,4.2rem)]"
                      style={{ fontFamily: 'var(--font-display), sans-serif' }}
                    >
                      What gives the work
                      <br />
                      its weight<span className="text-white/82">.</span>
                    </h2>
                  </div>
                  <p className="max-w-2xl text-sm leading-7 text-white/58 md:text-base">
                    The casefile reads better when the proof is concrete, so these panels capture the system decisions that actually shaped the final result.
                  </p>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {caseFile.evidence.map((evidenceCard) => (
                    <article key={evidenceCard.label} className="flow-card p-6">
                      <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/54">
                        {evidenceCard.label}
                      </p>
                      <h3 className="mt-4 text-2xl font-black uppercase leading-tight tracking-[-0.04em] text-white">
                        {evidenceCard.title}
                      </h3>
                      <p className="mt-4 text-sm leading-7 text-white/66 md:text-base">
                        {evidenceCard.detail}
                      </p>
                    </article>
                  ))}
                </div>
              </section>

              <section id="build-log" className="case-strip opacity-0">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/48">
                      build log
                    </p>
                    <h2
                      className="mt-4 text-[clamp(1.9rem,9vw,3.3rem)] font-black uppercase leading-[0.92] tracking-[-0.06em] text-white md:text-[clamp(2.2rem,4.2vw,4.2rem)]"
                      style={{ fontFamily: 'var(--font-display), sans-serif' }}
                    >
                      Decisions under
                      <br />
                      pressure<span className="text-white/82">.</span>
                    </h2>
                  </div>
                  <p className="max-w-2xl text-sm leading-7 text-white/58 md:text-base">
                    This is the part most portfolios flatten. Here, the important tradeoffs stay visible so the reader understands both the friction and the craft.
                  </p>
                </div>

                <div className="mt-8 grid gap-5 xl:grid-cols-3">
                  {caseFile.buildNotes.map((buildNote) => (
                    <article key={buildNote.title} className="flow-card p-6">
                      <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/54">
                        {buildNote.title}
                      </p>
                      <div className="mt-5 space-y-4 text-sm leading-7 text-white/70 md:text-base">
                        {buildNote.body.map((noteLine) => (
                          <p key={noteLine}>{noteLine}</p>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section id="signal-log" className="case-strip opacity-0">
                <article className="terminal-window overflow-hidden shadow-[0_0_26px_rgba(255,255,255,0.04)]">
                  <div className="terminal-header justify-between px-4 py-3">
                    <div className="flex items-center">
                      <span className="terminal-btn" />
                      <span className="terminal-btn" />
                      <span className="terminal-btn fill" />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/48 md:text-xs">
                      signal_log.sh
                    </span>
                  </div>
                  <div className="px-4 py-5 md:px-6 md:py-6">
                    <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/48">
                          command trace
                        </p>
                        <h2
                          className="mt-4 text-[clamp(1.8rem,8vw,3rem)] font-black uppercase leading-[0.94] tracking-[-0.05em] text-white md:text-[clamp(2rem,4vw,3.75rem)]"
                          style={{ fontFamily: 'var(--font-display), sans-serif' }}
                        >
                          The readable trail
                          <span className="text-white/82">.</span>
                        </h2>
                      </div>
                      <p className="max-w-2xl text-sm leading-7 text-white/56 md:text-base">
                        A compact command log makes the project feel like a real operational record instead of a neatly packaged afterthought.
                      </p>
                    </div>

                    <div className="space-y-4 font-mono text-[11px] md:text-sm">
                      {caseFile.signalLog.map((signalEntry, entryIndex) => (
                        <div key={`${signalEntry.command}-${entryIndex}`} className="signal-row border border-white/8 bg-black/42 px-4 py-4">
                          <p className="text-white/88">&gt; {signalEntry.command}</p>
                          <p className="mt-3 text-white/56">{signalEntry.response}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              </section>

              <section id="outcome" className="case-strip border-t border-white/10 pt-10 opacity-0 md:pt-12">
                <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/48">
                      outcome
                    </p>
                    <h2
                      className="mt-4 text-[clamp(1.9rem,9vw,3.4rem)] font-black uppercase leading-[0.92] tracking-[-0.06em] text-white md:text-[clamp(2.2rem,4.2vw,4.25rem)]"
                      style={{ fontFamily: 'var(--font-display), sans-serif' }}
                    >
                      Where the project
                      <br />
                      finally lands<span className="text-white/82">.</span>
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <div className="flow-card p-6">
                      <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/54">
                        release note
                      </p>
                      <p className="mt-4 text-base leading-8 text-white/74 md:text-lg">
                        {outcomeNote?.body[0] ?? caseFile.overview[caseFile.overview.length - 1]}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {caseFile.metrics.map((metricPatch) => (
                        <div key={`outcome-${metricPatch.label}`} className="flow-card px-4 py-4">
                          <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-white/42">{metricPatch.label}</p>
                          <p className="mt-3 text-lg font-black uppercase tracking-tight text-white">{metricPatch.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-[0.28em] md:text-xs">
                      <Link
                        href={`/work/${nextCaseFile.id}`}
                        className={`flow-chip text-white transition-colors ${hoverBorderClass} ${hoverAccentClass}`}
                        onMouseEnter={playBlip}
                      >
                        next case: {nextCaseFile.fileName}
                      </Link>
                      <Link
                        href="/"
                        className="flow-chip text-white/68 transition-colors hover:border-white/28 hover:text-white"
                        onMouseEnter={playBlip}
                      >
                        return home
                      </Link>
                      <Link
                        href="/about"
                        className="flow-chip text-white/68 transition-colors hover:border-white/28 hover:text-white"
                        onMouseEnter={playBlip}
                      >
                        archive
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
