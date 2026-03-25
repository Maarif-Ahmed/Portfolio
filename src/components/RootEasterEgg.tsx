'use client';

import { useEffect, useState, useCallback } from 'react';

const secretProjects = [
  { name: 'PROJECT_NULL', status: 'CLASSIFIED', progress: '██████████ 100%' },
  { name: 'GHOST_PROTOCOL', status: 'DORMANT', progress: '████░░░░░░ 40%' },
  { name: 'NEON_ABYSS', status: 'ACTIVE', progress: '████████░░ 80%' },
  { name: 'VOID_ENGINE', status: 'ARCHIVED', progress: '██████████ 100%' },
];

export default function RootEasterEgg() {
  const [isActive, setIsActive] = useState(false);
  const [typedKeys, setTypedKeys] = useState('');

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const key = e.key.toUpperCase();
    if (!'ROOT'.includes(key)) {
      setTypedKeys('');
      return;
    }
    
    const next = typedKeys + key;
    if ('ROOT'.startsWith(next)) {
      setTypedKeys(next);
      if (next === 'ROOT') {
        setIsActive(prev => !prev);
        setTypedKeys('');
      }
    } else {
      setTypedKeys(key === 'R' ? 'R' : '');
    }
  }, [typedKeys]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isActive) {
      document.documentElement.classList.add('root-mode');
    } else {
      document.documentElement.classList.remove('root-mode');
    }
    return () => document.documentElement.classList.remove('root-mode');
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div 
      className="fixed inset-0 z-[99997] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
      onClick={() => setIsActive(false)}
    >
      <div 
        className="w-full max-w-2xl border border-accent bg-background shadow-[0_0_60px_rgba(57,255,20,0.3)] animate-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Terminal Title Bar */}
        <div className="w-full h-8 border-b border-accent bg-background flex items-center px-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 border border-accent rounded-full" />
            <div className="w-3 h-3 border border-accent rounded-full" />
            <button onClick={() => setIsActive(false)} className="w-3 h-3 bg-accent border border-accent rounded-full hover:bg-red-500 transition-colors cursor-pointer" />
          </div>
          <div className="mx-auto text-[10px] uppercase tracking-widest text-accent">
            root@maarif:~/secret_projects — RESTRICTED
          </div>
        </div>

        {/* Terminal Body */}
        <div className="p-6 text-sm space-y-1">
          <p className="text-accent mb-4">{'>'} ACCESS_GRANTED. Welcome back, root.</p>
          <p className="text-white/50 mb-6">{'>'} Displaying classified project manifests...</p>
          
          <div className="border-t border-accent/30 pt-4 space-y-4">
            {secretProjects.map((project, i) => (
              <div key={i} className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-accent/10 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-accent">$</span>
                  <span className="text-white font-bold">{project.name}</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className={`px-2 py-0.5 border ${project.status === 'ACTIVE' ? 'border-accent text-accent' : project.status === 'DORMANT' ? 'border-yellow-500 text-yellow-500' : 'border-white/30 text-white/50'}`}>
                    {project.status}
                  </span>
                  <span className="text-white/40 font-mono">{project.progress}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 flex items-center gap-2 text-accent">
            <span>{'>'}</span>
            <span className="animate-pulse">█</span>
            <span className="text-white/30 text-xs ml-2">Type ROOT again to exit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
