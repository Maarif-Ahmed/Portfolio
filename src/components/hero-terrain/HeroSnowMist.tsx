'use client';

import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

function createMistTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Unable to create hero mist texture.');
  }

  const gradient = context.createRadialGradient(256, 210, 20, 256, 256, 235);
  gradient.addColorStop(0, 'rgba(255,255,255,0.96)');
  gradient.addColorStop(0.26, 'rgba(255,255,255,0.82)');
  gradient.addColorStop(0.58, 'rgba(255,255,255,0.34)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export default function HeroSnowMist() {
  const mistTexture = useMemo(() => createMistTexture(), []);

  useEffect(() => {
    return () => {
      mistTexture.dispose();
    };
  }, [mistTexture]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.16, 0]}>
      <planeGeometry args={[16, 16, 1, 1]} />
      <meshBasicMaterial
        map={mistTexture}
        transparent
        opacity={0.16}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
