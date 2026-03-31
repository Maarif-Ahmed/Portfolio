'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

type TransitionState = {
  isActive: boolean;
  rect: DOMRect | null;
  imgUrl: string | null;
  borderRadius: string;
};

type TransitionContextType = {
  transitionState: TransitionState;
  startFlipTransition: (element: HTMLElement, imgUrl: string, borderRadius?: string) => void;
  completeFlipTransition: () => void;
};

const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

export function TransitionProvider({ children }: { children: ReactNode }) {
  const [transitionState, setTransitionState] = useState<TransitionState>({
    isActive: false,
    rect: null,
    imgUrl: null,
    borderRadius: '0px',
  });

  const startFlipTransition = useCallback((element: HTMLElement, imgUrl: string, borderRadius = '0px') => {
    const rect = element.getBoundingClientRect();
    element.style.opacity = '0';
    setTransitionState({ isActive: true, rect, imgUrl, borderRadius });
  }, []);

  const completeFlipTransition = useCallback(() => {
    setTransitionState({ isActive: false, rect: null, imgUrl: null, borderRadius: '0px' });
  }, []);

  return (
    <TransitionContext.Provider value={{ transitionState, startFlipTransition, completeFlipTransition }}>
      {children}

      {transitionState.isActive && transitionState.rect && (
        <div
          id="flip-clone"
          className="fixed z-[99999] pointer-events-none bg-cover bg-center"
          style={{
            top: transitionState.rect.top,
            left: transitionState.rect.left,
            width: transitionState.rect.width,
            height: transitionState.rect.height,
            backgroundImage: `url(${transitionState.imgUrl})`,
            borderRadius: transitionState.borderRadius,
            margin: 0,
          }}
        />
      )}
    </TransitionContext.Provider>
  );
}

export function useTransitionContext() {
  const context = useContext(TransitionContext);
  if (context === undefined) {
    throw new Error('useTransitionContext must be used within a TransitionProvider');
  }
  return context;
}
