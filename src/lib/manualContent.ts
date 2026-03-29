export interface ManualSection {
  title: string;
  body: string[];
}

export const MANUAL_NAME = 'Maarif - Fullstack Wizard';
export const MANUAL_SYNOPSIS = 'maarif [OPTIONS] [PROJECTS]';

export const MANUAL_SECTIONS: ManualSection[] = [
  {
    title: 'DESCRIPTION',
    body: [
      'Maarif builds products that feel like tuned machines: fast, tactile, and a little theatrical without losing discipline.',
      'He cares about frontend architecture, motion systems, and shipping interfaces that glow, load quickly, and still behave under pressure.',
    ],
  },
  {
    title: 'DEPENDENCIES',
    body: [
      'Coffee',
      'Mechanical keyboards',
      'Dark mode',
    ],
  },
  {
    title: 'RUNTIME',
    body: [
      'Next.js, TypeScript, GSAP, Tailwind CSS, Three.js, React Three Fiber, and a steady affection for terminal metaphors.',
    ],
  },
  {
    title: 'NOTES',
    body: [
      'Prefers bold interfaces over safe ones.',
      'Will usually optimize both the animation and the paint cost.',
    ],
  },
  {
    title: 'EXIT STATUS',
    body: [
      '0 when the interface feels alive.',
      '1 when the design gets boring.',
    ],
  },
];
