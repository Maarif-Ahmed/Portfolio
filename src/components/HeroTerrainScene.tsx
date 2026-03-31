'use client';

import { AdaptiveDpr } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useState } from 'react';
import * as THREE from 'three';
import HeroSnowBackdrop from '@/components/hero-terrain/HeroSnowBackdrop';
import HeroTerrainFallback from '@/components/hero-terrain/HeroTerrainFallback';
import HeroTerrainWorld from '@/components/hero-terrain/HeroTerrainWorld';
import { HERO_TERRAIN_CONFIG } from '@/lib/heroTerrainConfig';

interface HeroTerrainSceneProps {
  motionReduced: boolean;
  sceneActive: boolean;
  onInputDetected?: () => void;
}

function supportsWebgl() {
  const canvas = document.createElement('canvas');
  return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
}

export default function HeroTerrainScene({
  motionReduced,
  sceneActive,
  onInputDetected,
}: HeroTerrainSceneProps) {
  const [webglReady, setWebglReady] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setWebglReady(supportsWebgl());
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  if (!webglReady) {
    return <HeroTerrainFallback />;
  }

  return (
    <Canvas
      shadows
      camera={{
        fov: HERO_TERRAIN_CONFIG.camera.fov,
        position: HERO_TERRAIN_CONFIG.camera.basePosition,
        near: 0.1,
        far: 1000,
      }}
      dpr={[
        1,
        motionReduced
          ? HERO_TERRAIN_CONFIG.performance.mobileMaxDpr
          : HERO_TERRAIN_CONFIG.performance.desktopMaxDpr,
      ]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.03;
      }}
      frameloop={sceneActive ? 'always' : 'demand'}
    >
      <AdaptiveDpr />
      <color attach="background" args={['#eef3f6']} />
      <fog attach="fog" args={['#eef3f6', 80, 240]} />
      <directionalLight
        position={HERO_TERRAIN_CONFIG.lighting.directionalPosition}
        intensity={HERO_TERRAIN_CONFIG.lighting.directionalIntensity}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={140}
        shadow-camera-left={-48}
        shadow-camera-right={48}
        shadow-camera-top={48}
        shadow-camera-bottom={-48}
        shadow-bias={-0.00008}
        shadow-normalBias={0.02}
      />
      <directionalLight
        position={HERO_TERRAIN_CONFIG.lighting.fillPosition}
        intensity={HERO_TERRAIN_CONFIG.lighting.fillIntensity}
      />
      <hemisphereLight
        args={[
          HERO_TERRAIN_CONFIG.lighting.hemisphereSky,
          HERO_TERRAIN_CONFIG.lighting.hemisphereGround,
          HERO_TERRAIN_CONFIG.lighting.hemisphereIntensity,
        ]}
      />
      <ambientLight intensity={HERO_TERRAIN_CONFIG.lighting.ambientIntensity} />

      <Suspense fallback={null}>
        <HeroSnowBackdrop />
        <HeroTerrainWorld sceneActive={sceneActive} onInputDetected={onInputDetected} />
      </Suspense>
    </Canvas>
  );
}
