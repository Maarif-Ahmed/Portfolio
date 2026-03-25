'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useRouter } from 'next/navigation';
import { useSudo } from '@/context/SudoContext';

gsap.registerPlugin(ScrollToPlugin);

const COMMANDS: Record<string, { type: 'scroll' | 'route' | 'action' | 'info'; target?: string; info?: string }> = {
  work: { type: 'scroll', target: '#work' },
  about: { type: 'route', target: '/about' },
  contact: { type: 'scroll', target: '#footer' },
  hero: { type: 'scroll', target: '#hero' },
  root: { type: 'route', target: '/' },
  sudo: { type: 'action' },
  clear: { type: 'action' },
  cls: { type: 'action' },
  v: { type: 'info', info: 'MAARIF_OS_v0.1.0-STABLE' },
  version: { type: 'info', info: 'MAARIF_OS_v0.1.0-STABLE' },
  help: { type: 'info', info: 'available: work, about, contact, hero, root, sudo, clear, version' },
};

export default function CommandInput() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toggleSudoMode } = useSudo();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow / or ` for terminal
      if ((e.key === '/' || e.key === '`') && !isOpen) {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setInput('');
        setFeedback(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.toLowerCase().trim();
    
    if (COMMANDS[cmd]) {
      const command = COMMANDS[cmd];
      
      if (command.type === 'scroll' && command.target) {
        gsap.to(window, {
          duration: 1.5,
          scrollTo: command.target,
          ease: 'power4.inOut'
        });
        setIsOpen(false);
      } else if (command.type === 'route' && command.target) {
        router.push(command.target);
        setIsOpen(false);
      } else if (command.type === 'action') {
        if (cmd === 'sudo') {
           toggleSudoMode();
           setIsOpen(false);
        } else if (cmd === 'clear' || cmd === 'cls') {
           setIsOpen(false);
        }
      } else if (command.type === 'info' && command.info) {
        setFeedback(command.info);
        setTimeout(() => {
          setIsOpen(false);
          setFeedback(null);
        }, 2000);
      }
      setInput('');
    } else {
      // Shake animation for invalid command
      gsap.to(inputRef.current, {
        x: 10,
        repeat: 3,
        yoyo: true,
        duration: 0.05,
        onComplete: () => {
           gsap.set(inputRef.current, { x: 0 });
           setInput('');
        }
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-md z-[1000002] px-4 md:px-0">
      <form 
        onSubmit={handleSubmit}
        className="bg-background border border-accent p-2 flex items-center shadow-[0_0_30px_rgba(57,255,20,0.2)]"
      >
        <span className="text-accent mr-2 md:mr-3 animate-pulse text-xs md:text-base">{'>'}</span>
        <input 
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={feedback || "ENTER_CMD..."}
          className={`flex-1 bg-transparent border-none outline-none text-[10px] md:text-sm font-mono text-foreground placeholder:text-accent/30 lowercase ${feedback ? 'text-accent animate-pulse' : ''}`}
          disabled={!!feedback}
        />
        <span className="hidden sm:inline text-[8px] md:text-[10px] text-accent/40 ml-2">ESC TO CLOSE</span>
      </form>
    </div>
  );
}
