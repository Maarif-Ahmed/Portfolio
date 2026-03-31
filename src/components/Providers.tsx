'use client';

import React from 'react';
import { SudoProvider } from "@/context/SudoContext";
import { TransitionProvider } from "@/context/TransitionContext";
import { AudioProvider } from "@/context/AudioContext";
import { MotionProvider } from "@/context/MotionContext";
import LenisProvider from "@/components/LenisProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionProvider>
      <LenisProvider>
        <AudioProvider>
          <SudoProvider>
            <TransitionProvider>
              {children}
            </TransitionProvider>
          </SudoProvider>
        </AudioProvider>
      </LenisProvider>
    </MotionProvider>
  );
}
