'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'maarif-motion-reduction';

interface MotionContextValue {
  motionReduced: boolean;
  motionReady: boolean;
  toggleMotionReduced: () => void;
}

const MotionContext = createContext<MotionContextValue | undefined>(undefined);

export function MotionProvider({ children }: { children: ReactNode }) {
  const [motionReduced, setMotionReduced] = useState(false);
  const [motionReady, setMotionReady] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const syncMotionPreference = () => {
      const storedPreference = window.localStorage.getItem(STORAGE_KEY);
      const shouldReduce = storedPreference === null ? mediaQuery.matches : storedPreference === 'true';

      window.requestAnimationFrame(() => {
        setMotionReduced(shouldReduce);
        setMotionReady(true);
      });
    };

    syncMotionPreference();
    mediaQuery.addEventListener('change', syncMotionPreference);

    return () => mediaQuery.removeEventListener('change', syncMotionPreference);
  }, []);

  useEffect(() => {
    if (!motionReady) return;

    document.documentElement.classList.toggle('motion-reduced', motionReduced);
    window.localStorage.setItem(STORAGE_KEY, String(motionReduced));
  }, [motionReady, motionReduced]);

  const toggleMotionReduced = useCallback(() => {
    setMotionReduced((currentPreference) => !currentPreference);
  }, []);

  const contextValue = useMemo(
    () => ({
      motionReduced,
      motionReady,
      toggleMotionReduced,
    }),
    [motionReady, motionReduced, toggleMotionReduced]
  );

  return (
    <MotionContext.Provider value={contextValue}>
      {children}
    </MotionContext.Provider>
  );
}

export function useMotionPreference() {
  const contextValue = useContext(MotionContext);

  if (!contextValue) {
    throw new Error('useMotionPreference must be used within MotionProvider');
  }

  return contextValue;
}
