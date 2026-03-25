'use client';

import { ReactLenis } from 'lenis/react';

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  return (
    // Lowered lerp & extended duration for a heavy, mechanical scroll frame
    <ReactLenis root options={{ lerp: 0.05, duration: 1.8, smoothWheel: true, syncTouch: true }}>
      {children}
    </ReactLenis>
  );
}
