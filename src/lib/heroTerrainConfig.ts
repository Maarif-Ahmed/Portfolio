export const HERO_TERRAIN_CONFIG = {
  terrain: {
    chunkSize: 50,
    chunksPerSide: 1,
    gridResolution: 80,
    chunkOverlap: 0.5,
    displacementScale: 0.18,
    textureRepeat: 7,
    saveLimit: 160,
  },
  deformation: {
    radius: 2.5,
    waveAmplitude: 0.005,
    waveFrequency: 4,
    depthStrength: 10,
    contactHeight: 1.05,
    stepSpacing: 0.34,
  },
  character: {
    speed: 11.4,
    rotationLerp: 4,
    scale: 0.1,
    yOffset: -0.5,
    walkAnimation: 'Armature|mixamo.com|Layer0',
    idleAnimation: 'Armature.001|mixamo.com|Layer0',
    leftFootBone: 'mixamorigLeftFoot',
    rightFootBone: 'mixamorigRightFoot',
  },
  camera: {
    fov: 65,
    basePosition: [0, 30, 100] as [number, number, number],
    followOffset: [0, 18, 28] as [number, number, number],
    lookHeight: 6.7,
    followDamping: 4.2,
  },
  lighting: {
    directionalPosition: [18, 28, 12] as [number, number, number],
    directionalIntensity: 2.8,
    fillPosition: [-16, 14, -24] as [number, number, number],
    fillIntensity: 0.38,
    hemisphereSky: '#f7fbff',
    hemisphereGround: '#bcc7cf',
    hemisphereIntensity: 0.7,
    ambientIntensity: 0.42,
  },
  performance: {
    desktopMaxDpr: 1.2,
    mobileMaxDpr: 1,
  },
} as const;

export type HeroTerrainConfig = typeof HERO_TERRAIN_CONFIG;
