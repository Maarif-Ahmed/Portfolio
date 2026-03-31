'use client';

import { useAnimations, useGLTF, useTexture } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import HeroSnowMist from '@/components/hero-terrain/HeroSnowMist';
import { useHeroMovementInput } from '@/components/hero-terrain/useHeroMovementInput';
import { useAudio } from '@/context/AudioContext';
import { HERO_TERRAIN_CONFIG } from '@/lib/heroTerrainConfig';
import { applySnowDeformation, lerpAngle } from '@/lib/terrainDeformMath';

interface HeroTerrainWorldProps {
  sceneActive: boolean;
  onInputDetected?: () => void;
}

type TerrainChunkMesh = THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>;

const tempFootPosition = new THREE.Vector3();
const tempCharacterPosition = new THREE.Vector3();
const tempDirection = new THREE.Vector3();
const tempRayOrigin = new THREE.Vector3();
const downVector = new THREE.Vector3(0, -1, 0);

export default function HeroTerrainWorld({ sceneActive, onInputDetected }: HeroTerrainWorldProps) {
  const characterRef = useRef<THREE.Group>(null);
  const characterCarrierRef = useRef<THREE.Group>(null);
  const chunksRef = useRef<TerrainChunkMesh[]>([]);
  const deformedChunksRef = useRef(new Map<string, Float32Array>());
  const smoothMovementRef = useRef(new THREE.Vector3());
  const currentRotationRef = useRef(0);
  const lastMovementTimeRef = useRef(0);
  const movingStateRef = useRef(false);
  const lastActiveChunkRef = useRef<TerrainChunkMesh | null>(null);
  const lastFootprintsRef = useRef({
    left: new THREE.Vector3(Number.NaN, Number.NaN, Number.NaN),
    right: new THREE.Vector3(Number.NaN, Number.NaN, Number.NaN),
  });
  const groundOffsetRef = useRef(0);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cameraTargetRef = useRef(new THREE.Vector3());
  const tempVertexRef = useRef(new THREE.Vector3());
  const terrainRaycasterRef = useRef(new THREE.Raycaster());

  const movementRef = useHeroMovementInput({ enabled: sceneActive, onFirstInput: onInputDetected });
  const { camera, gl } = useThree();
  const { playSnowStep } = useAudio();

  const { scene, animations } = useGLTF('/hero-terrain/models/explorer.glb') as unknown as {
    scene: THREE.Group;
    animations: THREE.AnimationClip[];
  };
  const { actions } = useAnimations(animations, scene);

  const [rawSnowColorMap, rawSnowNormalMap, rawSnowRoughnessMap, rawSnowAoMap, rawSnowDisplacementMap] =
    useTexture([
      '/hero-terrain/textures/snow/snow-color.jpg',
      '/hero-terrain/textures/snow/snow-normal-gl.jpg',
      '/hero-terrain/textures/snow/snow-roughness.jpg',
      '/hero-terrain/textures/snow/snow-ambientocclusion.jpg',
      '/hero-terrain/textures/snow/snow-displacement.jpg',
    ]);

  const [rawCharacterAoMap, rawCharacterColorMap, rawCharacterNormalMap] = useTexture([
    '/hero-terrain/textures/character/occlusion.png',
    '/hero-terrain/textures/character/texture.png',
    '/hero-terrain/textures/character/normal.png',
  ]);

  const snowColorMap = useMemo(() => {
    const texture = rawSnowColorMap.clone();
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(HERO_TERRAIN_CONFIG.terrain.textureRepeat, HERO_TERRAIN_CONFIG.terrain.textureRepeat);
    texture.anisotropy = gl.capabilities.getMaxAnisotropy();
    return texture;
  }, [gl.capabilities, rawSnowColorMap]);

  const snowNormalMap = useMemo(() => {
    const texture = rawSnowNormalMap.clone();
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(HERO_TERRAIN_CONFIG.terrain.textureRepeat, HERO_TERRAIN_CONFIG.terrain.textureRepeat);
    texture.anisotropy = gl.capabilities.getMaxAnisotropy();
    return texture;
  }, [gl.capabilities, rawSnowNormalMap]);

  const snowRoughnessMap = useMemo(() => {
    const texture = rawSnowRoughnessMap.clone();
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(HERO_TERRAIN_CONFIG.terrain.textureRepeat, HERO_TERRAIN_CONFIG.terrain.textureRepeat);
    texture.anisotropy = gl.capabilities.getMaxAnisotropy();
    return texture;
  }, [gl.capabilities, rawSnowRoughnessMap]);

  const snowAoMap = useMemo(() => {
    const texture = rawSnowAoMap.clone();
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(HERO_TERRAIN_CONFIG.terrain.textureRepeat, HERO_TERRAIN_CONFIG.terrain.textureRepeat);
    texture.anisotropy = gl.capabilities.getMaxAnisotropy();
    return texture;
  }, [gl.capabilities, rawSnowAoMap]);

  const snowDisplacementMap = useMemo(() => {
    const texture = rawSnowDisplacementMap.clone();
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(HERO_TERRAIN_CONFIG.terrain.textureRepeat, HERO_TERRAIN_CONFIG.terrain.textureRepeat);
    texture.anisotropy = gl.capabilities.getMaxAnisotropy();
    return texture;
  }, [gl.capabilities, rawSnowDisplacementMap]);

  const characterAoMap = useMemo(() => {
    const texture = rawCharacterAoMap.clone();
    texture.flipY = false;
    return texture;
  }, [rawCharacterAoMap]);

  const characterColorMap = useMemo(() => {
    const texture = rawCharacterColorMap.clone();
    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [rawCharacterColorMap]);

  const characterNormalMap = useMemo(() => {
    const texture = rawCharacterNormalMap.clone();
    texture.flipY = false;
    return texture;
  }, [rawCharacterNormalMap]);

  const cameraOffset = useMemo(
    () => new THREE.Vector3(...HERO_TERRAIN_CONFIG.camera.followOffset),
    []
  );

  const terrainSlots = useMemo(() => {
    const slots: { x: number; z: number }[] = [];

    for (
      let x = -HERO_TERRAIN_CONFIG.terrain.chunksPerSide;
      x <= HERO_TERRAIN_CONFIG.terrain.chunksPerSide;
      x += 1
    ) {
      for (
        let z = -HERO_TERRAIN_CONFIG.terrain.chunksPerSide;
        z <= HERO_TERRAIN_CONFIG.terrain.chunksPerSide;
        z += 1
      ) {
        slots.push({ x, z });
      }
    }

    return slots;
  }, []);

  const setChunkRef = useCallback((index: number, chunk: THREE.Mesh | null) => {
    if (!chunk) return;

    chunksRef.current[index] = chunk as TerrainChunkMesh;

    const positionAttribute = chunk.geometry.getAttribute('position');
    if (!(positionAttribute instanceof THREE.BufferAttribute)) return;

    if (!chunk.geometry.userData.originalPosition) {
      chunk.geometry.userData.originalPosition = positionAttribute.array.slice(0);
    }
  }, []);

  const switchAnimation = useCallback(
    (animationName: string) => {
      const walkAction = actions[HERO_TERRAIN_CONFIG.character.walkAnimation];
      const idleAction = actions[HERO_TERRAIN_CONFIG.character.idleAnimation];

      if (animationName === HERO_TERRAIN_CONFIG.character.walkAnimation) {
        idleAction?.fadeOut(0.5);
        walkAction?.reset().fadeIn(0.4).play();
        return;
      }

      walkAction?.fadeOut(0.5);
      idleAction?.reset().fadeIn(0.4).play();
    },
    [actions]
  );

  const getChunkKey = useCallback((x: number, z: number) => {
    return `${Math.round(x / HERO_TERRAIN_CONFIG.terrain.chunkSize)},${Math.round(
      z / HERO_TERRAIN_CONFIG.terrain.chunkSize
    )}`;
  }, []);

  const resetChunkGeometry = useCallback((chunk: TerrainChunkMesh) => {
    const originalPosition = chunk.geometry.userData.originalPosition as Float32Array | undefined;
    const positionAttribute = chunk.geometry.getAttribute('position');

    if (!originalPosition || !(positionAttribute instanceof THREE.BufferAttribute)) return;

    (positionAttribute.array as Float32Array).set(originalPosition);
    positionAttribute.needsUpdate = true;
    chunk.geometry.computeVertexNormals();
  }, []);

  const saveChunkDeformation = useCallback(
    (chunk: TerrainChunkMesh) => {
      const positionAttribute = chunk.geometry.getAttribute('position');
      if (!(positionAttribute instanceof THREE.BufferAttribute)) return;

      const chunkKey = getChunkKey(chunk.position.x, chunk.position.z);
      deformedChunksRef.current.set(chunkKey, new Float32Array(positionAttribute.array as Float32Array));

      if (deformedChunksRef.current.size > HERO_TERRAIN_CONFIG.terrain.saveLimit) {
        const oldestKey = deformedChunksRef.current.keys().next().value as string | undefined;
        if (oldestKey) {
          deformedChunksRef.current.delete(oldestKey);
        }
      }
    },
    [getChunkKey]
  );

  const loadChunkDeformation = useCallback(
    (chunk: TerrainChunkMesh) => {
      const savedPosition = deformedChunksRef.current.get(getChunkKey(chunk.position.x, chunk.position.z));
      const positionAttribute = chunk.geometry.getAttribute('position');

      if (!savedPosition || !(positionAttribute instanceof THREE.BufferAttribute)) {
        return false;
      }

      (positionAttribute.array as Float32Array).set(savedPosition);
      positionAttribute.needsUpdate = true;
      chunk.geometry.computeVertexNormals();
      return true;
    },
    [getChunkKey]
  );

  const getNeighboringChunks = useCallback((worldPosition: THREE.Vector3) => {
    return chunksRef.current.filter((chunk) => {
      const distance = new THREE.Vector2(
        chunk.position.x - worldPosition.x,
        chunk.position.z - worldPosition.z
      ).length();

      return distance < HERO_TERRAIN_CONFIG.terrain.chunkSize + HERO_TERRAIN_CONFIG.deformation.radius;
    });
  }, []);

  const deformAtPoint = useCallback(
    (worldPoint: THREE.Vector3) => {
      const neighboringChunks = getNeighboringChunks(worldPoint);
      if (!neighboringChunks.length) return;

      neighboringChunks.forEach((chunk) => {
        const changed = applySnowDeformation(chunk, worldPoint, tempVertexRef.current);
        if (changed) {
          saveChunkDeformation(chunk);
        }
      });
    },
    [getNeighboringChunks, saveChunkDeformation]
  );

  useEffect(() => {
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      if (!(child.material instanceof THREE.MeshStandardMaterial)) return;

      child.castShadow = true;
      child.receiveShadow = true;
      child.material.map = characterColorMap;
      child.material.normalMap = characterNormalMap;
      child.material.aoMap = characterAoMap;
      child.material.aoMapIntensity = 0.28;
      child.material.roughness = 0.96;
      child.material.metalness = 0;
      child.material.color.set('#ffffff');
      child.material.needsUpdate = true;

    });

    scene.scale.setScalar(HERO_TERRAIN_CONFIG.character.scale);
  }, [characterAoMap, characterColorMap, characterNormalMap, scene]);

  useEffect(() => {
    return () => {
      snowColorMap.dispose();
      snowNormalMap.dispose();
      snowRoughnessMap.dispose();
      snowAoMap.dispose();
      snowDisplacementMap.dispose();
      characterAoMap.dispose();
      characterColorMap.dispose();
      characterNormalMap.dispose();
    };
  }, [
    characterAoMap,
    characterColorMap,
    characterNormalMap,
    snowAoMap,
    snowColorMap,
    snowDisplacementMap,
    snowNormalMap,
    snowRoughnessMap,
  ]);

  useEffect(() => {
    if (!characterRef.current || !characterCarrierRef.current) return;

    const boundingBox = new THREE.Box3().setFromObject(characterRef.current);
    groundOffsetRef.current = -boundingBox.min.y + HERO_TERRAIN_CONFIG.character.yOffset;
    characterCarrierRef.current.position.set(0, groundOffsetRef.current, 0);
  }, [scene]);

  useEffect(() => {
    switchAnimation(HERO_TERRAIN_CONFIG.character.idleAnimation);
  }, [switchAnimation]);

  useEffect(() => {
    cameraRef.current = camera as THREE.PerspectiveCamera;
  }, [camera]);

  const maybeStampFoot = useCallback(
    (footKey: 'left' | 'right', bone: THREE.Object3D) => {
      tempFootPosition.setFromMatrixPosition(bone.matrixWorld);

      if (tempFootPosition.y > HERO_TERRAIN_CONFIG.deformation.contactHeight) {
        return;
      }

      const lastFootprint = lastFootprintsRef.current[footKey];
      if (
        Number.isFinite(lastFootprint.x) &&
        lastFootprint.distanceToSquared(tempFootPosition) <
          HERO_TERRAIN_CONFIG.deformation.stepSpacing ** 2
      ) {
        return;
      }

      lastFootprint.copy(tempFootPosition);
      deformAtPoint(tempFootPosition);
      playSnowStep();
    },
    [deformAtPoint, playSnowStep]
  );

  useFrame((state, delta) => {
    tempDirection.set(0, 0, 0);

    if (movementRef.current.forward) tempDirection.z -= 1;
    if (movementRef.current.backward) tempDirection.z += 1;
    if (movementRef.current.left) tempDirection.x -= 1;
    if (movementRef.current.right) tempDirection.x += 1;

    tempDirection.normalize();
    smoothMovementRef.current.lerp(tempDirection, 1 - Math.exp(-delta * 8));

    const isCurrentlyMoving = smoothMovementRef.current.lengthSq() > 0.01;

    if (isCurrentlyMoving) {
      lastMovementTimeRef.current = state.clock.elapsedTime;
      if (!movingStateRef.current) {
        movingStateRef.current = true;
        switchAnimation(HERO_TERRAIN_CONFIG.character.walkAnimation);
      }
    } else if (
      movingStateRef.current &&
      state.clock.elapsedTime - lastMovementTimeRef.current > 0.25
    ) {
      movingStateRef.current = false;
      switchAnimation(HERO_TERRAIN_CONFIG.character.idleAnimation);
    }

    if (!characterCarrierRef.current) return;

    if (isCurrentlyMoving) {
      characterCarrierRef.current.position.addScaledVector(
        smoothMovementRef.current,
        HERO_TERRAIN_CONFIG.character.speed * delta
      );

      const targetRotation = Math.atan2(
        smoothMovementRef.current.x,
        smoothMovementRef.current.z
      );
      currentRotationRef.current = lerpAngle(
        currentRotationRef.current,
        targetRotation,
        delta * HERO_TERRAIN_CONFIG.character.rotationLerp
      );
      characterCarrierRef.current.rotation.y = currentRotationRef.current;
    }

    characterCarrierRef.current.getWorldPosition(tempCharacterPosition);
    cameraTargetRef.current.copy(tempCharacterPosition);

    const activeCamera = cameraRef.current;
    if (!activeCamera) return;

    const targetCameraPosition = tempCharacterPosition.clone().add(cameraOffset);
    activeCamera.position.x = THREE.MathUtils.damp(
      activeCamera.position.x,
      targetCameraPosition.x,
      HERO_TERRAIN_CONFIG.camera.followDamping,
      delta
    );
    activeCamera.position.y = THREE.MathUtils.damp(
      activeCamera.position.y,
      targetCameraPosition.y,
      HERO_TERRAIN_CONFIG.camera.followDamping,
      delta
    );
    activeCamera.position.z = THREE.MathUtils.damp(
      activeCamera.position.z,
      targetCameraPosition.z,
      HERO_TERRAIN_CONFIG.camera.followDamping,
      delta
    );
    activeCamera.lookAt(
      cameraTargetRef.current.x,
      cameraTargetRef.current.y + HERO_TERRAIN_CONFIG.camera.lookHeight,
      cameraTargetRef.current.z
    );

    const { x: characterX, z: characterZ } = characterCarrierRef.current.position;

    chunksRef.current.forEach((chunk, index) => {
      const nextChunkX =
        Math.round(characterX / HERO_TERRAIN_CONFIG.terrain.chunkSize) *
          HERO_TERRAIN_CONFIG.terrain.chunkSize +
        terrainSlots[index].x * HERO_TERRAIN_CONFIG.terrain.chunkSize;
      const nextChunkZ =
        Math.round(characterZ / HERO_TERRAIN_CONFIG.terrain.chunkSize) *
          HERO_TERRAIN_CONFIG.terrain.chunkSize +
        terrainSlots[index].z * HERO_TERRAIN_CONFIG.terrain.chunkSize;

      if (chunk.position.x === nextChunkX && chunk.position.z === nextChunkZ) {
        return;
      }

      chunk.position.set(nextChunkX, 0, nextChunkZ);

      if (!loadChunkDeformation(chunk)) {
        resetChunkGeometry(chunk);
      }
    });

    const terrainRaycaster = terrainRaycasterRef.current;
    tempRayOrigin.set(characterX, 40, characterZ);
    terrainRaycaster.set(tempRayOrigin, downVector);
    const groundHit = terrainRaycaster.intersectObjects(chunksRef.current, false)[0];

    if (groundHit) {
      characterCarrierRef.current.position.y = THREE.MathUtils.damp(
        characterCarrierRef.current.position.y,
        groundHit.point.y + groundOffsetRef.current,
        10,
        delta
      );
    }

    const activeChunk =
      chunksRef.current.find((chunk) => {
        const minX = chunk.position.x - HERO_TERRAIN_CONFIG.terrain.chunkSize / 2;
        const maxX = chunk.position.x + HERO_TERRAIN_CONFIG.terrain.chunkSize / 2;
        const minZ = chunk.position.z - HERO_TERRAIN_CONFIG.terrain.chunkSize / 2;
        const maxZ = chunk.position.z + HERO_TERRAIN_CONFIG.terrain.chunkSize / 2;

        return characterX >= minX && characterX < maxX && characterZ >= minZ && characterZ < maxZ;
      }) ?? lastActiveChunkRef.current;

    if (activeChunk) {
      lastActiveChunkRef.current = activeChunk;
    }

    if (!isCurrentlyMoving || !activeChunk || !characterRef.current) {
      return;
    }

    characterRef.current.updateWorldMatrix(true, true);

    const leftFootBone = characterRef.current.getObjectByName(HERO_TERRAIN_CONFIG.character.leftFootBone);
    const rightFootBone = characterRef.current.getObjectByName(HERO_TERRAIN_CONFIG.character.rightFootBone);

    if (leftFootBone) {
      maybeStampFoot('left', leftFootBone);
    }

    if (rightFootBone) {
      maybeStampFoot('right', rightFootBone);
    }
  });

  return (
    <>
      {terrainSlots.map((slot, index) => (
        <mesh
          key={`${slot.x}-${slot.z}`}
          ref={(chunk) => setChunkRef(index, chunk)}
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[
            slot.x * HERO_TERRAIN_CONFIG.terrain.chunkSize,
            0,
            slot.z * HERO_TERRAIN_CONFIG.terrain.chunkSize,
          ]}
        >
          <planeGeometry
            args={[
              HERO_TERRAIN_CONFIG.terrain.chunkSize + HERO_TERRAIN_CONFIG.terrain.chunkOverlap * 2,
              HERO_TERRAIN_CONFIG.terrain.chunkSize + HERO_TERRAIN_CONFIG.terrain.chunkOverlap * 2,
              HERO_TERRAIN_CONFIG.terrain.gridResolution,
              HERO_TERRAIN_CONFIG.terrain.gridResolution,
            ]}
          />
          <meshStandardMaterial
            map={snowColorMap}
            normalMap={snowNormalMap}
            roughnessMap={snowRoughnessMap}
            aoMap={snowAoMap}
            displacementMap={snowDisplacementMap}
            displacementScale={HERO_TERRAIN_CONFIG.terrain.displacementScale}
            normalScale={new THREE.Vector2(1.15, 1.15)}
            roughness={0.98}
            metalness={0}
            color="#ffffff"
          />
        </mesh>
      ))}

      <group ref={characterCarrierRef}>
        <primitive ref={characterRef} object={scene} />
        <HeroSnowMist />
      </group>
    </>
  );
}

useGLTF.preload('/hero-terrain/models/explorer.glb');
