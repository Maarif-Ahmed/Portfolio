'use client';

import {
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type MouseEvent,
} from 'react';
import { useAudio } from '@/context/AudioContext';

const GLYPHS = '!<>-_\\/[]{}=+*^?#';

interface ScrambleHoverProps {
  className?: string;
  duration?: number;
  href?: string;
  onFocus?: (event: FocusEvent<HTMLElement>) => void;
  onMouseEnter?: (event: MouseEvent<HTMLElement>) => void;
  rel?: string;
  target?: string;
  text: string;
}

function scrambleText(text: string, revealCount: number) {
  return text
    .split('')
    .map((char, index) => {
      if (char === ' ') return char;
      if (index < revealCount) return text[index];
      return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    })
    .join('');
}

export default function ScrambleHover({
  className,
  duration = 400,
  href,
  onFocus,
  onMouseEnter,
  rel,
  target,
  text,
}: ScrambleHoverProps) {
  const [displayText, setDisplayText] = useState(text);
  const frameRef = useRef<number | null>(null);
  const { playBlip } = useAudio();

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const startScramble = () => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
    }

    let startTime = 0;

    const tick = (now: number) => {
      if (startTime === 0) {
        startTime = now;
      }

      const progress = Math.min((now - startTime) / duration, 1);
      const revealCount = Math.floor(progress * text.length);
      setDisplayText(scrambleText(text, revealCount));

      if (progress < 1) {
        frameRef.current = window.requestAnimationFrame(tick);
      } else {
        setDisplayText(text);
        frameRef.current = null;
      }
    };

    setDisplayText(scrambleText(text, 0));
    frameRef.current = window.requestAnimationFrame(tick);
  };

  const content = (
    <span aria-hidden="true" className="inline-block whitespace-pre">
      {displayText}
    </span>
  );

  if (href) {
    return (
      <a
        aria-label={text}
        className={className}
        href={href}
        rel={rel}
        target={target}
        onFocus={(event) => {
          onFocus?.(event);
          playBlip();
          startScramble();
        }}
        onMouseEnter={(event) => {
          onMouseEnter?.(event);
          playBlip();
          startScramble();
        }}
      >
        {content}
      </a>
    );
  }

  return (
    <span
      aria-label={text}
      className={className}
      onFocus={(event) => {
        onFocus?.(event);
        playBlip();
        startScramble();
      }}
      onMouseEnter={(event) => {
        onMouseEnter?.(event);
        playBlip();
        startScramble();
      }}
    >
      {content}
    </span>
  );
}
