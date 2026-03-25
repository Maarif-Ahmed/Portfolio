'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAudio } from '@/context/AudioContext';

const LINKS = [
  { label: 'ARCHIVE', href: '/about', ext: '.tsx', size: '1.2kb' },
  { label: 'SOURCE', href: '#', ext: '.git', size: '4.8mb' },
  { label: 'PING', href: 'mailto:contact@maarif.digital', ext: '.sh', size: '0.4kb' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { playBlip } = useAudio();

  return (
    <nav className="fixed top-0 w-full px-6 py-5 md:px-20 z-[99990] flex justify-between items-center mix-blend-difference text-white">
      <Link 
        href="/" 
        onMouseEnter={playBlip}
        className="font-bold text-lg md:text-xl tracking-tighter uppercase cursor-pointer glitch-link" 
        data-text="[ SYS_ROOT ]"
      >
        [ SYS_ROOT ]
      </Link>
      
      <div className="flex gap-4 md:gap-8">
        <button 
          onClick={() => { setIsOpen(!isOpen); playBlip(); }}
          onMouseEnter={playBlip}
          className="text-[10px] md:text-xs font-bold uppercase tracking-widest cursor-pointer hover:text-accent transition-colors"
        >
          [ {isOpen ? 'CLOSE_MENU' : 'OPEN_MENU'} ]
        </button>
      </div>

      {/* Fullscreen Overlay Menu */}
      <div className={`fixed inset-0 bg-background z-[100] transition-transform duration-500 flex flex-col items-center justify-center ${isOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="flex flex-col gap-6 md:gap-10 items-center">
          {isOpen && LINKS.map((link, i) => (
            <TypewriterLink key={i} link={link} index={i} onClick={() => setIsOpen(false)} playBlip={playBlip} />
          ))}
        </div>
        <button 
          onClick={() => { setIsOpen(false); playBlip(); }}
          onMouseEnter={playBlip}
          className="absolute bottom-20 text-xs font-mono text-accent/40 hover:text-accent transition-colors"
        >
          {'>'} EXIT_PROCESS();
        </button>
      </div>
    </nav>
  );
}

function TypewriterLink({ link, index, onClick, playBlip }: { link: typeof LINKS[0], index: number, onClick: () => void, playBlip: () => void }) {
  const [text, setText] = useState('');
  const fullText = link.label;

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      if (current <= fullText.length) {
        setText(fullText.slice(0, current));
        current++;
      } else {
        clearInterval(interval);
      }
    }, 50 + index * 20);
    return () => clearInterval(interval);
  }, [fullText, index]);

  return (
    <Link 
      href={link.href} 
      onClick={onClick}
      onMouseEnter={playBlip}
      className="group flex flex-col items-center md:flex-row md:items-baseline gap-2 md:gap-4"
    >
      <span className="text-[9vw] sm:text-4xl md:text-7xl font-black uppercase tracking-tighter hover:text-accent transition-colors">
        {text}<span className="inline-block w-2 md:w-4 h-[7vw] sm:h-8 md:h-14 bg-accent animate-pulse align-middle ml-1" />
      </span>
      <span className="text-[10px] md:text-xs font-mono text-accent/20 group-hover:text-accent/60 transition-colors">
        {link.ext} — {link.size}
      </span>
    </Link>
  );
}
