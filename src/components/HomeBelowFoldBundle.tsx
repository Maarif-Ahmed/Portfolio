'use client';

import MiniTerminal from '@/components/MiniTerminal';
import StackTelemetrySection from '@/components/StackTelemetrySection';
import WorkGallery from '@/components/WorkGallery';
import type { BuildNote } from '@/lib/buildNoteTypes';

interface HomeBelowFoldBundleProps {
  buildNotes: BuildNote[];
}

export default function HomeBelowFoldBundle({ buildNotes }: HomeBelowFoldBundleProps) {
  return (
    <>
      <MiniTerminal buildNotes={buildNotes} variant="floating" className="-mt-16 md:-mt-24 lg:-mt-28" />
      <StackTelemetrySection />
      <WorkGallery />
    </>
  );
}
