'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const RIDGES = [
  { position: [-124, -34, -320], scale: [148, 10, 34], rotation: [0.02, 0.18, 0] },
  { position: [132, -36, -336], scale: [154, 11, 36], rotation: [-0.03, -0.2, 0] },
  { position: [0, -40, -412], scale: [236, 14, 52], rotation: [0.01, 0.03, 0] },
  { position: [-188, -39, -438], scale: [210, 12, 44], rotation: [0, 0.1, 0] },
  { position: [192, -41, -452], scale: [224, 12, 48], rotation: [0, -0.08, 0] },
] as const;

function seededNoise(seed: number) {
  const raw = Math.sin(seed * 12.9898) * 43758.5453123;
  return raw - Math.floor(raw);
}

export default function HeroSnowBackdrop() {
  const flurryRef = useRef<THREE.Points>(null);
  const flurryPositions = useMemo(() => {
    const positions = new Float32Array(160 * 3);

    for (let index = 0; index < 160; index += 1) {
      const xNoise = seededNoise(index + 1);
      const yNoise = seededNoise(index + 101);
      const zNoise = seededNoise(index + 201);
      positions[index * 3] = (xNoise - 0.5) * 180;
      positions[index * 3 + 1] = yNoise * 38 + 4;
      positions[index * 3 + 2] = -zNoise * 220 - 12;
    }

    return positions;
  }, []);

  useFrame((_, delta) => {
    const flurry = flurryRef.current;
    if (!flurry) return;

    const position = flurry.geometry.getAttribute('position');
    if (!(position instanceof THREE.BufferAttribute)) return;

    for (let index = 0; index < position.count; index += 1) {
      const y = position.getY(index) - delta * (0.35 + (index % 5) * 0.04);
      const x = position.getX(index) + Math.sin(index * 0.7 + performance.now() * 0.0004) * delta * 0.06;
      position.setY(index, y < -1 ? 34 + (index % 7) : y);
      position.setX(index, x);
    }

    position.needsUpdate = true;
  });

  return (
    <group>
      {RIDGES.map((ridge, index) => (
        <mesh
          key={`${ridge.position.join('-')}-${index}`}
          position={ridge.position as [number, number, number]}
          rotation={ridge.rotation as [number, number, number]}
          scale={ridge.scale as [number, number, number]}
          castShadow={false}
          receiveShadow={false}
        >
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={index > 1 ? '#d8e0e5' : '#e2e8ec'}
            roughness={1}
            metalness={0}
            flatShading
          />
        </mesh>
      ))}

      <points ref={flurryRef} position={[0, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[flurryPositions, 3]}
            count={flurryPositions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial color="#ffffff" size={0.18} sizeAttenuation transparent opacity={0.4} depthWrite={false} />
      </points>
    </group>
  );
}
