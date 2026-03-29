'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { PROJECTS_BY_ID } from '@/lib/projects';
import { useSudo } from '@/context/SudoContext';

const MATRIX_CHARS = '01SUDO#<>[]{}';

export default function RootEasterEgg() {
  const { sudoMode, activationCount } = useSudo();
  const [dismissedActivation, setDismissedActivation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const secretProject = PROJECTS_BY_ID['5'];
  const isVisible = sudoMode && activationCount !== dismissedActivation;

  useEffect(() => {
    if (!isVisible || !canvasRef.current) return undefined;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return undefined;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();

    const fontSize = 16;
    let columns = Math.ceil(canvas.width / fontSize);
    let drops = Array.from({ length: columns }, () => Math.random() * -50);
    let frameId = 0;

    const draw = () => {
      context.fillStyle = 'rgba(0, 0, 0, 0.08)';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.font = `${fontSize}px var(--font-jetbrains), monospace`;

      drops.forEach((drop, index) => {
        const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
        context.fillStyle = index % 9 === 0 ? '#00F0FF' : '#39FF14';
        context.fillText(char, index * fontSize, drop * fontSize);

        if (drop * fontSize > canvas.height && Math.random() > 0.985) {
          drops[index] = 0;
        }

        drops[index] += 0.65;
      });

      frameId = window.requestAnimationFrame(draw);
    };

    const handleResize = () => {
      resizeCanvas();
      columns = Math.ceil(canvas.width / fontSize);
      drops = Array.from({ length: columns }, () => Math.random() * -50);
    };

    frameId = window.requestAnimationFrame(draw);
    window.addEventListener('resize', handleResize);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[99997] flex items-center justify-center bg-black/82 p-6 backdrop-blur-sm" onClick={() => setDismissedActivation(activationCount)}>
      <canvas ref={canvasRef} className="absolute inset-0 opacity-45" />
      <div
        className="relative w-full max-w-3xl animate-in border border-[#E0E0E0]/28 bg-black/88 shadow-[0_0_70px_rgba(224,224,224,0.08)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex h-9 items-center border-b border-[#E0E0E0]/18 bg-black px-4">
          <div className="flex gap-2">
            <div className="h-3 w-3 rounded-full border border-[#FF00FF] bg-[#FF00FF]/15" />
            <div className="h-3 w-3 rounded-full border border-[#E0E0E0] bg-[#E0E0E0]/10" />
            <button
              onClick={() => setDismissedActivation(activationCount)}
              className="h-3 w-3 rounded-full border border-[#39FF14] bg-[#39FF14]/15 transition-colors hover:bg-[#39FF14]"
            />
          </div>
          <div className="mx-auto font-mono text-[10px] uppercase tracking-[0.34em] text-[#E0E0E0]/72">
            sudo://root/unlocked
          </div>
        </div>

        <div className="relative z-10 px-6 py-6 md:px-8 md:py-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#39FF14] md:text-xs">sudo access granted</p>
          <h2 className="mt-4 text-3xl font-black uppercase tracking-tight text-[#E0E0E0] md:text-5xl">
            Secret Project Unlocked
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#E0E0E0]/72 md:text-base">
            Typing <span className="text-[#00F0FF]">sudo</span> toggles developer mode, unlocks a hidden fifth project,
            and exposes the messier side of the portfolio on purpose.
          </p>

          <div className="mt-8 grid gap-5 border-t border-[#E0E0E0]/12 pt-6 md:grid-cols-[0.65fr_0.35fr]">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#FF00FF]">manifest</p>
              <div className="mt-4 space-y-3 font-mono text-sm text-[#E0E0E0]/78">
                <p>|-- file: {secretProject.fileName}</p>
                <p>|-- title: {secretProject.title}</p>
                <p>|-- status: <span className="text-[#39FF14]">unlocked</span></p>
                <p>|-- palette: cyan / magenta / green / neutral</p>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href={`/work/${secretProject.id}`}
                onClick={() => setDismissedActivation(activationCount)}
                className="block border border-[#E0E0E0] px-4 py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-[#E0E0E0] transition-colors hover:bg-[#E0E0E0] hover:text-black"
              >
                [ open secret case ]
              </Link>
              <button
                onClick={() => setDismissedActivation(activationCount)}
                className="block w-full border border-[#FF00FF]/55 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.3em] text-[#FF00FF] transition-colors hover:bg-[#FF00FF] hover:text-black"
              >
                [ keep browsing ]
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
