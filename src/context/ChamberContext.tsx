'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type ChamberMode = 'primary' | 'alternate';

interface ChamberContextType {
  chamberMode: ChamberMode;
  activationCount: number;
  setChamberMode: (mode: ChamberMode) => void;
  toggleAlternateChamber: () => ChamberMode;
}

const ChamberContext = createContext<ChamberContextType | undefined>(undefined);

export const ChamberProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chamberMode, setChamberModeState] = useState<ChamberMode>('primary');
  const [activationCount, setActivationCount] = useState(0);

  const setChamberMode = useCallback((mode: ChamberMode) => {
    setChamberModeState((currentMode) => {
      if (currentMode !== mode && mode === 'alternate') {
        setActivationCount((currentCount) => currentCount + 1);
      }

      return mode;
    });
  }, []);

  const toggleAlternateChamber = useCallback(() => {
    let nextMode: ChamberMode = 'primary';

    setChamberModeState((currentMode) => {
      nextMode = currentMode === 'alternate' ? 'primary' : 'alternate';
      if (nextMode === 'alternate') {
        setActivationCount((currentCount) => currentCount + 1);
      }
      return nextMode;
    });

    return nextMode;
  }, []);

  const contextValue = useMemo(
    () => ({
      chamberMode,
      activationCount,
      setChamberMode,
      toggleAlternateChamber,
    }),
    [activationCount, chamberMode, setChamberMode, toggleAlternateChamber]
  );

  return <ChamberContext.Provider value={contextValue}>{children}</ChamberContext.Provider>;
};

export const useChamber = () => {
  const context = useContext(ChamberContext);
  if (context === undefined) {
    throw new Error('useChamber must be used within a ChamberProvider');
  }

  return context;
};
