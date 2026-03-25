'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SudoContextType {
  sudoMode: boolean;
  setSudoMode: (val: boolean) => void;
  toggleSudoMode: () => void;
}

const SudoContext = createContext<SudoContextType | undefined>(undefined);

export const SudoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sudoMode, setSudoMode] = useState(false);

  const toggleSudoMode = () => setSudoMode(prev => !prev);

  // Keyboard shortcut: Alt + S to toggle sudo mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === 's') {
        toggleSudoMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <SudoContext.Provider value={{ sudoMode, setSudoMode, toggleSudoMode }}>
      {children}
    </SudoContext.Provider>
  );
};

export const useSudo = () => {
  const context = useContext(SudoContext);
  if (context === undefined) {
    throw new Error('useSudo must be used within a SudoProvider');
  }
  return context;
};
