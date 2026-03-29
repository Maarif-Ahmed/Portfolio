'use client';

import { useEffect, useRef } from 'react';

interface DustParticle {
  alpha: number;
  drag: number;
  gravity: number;
  life: number;
  maxLife: number;
  radius: number;
  sway: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
}

interface HeroProgressEventDetail {
  progress: number;
}

interface HeroDetonationEventDetail {
  intensity: number;
  progress: number;
  x: number;
  y: number;
}

function randomRange(minValue: number, maxValue: number) {
  return minValue + Math.random() * (maxValue - minValue);
}

export default function HeroDustOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dustFieldRef = useRef<DustParticle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef(0);
  const lastProgressRef = useRef(0);
  const activeRef = useRef(false);
  const resetQueuedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext('2d');
    if (!context) return undefined;

    const sizeCanvas = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * pixelRatio);
      canvas.height = Math.floor(window.innerHeight * pixelRatio);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const clearField = () => {
      dustFieldRef.current = [];
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      activeRef.current = false;
      resetQueuedRef.current = false;
    };

    const spawnBurst = (detonationPoint: HeroDetonationEventDetail) => {
      const centerX = detonationPoint.x;
      const centerY = detonationPoint.y;
      const particleCount = Math.max(80, Math.floor(window.innerWidth * 0.1));
      const nextField: DustParticle[] = [];

      for (let index = 0; index < particleCount; index += 1) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = randomRange(80, 240) * detonationPoint.intensity;
        const radialBias = randomRange(0.5, 0.84);
        nextField.push({
          x: centerX + Math.cos(angle) * randomRange(6, 24),
          y: centerY + Math.sin(angle) * randomRange(6, 24),
          vx: Math.cos(angle) * velocity * radialBias,
          vy: Math.sin(angle) * velocity * radialBias - randomRange(22, 96),
          radius: randomRange(0.8, 2.8),
          life: 0,
          maxLife: randomRange(4.8, 8.2),
          alpha: randomRange(0.1, 0.26),
          drag: randomRange(0.954, 0.982),
          gravity: randomRange(120, 190),
          sway: randomRange(-10, 10),
        });
      }

      dustFieldRef.current = nextField;
      activeRef.current = true;
      resetQueuedRef.current = false;
    };

    const step = (timestamp: number) => {
      const deltaSeconds = Math.min((timestamp - lastTimestampRef.current || 16) / 1000, 0.032);
      lastTimestampRef.current = timestamp;

      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (activeRef.current) {
        const nextField: DustParticle[] = [];

        for (const dustParticle of dustFieldRef.current) {
          const nextParticle = dustParticle;
          nextParticle.life += deltaSeconds;
          nextParticle.vx *= nextParticle.drag;
          nextParticle.vy += nextParticle.gravity * deltaSeconds;
          const lifeRatio = nextParticle.life / nextParticle.maxLife;
          nextParticle.x += nextParticle.vx * deltaSeconds + nextParticle.sway * lifeRatio * deltaSeconds;
          nextParticle.y += nextParticle.vy * deltaSeconds;

          const fade = Math.max(0, 1 - lifeRatio);
          const drawAlpha = nextParticle.alpha * Math.pow(fade, 1.7);

          if (drawAlpha > 0.014 && nextParticle.y < window.innerHeight + 120) {
            context.beginPath();
            context.fillStyle = `rgba(214, 208, 198, ${drawAlpha * 0.42})`;
            context.shadowColor = `rgba(0, 240, 255, ${drawAlpha * 0.06})`;
            context.shadowBlur = 4 * fade;
            context.arc(nextParticle.x, nextParticle.y, nextParticle.radius * (0.82 + fade * 0.24), 0, Math.PI * 2);
            context.fill();
            nextField.push(nextParticle);
          }
        }

        context.shadowBlur = 0;
        dustFieldRef.current = nextField;

        if (dustFieldRef.current.length === 0) {
          activeRef.current = false;
        }
      }

      animationFrameRef.current = window.requestAnimationFrame(step);
    };

    const handleDetonation = (event: Event) => {
      const detonationEvent = event as CustomEvent<HeroDetonationEventDetail>;
      spawnBurst(detonationEvent.detail);
    };

    const handleHeroProgress = (event: Event) => {
      const heroEvent = event as CustomEvent<HeroProgressEventDetail>;
      const progressValue = heroEvent.detail?.progress ?? 0;

      if (progressValue < 0.6 && lastProgressRef.current >= 0.6) {
        resetQueuedRef.current = true;
      }

      if (resetQueuedRef.current && progressValue < 0.2) {
        clearField();
      }

      lastProgressRef.current = progressValue;
    };

    sizeCanvas();
    animationFrameRef.current = window.requestAnimationFrame(step);
    window.addEventListener('resize', sizeCanvas);
    window.addEventListener('hero-detonation', handleDetonation as EventListener);
    window.addEventListener('hero-sequence-progress', handleHeroProgress as EventListener);

    return () => {
      window.removeEventListener('resize', sizeCanvas);
      window.removeEventListener('hero-detonation', handleDetonation as EventListener);
      window.removeEventListener('hero-sequence-progress', handleHeroProgress as EventListener);
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      clearField();
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-30" aria-hidden="true" />;
}
