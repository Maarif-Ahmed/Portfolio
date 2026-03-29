'use client';

import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { AdaptiveDpr, useGLTF } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshSurfaceSampler, mergeBufferGeometries } from 'three-stdlib';
import * as THREE from 'three';
import type { GLTF } from 'three-stdlib';
import { useAudio } from '@/context/AudioContext';
import type { ChamberMode } from '@/context/ChamberContext';

interface AxisVector {
  x: number;
  y: number;
}

interface HeroSignalSceneProps {
  progressRef: MutableRefObject<number>;
  pointerRef: MutableRefObject<AxisVector>;
  motionReduced: boolean;
  chamberMode: ChamberMode;
}

type SkullAsset = GLTF & {
  scene: THREE.Group;
};

interface SkullUniforms {
  uTime: { value: number };
  uProgress: { value: number };
  uPointer: { value: THREE.Vector2 };
  uAudio: { value: number };
  uTalk: { value: number };
}

interface ShellFragmentPayload {
  bursts: Float32Array;
  origins: Float32Array;
  scales: Float32Array;
  spins: Float32Array;
}

interface BoneTextureSet {
  albedo: THREE.CanvasTexture;
  roughness: THREE.CanvasTexture;
}

const skullVertexShader = `
  uniform float uTime;
  uniform float uProgress;
  uniform vec2 uPointer;
  uniform float uAudio;
  uniform float uTalk;

  attribute vec3 aNormal;
  attribute vec3 aBurst;
  attribute float aSeed;
  attribute float aSize;

  varying float vAlpha;
  varying float vBurst;
  varying float vExpand;
  varying float vTalk;

  vec3 mod289(vec3 value) {
    return value - floor(value * (1.0 / 289.0)) * 289.0;
  }

  vec4 mod289(vec4 value) {
    return value - floor(value * (1.0 / 289.0)) * 289.0;
  }

  vec4 permute(vec4 value) {
    return mod289(((value * 34.0) + 1.0) * value);
  }

  vec4 taylorInvSqrt(vec4 value) {
    return 1.79284291400159 - 0.85373472095314 * value;
  }

  float snoise(vec3 value) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 base = floor(value + dot(value, C.yyy));
    vec3 initial = value - base + dot(base, C.xxx);
    vec3 gate = step(initial.yzx, initial.xyz);
    vec3 low = 1.0 - gate;
    vec3 offsetOne = min(gate.xyz, low.zxy);
    vec3 offsetTwo = max(gate.xyz, low.zxy);
    vec3 offsetA = initial - offsetOne + C.xxx;
    vec3 offsetB = initial - offsetTwo + C.yyy;
    vec3 offsetC = initial - D.yyy;

    base = mod289(base);
    vec4 hash = permute(permute(permute(
      base.z + vec4(0.0, offsetOne.z, offsetTwo.z, 1.0))
      + base.y + vec4(0.0, offsetOne.y, offsetTwo.y, 1.0))
      + base.x + vec4(0.0, offsetOne.x, offsetTwo.x, 1.0));

    float shard = 0.142857142857;
    vec3 stretch = shard * D.wyz - D.xzx;
    vec4 strip = hash - 49.0 * floor(hash * stretch.z * stretch.z);
    vec4 gridX = floor(strip * stretch.z);
    vec4 gridY = floor(strip - 7.0 * gridX);
    vec4 skewX = gridX * stretch.x + stretch.yyyy;
    vec4 skewY = gridY * stretch.x + stretch.yyyy;
    vec4 ridge = 1.0 - abs(skewX) - abs(skewY);

    vec4 braidA = vec4(skewX.xy, skewY.xy);
    vec4 braidB = vec4(skewX.zw, skewY.zw);
    vec4 signA = floor(braidA) * 2.0 + 1.0;
    vec4 signB = floor(braidB) * 2.0 + 1.0;
    vec4 shield = -step(ridge, vec4(0.0));

    vec4 flowA = braidA.xzyw + signA.xzyw * shield.xxyy;
    vec4 flowB = braidB.xzyw + signB.xzyw * shield.zzww;

    vec3 sampleA = vec3(flowA.xy, ridge.x);
    vec3 sampleB = vec3(flowA.zw, ridge.y);
    vec3 sampleC = vec3(flowB.xy, ridge.z);
    vec3 sampleD = vec3(flowB.zw, ridge.w);

    vec4 norm = taylorInvSqrt(vec4(
      dot(sampleA, sampleA),
      dot(sampleB, sampleB),
      dot(sampleC, sampleC),
      dot(sampleD, sampleD)
    ));

    sampleA *= norm.x;
    sampleB *= norm.y;
    sampleC *= norm.z;
    sampleD *= norm.w;

    vec4 mask = max(0.6 - vec4(
      dot(initial, initial),
      dot(offsetA, offsetA),
      dot(offsetB, offsetB),
      dot(offsetC, offsetC)
    ), 0.0);

    mask = mask * mask;

    return 42.0 * dot(mask * mask, vec4(
      dot(sampleA, initial),
      dot(sampleB, offsetA),
      dot(sampleC, offsetB),
      dot(sampleD, offsetC)
    ));
  }

  mat2 rotate2d(float angle) {
    float sine = sin(angle);
    float cosine = cos(angle);
    return mat2(cosine, -sine, sine, cosine);
  }

  vec3 rotateAroundX(vec3 point, float angle, vec3 pivot) {
    point -= pivot;
    float cosine = cos(angle);
    float sine = sin(angle);
    point = vec3(
      point.x,
      point.y * cosine - point.z * sine,
      point.y * sine + point.z * cosine
    );
    point += pivot;
    return point;
  }

  vec3 curlField(vec3 point) {
    float stepSize = 0.18;
    vec3 dx = vec3(stepSize, 0.0, 0.0);
    vec3 dy = vec3(0.0, stepSize, 0.0);
    vec3 dz = vec3(0.0, 0.0, stepSize);

    float x0 = snoise(point - dy);
    float x1 = snoise(point + dy);
    float x2 = snoise(point - dz);
    float x3 = snoise(point + dz);
    float y0 = snoise(point - dz + 11.0);
    float y1 = snoise(point + dz + 11.0);
    float y2 = snoise(point - dx + 11.0);
    float y3 = snoise(point + dx + 11.0);
    float z0 = snoise(point - dx + 23.0);
    float z1 = snoise(point + dx + 23.0);
    float z2 = snoise(point - dy + 23.0);
    float z3 = snoise(point + dy + 23.0);

    return normalize(vec3(
      (x1 - x0) - (x3 - x2),
      (y1 - y0) - (y3 - y2),
      (z1 - z0) - (z3 - z2)
    ) / (2.0 * stepSize + 0.0001));
  }

  void main() {
    float approach = smoothstep(0.08, 0.68, uProgress);
    float detonate = smoothstep(0.72, 0.98, uProgress);
    float dustReveal = smoothstep(0.79, 0.88, uProgress);
    float dustSettle = smoothstep(0.88, 1.0, uProgress);
    vec3 burstDirection = normalize(aBurst + vec3(0.0001, 0.0001, 0.0001));

    float lowerMask = (1.0 - smoothstep(-0.05, 0.58, position.y)) * smoothstep(-0.24, 0.42, position.z);
    float speechPulse = sin(uTime * 11.0 + aSeed * 3.2) * 0.5 + 0.5;
    float talkAngle = uTalk * speechPulse * 0.32 * lowerMask;
    vec3 livePosition = rotateAroundX(position, talkAngle, vec3(0.0, -0.34, 0.18));

    vec2 pointerField = uPointer * vec2(1.85, 1.35);
    vec2 repelDelta = livePosition.xy - pointerField;
    float repelDistance = length(repelDelta);
    float repelForce = (1.0 - smoothstep(0.24, 2.1, repelDistance)) * (1.0 - detonate);
    livePosition.xy += normalize(repelDelta + vec2(0.0001, 0.0001)) * repelForce * (0.06 + aSeed * 0.16);

    livePosition.xz = rotate2d(uPointer.x * 0.16 + uProgress * 0.28) * livePosition.xz;
    livePosition.yz = rotate2d(uPointer.y * -0.1 + sin(uTime * 0.22) * 0.05) * livePosition.yz;

    vec3 detonationPosition = position;
    detonationPosition += burstDirection * (1.35 + aSeed * 2.35 + detonate * (7.6 + aSeed * 10.8));
    detonationPosition += curlField(detonationPosition * 0.54 + vec3(uTime * 0.34, -uTime * 0.18, uTime * 0.22) + aSeed * 19.0) * (0.78 + aSeed * 1.12);
    detonationPosition += burstDirection * dustSettle * (0.58 + aSeed * 1.42);
    detonationPosition.y += detonate * (0.18 + aSeed * 0.34);
    detonationPosition.y -= dustSettle * dustSettle * (1.4 + aSeed * 2.1);
    detonationPosition.xz = rotate2d(uTime * 0.18 + aSeed * 2.8) * detonationPosition.xz;

    vec3 finalPosition = mix(livePosition, detonationPosition, detonate);

    vExpand = approach;
    vBurst = detonate;
    vTalk = 0.0;
    vAlpha = dustReveal * (1.0 - dustSettle * 0.26);

    vec4 modelViewPosition = modelViewMatrix * vec4(finalPosition, 1.0);
    float size = aSize * mix(1.26, 0.62, dustSettle);
    size *= dustReveal * (1.0 + uAudio * 0.16);

    gl_PointSize = size * (150.0 / max(-modelViewPosition.z, 0.0001));
    gl_Position = projectionMatrix * modelViewPosition;
  }
`;

const skullFragmentShader = `
  uniform float uAudio;

  varying float vAlpha;
  varying float vBurst;
  varying float vExpand;
  varying float vTalk;

  void main() {
    vec2 pointUv = gl_PointCoord - 0.5;
    float radius = length(pointUv);

    if (radius > 0.5) {
      discard;
    }

    float halo = 1.0 - smoothstep(0.0, 0.5, radius);
    float core = 1.0 - smoothstep(0.0, 0.18, radius);
    float edge = smoothstep(0.12, 0.5, radius);

    vec3 baseColor = mix(vec3(0.14, 0.15, 0.16), vec3(0.76, 0.76, 0.74), core);
    baseColor += vec3(0.05, 0.05, 0.05) * vExpand * 0.04;
    baseColor += vec3(0.0, 0.14, 0.18) * edge * (vBurst * 0.24);
    baseColor = mix(baseColor, vec3(0.88), uAudio * core * 0.14);
    baseColor *= mix(1.0, 0.86, vTalk);

    float alpha = pow(halo, 2.4) * vAlpha * 0.4;

    gl_FragColor = vec4(baseColor, alpha);
  }
`;

useGLTF.preload('/models/skull.glb');

function seededRandom(seedValue: number) {
  let seed = seedValue >>> 0;

  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function collectSkullMeshes(scene: THREE.Group) {
  const skullMeshes: THREE.Mesh[] = [];

  scene.updateWorldMatrix(true, true);
  scene.traverse((node) => {
    if ((node as THREE.Mesh).isMesh) {
      skullMeshes.push(node as THREE.Mesh);
    }
  });

  return skullMeshes;
}

function measureSkullFrame(scene: THREE.Group) {
  const worldBounds = new THREE.Box3().setFromObject(scene);
  const centerPoint = new THREE.Vector3();
  const boundsSize = new THREE.Vector3();

  worldBounds.getCenter(centerPoint);
  worldBounds.getSize(boundsSize);

  return {
    centerPoint,
    scaleFactor: 3.35 / Math.max(boundsSize.x, boundsSize.y, boundsSize.z, 0.001),
  };
}

function measureMeshArea(mesh: THREE.Mesh) {
  const sourceGeometry = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry;
  const positionAttribute = sourceGeometry.getAttribute('position') as THREE.BufferAttribute | undefined;

  if (!positionAttribute) {
    if (sourceGeometry !== mesh.geometry) {
      sourceGeometry.dispose();
    }

    return 0;
  }

  mesh.updateWorldMatrix(true, false);

  const pointA = new THREE.Vector3();
  const pointB = new THREE.Vector3();
  const pointC = new THREE.Vector3();
  const edgeA = new THREE.Vector3();
  const edgeB = new THREE.Vector3();
  let totalArea = 0;

  for (let index = 0; index < positionAttribute.count; index += 3) {
    pointA.fromBufferAttribute(positionAttribute, index).applyMatrix4(mesh.matrixWorld);
    pointB.fromBufferAttribute(positionAttribute, index + 1).applyMatrix4(mesh.matrixWorld);
    pointC.fromBufferAttribute(positionAttribute, index + 2).applyMatrix4(mesh.matrixWorld);

    edgeA.subVectors(pointB, pointA);
    edgeB.subVectors(pointC, pointA);
    totalArea += edgeA.cross(edgeB).length() * 0.5;
  }

  if (sourceGeometry !== mesh.geometry) {
    sourceGeometry.dispose();
  }

  return totalArea;
}

function buildSkullGeometry(scene: THREE.Group) {
  const skullMeshes = collectSkullMeshes(scene);

  if (skullMeshes.length === 0) {
    return null;
  }

  const rng = seededRandom(20260328);
  const targetParticleCount = 9000;
  const { centerPoint, scaleFactor } = measureSkullFrame(scene);
  const meshAreas = skullMeshes.map((skullMesh) => measureMeshArea(skullMesh));
  const totalArea = meshAreas.reduce((areaTotal, meshArea) => areaTotal + meshArea, 0) || 1;

  const positions: number[] = [];
  const normals: number[] = [];
  const burstVectors: number[] = [];
  const seeds: number[] = [];
  const sizes: number[] = [];

  const sampledPoint = new THREE.Vector3();
  const sampledNormal = new THREE.Vector3();
  const centeredPoint = new THREE.Vector3();
  skullMeshes.forEach((skullMesh, meshIndex) => {
    const meshFraction = meshAreas[meshIndex] / totalArea;
    const meshParticleCount =
      meshIndex === skullMeshes.length - 1
        ? targetParticleCount - positions.length / 3
        : Math.max(1200, Math.round(targetParticleCount * meshFraction));

    const sampler = new MeshSurfaceSampler(skullMesh).setRandomGenerator(rng).build();
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(skullMesh.matrixWorld);

    for (let sampleIndex = 0; sampleIndex < meshParticleCount; sampleIndex += 1) {
      sampler.sample(sampledPoint, sampledNormal);

      sampledPoint.applyMatrix4(skullMesh.matrixWorld);
      sampledNormal.applyNormalMatrix(normalMatrix).normalize();

      centeredPoint
        .copy(sampledPoint)
        .sub(centerPoint)
        .multiplyScalar(scaleFactor)
        .setY((sampledPoint.y - centerPoint.y) * scaleFactor + 0.08);

      positions.push(centeredPoint.x, centeredPoint.y, centeredPoint.z);
      normals.push(sampledNormal.x, sampledNormal.y, sampledNormal.z);
      const seed = rng();
      const burstVector = centeredPoint.clone().normalize();

      if (burstVector.lengthSq() < 0.0001) {
        burstVector.set(rng() - 0.5, rng() - 0.35, rng() - 0.5).normalize();
      }

      burstVector.addScaledVector(sampledNormal, 0.18).normalize();
      burstVector.multiplyScalar(4.2 + seed * 7.4);

      burstVectors.push(burstVector.x, burstVector.y, burstVector.z);
      seeds.push(seed);
      sizes.push(0.72 + rng() * 1.1);
    }
  });

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  particleGeometry.setAttribute('aNormal', new THREE.Float32BufferAttribute(normals, 3));
  particleGeometry.setAttribute('aBurst', new THREE.Float32BufferAttribute(burstVectors, 3));
  particleGeometry.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1));
  particleGeometry.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1));
  particleGeometry.computeBoundingSphere();

  return particleGeometry;
}

function buildShellFragmentPayload(scene: THREE.Group) {
  const skullMeshes = collectSkullMeshes(scene);

  if (skullMeshes.length === 0) {
    return null;
  }

  const rng = seededRandom(20260329);
  const targetFragmentCount = 840;
  const { centerPoint, scaleFactor } = measureSkullFrame(scene);
  const meshAreas = skullMeshes.map((skullMesh) => measureMeshArea(skullMesh));
  const totalArea = meshAreas.reduce((areaTotal, meshArea) => areaTotal + meshArea, 0) || 1;

  const origins = new Float32Array(targetFragmentCount * 3);
  const bursts = new Float32Array(targetFragmentCount * 3);
  const scales = new Float32Array(targetFragmentCount);
  const spins = new Float32Array(targetFragmentCount);

  const sampledPoint = new THREE.Vector3();
  const sampledNormal = new THREE.Vector3();
  const centeredPoint = new THREE.Vector3();
  let fragmentOffset = 0;

  skullMeshes.forEach((skullMesh, meshIndex) => {
    const meshFraction = meshAreas[meshIndex] / totalArea;
    const meshFragmentCount =
      meshIndex === skullMeshes.length - 1
        ? targetFragmentCount - fragmentOffset
        : Math.max(60, Math.round(targetFragmentCount * meshFraction));

    const sampler = new MeshSurfaceSampler(skullMesh).setRandomGenerator(rng).build();
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(skullMesh.matrixWorld);

    for (let sampleIndex = 0; sampleIndex < meshFragmentCount && fragmentOffset < targetFragmentCount; sampleIndex += 1) {
      sampler.sample(sampledPoint, sampledNormal);

      sampledPoint.applyMatrix4(skullMesh.matrixWorld);
      sampledNormal.applyNormalMatrix(normalMatrix).normalize();

      centeredPoint
        .copy(sampledPoint)
        .sub(centerPoint)
        .multiplyScalar(scaleFactor)
        .setY((sampledPoint.y - centerPoint.y) * scaleFactor + 0.08);

      const burstVector = centeredPoint.clone().normalize();
      if (burstVector.lengthSq() < 0.0001) {
        burstVector.set(rng() - 0.5, rng() - 0.35, rng() - 0.5).normalize();
      }

      burstVector.addScaledVector(sampledNormal, 0.14).normalize();
      burstVector.multiplyScalar(0.7 + rng() * 1.7);

      origins[fragmentOffset * 3] = centeredPoint.x;
      origins[fragmentOffset * 3 + 1] = centeredPoint.y;
      origins[fragmentOffset * 3 + 2] = centeredPoint.z;

      bursts[fragmentOffset * 3] = burstVector.x;
      bursts[fragmentOffset * 3 + 1] = burstVector.y;
      bursts[fragmentOffset * 3 + 2] = burstVector.z;

      scales[fragmentOffset] = 0.032 + rng() * 0.05;
      spins[fragmentOffset] = (rng() - 0.5) * 2.4;
      fragmentOffset += 1;
    }
  });

  return {
    origins,
    bursts,
    scales,
    spins,
  } satisfies ShellFragmentPayload;
}

function buildSkullShellGeometry(scene: THREE.Group) {
  const skullMeshes = collectSkullMeshes(scene);

  if (skullMeshes.length === 0) {
    return null;
  }

  const { centerPoint, scaleFactor } = measureSkullFrame(scene);

  const bakedGeometries = skullMeshes.map((skullMesh) => {
    const bakedGeometry = skullMesh.geometry.clone();
    bakedGeometry.applyMatrix4(skullMesh.matrixWorld);
    bakedGeometry.translate(-centerPoint.x, -centerPoint.y, -centerPoint.z);
    bakedGeometry.scale(scaleFactor, scaleFactor, scaleFactor);
    bakedGeometry.translate(0, 0.08, 0);

    return bakedGeometry;
  });

  const mergedGeometry = mergeBufferGeometries(bakedGeometries, false);
  bakedGeometries.forEach((bakedGeometry) => bakedGeometry.dispose());

  if (!mergedGeometry) {
    return null;
  }

  mergedGeometry.computeVertexNormals();
  mergedGeometry.computeBoundingSphere();

  return mergedGeometry;
}

function splitSkullShellGeometry(shellGeometry: THREE.BufferGeometry) {
  const sourceGeometry = shellGeometry.index ? shellGeometry.toNonIndexed() : shellGeometry.clone();
  const positionAttribute = sourceGeometry.getAttribute('position') as THREE.BufferAttribute | undefined;

  if (!positionAttribute) {
    sourceGeometry.dispose();
    return null;
  }

  const upperVertices: number[] = [];
  const lowerVertices: number[] = [];

  for (let triangleIndex = 0; triangleIndex < positionAttribute.count; triangleIndex += 3) {
    const aY = positionAttribute.getY(triangleIndex);
    const bY = positionAttribute.getY(triangleIndex + 1);
    const cY = positionAttribute.getY(triangleIndex + 2);
    const aZ = positionAttribute.getZ(triangleIndex);
    const bZ = positionAttribute.getZ(triangleIndex + 1);
    const cZ = positionAttribute.getZ(triangleIndex + 2);

    const centroidY = (aY + bY + cY) / 3;
    const centroidZ = (aZ + bZ + cZ) / 3;
    const targetBucket = centroidY < -0.18 && centroidZ > -0.32 ? lowerVertices : upperVertices;

    for (let vertexOffset = 0; vertexOffset < 3; vertexOffset += 1) {
      const sourceIndex = triangleIndex + vertexOffset;
      targetBucket.push(
        positionAttribute.getX(sourceIndex),
        positionAttribute.getY(sourceIndex),
        positionAttribute.getZ(sourceIndex)
      );
    }
  }

  sourceGeometry.dispose();

  const upperGeometry = new THREE.BufferGeometry();
  upperGeometry.setAttribute('position', new THREE.Float32BufferAttribute(upperVertices, 3));
  upperGeometry.computeVertexNormals();
  upperGeometry.computeBoundingSphere();

  const lowerGeometry = new THREE.BufferGeometry();
  lowerGeometry.setAttribute('position', new THREE.Float32BufferAttribute(lowerVertices, 3));
  lowerGeometry.computeVertexNormals();
  lowerGeometry.computeBoundingSphere();

  return {
    upperGeometry,
    lowerGeometry,
  };
}

function buildFractureGeometry() {
  const fractureSegments = [
    -0.52, 0.84, 0.88, -0.34, 0.52, 1.02,
    -0.34, 0.52, 1.02, -0.22, 0.2, 1.1,
    0.52, 0.84, 0.88, 0.34, 0.52, 1.02,
    0.34, 0.52, 1.02, 0.22, 0.2, 1.1,
    0.0, 0.72, 1.02, 0.0, 0.36, 1.16,
    -0.24, 0.04, 1.08, -0.38, -0.22, 0.98,
    0.24, 0.04, 1.08, 0.38, -0.22, 0.98,
    -0.08, -0.1, 1.18, 0.0, -0.34, 1.14,
    0.08, -0.1, 1.18, 0.0, -0.34, 1.14,
  ];

  const fractureGeometry = new THREE.BufferGeometry();
  fractureGeometry.setAttribute('position', new THREE.Float32BufferAttribute(fractureSegments, 3));
  fractureGeometry.computeBoundingSphere();
  return fractureGeometry;
}

function buildEngravedSymbolGeometry() {
  const symbolSegments = [
    0.0, 1.28, 0.0, 0.0, 0.86, 0.0,
    -0.72, 0.0, 0.0, 0.72, 0.0, 0.0,
    0.0, -1.06, 0.0, 0.0, -0.62, 0.0,
    -0.42, 0.86, 0.0, 0.0, 1.12, 0.0,
    0.42, 0.86, 0.0, 0.0, 1.12, 0.0,
    -0.56, -0.74, 0.0, 0.0, -0.98, 0.0,
    0.56, -0.74, 0.0, 0.0, -0.98, 0.0,
    -0.56, 0.52, 0.0, -0.18, 0.2, 0.0,
    0.56, 0.52, 0.0, 0.18, 0.2, 0.0,
    -0.18, 0.2, 0.0, 0.0, -0.18, 0.0,
    0.18, 0.2, 0.0, 0.0, -0.18, 0.0,
    -0.3, -0.42, 0.0, 0.3, -0.42, 0.0,
  ];

  const symbolGeometry = new THREE.BufferGeometry();
  symbolGeometry.setAttribute('position', new THREE.Float32BufferAttribute(symbolSegments, 3));
  symbolGeometry.computeBoundingSphere();
  return symbolGeometry;
}

function buildBoneTextureSet() {
  const textureSize = 256;
  const albedoCanvas = document.createElement('canvas');
  const roughnessCanvas = document.createElement('canvas');
  albedoCanvas.width = textureSize;
  albedoCanvas.height = textureSize;
  roughnessCanvas.width = textureSize;
  roughnessCanvas.height = textureSize;

  const albedoContext = albedoCanvas.getContext('2d');
  const roughnessContext = roughnessCanvas.getContext('2d');

  if (!albedoContext || !roughnessContext) {
    const fallback = new THREE.CanvasTexture(albedoCanvas);
    return {
      albedo: fallback,
      roughness: fallback.clone(),
    } satisfies BoneTextureSet;
  }

  albedoContext.fillStyle = '#d3c9bb';
  albedoContext.fillRect(0, 0, textureSize, textureSize);
  roughnessContext.fillStyle = '#929292';
  roughnessContext.fillRect(0, 0, textureSize, textureSize);

  for (let index = 0; index < 3200; index += 1) {
    const x = Math.random() * textureSize;
    const y = Math.random() * textureSize;
    const size = Math.random() * 5 + 1;
    const shade = 198 + Math.floor(Math.random() * 26);
    albedoContext.fillStyle = `rgba(${shade}, ${shade - 6}, ${shade - 14}, ${0.06 + Math.random() * 0.08})`;
    albedoContext.beginPath();
    albedoContext.arc(x, y, size, 0, Math.PI * 2);
    albedoContext.fill();

    const roughValue = 96 + Math.floor(Math.random() * 96);
    roughnessContext.fillStyle = `rgba(${roughValue}, ${roughValue}, ${roughValue}, ${0.08 + Math.random() * 0.1})`;
    roughnessContext.beginPath();
    roughnessContext.arc(x, y, size * 0.9, 0, Math.PI * 2);
    roughnessContext.fill();
  }

  for (let streakIndex = 0; streakIndex < 36; streakIndex += 1) {
    const startX = Math.random() * textureSize;
    const startY = Math.random() * textureSize;
    const endX = startX + (Math.random() - 0.5) * 48;
    const endY = startY + Math.random() * 60;
    albedoContext.strokeStyle = `rgba(115, 103, 91, ${0.08 + Math.random() * 0.08})`;
    albedoContext.lineWidth = 0.6 + Math.random() * 1.2;
    albedoContext.beginPath();
    albedoContext.moveTo(startX, startY);
    albedoContext.lineTo(endX, endY);
    albedoContext.stroke();

    const roughLine = 146 + Math.floor(Math.random() * 48);
    roughnessContext.strokeStyle = `rgba(${roughLine}, ${roughLine}, ${roughLine}, ${0.12 + Math.random() * 0.12})`;
    roughnessContext.lineWidth = 0.5 + Math.random();
    roughnessContext.beginPath();
    roughnessContext.moveTo(startX, startY);
    roughnessContext.lineTo(endX, endY);
    roughnessContext.stroke();
  }

  const albedoTexture = new THREE.CanvasTexture(albedoCanvas);
  const roughnessTexture = new THREE.CanvasTexture(roughnessCanvas);

  [albedoTexture, roughnessTexture].forEach((texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1.6, 1.6);
    texture.needsUpdate = true;
  });

  return {
    albedo: albedoTexture,
    roughness: roughnessTexture,
  } satisfies BoneTextureSet;
}

function SkullField({ progressRef, pointerRef, motionReduced, chamberMode }: HeroSignalSceneProps) {
  const { getAudioData } = useAudio();
  const skullAsset = useGLTF('/models/skull.glb') as SkullAsset;

  const skullMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const skullGroupRef = useRef<THREE.Group>(null);
  const fragmentMeshRef = useRef<THREE.InstancedMesh>(null);
  const fragmentMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const shockwaveRef = useRef<THREE.Mesh>(null);
  const shockwaveMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const fractureLinesRef = useRef<THREE.LineSegments>(null);
  const fractureGlowRef = useRef<THREE.LineSegments>(null);
  const engravedSymbolRef = useRef<THREE.LineSegments>(null);
  const upperShellGroupRef = useRef<THREE.Group>(null);
  const upperShellRef = useRef<THREE.Mesh>(null);
  const upperEdgesRef = useRef<THREE.LineSegments>(null);
  const jawGroupRef = useRef<THREE.Group>(null);
  const lowerShellRef = useRef<THREE.Mesh>(null);
  const lowerEdgesRef = useRef<THREE.LineSegments>(null);
  const innerHaloRef = useRef<THREE.Mesh>(null);
  const innerHaloMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const altarGlowRef = useRef<THREE.Mesh>(null);
  const altarGlowMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const pedestalRef = useRef<THREE.Mesh>(null);
  const pedestalMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const pedestalShadowRef = useRef<THREE.Mesh>(null);
  const pedestalShadowMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const detonationTriggeredRef = useRef(false);

  const skullGeometry = useMemo(() => buildSkullGeometry(skullAsset.scene), [skullAsset.scene]);
  const shellFragmentPayload = useMemo(() => buildShellFragmentPayload(skullAsset.scene), [skullAsset.scene]);
  const skullShellGeometry = useMemo(() => buildSkullShellGeometry(skullAsset.scene), [skullAsset.scene]);
  const skullShellParts = useMemo(
    () => (skullShellGeometry ? splitSkullShellGeometry(skullShellGeometry) : null),
    [skullShellGeometry]
  );
  const upperEdgeGeometry = useMemo(
    () => (skullShellParts ? new THREE.EdgesGeometry(skullShellParts.upperGeometry, 34) : null),
    [skullShellParts]
  );
  const lowerEdgeGeometry = useMemo(
    () => (skullShellParts ? new THREE.EdgesGeometry(skullShellParts.lowerGeometry, 30) : null),
    [skullShellParts]
  );
  const fractureGeometry = useMemo(() => buildFractureGeometry(), []);
  const engravedSymbolGeometry = useMemo(() => buildEngravedSymbolGeometry(), []);
  const boneTextureSet = useMemo(() => buildBoneTextureSet(), []);
  const pointerDrift = useMemo(() => new THREE.Vector2(), []);
  const fragmentProxy = useMemo(() => new THREE.Object3D(), []);
  const burstAnchor = useMemo(() => new THREE.Vector3(), []);
  const alternateChamber = chamberMode === 'alternate';

  useEffect(() => {
    return () => {
      boneTextureSet.albedo.dispose();
      boneTextureSet.roughness.dispose();
    };
  }, [boneTextureSet]);

  const skullMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uProgress: { value: 0 },
          uPointer: { value: new THREE.Vector2() },
          uAudio: { value: 0 },
          uTalk: { value: 0 },
        } satisfies SkullUniforms,
        vertexShader: skullVertexShader,
        fragmentShader: skullFragmentShader,
        blending: THREE.NormalBlending,
        depthWrite: false,
        transparent: true,
      }),
    []
  );

  useFrame((state, delta) => {
    if (!skullMaterialRef.current || !skullGroupRef.current) {
      return;
    }

    const progressValue = motionReduced ? 0.34 : progressRef.current;
    const pointerX = motionReduced ? 0 : pointerRef.current.x;
    const pointerY = motionReduced ? 0 : pointerRef.current.y;
    const audioLevel = motionReduced ? 0 : getAudioData();
    const talkPhase = 0;

    const skullUniforms = skullMaterialRef.current.uniforms as unknown as SkullUniforms;

    skullUniforms.uTime.value += delta;
    skullUniforms.uProgress.value = THREE.MathUtils.lerp(skullUniforms.uProgress.value, progressValue, 0.08);
    skullUniforms.uAudio.value = THREE.MathUtils.lerp(skullUniforms.uAudio.value, audioLevel, 0.08);
    skullUniforms.uPointer.value.lerp(pointerDrift.set(pointerX, pointerY), 0.08);
    skullUniforms.uTalk.value = THREE.MathUtils.lerp(skullUniforms.uTalk.value, talkPhase, 0.08);

    const approachPhase = THREE.MathUtils.smoothstep(progressValue, 0.08, 0.68);
    const pressurePhase = THREE.MathUtils.smoothstep(progressValue, 0.54, 0.72) * (1 - THREE.MathUtils.smoothstep(progressValue, 0.74, 0.88));
    const crackPhase = THREE.MathUtils.smoothstep(progressValue, 0.6, 0.74) * (1 - THREE.MathUtils.smoothstep(progressValue, 0.78, 0.9));
    const detonationPhase = THREE.MathUtils.smoothstep(progressValue, 0.77, 0.98);
    const shellFadePhase = THREE.MathUtils.smoothstep(progressValue, 0.82, 0.95);
    const fragmentLaunchPhase = THREE.MathUtils.smoothstep(progressValue, 0.75, 0.86);
    const falloutPhase = THREE.MathUtils.smoothstep(progressValue, 0.84, 1.0);
    const settlePhase = THREE.MathUtils.smoothstep(progressValue, 0.0, 0.22);
    const invocationPhase = THREE.MathUtils.smoothstep(progressValue, 0.12, 0.58) * (1 - THREE.MathUtils.smoothstep(progressValue, 0.8, 0.96));
    const pulseLift = Math.sin(skullUniforms.uTime.value * 0.14) * 0.012;
    const fractureShimmer = crackPhase * (Math.sin(skullUniforms.uTime.value * 24) * 0.5 + 0.5);

    const targetYaw = pointerX * 0.018;
    skullGroupRef.current.rotation.y = THREE.MathUtils.lerp(skullGroupRef.current.rotation.y, targetYaw, 0.06);
    skullGroupRef.current.rotation.x = THREE.MathUtils.lerp(
      skullGroupRef.current.rotation.x,
      0.002 + pointerY * 0.01 - approachPhase * 0.006,
      0.06
    );
    skullGroupRef.current.position.y = THREE.MathUtils.lerp(
      skullGroupRef.current.position.y,
      pulseLift + approachPhase * 0.04 - detonationPhase * 0.28,
      0.06
    );
    skullGroupRef.current.position.z = THREE.MathUtils.lerp(
      skullGroupRef.current.position.z,
      approachPhase * 0.32 - detonationPhase * 0.2 + crackPhase * 0.03,
      0.06
    );

    if (innerHaloRef.current && innerHaloMaterialRef.current) {
      innerHaloRef.current.rotation.z += delta * 0.02;
      innerHaloRef.current.scale.setScalar(1.1 + invocationPhase * 0.06);
      innerHaloMaterialRef.current.opacity = THREE.MathUtils.lerp(
        innerHaloMaterialRef.current.opacity,
        (alternateChamber ? 0.04 : 0.014) + invocationPhase * (alternateChamber ? 0.052 : 0.028) - shellFadePhase * 0.04,
        0.08
      );
    }

    if (altarGlowRef.current && altarGlowMaterialRef.current) {
      altarGlowRef.current.scale.setScalar(1.12 + invocationPhase * 0.04 + pressurePhase * 0.04);
      altarGlowMaterialRef.current.opacity = THREE.MathUtils.lerp(
        altarGlowMaterialRef.current.opacity,
        (alternateChamber ? 0.046 : 0.02) + invocationPhase * (alternateChamber ? 0.05 : 0.02) + pressurePhase * (alternateChamber ? 0.06 : 0.02) - falloutPhase * 0.03,
        0.08
      );
    }

    if (pedestalRef.current && pedestalMaterialRef.current) {
      pedestalRef.current.position.y = THREE.MathUtils.lerp(
        pedestalRef.current.position.y,
        -1.28 + invocationPhase * 0.014 - detonationPhase * 0.03,
        0.08
      );
      pedestalRef.current.scale.set(
        THREE.MathUtils.lerp(pedestalRef.current.scale.x, 1.0 + invocationPhase * 0.01, 0.08),
        THREE.MathUtils.lerp(pedestalRef.current.scale.y, 1.0, 0.08),
        THREE.MathUtils.lerp(pedestalRef.current.scale.z, 1.0 + invocationPhase * 0.012, 0.08)
      );
      pedestalMaterialRef.current.opacity = THREE.MathUtils.lerp(
        pedestalMaterialRef.current.opacity,
        (alternateChamber ? 0.12 : 0.08) + invocationPhase * (alternateChamber ? 0.05 : 0.028) - detonationPhase * 0.08,
        0.08
      );
    }

    if (pedestalShadowRef.current && pedestalShadowMaterialRef.current) {
      pedestalShadowRef.current.scale.setScalar(1.0 + invocationPhase * 0.03 + pressurePhase * 0.02);
      pedestalShadowMaterialRef.current.opacity = THREE.MathUtils.lerp(
        pedestalShadowMaterialRef.current.opacity,
        0.08 + invocationPhase * (alternateChamber ? 0.042 : 0.018) - detonationPhase * 0.05,
        0.08
      );
    }

    if (engravedSymbolRef.current) {
      const symbolMaterial = engravedSymbolRef.current.material as THREE.LineBasicMaterial;
      engravedSymbolRef.current.rotation.z -= delta * (alternateChamber ? 0.03 : 0.01);
      engravedSymbolRef.current.scale.setScalar(1.0 + invocationPhase * 0.015);
      symbolMaterial.opacity = THREE.MathUtils.lerp(
        symbolMaterial.opacity,
        (alternateChamber ? 0.1 : 0.035) + invocationPhase * (alternateChamber ? 0.06 : 0.02) - shellFadePhase * 0.03,
        0.08
      );
    }

    if (upperShellRef.current) {
      const upperMaterial = upperShellRef.current.material as THREE.MeshPhysicalMaterial;
      upperShellRef.current.scale.setScalar(1 + approachPhase * 0.05 + pressurePhase * 0.025 + crackPhase * 0.012 + detonationPhase * 0.02);
      upperMaterial.opacity = THREE.MathUtils.lerp(upperMaterial.opacity, 0.98 - shellFadePhase * 1.02, 0.12);
      upperMaterial.emissiveIntensity = THREE.MathUtils.lerp(
        upperMaterial.emissiveIntensity,
        (alternateChamber ? 0.003 : 0.0004) + crackPhase * 0.01 + fractureShimmer * (alternateChamber ? 0.012 : 0.006) + detonationPhase * (alternateChamber ? 0.02 : 0.012),
        0.08
      );
      upperMaterial.roughness = THREE.MathUtils.lerp(upperMaterial.roughness, 0.9 + detonationPhase * 0.04, 0.08);
    }

    if (upperShellGroupRef.current) {
      upperShellGroupRef.current.position.y = THREE.MathUtils.lerp(
        upperShellGroupRef.current.position.y,
        crackPhase * 0.045 + fragmentLaunchPhase * 0.11,
        0.12
      );
      upperShellGroupRef.current.position.z = THREE.MathUtils.lerp(
        upperShellGroupRef.current.position.z,
        -crackPhase * 0.02 - fragmentLaunchPhase * 0.08,
        0.12
      );
      upperShellGroupRef.current.position.x = THREE.MathUtils.lerp(
        upperShellGroupRef.current.position.x,
        0.01 + crackPhase * 0.006,
        0.1
      );
      upperShellGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        upperShellGroupRef.current.rotation.x,
        -crackPhase * 0.045 - fragmentLaunchPhase * 0.08,
        0.12
      );
      upperShellGroupRef.current.rotation.z = THREE.MathUtils.lerp(
        upperShellGroupRef.current.rotation.z,
        -0.01 - crackPhase * 0.02,
        0.1
      );
      upperShellGroupRef.current.scale.x = THREE.MathUtils.lerp(upperShellGroupRef.current.scale.x, 1.008, 0.08);
      upperShellGroupRef.current.scale.y = THREE.MathUtils.lerp(upperShellGroupRef.current.scale.y, 0.996, 0.08);
    }

    if (upperEdgesRef.current) {
      const upperEdgeMaterial = upperEdgesRef.current.material as THREE.LineBasicMaterial;
      upperEdgeMaterial.opacity = THREE.MathUtils.lerp(
        upperEdgeMaterial.opacity,
        0.06 + crackPhase * 0.12 - shellFadePhase * 0.18,
        0.12
      );
    }

    if (jawGroupRef.current) {
      jawGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        jawGroupRef.current.rotation.x,
        crackPhase * 0.04 + fragmentLaunchPhase * 0.14,
        0.12
      );
      jawGroupRef.current.rotation.z = THREE.MathUtils.lerp(
        jawGroupRef.current.rotation.z,
        0.008 + crackPhase * 0.014,
        0.1
      );
      jawGroupRef.current.position.x = THREE.MathUtils.lerp(jawGroupRef.current.position.x, -0.01 - crackPhase * 0.006, 0.1);
      jawGroupRef.current.position.y = THREE.MathUtils.lerp(jawGroupRef.current.position.y, -crackPhase * 0.04 - fragmentLaunchPhase * 0.16, 0.12);
      jawGroupRef.current.position.z = THREE.MathUtils.lerp(jawGroupRef.current.position.z, crackPhase * 0.05 + fragmentLaunchPhase * 0.2, 0.12);
    }

    if (lowerShellRef.current) {
      const lowerMaterial = lowerShellRef.current.material as THREE.MeshPhysicalMaterial;
      lowerShellRef.current.scale.setScalar(1 + approachPhase * 0.05 + pressurePhase * 0.03 + crackPhase * 0.012 + detonationPhase * 0.025);
      lowerMaterial.opacity = THREE.MathUtils.lerp(lowerMaterial.opacity, 0.98 - shellFadePhase * 1.06, 0.12);
      lowerMaterial.emissiveIntensity = THREE.MathUtils.lerp(
        lowerMaterial.emissiveIntensity,
        (alternateChamber ? 0.0032 : 0.0005) + crackPhase * 0.011 + fractureShimmer * (alternateChamber ? 0.013 : 0.007) + detonationPhase * (alternateChamber ? 0.022 : 0.014),
        0.08
      );
      lowerMaterial.roughness = THREE.MathUtils.lerp(lowerMaterial.roughness, 0.88 + detonationPhase * 0.05, 0.08);
    }

    if (lowerEdgesRef.current) {
      const lowerEdgeMaterial = lowerEdgesRef.current.material as THREE.LineBasicMaterial;
      lowerEdgeMaterial.opacity = THREE.MathUtils.lerp(
        lowerEdgeMaterial.opacity,
        0.08 + crackPhase * 0.14 - shellFadePhase * 0.2,
        0.12
      );
    }

    if (fractureLinesRef.current) {
      const fractureMaterial = fractureLinesRef.current.material as THREE.LineBasicMaterial;
      fractureMaterial.opacity = THREE.MathUtils.lerp(
        fractureMaterial.opacity,
        crackPhase * (1 - shellFadePhase * 0.65) * (0.26 + fractureShimmer * 0.14),
        0.16
      );
      const crawl = Math.sin(skullUniforms.uTime.value * 14) * 0.004 * crackPhase;
      fractureLinesRef.current.scale.setScalar(1 + crackPhase * 0.01);
      fractureLinesRef.current.position.x = crawl;
      fractureLinesRef.current.position.y = -crawl * 0.6;
    }

    if (fractureGlowRef.current) {
      const fractureGlowMaterial = fractureGlowRef.current.material as THREE.LineBasicMaterial;
      fractureGlowMaterial.opacity = THREE.MathUtils.lerp(
        fractureGlowMaterial.opacity,
        crackPhase * (1 - shellFadePhase * 0.7) * ((alternateChamber ? 0.18 : 0.1) + fractureShimmer * (alternateChamber ? 0.22 : 0.16)),
        0.16
      );
      fractureGlowRef.current.position.x = -Math.sin(skullUniforms.uTime.value * 12) * 0.003 * crackPhase;
      fractureGlowRef.current.position.y = Math.cos(skullUniforms.uTime.value * 10) * 0.002 * crackPhase;
    }

    if (fragmentMeshRef.current && shellFragmentPayload) {
      const fragmentMaterial = fragmentMaterialRef.current;
      const fragmentFade = 1 - THREE.MathUtils.smoothstep(progressValue, 0.9, 1.0);

      for (let fragmentIndex = 0; fragmentIndex < shellFragmentPayload.scales.length; fragmentIndex += 1) {
        const originIndex = fragmentIndex * 3;
        const originX = shellFragmentPayload.origins[originIndex];
        const originY = shellFragmentPayload.origins[originIndex + 1];
        const originZ = shellFragmentPayload.origins[originIndex + 2];
        const burstX = shellFragmentPayload.bursts[originIndex];
        const burstY = shellFragmentPayload.bursts[originIndex + 1];
        const burstZ = shellFragmentPayload.bursts[originIndex + 2];
        const spin = shellFragmentPayload.spins[fragmentIndex];

        const burstDistance = fragmentLaunchPhase * (0.16 + detonationPhase * 1.45);
        const fallDistance = falloutPhase * falloutPhase * (0.05 + fragmentIndex / shellFragmentPayload.scales.length * 0.72);

        fragmentProxy.position.set(
          originX + burstX * burstDistance,
          originY + burstY * burstDistance - fallDistance,
          originZ + burstZ * burstDistance
        );
        fragmentProxy.rotation.set(
          spin * fragmentLaunchPhase * 1.1,
          spin * fragmentLaunchPhase * 1.5,
          -spin * fragmentLaunchPhase * 1.0
        );

        const fragmentScale = shellFragmentPayload.scales[fragmentIndex] * fragmentLaunchPhase * fragmentFade;
        fragmentProxy.scale.setScalar(fragmentScale);
        fragmentProxy.updateMatrix();
        fragmentMeshRef.current.setMatrixAt(fragmentIndex, fragmentProxy.matrix);
      }

      fragmentMeshRef.current.instanceMatrix.needsUpdate = true;

      if (fragmentMaterial) {
        fragmentMaterial.opacity = THREE.MathUtils.lerp(fragmentMaterial.opacity, fragmentLaunchPhase * 0.56 * fragmentFade, 0.16);
        fragmentMaterial.emissiveIntensity = THREE.MathUtils.lerp(fragmentMaterial.emissiveIntensity, (alternateChamber ? 0.012 : 0.006) + detonationPhase * (alternateChamber ? 0.024 : 0.016), 0.14);
      }
    }

    if (shockwaveRef.current && shockwaveMaterialRef.current) {
      shockwaveRef.current.position.z = 0.22 + detonationPhase * 0.24;
      shockwaveRef.current.scale.setScalar(0.2 + detonationPhase * 3.4);
      shockwaveMaterialRef.current.opacity = THREE.MathUtils.lerp(
        shockwaveMaterialRef.current.opacity,
        detonationPhase * (1 - THREE.MathUtils.smoothstep(progressValue, 0.84, 0.94)) * 0.12,
        0.18
      );
    }

    const perspectiveCamera = state.camera as THREE.PerspectiveCamera;
    perspectiveCamera.position.x = THREE.MathUtils.lerp(perspectiveCamera.position.x, pointerX * 0.12, 0.04);
    perspectiveCamera.position.y = THREE.MathUtils.lerp(
      perspectiveCamera.position.y,
      pointerY * 0.028 - 0.02 - approachPhase * 0.07,
      0.04
    );
    perspectiveCamera.position.z = THREE.MathUtils.lerp(
      perspectiveCamera.position.z,
      6.8 - settlePhase * 0.7 - approachPhase * 1.12 + pressurePhase * 0.08 + detonationPhase * 1.5,
      0.04
    );
    perspectiveCamera.lookAt(0, -0.1 - approachPhase * 0.07 - detonationPhase * 0.08, 0.26);

    if (shockwaveRef.current && detonationPhase > 0.12 && !detonationTriggeredRef.current) {
      shockwaveRef.current.getWorldPosition(burstAnchor);
      burstAnchor.project(perspectiveCamera);

      window.dispatchEvent(
        new CustomEvent('hero-detonation', {
          detail: {
            intensity: 0.62 + detonationPhase * 0.14,
            progress: progressValue,
            x: (burstAnchor.x * 0.5 + 0.5) * state.size.width,
            y: (-burstAnchor.y * 0.5 + 0.5) * state.size.height,
          },
        })
      );

      detonationTriggeredRef.current = true;
    }

    if (progressValue < 0.58) {
      detonationTriggeredRef.current = false;
    }
  });

  if (!skullGeometry) {
    return null;
  }

  return (
    <>
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={alternateChamber ? 0.05 : 0.03} color={alternateChamber ? '#294349' : '#43484d'} />
      <directionalLight position={[0.26, 1.86, 4.8]} intensity={alternateChamber ? 1.44 : 1.62} color={alternateChamber ? '#d7e9eb' : '#f3ede4'} />
      <directionalLight position={[-1.7, 0.2, 2.1]} intensity={alternateChamber ? 0.26 : 0.16} color={alternateChamber ? '#3d6f77' : '#6f767e'} />
      <directionalLight position={[-2.1, 1.0, -2.7]} intensity={alternateChamber ? 0.12 : 0.05} color={alternateChamber ? '#2e5157' : '#9aa3a8'} />
      <pointLight position={[0, -0.2, 2.4]} intensity={alternateChamber ? 0.09 : 0.05} color={alternateChamber ? '#70e5ee' : '#efe6d8'} distance={4.6} decay={2} />
      <spotLight position={[0, 2.8, 1.8]} angle={0.44} penumbra={0.8} intensity={alternateChamber ? 0.34 : 0.26} color={alternateChamber ? '#d9f8fb' : '#efe9dc'} distance={8} decay={2} />

      <group ref={skullGroupRef}>
        <lineSegments ref={engravedSymbolRef} geometry={engravedSymbolGeometry} position={[0, 0.02, -0.92]}>
          <lineBasicMaterial color={alternateChamber ? '#8fd8de' : '#8b8782'} transparent opacity={0} />
        </lineSegments>
        <mesh ref={innerHaloRef} position={[0, 0.06, -0.44]}>
          <ringGeometry args={[0.92, 1, 128]} />
          <meshBasicMaterial
            ref={innerHaloMaterialRef}
            color={alternateChamber ? '#78f0fa' : '#d8d4cd'}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
        <mesh ref={altarGlowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.16, -0.58]}>
          <circleGeometry args={[1.34, 96]} />
          <meshBasicMaterial
            ref={altarGlowMaterialRef}
            color={alternateChamber ? '#57e6f5' : '#d4d0ca'}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
        <mesh ref={pedestalShadowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.245, -0.52]}>
          <circleGeometry args={[0.98, 72]} />
          <meshBasicMaterial
            ref={pedestalShadowMaterialRef}
            color="#050505"
            transparent
            opacity={0.08}
            depthWrite={false}
          />
        </mesh>
        <mesh ref={pedestalRef} position={[0, -1.28, -0.54]}>
          <cylinderGeometry args={[0.88, 1.02, 0.18, 48]} />
          <meshStandardMaterial
            ref={pedestalMaterialRef}
            color={alternateChamber ? '#252c2e' : '#45413d'}
            roughness={0.98}
            metalness={0.01}
            transparent
            opacity={0.08}
          />
        </mesh>
        {skullShellParts && (
          <>
            <group position={[0, 0, 0.01]}>
              <lineSegments ref={fractureLinesRef} geometry={fractureGeometry}>
                <lineBasicMaterial color="#c5c1bb" transparent opacity={0} />
              </lineSegments>
              <lineSegments ref={fractureGlowRef} geometry={fractureGeometry}>
                <lineBasicMaterial color="#00F0FF" transparent opacity={0} />
              </lineSegments>
            </group>
            <group ref={upperShellGroupRef}>
              <mesh ref={upperShellRef} geometry={skullShellParts.upperGeometry}>
                <meshPhysicalMaterial
                  color={alternateChamber ? '#5e6668' : '#807c76'}
                  metalness={0.02}
                  roughness={0.96}
                  clearcoat={0.02}
                  clearcoatRoughness={0.5}
                  map={boneTextureSet.albedo}
                  roughnessMap={boneTextureSet.roughness}
                  emissive="#00F0FF"
                  emissiveIntensity={0.001}
                  transparent
                  opacity={0.96}
                />
              </mesh>
              {upperEdgeGeometry && (
                <lineSegments ref={upperEdgesRef} geometry={upperEdgeGeometry}>
                  <lineBasicMaterial color="#706b66" transparent opacity={0.1} />
                </lineSegments>
              )}
            </group>

            <group ref={jawGroupRef} position={[0, -0.34, 0.16]}>
              <mesh ref={lowerShellRef} geometry={skullShellParts.lowerGeometry} position={[0, 0.34, -0.16]}>
                <meshPhysicalMaterial
                  color={alternateChamber ? '#596062' : '#77726c'}
                  metalness={0.02}
                  roughness={0.95}
                  clearcoat={0.02}
                  clearcoatRoughness={0.48}
                  map={boneTextureSet.albedo}
                  roughnessMap={boneTextureSet.roughness}
                  emissive="#00F0FF"
                  emissiveIntensity={0.001}
                  transparent
                  opacity={0.96}
                />
              </mesh>
              {lowerEdgeGeometry && (
                <lineSegments ref={lowerEdgesRef} geometry={lowerEdgeGeometry} position={[0, 0.34, -0.16]}>
                  <lineBasicMaterial color={alternateChamber ? '#43656b' : '#6a6560'} transparent opacity={0.1} />
                </lineSegments>
              )}
            </group>
          </>
        )}
        {shellFragmentPayload && (
          <instancedMesh ref={fragmentMeshRef} args={[undefined, undefined, shellFragmentPayload.scales.length]}>
            <tetrahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
              ref={fragmentMaterialRef}
              color={alternateChamber ? '#4f5658' : '#78736d'}
              metalness={0.02}
              roughness={0.96}
              map={boneTextureSet.albedo}
              roughnessMap={boneTextureSet.roughness}
              emissive="#00F0FF"
              emissiveIntensity={0.004}
              transparent
              opacity={0}
            />
          </instancedMesh>
        )}
        <mesh ref={shockwaveRef} rotation={[0, 0, 0]} position={[0, 0.04, 0.24]}>
          <ringGeometry args={[0.8, 1.02, 96]} />
          <meshBasicMaterial
            ref={shockwaveMaterialRef}
            color="#00F0FF"
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
        <points geometry={skullGeometry}>
          <primitive ref={skullMaterialRef} object={skullMaterial} attach="material" />
        </points>
      </group>
    </>
  );
}

export default function HeroSignalScene(props: HeroSignalSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.12, 7], fov: 30, near: 0.1, far: 24 }}
      dpr={[1, props.motionReduced ? 1.1 : 1.35]}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance', stencil: false }}
      performance={{ min: 0.7 }}
    >
      <AdaptiveDpr pixelated />
      <SkullField {...props} />
    </Canvas>
  );
}
