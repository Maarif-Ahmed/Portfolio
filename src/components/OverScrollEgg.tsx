'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OverScrollEgg() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      
      // Detect over-scroll / rubber-banding at bottom
      if (isAtBottom && window.scrollY > lastScrollY) {
        setShow(true);
        setTimeout(() => setShow(false), 3000);
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[1000003] pointer-events-none"
        >
          <div className="bg-red-950 border border-red-500 px-6 py-3 text-red-500 font-mono text-xs md:text-sm shadow-[0_0_30px_rgba(255,0,0,0.3)]">
            <p className="flex items-center gap-3">
              <span className="bg-red-500 text-black px-1 font-bold">CRITICAL_ERR</span>
              [ ERROR: END OF LINE. TURN BACK? Y/N ]
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
