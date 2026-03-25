'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const chars = '!<>-_\\\\/[]{}—=+*^?#_';

export default function DecipherText({ text, delay = 0, className = '' }: { text: string, delay?: number, className?: string }) {
  const [displayText, setDisplayText] = useState(text.replace(/[^\s]/g, '_'));
  const targetTextRef = useRef(text);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const targetText = targetTextRef.current;
    
    const timeout = setTimeout(() => {
      gsap.to({}, {
        duration: 1.5,
        onUpdate: function() {
          const progress = this.progress();
          const revealCount = Math.floor(progress * targetText.length);
          
          let currentStr = "";
          for(let i=0; i<targetText.length; i++) {
             if (i < revealCount) {
                 currentStr += targetText[i];
             } else if (targetText[i] === " ") {
                 currentStr += " ";
             } else {
                 currentStr += chars[Math.floor(Math.random() * chars.length)];
             }
          }
          setDisplayText(currentStr);
        },
        ease: 'power2.inOut'
      });
    }, delay * 1000);

    return () => clearTimeout(timeout);
  }, [delay]);

  return <span ref={containerRef} className={className}>{displayText}</span>;
}
