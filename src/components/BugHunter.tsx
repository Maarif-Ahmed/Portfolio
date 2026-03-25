'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: string;
}

const BUG_CHARS = ['🐛', '🐞', '🪲'];
const PARTICLE_CHARS = ['0', '1', '{', '}', '/', '\\', ';', '#', '$', '!', '>', '<'];

export default function BugHunter() {
  const [bugs, setBugs] = useState<{ id: number; x: number; y: number; char: string }[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [bugFixes, setBugFixes] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      const stored = window.localStorage.getItem('bug_fixes');
      const parsed = Number.parseInt(stored ?? '', 10);
      if (Number.isFinite(parsed)) {
        setBugFixes(parsed);
      }
    });

    return () => window.cancelAnimationFrame(rafId);
  }, []);

  // Spawn bugs periodically
  useEffect(() => {
    const spawnBug = () => {
      // Only spawn if less than 2 bugs visible
      setBugs(prev => {
        if (prev.length >= 2) return prev;
        const x = Math.random() * (window.innerWidth - 40);
        const y = Math.random() * (document.documentElement.scrollHeight - 200);
        return [...prev, {
          id: Date.now(),
          x,
          y,
          char: BUG_CHARS[Math.floor(Math.random() * BUG_CHARS.length)]
        }];
      });
    };
    
    // Spawn first bug quickly, then every 15-30s
    const firstTimeout = setTimeout(spawnBug, 3000);
    intervalRef.current = setInterval(spawnBug, 15000 + Math.random() * 15000);
    
    return () => {
      clearTimeout(firstTimeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const squashBug = useCallback((bugId: number, bugX: number, bugY: number) => {
    // Remove bug
    setBugs(prev => prev.filter(b => b.id !== bugId));

    // Increment counter
    setBugFixes((prev) => {
      const nextCount = prev + 1;
      window.localStorage.setItem('bug_fixes', String(nextCount));
      return nextCount;
    });

    // Spawn particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20;
      const speed = 3 + Math.random() * 6;
      newParticles.push({
        id: Date.now() + i,
        x: bugX,
        y: bugY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        char: PARTICLE_CHARS[Math.floor(Math.random() * PARTICLE_CHARS.length)],
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
    
    // Clean particles after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1200);
  }, []);

  return (
    <>
      {/* Bugs */}
      <AnimatePresence>
        {bugs.map(bug => (
          <motion.button
            key={bug.id}
            className="absolute z-[99970] text-2xl cursor-pointer select-none hover:scale-125 transition-transform pointer-events-auto"
            style={{ left: bug.x, top: bug.y }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 200 }}
            onClick={() => squashBug(bug.id, bug.x, bug.y)}
            title="SQUASH THIS BUG!"
          >
            {bug.char}
          </motion.button>
        ))}
      </AnimatePresence>

      {/* Particles */}
      <AnimatePresence>
        {particles.map(p => (
          <motion.span
            key={p.id}
            className="fixed z-[99971] text-accent text-xs font-bold pointer-events-none"
            style={{ left: p.x, top: p.y }}
            initial={{ opacity: 1, scale: 1 }}
            animate={{
              x: p.vx * 40,
              y: p.vy * 40,
              opacity: 0,
              scale: 0,
            }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            {p.char}
          </motion.span>
        ))}
      </AnimatePresence>

      {/* Bug Counter — visible if any squashed */}
      {bugFixes > 0 && (
        <div className="fixed bottom-12 right-6 z-[99972] text-[9px] text-accent/50 uppercase tracking-widest pointer-events-none">
          bug_fixes: {bugFixes}
        </div>
      )}
    </>
  );
}
