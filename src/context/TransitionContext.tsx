'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import StaticTransition from '@/components/StaticTransition';

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
  showLoader: boolean;
  loaderLines: string[];
  triggerLoader: (targetPath: string, onComplete: () => void) => void;
};

const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

const LOADING_LINES = [
  '> Initializing terminal...',
  '> Loading modules: [gsap, framer-motion, lenis]',
  '> Compiling TypeScript... OK',
  '> Mounting DOM tree...',
  '> Fetching project data... [########..] 80%',
  '> Resolving dependencies...',
  '> Injecting styles... OK',
  '> Rendering viewport...',
  '> STATUS: READY',
];

export function TransitionProvider({ children }: { children: ReactNode }) {
  const [transitionState, setTransitionState] = useState<TransitionState>({
    isActive: false,
    rect: null,
    imgUrl: null,
    borderRadius: '0px',
  });

  const [showLoader, setShowLoader] = useState(false);
  const [loaderLines, setLoaderLines] = useState<string[]>([]);
  const [showStatic, setShowStatic] = useState(false);

  const startFlipTransition = useCallback((element: HTMLElement, imgUrl: string, borderRadius = '0px') => {
    const rect = element.getBoundingClientRect();
    element.style.opacity = '0'; 
    setTransitionState({ isActive: true, rect, imgUrl, borderRadius });
  }, []);

  const completeFlipTransition = useCallback(() => {
    setTransitionState({ isActive: false, rect: null, imgUrl: null, borderRadius: '0px' });
  }, []);

  const triggerLoader = useCallback((targetPath: string, onComplete: () => void) => {
    setShowLoader(true);
    setLoaderLines([]);

    const customLines = [
      ...LOADING_LINES.slice(0, 4),
      `> Navigating to ${targetPath}...`,
      ...LOADING_LINES.slice(4)
    ];

    let lineIndex = 0;
    const interval = setInterval(() => {
      if (lineIndex < customLines.length) {
        setLoaderLines(prev => [...prev, customLines[lineIndex]]);
        lineIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setShowStatic(true);
          setTimeout(() => {
            setShowLoader(false);
            setLoaderLines([]);
            onComplete();
            // Static disappears after its own duration logic
            setTimeout(() => setShowStatic(false), 250);
          }, 200);
        }, 400);
      }
    }, 80); // Speed up loader slightly for better flow
  }, []);

  return (
    <TransitionContext.Provider value={{ transitionState, startFlipTransition, completeFlipTransition, showLoader, loaderLines, triggerLoader }}>
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

      {/* Digital Static Overlay */}
      <StaticTransition isVisible={showStatic} onComplete={() => setShowStatic(false)} />

      {/* Terminal Loading Overlay */}
      {showLoader && (
        <div className="fixed inset-0 z-[999998] bg-background flex flex-col justify-center px-6 md:px-20">
          <div className="max-w-2xl space-y-1">
            {loaderLines.map((line, i) => (
              <p key={i} className={`text-xs md:text-sm ${
                line.includes('OK') || line.includes('READY') ? 'text-accent' : 'text-foreground/70'
              }`}>
                {line}
              </p>
            ))}
            {loaderLines.length < 10 && (
              <span className="inline-block w-2 h-4 bg-accent animate-pulse" />
            )}
          </div>
        </div>
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
