'use client';

import { useEffect, useMemo, useRef, useState, type MutableRefObject, type MouseEvent } from 'react';
import { useGSAP } from '@gsap/react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  FloatType,
  MathUtils,
  Points,
  ShaderMaterial,
  Texture,
  Vector2,
} from 'three';
import { GPUComputationRenderer } from 'three-stdlib';
import { useMotionPreference } from '@/context/MotionContext';

gsap.registerPlugin(ScrollTrigger);

const particleEvolutionVertexShader = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

const particleEvolutionFragmentShader = `
  uniform sampler2D posBuffer;
  uniform float uTime;
  uniform float uDelta;
  uniform float uProgress;
  uniform float uTwist;
  uniform vec2 uPointer;
  uniform float uPointerForce;
  uniform float uDriftIntensity;

  vec4 mod289(vec4 value) {
    return value - floor(value * (1.0 / 289.0)) * 289.0;
  }

  float mod289(float value) {
    return value - floor(value * (1.0 / 289.0)) * 289.0;
  }

  vec4 permute(vec4 value) {
    return mod289(((value * 34.0) + 1.0) * value);
  }

  vec4 taylorInvSqrt(vec4 value) {
    return 1.79284291400159 - 0.85373472095314 * value;
  }

  float snoise(vec3 point) {
    const vec2 skew = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 offsetMask = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 simplexCell = floor(point + dot(point, skew.yyy));
    vec3 simplexOffset = point - simplexCell + dot(simplexCell, skew.xxx);

    vec3 simplexStep = step(simplexOffset.yzx, simplexOffset.xyz);
    vec3 inverseStep = 1.0 - simplexStep;
    vec3 secondCorner = min(simplexStep.xyz, inverseStep.zxy);
    vec3 thirdCorner = max(simplexStep.xyz, inverseStep.zxy);

    vec3 offsetOne = simplexOffset - secondCorner + skew.xxx;
    vec3 offsetTwo = simplexOffset - thirdCorner + skew.yyy;
    vec3 offsetThree = simplexOffset - offsetMask.yyy;

    simplexCell = mod289(simplexCell);
    vec4 permuted = permute(
      permute(
        permute(simplexCell.z + vec4(0.0, secondCorner.z, thirdCorner.z, 1.0))
        + simplexCell.y + vec4(0.0, secondCorner.y, thirdCorner.y, 1.0)
      )
      + simplexCell.x + vec4(0.0, secondCorner.x, thirdCorner.x, 1.0)
    );

    float ring = 0.142857142857;
    vec3 lattice = ring * offsetMask.wyz - offsetMask.xzx;

    vec4 shard = permuted - 49.0 * floor(permuted * lattice.z * lattice.z);
    vec4 shardX = floor(shard * lattice.z);
    vec4 shardY = floor(shard - 7.0 * shardX);

    vec4 sampleX = shardX * lattice.x + lattice.yyyy;
    vec4 sampleY = shardY * lattice.x + lattice.yyyy;
    vec4 sampleH = 1.0 - abs(sampleX) - abs(sampleY);

    vec4 lane0 = vec4(sampleX.xy, sampleY.xy);
    vec4 lane1 = vec4(sampleX.zw, sampleY.zw);

    vec4 sign0 = floor(lane0) * 2.0 + 1.0;
    vec4 sign1 = floor(lane1) * 2.0 + 1.0;
    vec4 stepH = -step(sampleH, vec4(0.0));

    vec4 branch0 = lane0.xzyw + sign0.xzyw * stepH.xxyy;
    vec4 branch1 = lane1.xzyw + sign1.xzyw * stepH.zzww;

    vec3 grad0 = vec3(branch0.xy, sampleH.x);
    vec3 grad1 = vec3(branch0.zw, sampleH.y);
    vec3 grad2 = vec3(branch1.xy, sampleH.z);
    vec3 grad3 = vec3(branch1.zw, sampleH.w);

    vec4 normalizer = taylorInvSqrt(vec4(dot(grad0, grad0), dot(grad1, grad1), dot(grad2, grad2), dot(grad3, grad3)));
    grad0 *= normalizer.x;
    grad1 *= normalizer.y;
    grad2 *= normalizer.z;
    grad3 *= normalizer.w;

    vec4 falloff = max(0.6 - vec4(dot(simplexOffset, simplexOffset), dot(offsetOne, offsetOne), dot(offsetTwo, offsetTwo), dot(offsetThree, offsetThree)), 0.0);
    falloff *= falloff;

    return 42.0 * dot(falloff * falloff, vec4(dot(grad0, simplexOffset), dot(grad1, offsetOne), dot(grad2, offsetTwo), dot(grad3, offsetThree)));
  }

  vec3 noiseStack(vec3 samplePoint) {
    return vec3(
      snoise(samplePoint),
      snoise(samplePoint + vec3(37.0, 11.0, -19.0)),
      snoise(samplePoint + vec3(-23.0, 31.0, 47.0))
    );
  }

  vec3 curlNoise(vec3 samplePoint) {
    float epsilon = 0.18;
    vec3 deltaX = vec3(epsilon, 0.0, 0.0);
    vec3 deltaY = vec3(0.0, epsilon, 0.0);
    vec3 deltaZ = vec3(0.0, 0.0, epsilon);

    vec3 sampleX0 = noiseStack(samplePoint - deltaX);
    vec3 sampleX1 = noiseStack(samplePoint + deltaX);
    vec3 sampleY0 = noiseStack(samplePoint - deltaY);
    vec3 sampleY1 = noiseStack(samplePoint + deltaY);
    vec3 sampleZ0 = noiseStack(samplePoint - deltaZ);
    vec3 sampleZ1 = noiseStack(samplePoint + deltaZ);

    float curlX = (sampleY1.z - sampleY0.z) - (sampleZ1.y - sampleZ0.y);
    float curlY = (sampleZ1.x - sampleZ0.x) - (sampleX1.z - sampleX0.z);
    float curlZ = (sampleX1.y - sampleX0.y) - (sampleY1.x - sampleY0.x);

    return normalize(vec3(curlX, curlY, curlZ) / (2.0 * epsilon) + vec3(0.0001));
  }

  vec3 buildTerminalFrame(vec2 uv, float seed, float phaseJitter) {
    float lane = fract(seed * 23.0 + uv.x * 2.0);
    float height = mix(-2.8, 2.8, uv.y);
    float depth = mix(-0.92, 0.92, fract(seed * 41.0 + uv.x));

    vec3 leftRail = vec3(-3.35 + sin(uv.y * 10.0 + phaseJitter) * 0.18, height, depth * 0.65);
    vec3 rightRail = vec3(3.35 + cos(uv.y * 10.0 - phaseJitter) * 0.18, height, -depth * 0.65);
    vec3 topBrace = vec3(mix(-3.2, 3.2, uv.x), 3.05, depth * 0.48);
    vec3 lowerBrace = vec3(mix(-3.2, 3.2, uv.x), -3.05, -depth * 0.48);

    vec3 terminalFrame = mix(leftRail, rightRail, step(0.5, lane));
    terminalFrame = mix(terminalFrame, topBrace, step(0.68, lane));
    terminalFrame = mix(terminalFrame, lowerBrace, step(0.84, lane));
    return terminalFrame;
  }

  void main() {
    vec2 sampleUv = gl_FragCoord.xy / resolution.xy;
    vec4 signalState = texture2D(posBuffer, sampleUv);
    vec3 signalPosition = signalState.xyz;
    float signalSeed = signalState.w;

    float strandParity = step(0.5, fract(sampleUv.x * 13.0 + signalSeed * 7.0));
    float strandOffset = mix(0.0, 3.14159265, strandParity);
    float longitudinalTrace = sampleUv.y * 2.0 - 1.0;
    float helixPhase = longitudinalTrace * uTwist * 3.14159265 + uTime * 0.28 + strandOffset;
    float helixRadius = 1.1 + sin(sampleUv.y * 17.0 + signalSeed * 6.28318) * 0.22;
    vec3 targetHelixBuffer = vec3(
      cos(helixPhase) * helixRadius,
      longitudinalTrace * 7.0,
      sin(helixPhase) * helixRadius
    );

    vec3 dreamCloudBuffer = vec3(
      sin(signalSeed * 47.0 + uTime * 0.13) * (2.5 + sampleUv.x * 4.6),
      cos(signalSeed * 31.0 - uTime * 0.11) * (1.9 + sampleUv.y * 4.4),
      sin(signalSeed * 71.0 + uTime * 0.09) * (3.4 + sampleUv.x * 2.8)
    );

    vec3 terminalFrameBuffer = buildTerminalFrame(sampleUv, signalSeed, uTime * 0.22 + signalSeed * 9.0);

    float releasePhase = smoothstep(0.16, 0.54, uProgress);
    float rewritePhase = smoothstep(0.66, 0.96, uProgress);

    vec3 targetBuffer = mix(targetHelixBuffer, dreamCloudBuffer, releasePhase);
    targetBuffer = mix(targetBuffer, terminalFrameBuffer, rewritePhase);

    vec3 driftField = curlNoise(signalPosition * 0.44 + vec3(0.0, 0.0, uTime * 0.14));
    float anchorPull = mix(0.08, 0.045, releasePhase);
    anchorPull = mix(anchorPull, 0.072, rewritePhase);

    vec3 pointerField = vec3(uPointer.x * 4.8, uPointer.y * 3.2, 0.0);
    vec3 pointerOffset = signalPosition - pointerField;
    float pointerDistance = length(pointerOffset);
    float pointerImpulse = smoothstep(2.0, 0.0, pointerDistance) * uPointerForce;

    signalPosition += (targetBuffer - signalPosition) * anchorPull;
    signalPosition += driftField * uDriftIntensity * (0.7 + releasePhase * 1.4);
    signalPosition += normalize(pointerOffset + vec3(0.0001)) * pointerImpulse * 0.22;
    signalPosition *= 0.9988;

    gl_FragColor = vec4(signalPosition, signalSeed);
  }
`;

const dreamyDustVertexShader = `
  attribute vec2 aLookupUv;
  attribute float aSignalSeed;

  uniform sampler2D uPositions;
  uniform float uTime;
  uniform float uPointScale;
  uniform float uScrollMorph;

  varying float v_lifeSpan;
  varying float v_signalHeat;
  varying float v_rewriteGlow;

  void main() {
    vec4 signalState = texture2D(uPositions, aLookupUv);
    vec3 signalPosition = signalState.xyz;
    float pulse = sin(uTime * 0.7 + aSignalSeed * 18.0) * 0.08;

    signalPosition.y += pulse * (0.45 + uScrollMorph * 0.65);

    vec4 viewPosition = modelViewMatrix * vec4(signalPosition, 1.0);
    gl_Position = projectionMatrix * viewPosition;

    float depthWeight = 18.0 / max(5.0, -viewPosition.z);
    gl_PointSize = (1.8 + aSignalSeed * 4.1) * uPointScale * depthWeight;

    v_lifeSpan = 0.5 + 0.5 * sin(uTime * 0.48 + aSignalSeed * 6.28318);
    v_signalHeat = 0.42 + 0.58 * cos(aSignalSeed * 10.0 + uScrollMorph * 4.5);
    v_rewriteGlow = smoothstep(0.62, 1.0, uScrollMorph);
  }
`;

const dreamyDustFragmentShader = `
  varying float v_lifeSpan;
  varying float v_signalHeat;
  varying float v_rewriteGlow;

  void main() {
    vec2 centered = gl_PointCoord - 0.5;
    float radial = length(centered);
    float haze = 1.0 - smoothstep(0.0, 0.5, radial);
    float core = 1.0 - smoothstep(0.0, 0.16, radial);

    if (haze <= 0.0) {
      discard;
    }

    vec3 plasmaCyan = vec3(0.0, 0.94, 1.0);
    vec3 frostWhite = vec3(0.88, 0.88, 0.88);
    vec3 signalMagenta = vec3(1.0, 0.0, 1.0);

    vec3 glowColor = mix(frostWhite, plasmaCyan, 0.68 + v_signalHeat * 0.24);
    glowColor = mix(glowColor, signalMagenta, core * 0.18 * v_rewriteGlow);

    float alpha = haze * (0.1 + v_lifeSpan * 0.38 + core * 0.24);
    gl_FragColor = vec4(glowColor, alpha);
  }
`;

function clampRange(value: number, start: number, end: number) {
  if (end <= start) return 0;
  return Math.min(Math.max((value - start) / (end - start), 0), 1);
}

function envelope(progressValue: number, fadeInStart: number, holdStart: number, holdEnd: number, fadeOutEnd: number) {
  const fadeIn = clampRange(progressValue, fadeInStart, holdStart);
  const fadeOut = 1 - clampRange(progressValue, holdEnd, fadeOutEnd);
  return Math.min(fadeIn, fadeOut);
}

function createSeededRandom(seedValue: number) {
  let rollingSeed = seedValue >>> 0;
  return () => {
    rollingSeed = (rollingSeed * 1664525 + 1013904223) >>> 0;
    return rollingSeed / 4294967296;
  };
}

function resolveParticleTextureEdge() {
  const clampedDeviceRatio = Math.min(window.devicePixelRatio || 1, 2);
  const viewportWidth = window.innerWidth;

  if (viewportWidth < 640) {
    return clampedDeviceRatio > 1.2 ? 192 : 160;
  }

  if (viewportWidth > 1500 && clampedDeviceRatio > 1.4) {
    return 320;
  }

  return clampedDeviceRatio > 1.3 ? 256 : 224;
}

function buildDreamyFieldSeed(textureEdge: number, fieldTexture: Texture) {
  const particleCount = textureEdge * textureEdge;
  const targetHelixBuffer = (fieldTexture.image as { data: Float32Array }).data;
  const particleLookupUv = new Float32Array(particleCount * 2);
  const particleDriftSeed = new Float32Array(particleCount);
  const seededRandom = createSeededRandom(textureEdge * 9173);

  for (let particleIndex = 0; particleIndex < particleCount; particleIndex += 1) {
    const rowIndex = Math.floor(particleIndex / textureEdge);
    const columnIndex = particleIndex % textureEdge;
    const bufferOffset = particleIndex * 4;
    const lookupOffset = particleIndex * 2;
    const strandOffset = particleIndex % 2 === 0 ? 0 : Math.PI;
    const verticalTrace = rowIndex / Math.max(textureEdge - 1, 1);
    const helixAngle = verticalTrace * Math.PI * 11.0 + strandOffset;
    const helixRadius = 1.08 + Math.sin(verticalTrace * Math.PI * 9.0) * 0.24;

    targetHelixBuffer[bufferOffset] = Math.cos(helixAngle) * helixRadius + (seededRandom() - 0.5) * 0.16;
    targetHelixBuffer[bufferOffset + 1] = (verticalTrace - 0.5) * 7.0 + (seededRandom() - 0.5) * 0.22;
    targetHelixBuffer[bufferOffset + 2] = Math.sin(helixAngle) * helixRadius + (seededRandom() - 0.5) * 0.16;
    targetHelixBuffer[bufferOffset + 3] = seededRandom();

    particleLookupUv[lookupOffset] = (columnIndex + 0.5) / textureEdge;
    particleLookupUv[lookupOffset + 1] = (rowIndex + 0.5) / textureEdge;
    particleDriftSeed[particleIndex] = seededRandom();
  }

  fieldTexture.needsUpdate = true;

  return {
    particleCount,
    particleLookupUv,
    particleDriftSeed,
  };
}

function createDreamyDustGeometry(particleLookupUv: Float32Array, particleDriftSeed: Float32Array, particleCount: number) {
  const dreamyDustGeometry = new BufferGeometry();
  dreamyDustGeometry.setAttribute('position', new BufferAttribute(new Float32Array(particleCount * 3), 3));
  dreamyDustGeometry.setAttribute('aLookupUv', new BufferAttribute(particleLookupUv, 2));
  dreamyDustGeometry.setAttribute('aSignalSeed', new BufferAttribute(particleDriftSeed, 1));
  return dreamyDustGeometry;
}

interface HelixControlState {
  twistMomentum: number;
  scrollClock: number;
  particleEvolution: number;
  pointerTarget: Vector2;
  pointerDrift: Vector2;
  pointerWake: number;
  pointerSignal: number;
}

interface DreamyFieldProps {
  motionReduced: boolean;
  particleTextureEdge: number;
  helixControlRef: MutableRefObject<HelixControlState>;
}

type ParticleStateVariable = ReturnType<GPUComputationRenderer['addVariable']>;

function DreamyField({ motionReduced, particleTextureEdge, helixControlRef }: DreamyFieldProps) {
  const particleFieldRef = useRef<Points>(null);
  const particleStateRendererRef = useRef<GPUComputationRenderer | null>(null);
  const particleStateVariableRef = useRef<ParticleStateVariable | null>(null);
  const particleSimulationReadyRef = useRef(false);
  const renderMaterialRef = useRef<ShaderMaterial | null>(null);
  const { gl, invalidate, size } = useThree();

  const particleFieldState = useMemo(() => {
    const fieldRenderer = new GPUComputationRenderer(particleTextureEdge, particleTextureEdge, gl);
    fieldRenderer.setDataType(FloatType);

    const fieldTexture = fieldRenderer.createTexture();
    const seededField = buildDreamyFieldSeed(particleTextureEdge, fieldTexture);
    const particleVariable = fieldRenderer.addVariable('posBuffer', particleEvolutionFragmentShader, fieldTexture);
    fieldRenderer.setVariableDependencies(particleVariable, [particleVariable]);

    const simulationUniforms = particleVariable.material.uniforms;
    simulationUniforms.uTime = { value: 0 };
    simulationUniforms.uDelta = { value: 0.016 };
    simulationUniforms.uProgress = { value: 0 };
    simulationUniforms.uTwist = { value: 11.2 };
    simulationUniforms.uPointer = { value: new Vector2(0, 0) };
    simulationUniforms.uPointerForce = { value: 0 };
    simulationUniforms.uDriftIntensity = { value: 0.028 };

    particleVariable.material.vertexShader = particleEvolutionVertexShader;
    particleVariable.material.needsUpdate = true;

    const renderMaterial = new ShaderMaterial({
      uniforms: {
        uPositions: { value: fieldTexture },
        uTime: { value: 0 },
        uPointScale: { value: 1 },
        uScrollMorph: { value: 0 },
      },
      vertexShader: dreamyDustVertexShader,
      fragmentShader: dreamyDustFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });

    const dreamyDustGeometry = createDreamyDustGeometry(
      seededField.particleLookupUv,
      seededField.particleDriftSeed,
      seededField.particleCount
    );

    return {
      fieldRenderer,
      particleVariable,
      fieldTexture,
      renderMaterial,
      dreamyDustGeometry,
    };
  }, [gl, particleTextureEdge]);

  useEffect(() => {
    particleStateRendererRef.current = particleFieldState.fieldRenderer;
    particleStateVariableRef.current = particleFieldState.particleVariable;
    renderMaterialRef.current = particleFieldState.renderMaterial;

    const initError = particleFieldState.fieldRenderer.init();
    particleSimulationReadyRef.current = initError === null;

    if (initError !== null) {
      console.error('[HelixParticles] GPU simulation fallback:', initError);
    }

    if (motionReduced) {
      invalidate();
    }

    return () => {
      particleStateRendererRef.current = null;
      particleStateVariableRef.current = null;
      particleSimulationReadyRef.current = false;
      renderMaterialRef.current = null;
      particleFieldState.dreamyDustGeometry.dispose();
      particleFieldState.renderMaterial.dispose();
      particleFieldState.fieldRenderer.dispose();
    };
  }, [invalidate, motionReduced, particleFieldState]);

  useFrame((state, deltaTime) => {
    const renderMaterial = renderMaterialRef.current;
    const fieldRenderer = particleStateRendererRef.current;
    const particleVariable = particleStateVariableRef.current;

    if (!renderMaterial) {
      return;
    }

    const helixControls = helixControlRef.current;
    helixControls.pointerSignal = MathUtils.damp(helixControls.pointerSignal, helixControls.pointerWake, 5, deltaTime);
    helixControls.pointerDrift.x = MathUtils.damp(helixControls.pointerDrift.x, helixControls.pointerTarget.x, 6, deltaTime);
    helixControls.pointerDrift.y = MathUtils.damp(helixControls.pointerDrift.y, helixControls.pointerTarget.y, 6, deltaTime);

    renderMaterial.uniforms.uTime.value = state.clock.elapsedTime;
    renderMaterial.uniforms.uScrollMorph.value = helixControls.particleEvolution;
    renderMaterial.uniforms.uPointScale.value = Math.max(0.82, size.height / 980);

    if (!fieldRenderer || !particleVariable || !particleSimulationReadyRef.current) {
      return;
    }

    const drivenTime = state.clock.elapsedTime * 0.34 + helixControls.scrollClock;
    particleVariable.material.uniforms.uTime.value = drivenTime;
    particleVariable.material.uniforms.uDelta.value = Math.min(deltaTime, 0.033);
    particleVariable.material.uniforms.uProgress.value = helixControls.particleEvolution;
    particleVariable.material.uniforms.uTwist.value = helixControls.twistMomentum;
    particleVariable.material.uniforms.uPointer.value.copy(helixControls.pointerDrift);
    particleVariable.material.uniforms.uPointerForce.value = helixControls.pointerSignal;
    particleVariable.material.uniforms.uDriftIntensity.value = motionReduced ? 0.006 : 0.028;

    fieldRenderer.compute();
    renderMaterial.uniforms.uPositions.value = fieldRenderer.getCurrentRenderTarget(particleVariable).texture;

    const particleField = particleFieldRef.current;
    if (!particleField) {
      return;
    }

    particleField.rotation.y = MathUtils.damp(particleField.rotation.y, -0.18 + helixControls.particleEvolution * 0.42, 4, deltaTime);
    particleField.rotation.x = MathUtils.damp(particleField.rotation.x, 0.12 - helixControls.particleEvolution * 0.18, 4, deltaTime);
    particleField.position.z = MathUtils.damp(particleField.position.z, -0.3 + helixControls.particleEvolution * 0.8, 4, deltaTime);

    if (motionReduced) {
      invalidate();
    }
  });

  return (
    <points
      ref={particleFieldRef}
      frustumCulled={false}
      geometry={particleFieldState.dreamyDustGeometry}
      material={particleFieldState.renderMaterial}
    />
  );
}

interface DreamyFieldSceneProps {
  motionReduced: boolean;
  helixControlRef: MutableRefObject<HelixControlState>;
}

function DreamyFieldScene({ motionReduced, helixControlRef }: DreamyFieldSceneProps) {
  const [particleTextureEdge, setParticleTextureEdge] = useState(224);
  const [canvasDpr, setCanvasDpr] = useState(1);

  useEffect(() => {
    const settleField = window.requestAnimationFrame(() => {
      const clampedDeviceRatio = Math.min(window.devicePixelRatio || 1, 2);
      setCanvasDpr(clampedDeviceRatio);
      setParticleTextureEdge(resolveParticleTextureEdge());
    });

    return () => window.cancelAnimationFrame(settleField);
  }, []);

  return (
    <Canvas
      key={`dreamy-field-${particleTextureEdge}-${motionReduced ? 'reduced' : 'full'}`}
      camera={{ fov: 40, position: [0, 0, 14], near: 0.1, far: 60 }}
      className="pointer-events-none absolute inset-0 h-screen w-screen"
      dpr={[0.75, canvasDpr]}
      frameloop={motionReduced ? 'demand' : 'always'}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl: renderer }) => {
        renderer.setClearColor('#000000', 1);
      }}
    >
      <DreamyField
        helixControlRef={helixControlRef}
        motionReduced={motionReduced}
        particleTextureEdge={particleTextureEdge}
      />
    </Canvas>
  );
}

export default function HelixParticles() {
  const helixSectionRef = useRef<HTMLElement>(null);
  const helixPinRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const narrativeRef = useRef<HTMLParagraphElement>(null);
  const phaseOneRef = useRef<HTMLParagraphElement>(null);
  const phaseTwoRef = useRef<HTMLParagraphElement>(null);
  const phaseThreeRef = useRef<HTMLParagraphElement>(null);
  const directiveRef = useRef<HTMLDivElement>(null);
  const warningBeaconRef = useRef<HTMLDivElement>(null);
  const helixControlRef = useRef<HelixControlState>({
    twistMomentum: 11.2,
    scrollClock: 0,
    particleEvolution: 0,
    pointerTarget: new Vector2(0, 0),
    pointerDrift: new Vector2(0, 0),
    pointerWake: 0,
    pointerSignal: 0,
  });
  const { motionReduced } = useMotionPreference();

  useGSAP(() => {
    const helixSection = helixSectionRef.current;
    const helixPin = helixPinRef.current;
    const eyebrow = eyebrowRef.current;
    const headline = headlineRef.current;
    const narrative = narrativeRef.current;
    const phaseOne = phaseOneRef.current;
    const phaseTwo = phaseTwoRef.current;
    const phaseThree = phaseThreeRef.current;
    const directive = directiveRef.current;
    const warningBeacon = warningBeaconRef.current;

    if (!helixSection || !helixPin || !eyebrow || !headline || !narrative || !phaseOne || !phaseTwo || !phaseThree || !directive || !warningBeacon) {
      return;
    }

    const setEyebrowOpacity = gsap.quickSetter(eyebrow, 'opacity');
    const setEyebrowLift = gsap.quickSetter(eyebrow, 'yPercent');
    const setHeadlineOpacity = gsap.quickSetter(headline, 'opacity');
    const setHeadlineLift = gsap.quickSetter(headline, 'yPercent');
    const setNarrativeOpacity = gsap.quickSetter(narrative, 'opacity');
    const setNarrativeLift = gsap.quickSetter(narrative, 'yPercent');
    const setPhaseOneOpacity = gsap.quickSetter(phaseOne, 'opacity');
    const setPhaseTwoOpacity = gsap.quickSetter(phaseTwo, 'opacity');
    const setPhaseThreeOpacity = gsap.quickSetter(phaseThree, 'opacity');
    const setDirectiveOpacity = gsap.quickSetter(directive, 'opacity');
    const setDirectiveLift = gsap.quickSetter(directive, 'yPercent');
    const setWarningOpacity = gsap.quickSetter(warningBeacon, 'opacity');
    const setWarningLift = gsap.quickSetter(warningBeacon, 'yPercent');

    let warningReleaseAt = 0;

    const syncManifest = (progressValue: number, velocityValue = 0) => {
      const unravelPhase = clampRange(progressValue, 0.14, 0.54);
      const rewritePhase = clampRange(progressValue, 0.66, 0.98);

      helixControlRef.current.twistMomentum = MathUtils.lerp(11.4, 2.8, unravelPhase);
      helixControlRef.current.twistMomentum = MathUtils.lerp(helixControlRef.current.twistMomentum, 8.9, rewritePhase);
      helixControlRef.current.scrollClock = progressValue * 6.8;
      helixControlRef.current.particleEvolution = progressValue;

      const eyebrowVisibility = envelope(progressValue, 0.02, 0.08, 0.54, 0.68);
      const headlineVisibility = envelope(progressValue, 0.04, 0.12, 0.84, 0.98);
      const narrativeVisibility = envelope(progressValue, 0.08, 0.18, 0.58, 0.74);
      const directiveVisibility = 1 - clampRange(progressValue, 0.8, 0.98);

      setEyebrowOpacity(eyebrowVisibility * 0.9);
      setEyebrowLift((1 - eyebrowVisibility) * 24);
      setHeadlineOpacity(headlineVisibility);
      setHeadlineLift((1 - headlineVisibility) * 18 - progressValue * 8);
      setNarrativeOpacity(narrativeVisibility * 0.92);
      setNarrativeLift((1 - narrativeVisibility) * 18);
      setPhaseOneOpacity(envelope(progressValue, 0.06, 0.12, 0.24, 0.32));
      setPhaseTwoOpacity(envelope(progressValue, 0.28, 0.36, 0.52, 0.64));
      setPhaseThreeOpacity(envelope(progressValue, 0.68, 0.76, 0.92, 0.99));
      setDirectiveOpacity(directiveVisibility * 0.72);
      setDirectiveLift((1 - directiveVisibility) * 24);

      if (Math.abs(velocityValue) > 2200) {
        warningReleaseAt = performance.now() + 280;
      }

      const warningVisible = performance.now() < warningReleaseAt ? 1 : 0;
      setWarningOpacity(warningVisible);
      setWarningLift((1 - warningVisible) * 18);
      warningBeacon.classList.toggle('hardware-jitter', warningVisible > 0.5);
    };

    syncManifest(motionReduced ? 0.14 : 0, 0);

    if (motionReduced) {
      setEyebrowOpacity(0.86);
      setEyebrowLift(0);
      setHeadlineOpacity(1);
      setHeadlineLift(0);
      setNarrativeOpacity(0.92);
      setNarrativeLift(0);
      setPhaseOneOpacity(1);
      setPhaseTwoOpacity(0);
      setPhaseThreeOpacity(0);
      setDirectiveOpacity(0.72);
      setDirectiveLift(0);
      setWarningOpacity(0);

      return () => {
        warningBeacon.classList.remove('hardware-jitter');
      };
    }

    const cinematicScrubber = ScrollTrigger.create({
      trigger: helixSection,
      start: 'top top',
      end: '+=3000',
      pin: helixPin,
      scrub: true,
      anticipatePin: 1,
      onUpdate: (manifestScene) => {
        syncManifest(manifestScene.progress, manifestScene.getVelocity());
      },
    });

    return () => {
      cinematicScrubber.kill();
      warningBeacon.classList.remove('hardware-jitter');
    };
  }, { dependencies: [motionReduced], scope: helixSectionRef });

  const distortField = (event: MouseEvent<HTMLDivElement>) => {
    if (motionReduced || !helixPinRef.current) {
      return;
    }

    const pinBounds = helixPinRef.current.getBoundingClientRect();
    const normalizedX = ((event.clientX - pinBounds.left) / pinBounds.width) * 2 - 1;
    const normalizedY = -(((event.clientY - pinBounds.top) / pinBounds.height) * 2 - 1);

    helixControlRef.current.pointerTarget.set(normalizedX, normalizedY);
    helixControlRef.current.pointerWake = 1;
  };

  const settleField = () => {
    helixControlRef.current.pointerWake = 0;
    helixControlRef.current.pointerTarget.set(0, 0);
  };

  return (
    <section
      id="hero"
      ref={helixSectionRef}
      className={motionReduced ? 'relative min-h-screen bg-black' : 'relative h-[300vh] bg-black'}
    >
      <div
        ref={helixPinRef}
        className="relative flex h-screen items-center justify-center overflow-hidden bg-black"
        onMouseMove={distortField}
        onMouseLeave={settleField}
      >
        <DreamyFieldScene helixControlRef={helixControlRef} motionReduced={motionReduced} />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.14),transparent_28%),radial-gradient(circle_at_50%_65%,rgba(255,0,255,0.06),transparent_30%),linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.72)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,rgba(0,0,0,0.84)_0%,rgba(0,0,0,0)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-[linear-gradient(0deg,rgba(0,0,0,0.9)_0%,rgba(0,0,0,0)_100%)]" />

        <div className="pointer-events-none relative z-10 flex max-w-7xl flex-col items-center px-6 text-center md:px-16 lg:px-24">
          <p
            ref={eyebrowRef}
            className="mb-6 font-mono text-[10px] uppercase tracking-[0.45em] text-[#00F0FF]/78 opacity-0 md:text-xs"
          >
            cinematic terminal / dreamy particle engine / tactile blackspace
          </p>

          <h1
            ref={headlineRef}
            className="velocity-skew font-sans text-[clamp(4.5rem,17vw,15rem)] font-black uppercase leading-[0.8] tracking-[-0.1em] text-[#E0E0E0] opacity-0 will-change-transform"
          >
            MAARIF<span className="text-[#00F0FF]">.</span>
          </h1>

          <p
            ref={narrativeRef}
            className="mt-8 max-w-4xl text-balance text-sm uppercase tracking-[0.3em] text-white/64 opacity-0 md:text-base"
          >
            Not a polite landing page. A terminal-grade reveal sequence where plasma cyan dust twists, loosens into smoke, and reforms into a machine frame as the archive wakes up.
          </p>

          <div className="mt-10 space-y-3 font-mono text-[10px] uppercase tracking-[0.36em] text-[#E0E0E0]/68 md:text-xs">
            <p ref={phaseOneRef} className="opacity-0">[ system_manifest / signal stable ]</p>
            <p ref={phaseTwoRef} className="opacity-0">[ core_deconstructed / drift expanding ]</p>
            <p ref={phaseThreeRef} className="opacity-0">[ signal_rewritten / terminal frame rebuilt ]</p>
          </div>
        </div>

        <div
          ref={directiveRef}
          className="pointer-events-none absolute bottom-12 left-1/2 z-20 -translate-x-1/2 border border-[#00F0FF]/24 bg-black/62 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.36em] text-[#E0E0E0]/72 opacity-0 backdrop-blur-sm md:bottom-14"
        >
          [ move through the field ]
        </div>

        <div
          ref={warningBeaconRef}
          className="pointer-events-none absolute right-6 top-24 z-20 hidden border border-[#00F0FF]/72 bg-black/88 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.35em] text-[#00F0FF] opacity-0 md:block"
        >
          [ FIELD_WARNING: SIGNAL_TEAR ]
        </div>
      </div>
    </section>
  );
}
