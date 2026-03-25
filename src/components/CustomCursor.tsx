'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [cursorState, setCursorState] = useState<'default' | 'type' | 'expand'>('default');
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: fine)');
    const updateEnabled = () => setIsEnabled(mediaQuery.matches);
    updateEnabled();

    mediaQuery.addEventListener('change', updateEnabled);
    return () => mediaQuery.removeEventListener('change', updateEnabled);
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      document.body.style.cursor = 'auto';
      return;
    }

    document.body.style.cursor = 'none';

    const updateCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      const isText = target.closest('h1, h2, h3, h4, p, span, li');
      const isInteractive = target.closest('a, button, .terminal-window');
      
      if (isInteractive) {
        setCursorState('expand');
      } else if (isText) {
        setCursorState('type');
      } else {
        setCursorState('default');
      }
    };

    window.addEventListener('mousemove', updateCursor);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      document.body.style.cursor = 'auto';
      window.removeEventListener('mousemove', updateCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [isEnabled]);

  if (!isEnabled) return null;

  const variants = {
    default: {
      width: 14,
      height: 24,
      backgroundColor: 'var(--accent)',
      border: 'none',
      opacity: 0.9,
    },
    type: {
      width: 3,
      height: 28,
      backgroundColor: 'var(--accent)',
      border: 'none',
      opacity: 1,
    },
    expand: {
      width: 60,
      height: 60,
      backgroundColor: 'transparent',
      border: '2px solid var(--accent)',
      opacity: 1,
    }
  };

  return (
    <motion.div
      className="fixed top-0 left-0 z-[9999] pointer-events-none flex items-center justify-center mix-blend-difference"
      animate={variants[cursorState]}
      style={{
        translateX: position.x - (cursorState === 'expand' ? 30 : (cursorState === 'type' ? 1.5 : 7)),
        translateY: position.y - (cursorState === 'expand' ? 30 : 12),
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
        mass: 0.2
      }}
    >
      {cursorState === 'default' && (
        <motion.div 
           className="w-full h-full bg-accent"
           animate={{ opacity: [1, 0] }} 
           transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse", ease: "linear" }} 
        />
      )}
    </motion.div>
  );
}
