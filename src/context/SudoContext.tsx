'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useKeySequence } from '@/hooks/useKeySequence';

interface SudoContextType {
  sudoMode: boolean;
  setSudoMode: (value: boolean) => void;
  toggleSudoMode: () => void;
}

const SudoContext = createContext<SudoContextType | undefined>(undefined);

export const SudoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [sudoMode, setSudoModeState] = useState(false);
  const sudoModeRef = useRef(false);

  const setSudoMode = useCallback((value: boolean) => {
    if (value === sudoModeRef.current) return;
    sudoModeRef.current = value;
    setSudoModeState(value);
  }, []);

  const toggleSudoMode = useCallback(() => {
    setSudoMode(!sudoModeRef.current);
  }, [setSudoMode]);

  useKeySequence('sudo', () => {
    if (pathname === '/') {
      toggleSudoMode();
    }
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key.toLowerCase() === 's') {
        toggleSudoMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSudoMode]);

  return <SudoContext.Provider value={{ sudoMode, setSudoMode, toggleSudoMode }}>{children}</SudoContext.Provider>;
};

export const useSudo = () => {
  const context = useContext(SudoContext);
  if (context === undefined) {
    throw new Error('useSudo must be used within a SudoProvider');
  }
  return context;
};
