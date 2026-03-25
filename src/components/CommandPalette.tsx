'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

const commands = [
  { label: '> HOME', path: '/', desc: 'Main terminal' },
  { label: '> ABOUT / ARCHIVE', path: '/about', desc: 'Who is this person' },
  { label: '> WORK / TERMINAL_VIBE', path: '/work/1', desc: 'Project 01' },
  { label: '> WORK / NEON_TRACKER', path: '/work/2', desc: 'Project 02' },
  { label: '> WORK / SYNTAX_ERROR', path: '/work/3', desc: 'Project 03' },
  { label: '> WORK / GIT_PUSHED', path: '/work/4', desc: 'Project 04' },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = query.toLowerCase() === 'help'
    ? []
    : commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()) || c.desc.toLowerCase().includes(query.toLowerCase()));

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsOpen(prev => !prev);
      setQuery('');
      setSelectedIndex(0);
      setShowHelp(false);
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen]);

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (query.toLowerCase() === 'help') {
        setShowHelp(true);
        return;
      }
      if (filtered[selectedIndex]) {
        router.push(filtered[selectedIndex].path);
        setIsOpen(false);
      }
    }
  };

  const handleSelect = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[999999] flex items-start justify-center pt-[20vh] px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          {/* Palette */}
          <motion.div
            className="relative w-full max-w-xl border border-accent bg-background shadow-[0_0_60px_rgba(57,255,20,0.2)] z-10"
            initial={{ y: -20, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -20, scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Terminal Bar */}
            <div className="w-full h-7 border-b border-accent flex items-center px-3 gap-2">
              <div className="w-2.5 h-2.5 border border-accent rounded-full" />
              <div className="w-2.5 h-2.5 border border-accent rounded-full" />
              <div className="w-2.5 h-2.5 bg-accent rounded-full" />
              <span className="mx-auto text-[9px] uppercase tracking-widest text-accent/70">cmd+k — command palette</span>
            </div>

            {/* Input */}
            <div className="flex items-center px-4 py-3 border-b border-accent/30">
              <span className="text-accent mr-3 text-sm">{'>'}</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); setShowHelp(false); }}
                onKeyDown={handleInputKeyDown}
                placeholder="type a command... (try 'help')"
                className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder-accent/30 caret-accent"
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            {/* Results */}
            <div className="max-h-64 overflow-y-auto">
              {showHelp ? (
                <div className="p-4 text-xs space-y-2">
                  <p className="text-accent mb-3">{'>'} AVAILABLE ROUTES:</p>
                  {commands.map((cmd, i) => (
                    <div key={i} className="flex justify-between border-b border-accent/10 pb-1">
                      <span className="text-foreground">{cmd.label}</span>
                      <span className="text-accent/50">{cmd.path}</span>
                    </div>
                  ))}
                  <p className="text-accent/40 mt-3">{'>'} Type a route name or press Esc to close.</p>
                </div>
              ) : filtered.length > 0 ? (
                filtered.map((cmd, i) => (
                  <button
                    key={cmd.path}
                    onClick={() => handleSelect(cmd.path)}
                    className={`w-full text-left px-4 py-2.5 text-sm flex justify-between items-center transition-colors ${
                      i === selectedIndex ? 'bg-accent text-background' : 'hover:bg-accent/10'
                    }`}
                  >
                    <span className="font-bold">{cmd.label}</span>
                    <span className="text-[10px] opacity-60 uppercase tracking-widest">{cmd.desc}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-xs text-accent/40">
                  {query ? 'NO_MATCH_FOUND. Try "help" for available commands.' : 'Start typing to navigate...'}
                </div>
              )}
            </div>

            <div className="px-4 py-2 border-t border-accent/20 text-[9px] text-accent/30 flex justify-between">
              <span>↑↓ navigate</span>
              <span>↵ select</span>
              <span>esc close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
