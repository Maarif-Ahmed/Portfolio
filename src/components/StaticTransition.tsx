'use client';

import { useEffect, useRef } from 'react';

export default function StaticTransition({ isVisible, onComplete }: { isVisible: boolean, onComplete?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isVisible || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const duration = 0.2; // 200ms as requested
    const startTime = Date.now();

    let frameId = 0;
    const render = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed >= duration) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (onComplete) onComplete();
        return;
      }

      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      // Create "pixel sorting" / digital static look
      for (let i = 0; i < data.length; i += 4) {
        const val = Math.random() > 0.5 ? 255 : 0;
        const color = Math.random() > 0.9 ? 224 : val; // Occasional cyan tint
        
        data[i] = color;     // R
        data[i + 1] = color; // G
        data[i + 2] = color; // B
        data[i + 3] = 255;   // A
      }

      // Draw random glitch rectangles
      ctx.putImageData(imageData, 0, 0);
      
      ctx.fillStyle = 'rgba(224, 224, 224, 0.2)';
      _drawGlitchRects(ctx, canvas.width, canvas.height);

      frameId = requestAnimationFrame(render);
    };

    const _drawGlitchRects = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      for (let i = 0; i < 5; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const rw = Math.random() * w * 0.5;
        const rh = Math.random() * 20;
        ctx.fillRect(x, y, rw, rh);
      }
    };

    frameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frameId);
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-[9999999] pointer-events-none mix-blend-screen"
    />
  );
}
