'use client';

import { useEffect, useRef, useState } from 'react';

export default function ScanLine() {
  const lineRef = useRef<HTMLDivElement>(null);
  const [mouseY, setMouseY] = useState(0);
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseY(e.clientY);
    };

    const handleClick = () => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 400);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div
      ref={lineRef}
      className="fixed left-0 w-full pointer-events-none z-[99975] transition-all duration-75"
      style={{
        top: mouseY,
        height: isPulsing ? '3px' : '1px',
        background: isPulsing 
          ? 'rgba(224, 224, 224, 0.5)' 
          : 'rgba(224, 224, 224, 0.2)',
        boxShadow: isPulsing 
          ? '0 0 20px rgba(224, 224, 224, 0.4), 0 0 40px rgba(224, 224, 224, 0.2)' 
          : '0 0 6px rgba(224, 224, 224, 0.1)',
        animation: 'scanline-flicker 3s ease-in-out infinite',
      }}
    />
  );
}
