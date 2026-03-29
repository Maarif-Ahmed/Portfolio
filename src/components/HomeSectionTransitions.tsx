'use client';

import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useMotionPreference } from '@/context/MotionContext';

gsap.registerPlugin(ScrollTrigger);

interface SectionNodes {
  section: HTMLElement;
  heading: HTMLElement | null;
  copy: HTMLElement | null;
  line: HTMLElement | null;
  field: HTMLElement | null;
  beam: HTMLElement | null;
  cards: HTMLElement[];
}

function collectSection(sectionId: string) {
  const section = document.getElementById(sectionId);
  if (!section) return null;

  const cards = sectionId === 'work' || sectionId === 'stack' || sectionId === 'build-notes'
    ? gsap.utils.toArray<HTMLElement>(section.querySelectorAll('article'))
    : [];

  return {
    section,
    heading: section.querySelector<HTMLElement>('.section-lock-heading') ?? section.querySelector<HTMLElement>('h2'),
    copy: section.querySelector<HTMLElement>('.section-lock-copy') ?? section.querySelector<HTMLElement>('h2 + p'),
    line: section.querySelector<HTMLElement>('.section-signal-line'),
    field: section.querySelector<HTMLElement>('.section-signal-field'),
    beam: section.querySelector<HTMLElement>('.section-signal-beam'),
    cards,
  } satisfies SectionNodes;
}

function setSectionIdleState(sectionNodes: SectionNodes) {
  gsap.set(sectionNodes.section, {
    y: 0,
    scale: 1,
    opacity: 1,
  });

  if (sectionNodes.heading) {
    gsap.set(sectionNodes.heading, {
      y: 38,
      opacity: 0,
      filter: 'blur(6px)',
    });
  }

  if (sectionNodes.copy) {
    gsap.set(sectionNodes.copy, {
      y: 18,
      opacity: 0,
      filter: 'blur(4px)',
    });
  }

  if (sectionNodes.line) {
    gsap.set(sectionNodes.line, {
      scaleX: 0.16,
      opacity: 0,
      transformOrigin: '50% 50%',
    });
  }

  if (sectionNodes.field) {
    gsap.set(sectionNodes.field, {
      opacity: 0,
    });
  }

  if (sectionNodes.beam) {
    gsap.set(sectionNodes.beam, {
      opacity: 0,
      yPercent: -18,
    });
  }

  if (sectionNodes.cards.length > 0) {
    gsap.set(sectionNodes.cards, {
      y: 42,
      opacity: 0,
      rotateX: 2,
      transformOrigin: '50% 50%',
    });
  }
}

function clearSectionState(sectionNodes: SectionNodes) {
  gsap.set(
    [
      sectionNodes.section,
      sectionNodes.heading,
      sectionNodes.copy,
      sectionNodes.line,
      sectionNodes.field,
      sectionNodes.beam,
      ...sectionNodes.cards,
    ],
    { clearProps: 'all' }
  );
}

export default function HomeSectionTransitions() {
  const { motionReduced } = useMotionPreference();

  useGSAP(() => {
    const storySection = collectSection('story');
    const shellSection = collectSection('shell');
    const stackSection = collectSection('stack');
    const workSection = collectSection('work');
    const buildNotesSection = collectSection('build-notes');
    const footerSection = collectSection('footer');

    if (!storySection || !shellSection || !stackSection || !workSection || !buildNotesSection || !footerSection) {
      return;
    }

    const sections = [storySection, shellSection, stackSection, workSection, buildNotesSection, footerSection];

    if (motionReduced) {
      sections.forEach(clearSectionState);
      return;
    }

    sections.forEach(setSectionIdleState);

    const storyReveal = gsap.timeline({
      scrollTrigger: {
        trigger: storySection.section,
        start: 'top 80%',
        end: 'top 38%',
        scrub: 1,
      },
    });

    storyReveal
      .to(storySection.line, { scaleX: 1, opacity: 1, duration: 0.16 }, 0)
      .to(storySection.field, { opacity: 1, duration: 0.22 }, 0)
      .to(storySection.beam, { opacity: 1, yPercent: 108, duration: 0.18 }, 0)
      .to(storySection.heading, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.24 }, 0.04)
      .to(storySection.copy, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.2 }, 0.08);

    const shellReveal = gsap.timeline({
      scrollTrigger: {
        trigger: shellSection.section,
        start: 'top 96%',
        end: 'top 50%',
        scrub: 1,
      },
    });

    shellReveal
      .to(shellSection.line, { scaleX: 1, opacity: 1, duration: 0.14 }, 0)
      .to(shellSection.field, { opacity: 1, duration: 0.2 }, 0)
      .to(shellSection.beam, { opacity: 1, yPercent: 115, duration: 0.18 }, 0)
      .to(shellSection.heading, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.2 }, 0.04)
      .to(shellSection.copy, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.16 }, 0.08);

    const stackReveal = gsap.timeline({
      scrollTrigger: {
        trigger: stackSection.section,
        start: 'top 94%',
        end: 'top 50%',
        scrub: 1,
      },
    });

    stackReveal
      .to(stackSection.line, { scaleX: 1, opacity: 1, duration: 0.14 }, 0)
      .to(stackSection.field, { opacity: 1, duration: 0.2 }, 0)
      .to(stackSection.beam, { opacity: 1, yPercent: 115, duration: 0.18 }, 0)
      .to(stackSection.heading, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.2 }, 0.04)
      .to(stackSection.copy, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.16 }, 0.08)
      .to(stackSection.cards, { y: 0, opacity: 1, rotateX: 0, duration: 0.22, stagger: 0.035 }, 0.12);

    const workReveal = gsap.timeline({
      scrollTrigger: {
        trigger: workSection.section,
        start: 'top 94%',
        end: 'top 50%',
        scrub: 1,
      },
    });

    workReveal
      .to(workSection.line, { scaleX: 1, opacity: 1, duration: 0.14 }, 0)
      .to(workSection.field, { opacity: 1, duration: 0.2 }, 0)
      .to(workSection.beam, { opacity: 1, yPercent: 115, duration: 0.18 }, 0)
      .to(workSection.heading, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.2 }, 0.04)
      .to(workSection.copy, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.16 }, 0.08)
      .to(workSection.cards, { y: 0, opacity: 1, rotateX: 0, duration: 0.28, stagger: 0.035 }, 0.12);

    const notesReveal = gsap.timeline({
      scrollTrigger: {
        trigger: buildNotesSection.section,
        start: 'top 94%',
        end: 'top 50%',
        scrub: 1,
      },
    });

    notesReveal
      .to(buildNotesSection.line, { scaleX: 1, opacity: 1, duration: 0.16 }, 0)
      .to(buildNotesSection.field, { opacity: 1, duration: 0.22 }, 0)
      .to(buildNotesSection.beam, { opacity: 1, yPercent: 110, duration: 0.18 }, 0)
      .to(buildNotesSection.heading, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.24 }, 0.04)
      .to(buildNotesSection.copy, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.2 }, 0.08)
      .to(buildNotesSection.cards, { y: 0, opacity: 1, rotateX: 0, duration: 0.24, stagger: 0.03 }, 0.12);

    const footerPanelReveal = gsap.timeline({
      scrollTrigger: {
        trigger: footerSection.section,
        start: 'top 96%',
        end: 'top 54%',
        scrub: 1,
      },
    });

    footerPanelReveal
      .to(footerSection.line, { scaleX: 1, opacity: 1, duration: 0.16 }, 0)
      .to(footerSection.field, { opacity: 1, duration: 0.22 }, 0)
      .to(footerSection.beam, { opacity: 1, yPercent: 110, duration: 0.18 }, 0)
      .to(footerSection.heading, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.24 }, 0.04)
      .to(footerSection.copy, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.2 }, 0.08);

    const storyHandoff = gsap.timeline({
      scrollTrigger: {
        trigger: shellSection.section,
        start: 'top bottom',
        end: 'top 42%',
        scrub: true,
      },
    });

    storyHandoff
      .to(storySection.section, { y: -10, scale: 0.997, opacity: 0.9, ease: 'none' }, 0)
      .to(storySection.copy, { y: -4, opacity: 0.58, ease: 'none' }, 0)
      .to(storySection.heading, { y: -3, opacity: 0.82, ease: 'none' }, 0)
      .to(storySection.line, { opacity: 0.38, ease: 'none' }, 0)
      .to(storySection.field, { opacity: 0.28, ease: 'none' }, 0);

    const shellHandoff = gsap.timeline({
      scrollTrigger: {
        trigger: stackSection.section,
        start: 'top bottom',
        end: 'top 44%',
        scrub: true,
      },
    });

    shellHandoff
      .to(shellSection.section, { y: -12, scale: 0.996, opacity: 0.86, ease: 'none' }, 0)
      .to(shellSection.copy, { y: -5, opacity: 0.5, ease: 'none' }, 0)
      .to(shellSection.heading, { y: -4, opacity: 0.76, ease: 'none' }, 0)
      .to(shellSection.line, { opacity: 0.34, ease: 'none' }, 0)
      .to(shellSection.field, { opacity: 0.24, ease: 'none' }, 0);

    const stackHandoff = gsap.timeline({
      scrollTrigger: {
        trigger: workSection.section,
        start: 'top bottom',
        end: 'top 44%',
        scrub: true,
      },
    });

    stackHandoff
      .to(stackSection.section, { y: -12, scale: 0.996, opacity: 0.84, ease: 'none' }, 0)
      .to(stackSection.copy, { y: -5, opacity: 0.5, ease: 'none' }, 0)
      .to(stackSection.cards, { y: -6, opacity: 0.8, ease: 'none', stagger: 0.02 }, 0)
      .to(stackSection.heading, { y: -4, opacity: 0.76, ease: 'none' }, 0)
      .to(stackSection.line, { opacity: 0.34, ease: 'none' }, 0)
      .to(stackSection.field, { opacity: 0.24, ease: 'none' }, 0);

    const workHandoff = gsap.timeline({
      scrollTrigger: {
        trigger: buildNotesSection.section,
        start: 'top bottom',
        end: 'top 44%',
        scrub: true,
      },
    });

    workHandoff
      .to(workSection.section, { scale: 0.99, opacity: 0.8, ease: 'none' }, 0)
      .to(workSection.cards, { y: -18, opacity: 0.78, ease: 'none', stagger: 0.022 }, 0)
      .to(workSection.copy, { y: -10, opacity: 0.46, ease: 'none' }, 0)
      .to(workSection.heading, { y: -8, opacity: 0.7, ease: 'none' }, 0)
      .to(workSection.line, { opacity: 0.3, ease: 'none' }, 0)
      .to(workSection.field, { opacity: 0.2, ease: 'none' }, 0);

    const notesHandoff = gsap.timeline({
      scrollTrigger: {
        trigger: footerSection.section,
        start: 'top bottom',
        end: 'top 44%',
        scrub: true,
      },
    });

    notesHandoff
      .to(buildNotesSection.section, { y: -10, scale: 0.994, opacity: 0.84, ease: 'none' }, 0)
      .to(buildNotesSection.copy, { y: -6, opacity: 0.52, ease: 'none' }, 0)
      .to(buildNotesSection.cards, { y: -8, opacity: 0.8, ease: 'none', stagger: 0.02 }, 0)
      .to(buildNotesSection.heading, { y: -4, opacity: 0.76, ease: 'none' }, 0)
      .to(buildNotesSection.line, { opacity: 0.32, ease: 'none' }, 0)
      .to(buildNotesSection.field, { opacity: 0.22, ease: 'none' }, 0);

    return () => {
      sections.forEach(clearSectionState);
      ScrollTrigger.refresh();
    };
  }, { dependencies: [motionReduced] });

  return null;
}
