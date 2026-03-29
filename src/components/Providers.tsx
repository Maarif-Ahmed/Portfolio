'use client';

import React from 'react';
import { SudoProvider } from "@/context/SudoContext";
import { TransitionProvider } from "@/context/TransitionContext";
import { AudioProvider } from "@/context/AudioContext";
import { MotionProvider } from "@/context/MotionContext";
import { ChamberProvider } from "@/context/ChamberContext";
import LenisProvider from "@/components/LenisProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionProvider>
      <LenisProvider>
        <AudioProvider>
          <ChamberProvider>
            <SudoProvider>
              <TransitionProvider>
                {children}
              </TransitionProvider>
            </SudoProvider>
          </ChamberProvider>
        </AudioProvider>
      </LenisProvider>
    </MotionProvider>
  );
}
