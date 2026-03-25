'use client';

import { motion } from 'framer-motion';
import { useTransitionContext } from '@/context/TransitionContext';

export default function Template({ children }: { children: React.ReactNode }) {
  const { transitionState } = useTransitionContext();

  if (transitionState.isActive) {
    return <>{children}</>;
  }

  // A CRT line scan / pixelate expand effect
  return (
    <>
      <motion.div
        className="fixed inset-0 z-[100] pointer-events-none bg-background flex flex-col justify-center"
        initial={{ scaleY: 1, opacity: 1 }}
        animate={{ scaleY: 0, opacity: 0 }}
        exit={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "circIn" }}
      >
        <motion.div 
           className="w-full h-[3px] bg-accent shadow-[0_0_20px_#39ff14]"
           initial={{ scaleX: 0 }}
           animate={{ scaleX: 1 }}
           transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </motion.div>
      {children}
    </>
  );
}
