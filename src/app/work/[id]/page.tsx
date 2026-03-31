'use client';

import { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import gsap from 'gsap';
import Flip from 'gsap/Flip';
import DepthScanSurface from '@/components/DepthScanSurface';
import { useAudio } from '@/context/AudioContext';
import { useSudo } from '@/context/SudoContext';
import { useTransitionContext } from '@/context/TransitionContext';
import { getVisibleProjects } from '@/lib/projects';

gsap.registerPlugin(Flip);

const GALLERY_POSITIONS = ['center', 'top', 'bottom'] as const;

/* ─── Shared "agency split" helper ───────────────────────
   Left label column + right content column, consistent
   across all sections.
───────────────────────────────────────────────────────── */

export default function CaseStudy() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;
  const { sudoMode } = useSudo();
  const { playBlip } = useAudio();
  const visibleProjects = useMemo(() => getVisibleProjects(sudoMode), [sudoMode]);
  const caseFile = visibleProjects.find((p) => p.id === caseId);
  const currentIndex = visibleProjects.findIndex((p) => p.id === caseId);
  const previousProject =
    currentIndex > 0 ? visibleProjects[currentIndex - 1] : visibleProjects[visibleProjects.length - 1];
  const nextProject =
    currentIndex >= 0 ? visibleProjects[(currentIndex + 1) % visibleProjects.length] : visibleProjects[0];
  const heroMediaRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const { transitionState, completeFlipTransition } = useTransitionContext();

  /* ── Keyboard navigation ── */
  useEffect(() => {
    if (!caseFile) return;
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') router.push('/#work');
      if (e.key === 'ArrowLeft') router.push(`/work/${previousProject.id}`);
      if (e.key === 'ArrowRight') router.push(`/work/${nextProject.id}`);
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [caseFile, nextProject.id, previousProject.id, router]);

  /* ── GSAP entrance + Flip transition ── */
  useEffect(() => {
    if (!caseFile || !heroMediaRef.current || !introRef.current) return;
    const introNodes = introRef.current.querySelectorAll<HTMLElement>('[data-case-reveal]');

    const runEntry = () => {
      gsap.fromTo(
        introNodes,
        { y: 24, opacity: 0, filter: 'blur(8px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.76, stagger: 0.06, ease: 'power3.out' },
      );
    };

    if (transitionState.isActive && transitionState.rect) {
      const flipClone = document.getElementById('flip-clone');
      if (flipClone) {
        gsap.set(heroMediaRef.current, { opacity: 1, visibility: 'visible' });
        const flipState = Flip.getState(flipClone, { props: 'borderRadius,opacity' });
        gsap.set(flipClone, { display: 'none' });
        Flip.from(flipState, {
          targets: heroMediaRef.current,
          duration: 0.95,
          ease: 'expo.inOut',
          absolute: true,
          onComplete: () => {
            completeFlipTransition();
            runEntry();
          },
        });
      } else {
        // No flip clone found — show hero immediately and animate intro
        gsap.set(heroMediaRef.current, { opacity: 0, visibility: 'visible' });
        gsap.to(heroMediaRef.current, { opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.1 });
        completeFlipTransition();
        runEntry();
      }
    } else {
      // Direct navigation — reveal hero media with a fade
      gsap.set(heroMediaRef.current, { opacity: 0, visibility: 'visible' });
      gsap.to(heroMediaRef.current, { opacity: 1, duration: 0.7, ease: 'power2.out', delay: 0.15 });
      runEntry();
    }

    return () => gsap.killTweensOf(introNodes);
  }, [caseFile, completeFlipTransition, transitionState]);

  /* ─── 404 State ─────────────────────────────────────── */
  if (!caseFile) {
    return (
      <main className="min-h-screen px-5 py-28 text-[#10151c] md:px-20">
        <div className="mx-auto max-w-[1440px]">
          <div className="border-t border-[#10151c]/10 pt-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-[#10151c]/38 md:text-[11px]">
              project unavailable
            </p>
            <h1
              className="mt-6 max-w-[8ch] text-[clamp(3rem,9vw,7rem)] font-semibold uppercase leading-[0.88] tracking-[-0.07em] text-[#10151c]"
              style={{ fontFamily: 'var(--font-display), sans-serif' }}
            >
              Access denied<span className="text-[#00F0FF]">.</span>
            </h1>
            <p className="mt-6 max-w-[52ch] text-base font-light leading-8 text-[#10151c]/54">
              This project is either hidden behind sudo mode or the requested route no longer exists.
            </p>
            <div className="mt-10 flex flex-wrap gap-6 border-t border-[#10151c]/10 pt-6 font-mono text-[10px] uppercase tracking-[0.28em] text-[#10151c]/48 md:text-[11px]">
              <Link href="/" className="transition-colors hover:text-[#00F0FF]">
                return home
              </Link>
              <span className="h-px w-6 self-center bg-[#10151c]/10" />
              <Link href="/#work" className="transition-colors hover:text-[#00F0FF]">
                view work
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ─── Case Study Page ────────────────────────────────── */
  return (
    <main className="relative isolate min-h-screen overflow-x-hidden text-[#10151c]">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.82),transparent_22%),linear-gradient(180deg,rgba(248,251,252,0.88)_0%,rgba(235,240,244,0)_18%,rgba(208,216,223,0.42)_100%)]" />

      {/* ── Top nav bar ── */}
      <header className="fixed inset-x-0 top-0 z-50 px-5 py-5 md:px-20 md:py-7">
        <div className="flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.28em] text-[#10151c]/52 md:text-[11px]">
          <Link href="/#work" onMouseEnter={playBlip} className="transition-colors hover:text-[#00F0FF]">
            ← close
          </Link>
          <div className="flex items-center gap-5 md:gap-7">
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.24em] text-[#10151c]/28 md:block md:text-[11px]">
              {caseFile.fileName}
            </span>
            <span className="h-px w-6 hidden bg-[#10151c]/10 md:block" />
            <button
              type="button"
              onMouseEnter={playBlip}
              onClick={() => router.push(`/work/${previousProject.id}`)}
              className="transition-colors hover:text-[#00F0FF]"
            >
              prev
            </button>
            <button
              type="button"
              onMouseEnter={playBlip}
              onClick={() => router.push(`/work/${nextProject.id}`)}
              className="transition-colors hover:text-[#00F0FF]"
            >
              next
            </button>
          </div>
        </div>
      </header>

      {/* ── Page body ── */}
      <div className="relative z-10 px-5 pb-24 pt-24 md:px-20 md:pb-32 md:pt-28">
        <div className="mx-auto max-w-[1440px]">

          {/* ══════════════════════════════════════════════
              §0  HERO — title + image
          ══════════════════════════════════════════════ */}
          <div ref={introRef} className="cs-hero">
            {/* Left: title block */}
            <div className="cs-hero__title-block">
              <p
                data-case-reveal
                className="font-mono text-[10px] uppercase tracking-[0.38em] text-[#10151c]/36 md:text-[11px]"
              >
                {caseFile.year} — {caseFile.category}
              </p>

              <h1
                data-case-reveal
                className="cs-page-title"
                style={{ fontFamily: 'var(--font-display), sans-serif' }}
              >
                {caseFile.title}<span className="text-[#00F0FF]">.</span>
              </h1>

              <p
                data-case-reveal
                className="cs-hero__subtitle"
              >
                {caseFile.desc}
              </p>

              {/* Meta: stack + role */}
              <div data-case-reveal className="cs-meta-strip">
                <div className="cs-meta-strip__item">
                  <p className="cs-label">Stack</p>
                  <p className="cs-meta-strip__value">
                    {caseFile.tech.join(' / ')}
                  </p>
                </div>
                <div className="cs-meta-strip__item">
                  <p className="cs-label">Role</p>
                  <p className="cs-meta-strip__value">
                    {caseFile.role.join(' / ')}
                  </p>
                </div>
                <div className="cs-meta-strip__item">
                  <p className="cs-label">Status</p>
                  <p className="cs-meta-strip__value">
                    {caseFile.manifest.status}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: hero image */}
            <div
              ref={heroMediaRef}
              className="cs-hero__media"
            >
              <div className="relative aspect-[5/4] overflow-hidden rounded-[6px] md:aspect-[21/9]">
                <DepthScanSurface
                  imageUrl={caseFile.img}
                  className="absolute inset-0"
                  accentColor="#00F0FF"
                  intensity={0.92}
                />
                {/* Inline meta overlay */}
                <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 py-4 font-mono text-[10px] uppercase tracking-[0.26em] text-[#10151c]/38 md:text-[11px]">
                  <span>{caseFile.category}</span>
                  <span>{caseFile.fileName}</span>
                </div>
                <div className="absolute inset-x-0 bottom-0 border-t border-[#10151c]/10 px-5 py-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-[#10151c]/32 md:text-[11px]">
                    project snapshot
                  </p>
                  <p className="mt-2 max-w-[40ch] text-sm leading-7 text-[#10151c]/52 md:text-base md:leading-8">
                    {caseFile.subtitle}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════
              §1  OVERVIEW
          ══════════════════════════════════════════════ */}
          <section className="cs-split-section">
            <div className="cs-split-section__label-col">
              <p className="cs-label">Overview</p>
            </div>
            <div className="cs-split-section__body-col">
              <div className="cs-prose">
                {caseFile.overview.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              §2  DETAILS (metrics)
          ══════════════════════════════════════════════ */}
          <section className="cs-split-section">
            <div className="cs-split-section__label-col">
              <p className="cs-label">Details</p>
            </div>
            <div className="cs-split-section__body-col">
              <div className="cs-metric-grid">
                {caseFile.metrics.map((metric) => (
                  <div key={metric.label} className="cs-metric">
                    <p className="cs-label">{metric.label}</p>
                    <p
                      className="cs-metric__value"
                      style={{ fontFamily: 'var(--font-display), sans-serif' }}
                    >
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              §3  MANIFEST (client / duration / mode)
          ══════════════════════════════════════════════ */}
          <section className="cs-split-section">
            <div className="cs-split-section__label-col">
              <p className="cs-label">Manifest</p>
            </div>
            <div className="cs-split-section__body-col">
              <div className="cs-metric-grid">
                {Object.entries(caseFile.manifest).map(([key, val]) => (
                  <div key={key} className="cs-metric">
                    <p className="cs-label">{key}</p>
                    <p className="cs-metric__value cs-metric__value--sm">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              §4  EVIDENCE
          ══════════════════════════════════════════════ */}
          <section className="cs-split-section">
            <div className="cs-split-section__label-col">
              <p className="cs-label">Evidence</p>
            </div>
            <div className="cs-split-section__body-col">
              <div className="cs-evidence-list">
                {caseFile.evidence.map((entry) => (
                  <article key={entry.label} className="cs-evidence-item">
                    <p className="cs-label">{entry.label}</p>
                    <h2
                      className="cs-evidence-item__heading"
                      style={{ fontFamily: 'var(--font-display), sans-serif' }}
                    >
                      {entry.title}
                    </h2>
                    <p className="cs-evidence-item__body">{entry.detail}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              §5  GALLERY
          ══════════════════════════════════════════════ */}
          <section className="cs-split-section">
            <div className="cs-split-section__label-col">
              <p className="cs-label">Gallery</p>
            </div>
            <div className="cs-split-section__body-col">
              <div className="cs-gallery-grid">
                {GALLERY_POSITIONS.map((position, i) => (
                  <div key={`${position}-${i}`} className="cs-gallery-item">
                    <div
                      className="aspect-[4/5] bg-cover bg-[#10151c]/4"
                      style={{
                        backgroundImage: `url(${caseFile.img})`,
                        backgroundPosition: position,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              §6  BUILD NOTES
          ══════════════════════════════════════════════ */}
          <section className="cs-split-section">
            <div className="cs-split-section__label-col">
              <p className="cs-label">Build notes</p>
            </div>
            <div className="cs-split-section__body-col">
              <div className="cs-notes-grid">
                {caseFile.buildNotes.map((note) => (
                  <div key={note.title} className="cs-note">
                    <p className="cs-label">{note.title}</p>
                    <div className="cs-note__body">
                      {note.body.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════
              §7  SIGNAL LOG
          ══════════════════════════════════════════════ */}
          {caseFile.signalLog.length > 0 && (
            <section className="cs-split-section">
              <div className="cs-split-section__label-col">
                <p className="cs-label">Signal log</p>
              </div>
              <div className="cs-split-section__body-col">
                <div className="cs-signal-log">
                  {caseFile.signalLog.map((entry, i) => (
                    <div key={i} className="cs-signal-entry">
                      <p className="cs-signal-entry__cmd">
                        <span className="cs-signal-entry__prompt" aria-hidden="true">
                          $&nbsp;
                        </span>
                        {entry.command}
                      </p>
                      <p className="cs-signal-entry__response">{entry.response}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ══════════════════════════════════════════════
              PAGE FOOTER — prev / next navigation
          ══════════════════════════════════════════════ */}
          <footer className="cs-page-footer">
            <div className="cs-page-footer__inner">
              <button
                type="button"
                onMouseEnter={playBlip}
                onClick={() => router.push(`/work/${previousProject.id}`)}
                className="cs-page-footer__nav-btn"
              >
                <span className="cs-page-footer__nav-direction">← prev</span>
                <span className="cs-page-footer__nav-title">{previousProject.title}</span>
              </button>

              <Link
                href="/#work"
                onMouseEnter={playBlip}
                className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#10151c]/40 transition-colors hover:text-[#00F0FF] md:text-[11px]"
              >
                index
              </Link>

              <button
                type="button"
                onMouseEnter={playBlip}
                onClick={() => router.push(`/work/${nextProject.id}`)}
                className="cs-page-footer__nav-btn cs-page-footer__nav-btn--right"
              >
                <span className="cs-page-footer__nav-direction">next →</span>
                <span className="cs-page-footer__nav-title">{nextProject.title}</span>
              </button>
            </div>
          </footer>

        </div>
      </div>
    </main>
  );
}
