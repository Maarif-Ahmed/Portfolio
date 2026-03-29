'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, type ForwardedRef } from 'react';
import gsap from 'gsap';

export interface ProjectShaderHandle {
  setHovered: (isHovered: boolean) => void;
}

interface ProjectShaderProps {
  imageUrl: string;
}

const FALLBACK_SURFACE =
  'linear-gradient(135deg, rgba(0,0,0,0.92) 0%, rgba(0,18,22,0.92) 45%, rgba(0,0,0,0.96) 100%)';

function ProjectSignalSurface(
  { imageUrl }: ProjectShaderProps,
  ref: ForwardedRef<ProjectShaderHandle>
) {
  const shellRef = useRef<HTMLDivElement>(null);
  const imagePlateRef = useRef<HTMLDivElement>(null);
  const cyanGhostRef = useRef<HTMLDivElement>(null);
  const magentaGhostRef = useRef<HTMLDivElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      setHovered: (isHovered: boolean) => {
        if (!imagePlateRef.current || !cyanGhostRef.current || !magentaGhostRef.current || !scanRef.current) {
          return;
        }

        gsap.to(imagePlateRef.current, {
          scale: isHovered ? 1.06 : 1,
          xPercent: isHovered ? 1.5 : 0,
          yPercent: isHovered ? -1.5 : 0,
          filter: isHovered
            ? 'brightness(1.08) contrast(1.08) saturate(1.06)'
            : 'brightness(0.96) contrast(1) saturate(0.96)',
          duration: 0.55,
          ease: 'power3.out',
          overwrite: true,
        });

        gsap.to(cyanGhostRef.current, {
          opacity: isHovered ? 0.28 : 0.12,
          xPercent: isHovered ? 2.2 : 0,
          yPercent: isHovered ? -0.8 : 0,
          duration: 0.45,
          ease: 'power2.out',
          overwrite: true,
        });

        gsap.to(magentaGhostRef.current, {
          opacity: isHovered ? 0.16 : 0.05,
          xPercent: isHovered ? -1.8 : 0,
          yPercent: isHovered ? 1 : 0,
          duration: 0.45,
          ease: 'power2.out',
          overwrite: true,
        });

        gsap.to(scanRef.current, {
          opacity: isHovered ? 0.26 : 0.14,
          yPercent: isHovered ? -4 : 0,
          duration: 0.5,
          ease: 'power2.out',
          overwrite: true,
        });
      },
    }),
    []
  );

  useEffect(() => {
    const imagePlate = imagePlateRef.current;
    const cyanGhost = cyanGhostRef.current;
    const magentaGhost = magentaGhostRef.current;
    const scanLayer = scanRef.current;

    return () => {
      gsap.killTweensOf([imagePlate, cyanGhost, magentaGhost, scanLayer]);
    };
  }, []);

  const imageStack = `linear-gradient(180deg, rgba(0,0,0,0.16) 0%, rgba(0,0,0,0.58) 100%), url(${imageUrl}), ${FALLBACK_SURFACE}`;

  return (
    <div ref={shellRef} className="absolute inset-0 h-full w-full pointer-events-none overflow-hidden">
      <div
        ref={imagePlateRef}
        className="absolute inset-0 bg-cover bg-center opacity-90"
        style={{
          backgroundImage: imageStack,
        }}
      />

      <div
        ref={cyanGhostRef}
        className="absolute inset-0 bg-cover bg-center mix-blend-screen opacity-12"
        style={{
          backgroundImage: `radial-gradient(circle at 70% 24%, rgba(0,240,255,0.24), transparent 28%), url(${imageUrl}), ${FALLBACK_SURFACE}`,
        }}
      />

      <div
        ref={magentaGhostRef}
        className="absolute inset-0 bg-cover bg-center mix-blend-screen opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 28% 72%, rgba(255,0,255,0.14), transparent 24%), url(${imageUrl}), ${FALLBACK_SURFACE}`,
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,240,255,0.18),transparent_34%),linear-gradient(180deg,transparent,rgba(0,0,0,0.68))]" />

      <div
        ref={scanRef}
        className="absolute inset-0 opacity-14"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, rgba(224,224,224,0.08) 0px, rgba(224,224,224,0.08) 1px, transparent 1px, transparent 5px)',
        }}
      />
    </div>
  );
}

const ProjectShader = forwardRef<ProjectShaderHandle, ProjectShaderProps>(ProjectSignalSurface);
ProjectShader.displayName = 'ProjectShader';

export default ProjectShader;
