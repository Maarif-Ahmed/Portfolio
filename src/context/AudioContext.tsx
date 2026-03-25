'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

interface AudioContextType {
  isMuted: boolean;
  toggleMute: () => void;
  playBlip: () => void;
}

interface WindowWithWebkitAudio extends Window {
  webkitAudioContext?: typeof AudioContext;
}

const AudioStateContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const toggleMute = () => setIsMuted(prev => !prev);

  const playBlip = useCallback(() => {
    if (isMuted) return;

    if (!audioCtxRef.current) {
      const AudioCtor =
        window.AudioContext ??
        (window as WindowWithWebkitAudio).webkitAudioContext;

      if (!AudioCtor) return;
      audioCtxRef.current = new AudioCtor();
    }

    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime); // High pitch A5
    oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.02);

    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.02);
  }, [isMuted]);

  return (
    <AudioStateContext.Provider value={{ isMuted, toggleMute, playBlip }}>
      {children}
    </AudioStateContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioStateContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
