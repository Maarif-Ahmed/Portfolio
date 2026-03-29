'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useRouter } from 'next/navigation';
import { useSudo } from '@/context/SudoContext';

gsap.registerPlugin(ScrollToPlugin);

const COMMAND_REGISTRY: Record<
  string,
  { type: 'scroll' | 'route' | 'action' | 'info'; target?: string; info?: string }
> = {
  hero: { type: 'scroll', target: '#hero' },
  reveal: { type: 'scroll', target: '#hero' },
  story: { type: 'scroll', target: '#story' },
  work: { type: 'scroll', target: '#work' },
  archive: { type: 'scroll', target: '#work' },
  about: { type: 'route', target: '/about' },
  contact: { type: 'scroll', target: '#footer' },
  root: { type: 'route', target: '/' },
  sudo: { type: 'action' },
  clear: { type: 'action' },
  cls: { type: 'action' },
  v: { type: 'info', info: 'MAARIF_OS_v0.3.0-CINEMATIC' },
  version: { type: 'info', info: 'MAARIF_OS_v0.3.0-CINEMATIC' },
  help: {
    type: 'info',
    info: 'available: hero, reveal, story, work, archive, about, contact, root, sudo, clear, version',
  },
};

export default function CommandInput() {
  const [isOpen, setIsOpen] = useState(false);
  const [commandLine, setCommandLine] = useState('');
  const [statusLine, setStatusLine] = useState<string | null>(null);
  const commandFieldRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toggleSudoMode } = useSudo();

  useEffect(() => {
    const openCommandLine = (event: KeyboardEvent) => {
      if ((event.key === '/' || event.key === '`') && !isOpen) {
        event.preventDefault();
        setIsOpen(true);
        window.setTimeout(() => commandFieldRef.current?.focus(), 50);
      }

      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setCommandLine('');
        setStatusLine(null);
      }
    };

    window.addEventListener('keydown', openCommandLine);
    return () => window.removeEventListener('keydown', openCommandLine);
  }, [isOpen]);

  const dispatchCommand = (event: React.FormEvent) => {
    event.preventDefault();
    const processId = commandLine.toLowerCase().trim();

    if (!COMMAND_REGISTRY[processId]) {
      gsap.to(commandFieldRef.current, {
        x: 10,
        repeat: 3,
        yoyo: true,
        duration: 0.05,
        onComplete: () => {
          gsap.set(commandFieldRef.current, { x: 0 });
          setCommandLine('');
        },
      });
      return;
    }

    const terminalProcess = COMMAND_REGISTRY[processId];

    if (terminalProcess.type === 'scroll' && terminalProcess.target) {
      gsap.to(window, {
        duration: 1.35,
        scrollTo: terminalProcess.target,
        ease: 'power4.inOut',
      });
      setIsOpen(false);
    } else if (terminalProcess.type === 'route' && terminalProcess.target) {
      router.push(terminalProcess.target);
      setIsOpen(false);
    } else if (terminalProcess.type === 'action') {
      if (processId === 'sudo') {
        toggleSudoMode();
      }
      setIsOpen(false);
    } else if (terminalProcess.type === 'info' && terminalProcess.info) {
      setStatusLine(terminalProcess.info);
      window.setTimeout(() => {
        setIsOpen(false);
        setStatusLine(null);
      }, 2200);
    }

    setCommandLine('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-12 left-1/2 z-[1000002] w-full max-w-[95vw] -translate-x-1/2 px-4 sm:max-w-[90vw] md:max-w-md md:px-0">
      <form
        onSubmit={dispatchCommand}
        className="flex items-center border border-accent bg-background p-2 shadow-[0_0_30px_rgba(0,240,255,0.18)]"
      >
        <span className="mr-2 animate-pulse text-xs text-accent md:mr-3 md:text-base">{'>'}</span>
        <input
          ref={commandFieldRef}
          value={commandLine}
          onChange={(event) => setCommandLine(event.target.value)}
          placeholder={statusLine || 'RUN_PROCESS...'}
          className={`flex-1 border-none bg-transparent font-mono text-[10px] lowercase text-foreground outline-none placeholder:text-accent/30 md:text-sm ${statusLine ? 'animate-pulse text-accent' : ''}`}
          disabled={Boolean(statusLine)}
        />
        <span className="ml-2 hidden text-[8px] text-accent/40 sm:inline md:text-[10px]">ESC TO CLOSE</span>
      </form>
    </div>
  );
}
