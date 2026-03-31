import * as THREE from 'three';
import { HERO_TERRAIN_CONFIG } from '@/lib/heroTerrainConfig';

export function lerpAngle(currentAngle: number, nextAngle: number, amount: number) {
  const difference = nextAngle - currentAngle;
  const shortestAngle =
    ((((difference + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) - Math.PI;

  return currentAngle + shortestAngle * amount;
}

export function applySnowDeformation(
  chunk: THREE.Mesh,
  worldPoint: THREE.Vector3,
  tempVertex: THREE.Vector3
) {
  const geometry = chunk.geometry;
  const positionAttribute = geometry.getAttribute('position');

  if (!(positionAttribute instanceof THREE.BufferAttribute)) {
    return false;
  }

  const vertices = positionAttribute.array as Float32Array;
  let hasDeformation = false;

  for (let index = 0; index < positionAttribute.count; index += 1) {
    tempVertex.fromArray(vertices, index * 3);
    chunk.localToWorld(tempVertex);

    const distance = tempVertex.distanceTo(worldPoint);
    if (distance >= HERO_TERRAIN_CONFIG.deformation.radius) {
      continue;
    }

    const normalizedDistance =
      (HERO_TERRAIN_CONFIG.deformation.radius - distance) / HERO_TERRAIN_CONFIG.deformation.radius;
    const influence = normalizedDistance ** 3;

    tempVertex.y -=
      influence *
      HERO_TERRAIN_CONFIG.deformation.depthStrength *
      Math.sin((distance / HERO_TERRAIN_CONFIG.deformation.radius) * Math.PI);

    tempVertex.y +=
      HERO_TERRAIN_CONFIG.deformation.waveAmplitude *
      Math.sin(HERO_TERRAIN_CONFIG.deformation.waveFrequency * distance);

    chunk.worldToLocal(tempVertex);
    tempVertex.toArray(vertices, index * 3);
    hasDeformation = true;
  }

  if (!hasDeformation) {
    return false;
  }

  positionAttribute.needsUpdate = true;
  geometry.computeVertexNormals();
  return true;
}
