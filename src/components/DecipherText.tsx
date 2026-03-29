'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useAudio } from '@/context/AudioContext';

const CHARS = '!<>-_\\/[]{}=+*^?#_';

interface DecipherTextProps {
  text: string;
  delay?: number;
  className?: string;
}

export default function DecipherText({ text, delay = 0, className = '' }: DecipherTextProps) {
  const [displayText, setDisplayText] = useState(text.replace(/[^\s]/g, '_'));
  const lastRevealRef = useRef(0);
  const { playTypingTick } = useAudio();

  useEffect(() => {
    lastRevealRef.current = 0;
    setDisplayText(text.replace(/[^\s]/g, '_'));

    const tween = gsap.to({ progress: 0 }, {
      progress: 1,
      duration: 1.5,
      delay,
      ease: 'power2.inOut',
      onUpdate() {
        const progress = this.targets()[0] as { progress: number };
        const revealCount = Math.floor(progress.progress * text.length);

        if (revealCount > lastRevealRef.current) {
          for (let index = lastRevealRef.current; index < revealCount; index += 1) {
            if (text[index] && text[index] !== ' ') {
              playTypingTick();
            }
          }
          lastRevealRef.current = revealCount;
        }

        let current = '';
        for (let index = 0; index < text.length; index += 1) {
          if (index < revealCount) {
            current += text[index];
          } else if (text[index] === ' ') {
            current += ' ';
          } else {
            current += CHARS[Math.floor(Math.random() * CHARS.length)];
          }
        }

        setDisplayText(current);
      },
      onComplete() {
        setDisplayText(text);
      },
    });

    return () => {
      tween.kill();
    };
  }, [delay, playTypingTick, text]);

  return <span className={className}>{displayText}</span>;
}
