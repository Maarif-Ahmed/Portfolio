'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { useMotionPreference } from '@/context/MotionContext';

type DepthScanSurfaceProps = {
  imageUrl: string;
  className?: string;
  accentColor?: string;
  loop?: boolean;
  intensity?: number;
};

function supportsWebgl() {
  const probe = document.createElement('canvas');
  return Boolean(probe.getContext('webgl2') || probe.getContext('webgl') || probe.getContext('experimental-webgl'));
}

function ScanPlane({
  imageUrl,
  accentColor,
  loop,
  intensity,
}: {
  imageUrl: string;
  accentColor: string;
  loop: boolean;
  intensity: number;
}) {
  const sourceTexture = useTexture(imageUrl);
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const { size, pointer } = useThree();

  const texture = useMemo(() => {
    const nextTexture = sourceTexture.clone();
    nextTexture.colorSpace = THREE.SRGBColorSpace;
    nextTexture.minFilter = THREE.LinearFilter;
    nextTexture.magFilter = THREE.LinearFilter;
    nextTexture.needsUpdate = true;
    return nextTexture;
  }, [sourceTexture]);

  useEffect(() => {
    return () => {
      texture.dispose();
    };
  }, [texture]);

  const uniforms = useMemo(() => ({
    uMap: { value: texture },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uImageResolution: { value: new THREE.Vector2(1, 1) },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uAccent: { value: new THREE.Color(accentColor) },
    uScan: { value: 0.18 },
    uTime: { value: 0 },
    uStrength: { value: intensity },
  }), [accentColor, intensity, texture]);

  useEffect(() => {
    uniforms.uResolution.value.set(size.width, size.height);
    const source = texture.image as { width?: number; height?: number } | undefined;
    uniforms.uImageResolution.value.set(source?.width ?? size.width, source?.height ?? size.height);
  }, [size.height, size.width, texture, uniforms]);

  useEffect(() => {
    uniforms.uAccent.value.set(accentColor);
  }, [accentColor, uniforms]);

  useEffect(() => {
    const tween = gsap.fromTo(
      uniforms.uScan,
      { value: -0.22 },
      {
        value: 1.16,
        duration: loop ? 3.4 : 1.8,
        ease: 'none',
        repeat: loop ? -1 : 0,
        repeatDelay: loop ? 0.35 : 0,
      }
    );

    return () => {
      tween.kill();
    };
  }, [loop, uniforms]);

  useFrame((_, delta) => {
    const material = materialRef.current;
    if (!material) return;

    material.uniforms.uTime.value += delta;
    material.uniforms.uPointer.value.lerp(pointer, 0.08);
  });

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        transparent: false,
        depthWrite: false,
        depthTest: false,
        vertexShader: /* glsl */ `
          varying vec2 vUv;

          void main() {
            vUv = uv;
            gl_Position = vec4(position.xy, 0.0, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform sampler2D uMap;
          uniform vec2 uResolution;
          uniform vec2 uImageResolution;
          uniform vec2 uPointer;
          uniform vec3 uAccent;
          uniform float uScan;
          uniform float uTime;
          uniform float uStrength;
          varying vec2 vUv;

          float luma(vec3 color) {
            return dot(color, vec3(0.299, 0.587, 0.114));
          }

          vec2 coverUv(vec2 uv, vec2 resolution, vec2 imageResolution) {
            float planeRatio = resolution.x / max(resolution.y, 0.0001);
            float imageRatio = imageResolution.x / max(imageResolution.y, 0.0001);

            if (planeRatio > imageRatio) {
              float scaled = imageRatio / planeRatio;
              uv.y = uv.y * scaled + (1.0 - scaled) * 0.5;
            } else {
              float scaled = planeRatio / imageRatio;
              uv.x = uv.x * scaled + (1.0 - scaled) * 0.5;
            }

            return uv;
          }

          float dotMask(vec2 uv) {
            float ratio = uResolution.x / max(uResolution.y, 0.0001);
            vec2 gridUv = vec2(uv.x * ratio, uv.y) * vec2(110.0, 110.0);
            vec2 cell = fract(gridUv) - 0.5;
            float radius = length(cell);
            return 1.0 - smoothstep(0.12, 0.32, radius);
          }

          float hash(vec2 p) {
            p = fract(p * vec2(123.34, 345.45));
            p += dot(p, p + 34.345);
            return fract(p.x * p.y);
          }

          void main() {
            vec2 baseUv = coverUv(vUv, uResolution, uImageResolution);
            vec4 source = texture2D(uMap, baseUv);
            float depth = luma(source.rgb);

            vec2 pointerOffset = vec2(uPointer.x, -uPointer.y) * 0.018;
            vec2 displacement = pointerOffset * (0.25 + depth * 0.75);
            displacement += vec2(0.0, (depth - 0.5) * uStrength * 0.05);

            float glitchWave = sin(vUv.y * 140.0 + uTime * 18.0) * 0.5 + 0.5;
            float band = smoothstep(uScan - 0.18, uScan - 0.01, vUv.y) * (1.0 - smoothstep(uScan + 0.01, uScan + 0.2, vUv.y));
            float line = smoothstep(0.0, 0.028, 0.028 - abs(vUv.y - uScan));
            float dots = dotMask(vUv) * band;
            float noise = hash(vUv * 240.0 + uTime * 0.04);

            vec2 sampleUv = coverUv(vUv + displacement * (0.25 + band * 0.85), uResolution, uImageResolution);
            vec4 shifted = texture2D(uMap, sampleUv);
            float displacedDepth = luma(shifted.rgb);

            vec3 baseColor = mix(shifted.rgb * 0.32, shifted.rgb, 0.72);
            baseColor *= 0.92 + displacedDepth * 0.14;

            vec3 scanLayer = uAccent * (dots * 0.48 + line * 0.42) + vec3(1.0) * line * 0.06;
            float interference = band * (0.14 + glitchWave * 0.12) + noise * 0.02;

            vec3 finalColor = baseColor;
            finalColor += scanLayer;
            finalColor += uAccent * interference * 0.18;
            finalColor = mix(finalColor, finalColor * 0.84, 0.08);

            gl_FragColor = vec4(finalColor, 1.0);
          }
        `,
      }),
    [uniforms]
  );

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <primitive ref={materialRef} object={material} attach="material" />
    </mesh>
  );
}

export default function DepthScanSurface({
  imageUrl,
  className = '',
  accentColor = '#00F0FF',
  loop = true,
  intensity = 0.85,
}: DepthScanSurfaceProps) {
  const [webglReady, setWebglReady] = useState(false);
  const { motionReduced } = useMotionPreference();

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setWebglReady(supportsWebgl());
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  if (motionReduced || !webglReady) {
    return (
      <div className={`relative overflow-hidden bg-black ${className}`}>
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.54)_52%,rgba(0,0,0,0.88)_100%)]" />
        <div className="absolute inset-x-0 top-[42%] h-px bg-[linear-gradient(90deg,transparent,rgba(0,240,255,0.42),transparent)]" />
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle, rgba(224,224,224,0.18) 0.5px, transparent 0.5px)', backgroundSize: '14px 14px' }} />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-black ${className}`}>
      <Canvas
        orthographic
        camera={{ position: [0, 0, 1], zoom: 1 }}
        dpr={[1, 1.1]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      >
        <ScanPlane imageUrl={imageUrl} accentColor={accentColor} loop={loop} intensity={intensity} />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.52)_48%,rgba(0,0,0,0.88)_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(224,224,224,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(224,224,224,0.06) 1px, transparent 1px)', backgroundSize: '28px 28px', maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.5), rgba(0,0,0,0.08))' }} />
    </div>
  );
}
