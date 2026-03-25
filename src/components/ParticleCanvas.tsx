'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  speed: number;
}

const createParticle = (canvas: HTMLCanvasElement): Particle => {
  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height;

  return {
    x,
    y,
    baseX: x,
    baseY: y,
    size: Math.random() * 1.5 + 0.5,
    speed: Math.random() * 0.5 + 0.2,
  };
};

const updateParticle = (
  particle: Particle,
  mouse: { x: number; y: number },
  canvas: HTMLCanvasElement
) => {
  // Drift upward
  particle.y -= particle.speed;
  if (particle.y < 0) particle.y = canvas.height;

  // Mouse repulsion
  const dx = mouse.x - particle.x;
  const dy = mouse.y - particle.y;
  const distance = Math.hypot(dx, dy);
  const threshold = 100;

  if (distance > 0 && distance < threshold) {
    const force = (threshold - distance) / threshold;
    const directionX = dx / distance;
    const directionY = dy / distance;
    particle.x -= directionX * force * 5;
    particle.y -= directionY * force * 5;
  } else if (particle.x !== particle.baseX) {
    // Return towards vertical line slowly
    const dxBase = particle.baseX - particle.x;
    particle.x += dxBase * 0.02;
  }
};

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    const particleCount = 200;

    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle(canvas));
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    let frameId = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((particle) => {
        updateParticle(particle, mouseRef.current, canvas);
        ctx.fillStyle = 'rgba(0, 224, 255, 0.4)'; // Cyan
        ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
      });
      frameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      className="fixed inset-0 z-[-2] pointer-events-none select-none opacity-50"
    />
  );
}
