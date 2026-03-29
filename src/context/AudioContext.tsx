'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

interface AudioContextType {
  isMuted: boolean;
  isUnlocked: boolean;
  toggleMute: () => void;
  unlockAudio: () => Promise<void>;
  startAmbient: () => Promise<void>;
  stopAmbient: () => void;
  setHeroRoomTone: (progress: number) => Promise<void>;
  playBlip: () => void;
  playTypingTick: () => void;
  playGlitchBurst: () => void;
  playHeroSwell: (intensity?: number) => void;
  playTransitionTone: () => void;
  getAudioData: () => number;
}

interface WindowWithWebkitAudio extends Window {
  webkitAudioContext?: typeof AudioContext;
}

interface AmbientNodes {
  gain: GainNode;
  filter: BiquadFilterNode;
  noiseFilter: BiquadFilterNode;
  oscillators: OscillatorNode[];
  noise: AudioBufferSourceNode;
  lfo: OscillatorNode;
  lfoGain: GainNode;
}

interface HeroRoomNodes {
  air: OscillatorNode;
  body: OscillatorNode;
  filter: BiquadFilterNode;
  gain: GainNode;
  harmonic: OscillatorNode;
  tremor: OscillatorNode;
  tremorGain: GainNode;
  vigil: OscillatorNode;
  vigilGain: GainNode;
}

const AudioStateContext = createContext<AudioContextType | undefined>(undefined);

function createNoiseBuffer(ctx: AudioContext, durationSeconds: number) {
  const frameCount = Math.max(1, Math.floor(ctx.sampleRate * durationSeconds));
  const noiseBuffer = ctx.createBuffer(1, frameCount, ctx.sampleRate);
  const channel = noiseBuffer.getChannelData(0);

  for (let index = 0; index < frameCount; index += 1) {
    channel[index] = (Math.random() * 2 - 1) * 0.38;
  }

  return noiseBuffer;
}

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const masterAnalyserRef = useRef<AnalyserNode | null>(null);
  const ambientNodesRef = useRef<AmbientNodes | null>(null);
  const heroRoomNodesRef = useRef<HeroRoomNodes | null>(null);
  const heroRoomStopTimerRef = useRef<number | null>(null);
  const isUnlockedRef = useRef(false);
  const isMutedRef = useRef(false);
  const lastTypingTickRef = useRef(0);
  const lastRelayClickRef = useRef(0);
  const lastHeroSwellRef = useRef(0);
  const lastTransitionToneRef = useRef(0);

  const getAudioContext = useCallback(async () => {
    if (!audioCtxRef.current) {
      const AudioCtor =
        window.AudioContext ??
        (window as WindowWithWebkitAudio).webkitAudioContext;

      if (!AudioCtor) return null;
      const ctx = new AudioCtor();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      const masterAnalyser = ctx.createAnalyser();
      masterAnalyser.fftSize = 64;
      masterAnalyser.smoothingTimeConstant = 0.8;

      masterGain.connect(masterAnalyser);
      masterAnalyser.connect(ctx.destination);

      masterGainRef.current = masterGain;
      masterAnalyserRef.current = masterAnalyser;
    }

    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }

    return audioCtxRef.current;
  }, []);

  const stopAmbient = useCallback(() => {
    const nodes = ambientNodesRef.current;
    if (!nodes) return;

    try {
      nodes.oscillators.forEach((oscillator) => oscillator.stop());
      nodes.noise.stop();
      nodes.lfo.stop();
    } catch {
      // Nodes may already be stopped during route transitions.
    }

    nodes.oscillators.forEach((oscillator) => oscillator.disconnect());
    nodes.noise.disconnect();
    nodes.lfo.disconnect();
    nodes.lfoGain.disconnect();
    nodes.noiseFilter.disconnect();
    nodes.filter.disconnect();
    nodes.gain.disconnect();
    ambientNodesRef.current = null;
  }, []);

  const clearHeroRoomStopTimer = useCallback(() => {
    if (heroRoomStopTimerRef.current !== null) {
      window.clearTimeout(heroRoomStopTimerRef.current);
      heroRoomStopTimerRef.current = null;
    }
  }, []);

  const stopHeroRoom = useCallback(() => {
    clearHeroRoomStopTimer();

    const nodes = heroRoomNodesRef.current;
    if (!nodes) return;

    try {
      nodes.body.stop();
      nodes.harmonic.stop();
      nodes.air.stop();
      nodes.tremor.stop();
      nodes.vigil.stop();
    } catch {
      // A route transition may catch the voices mid-release.
    }

    nodes.body.disconnect();
    nodes.harmonic.disconnect();
    nodes.air.disconnect();
    nodes.tremor.disconnect();
    nodes.tremorGain.disconnect();
    nodes.vigil.disconnect();
    nodes.vigilGain.disconnect();
    nodes.filter.disconnect();
    nodes.gain.disconnect();
    heroRoomNodesRef.current = null;
  }, [clearHeroRoomStopTimer]);

  const startAmbient = useCallback(async () => {
    if (isMutedRef.current || !isUnlockedRef.current || ambientNodesRef.current) return;

    const ctx = await getAudioContext();
    if (!ctx) return;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, ctx.currentTime);
    filter.Q.setValueAtTime(0.8, ctx.currentTime);

    const base = ctx.createOscillator();
    base.type = 'sawtooth';
    base.frequency.setValueAtTime(47, ctx.currentTime);

    const harmonic = ctx.createOscillator();
    harmonic.type = 'triangle';
    harmonic.frequency.setValueAtTime(62, ctx.currentTime);
    harmonic.detune.setValueAtTime(-5, ctx.currentTime);

    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, 2.4);
    noise.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(180, ctx.currentTime);
    noiseFilter.Q.setValueAtTime(0.42, ctx.currentTime);

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.14, ctx.currentTime);

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.002, ctx.currentTime);

    base.connect(filter);
    harmonic.connect(filter);
    noise.connect(noiseFilter);
    noiseFilter.connect(filter);
    filter.connect(gain);
    if (masterGainRef.current) gain.connect(masterGainRef.current);

    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);

    base.start();
    harmonic.start();
    noise.start();
    lfo.start();

    gain.gain.exponentialRampToValueAtTime(0.015, ctx.currentTime + 1.8);

    ambientNodesRef.current = {
      gain,
      filter,
      noiseFilter,
      oscillators: [base, harmonic],
      noise,
      lfo,
      lfoGain,
    };
  }, [getAudioContext]);

  const setHeroRoomTone = useCallback(async (progress: number) => {
    if (progress < 0 || isMutedRef.current || !isUnlockedRef.current) {
      stopHeroRoom();
      return;
    }

    const ctx = await getAudioContext();
    if (!ctx) return;

    clearHeroRoomStopTimer();

    let nodes = heroRoomNodesRef.current;
    if (!nodes) {
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(118, ctx.currentTime);
      filter.Q.setValueAtTime(0.42, ctx.currentTime);

      const body = ctx.createOscillator();
      body.type = 'sine';
      body.frequency.setValueAtTime(41, ctx.currentTime);

      const harmonic = ctx.createOscillator();
      harmonic.type = 'triangle';
      harmonic.frequency.setValueAtTime(61, ctx.currentTime);
      harmonic.detune.setValueAtTime(-4, ctx.currentTime);

      const air = ctx.createOscillator();
      air.type = 'sine';
      air.frequency.setValueAtTime(83, ctx.currentTime);
      air.detune.setValueAtTime(7, ctx.currentTime);

      const tremor = ctx.createOscillator();
      tremor.type = 'sine';
      tremor.frequency.setValueAtTime(0.06, ctx.currentTime);

      const tremorGain = ctx.createGain();
      tremorGain.gain.setValueAtTime(0.00075, ctx.currentTime);

      const vigil = ctx.createOscillator();
      vigil.type = 'sine';
      vigil.frequency.setValueAtTime(92, ctx.currentTime);

      const vigilGain = ctx.createGain();
      vigilGain.gain.setValueAtTime(0.0001, ctx.currentTime);

      body.connect(filter);
      harmonic.connect(filter);
      air.connect(filter);
      vigil.connect(vigilGain);
      vigilGain.connect(filter);
      filter.connect(gain);
      if (masterGainRef.current) gain.connect(masterGainRef.current);

      tremor.connect(tremorGain);
      tremorGain.connect(gain.gain);

      body.start();
      harmonic.start();
      air.start();
      tremor.start();
      vigil.start();

      nodes = { air, body, filter, gain, harmonic, tremor, tremorGain, vigil, vigilGain };
      heroRoomNodesRef.current = nodes;
    }

    const clampedProgress = Math.min(Math.max(progress, 0), 1);
    const vigilPresence =
      clampedProgress < 0.46
        ? 0
        : clampedProgress < 0.74
          ? Math.min((clampedProgress - 0.46) / 0.18, 1) * (1 - Math.min(Math.max(clampedProgress - 0.64, 0) / 0.1, 1) * 0.28)
          : Math.max(1 - (clampedProgress - 0.74) / 0.18, 0) * 0.35;
    const chamberGain =
      clampedProgress < 0.48
        ? 0.0008 + clampedProgress * 0.0024
        : clampedProgress < 0.72
          ? 0.00195 + ((clampedProgress - 0.48) / 0.24) * 0.00115
          : 0.0031 - ((clampedProgress - 0.72) / 0.28) * 0.0029;
    const filteredGain = Math.max(0.00012, chamberGain);
    const filterCutoff =
      clampedProgress < 0.48
        ? 102 + clampedProgress * 38
        : clampedProgress < 0.72
          ? 120 + ((clampedProgress - 0.48) / 0.24) * 28
          : 148 - ((clampedProgress - 0.72) / 0.28) * 52;

    nodes.gain.gain.cancelScheduledValues(ctx.currentTime);
    nodes.gain.gain.setTargetAtTime(filteredGain, ctx.currentTime, 0.28);

    nodes.filter.frequency.cancelScheduledValues(ctx.currentTime);
    nodes.filter.frequency.setTargetAtTime(filterCutoff, ctx.currentTime, 0.36);

    nodes.body.frequency.cancelScheduledValues(ctx.currentTime);
    nodes.body.frequency.setTargetAtTime(39.5 + clampedProgress * 3.6, ctx.currentTime, 0.32);

    nodes.harmonic.frequency.cancelScheduledValues(ctx.currentTime);
    nodes.harmonic.frequency.setTargetAtTime(58 + clampedProgress * 5.5, ctx.currentTime, 0.32);

    nodes.air.frequency.cancelScheduledValues(ctx.currentTime);
    nodes.air.frequency.setTargetAtTime(80 + clampedProgress * 9, ctx.currentTime, 0.34);

    nodes.vigil.frequency.cancelScheduledValues(ctx.currentTime);
    nodes.vigil.frequency.setTargetAtTime(92 + vigilPresence * 7.5, ctx.currentTime, 0.4);

    nodes.vigilGain.gain.cancelScheduledValues(ctx.currentTime);
    nodes.vigilGain.gain.setTargetAtTime(0.0001 + vigilPresence * 0.0009, ctx.currentTime, 0.32);

    if (clampedProgress > 0.985) {
      heroRoomStopTimerRef.current = window.setTimeout(() => {
        stopHeroRoom();
      }, 640);
    }
  }, [clearHeroRoomStopTimer, getAudioContext, stopHeroRoom]);

  const unlockAudio = useCallback(async () => {
    const ctx = await getAudioContext();
    if (!ctx) return;

    isUnlockedRef.current = true;
    setIsUnlocked(true);

    if (!isMutedRef.current) {
      await startAmbient();
    }
  }, [getAudioContext, startAmbient]);

  const playBlip = useCallback(async () => {
    if (isMutedRef.current || !isUnlockedRef.current) return;

    const now = performance.now();
    if (now - lastRelayClickRef.current < 48) return;
    lastRelayClickRef.current = now;

    const ctx = await getAudioContext();
    if (!ctx) return;

    const relayOscillator = ctx.createOscillator();
    const relayGain = ctx.createGain();
    const relayFilter = ctx.createBiquadFilter();
    const thockOscillator = ctx.createOscillator();
    const thockGain = ctx.createGain();

    relayOscillator.type = 'square';
    relayOscillator.frequency.setValueAtTime(1680, ctx.currentTime);
    relayOscillator.frequency.exponentialRampToValueAtTime(760, ctx.currentTime + 0.022);

    relayFilter.type = 'highpass';
    relayFilter.frequency.setValueAtTime(980, ctx.currentTime);
    relayFilter.Q.setValueAtTime(0.6, ctx.currentTime);

    relayGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    relayGain.gain.exponentialRampToValueAtTime(0.022, ctx.currentTime + 0.004);
    relayGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.045);

    thockOscillator.type = 'triangle';
    thockOscillator.frequency.setValueAtTime(220, ctx.currentTime);
    thockOscillator.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.035);

    thockGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    thockGain.gain.exponentialRampToValueAtTime(0.014, ctx.currentTime + 0.005);
    thockGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.055);

    relayOscillator.connect(relayFilter);
    relayFilter.connect(relayGain);
    if (masterGainRef.current) relayGain.connect(masterGainRef.current);

    thockOscillator.connect(thockGain);
    if (masterGainRef.current) thockGain.connect(masterGainRef.current);

    relayOscillator.start();
    thockOscillator.start();
    relayOscillator.stop(ctx.currentTime + 0.06);
    thockOscillator.stop(ctx.currentTime + 0.06);
  }, [getAudioContext]);

  const playTypingTick = useCallback(async () => {
    if (isMutedRef.current || !isUnlockedRef.current) return;

    const now = performance.now();
    if (now - lastTypingTickRef.current < 25) return;
    lastTypingTickRef.current = now;

    const ctx = await getAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(1620, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(540, ctx.currentTime + 0.025);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(980, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.018, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);

    oscillator.connect(filter);
    filter.connect(gainNode);
    if (masterGainRef.current) gainNode.connect(masterGainRef.current);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.03);
  }, [getAudioContext]);

  const playGlitchBurst = useCallback(async () => {
    if (isMutedRef.current || !isUnlockedRef.current) return;

    const ctx = await getAudioContext();
    if (!ctx) return;

    const carrier = ctx.createOscillator();
    const mod = ctx.createOscillator();
    const carrierGain = ctx.createGain();
    const modGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    carrier.type = 'sawtooth';
    carrier.frequency.setValueAtTime(130, ctx.currentTime);
    carrier.frequency.exponentialRampToValueAtTime(34, ctx.currentTime + 0.45);

    mod.type = 'square';
    mod.frequency.setValueAtTime(28, ctx.currentTime);
    modGain.gain.setValueAtTime(55, ctx.currentTime);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(720, ctx.currentTime);
    filter.Q.setValueAtTime(1.4, ctx.currentTime);

    carrierGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    carrierGain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.02);
    carrierGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.55);

    mod.connect(modGain);
    modGain.connect(carrier.frequency);
    carrier.connect(filter);
    filter.connect(carrierGain);
    if (masterGainRef.current) carrierGain.connect(masterGainRef.current);

    carrier.start();
    mod.start();
    carrier.stop(ctx.currentTime + 0.6);
    mod.stop(ctx.currentTime + 0.6);
  }, [getAudioContext]);

  const playHeroSwell = useCallback(async (intensity = 1) => {
    if (isMutedRef.current || !isUnlockedRef.current) return;

    const now = performance.now();
    if (now - lastHeroSwellRef.current < 680) return;
    lastHeroSwellRef.current = now;

    const ctx = await getAudioContext();
    if (!ctx) return;

    const swellGain = ctx.createGain();
    const swellFilter = ctx.createBiquadFilter();
    const body = ctx.createOscillator();
    const harmony = ctx.createOscillator();
    const swellAmount = Math.min(Math.max(intensity, 0.45), 1.3);

    swellFilter.type = 'lowpass';
    swellFilter.frequency.setValueAtTime(980, ctx.currentTime);
    swellFilter.frequency.exponentialRampToValueAtTime(560, ctx.currentTime + 1.6);
    swellFilter.Q.setValueAtTime(0.7, ctx.currentTime);

    swellGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    swellGain.gain.exponentialRampToValueAtTime(0.012 * swellAmount, ctx.currentTime + 0.22);
    swellGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.9);

    body.type = 'triangle';
    body.frequency.setValueAtTime(196, ctx.currentTime);
    body.frequency.exponentialRampToValueAtTime(164, ctx.currentTime + 1.6);
    body.detune.setValueAtTime(-4, ctx.currentTime);

    harmony.type = 'sine';
    harmony.frequency.setValueAtTime(294, ctx.currentTime);
    harmony.frequency.exponentialRampToValueAtTime(246, ctx.currentTime + 1.6);
    harmony.detune.setValueAtTime(3, ctx.currentTime);

    body.connect(swellFilter);
    harmony.connect(swellFilter);
    swellFilter.connect(swellGain);
    if (masterGainRef.current) swellGain.connect(masterGainRef.current);

    body.start();
    harmony.start();
    body.stop(ctx.currentTime + 2);
    harmony.stop(ctx.currentTime + 2);
  }, [getAudioContext]);

  const playTransitionTone = useCallback(async () => {
    if (isMutedRef.current || !isUnlockedRef.current) return;

    const now = performance.now();
    if (now - lastTransitionToneRef.current < 1400) return;
    lastTransitionToneRef.current = now;

    const ctx = await getAudioContext();
    if (!ctx) return;

    const bridgeGain = ctx.createGain();
    const bridgeFilter = ctx.createBiquadFilter();
    const body = ctx.createOscillator();
    const air = ctx.createOscillator();

    bridgeFilter.type = 'lowpass';
    bridgeFilter.frequency.setValueAtTime(420, ctx.currentTime);
    bridgeFilter.Q.setValueAtTime(0.7, ctx.currentTime);

    bridgeGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    bridgeGain.gain.exponentialRampToValueAtTime(0.0042, ctx.currentTime + 0.16);
    bridgeGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.15);

    body.type = 'triangle';
    body.frequency.setValueAtTime(132, ctx.currentTime);
    body.frequency.exponentialRampToValueAtTime(118, ctx.currentTime + 1.1);

    air.type = 'sine';
    air.frequency.setValueAtTime(198, ctx.currentTime);
    air.frequency.exponentialRampToValueAtTime(176, ctx.currentTime + 1.1);
    air.detune.setValueAtTime(5, ctx.currentTime);

    body.connect(bridgeFilter);
    air.connect(bridgeFilter);
    bridgeFilter.connect(bridgeGain);
    if (masterGainRef.current) bridgeGain.connect(masterGainRef.current);

    body.start();
    air.start();
    body.stop(ctx.currentTime + 1.2);
    air.stop(ctx.currentTime + 1.2);
  }, [getAudioContext]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      isMutedRef.current = next;

      if (next) {
        stopAmbient();
        stopHeroRoom();
      } else if (isUnlockedRef.current) {
        void startAmbient();
      }

      return next;
    });
  }, [startAmbient, stopAmbient, stopHeroRoom]);

  const getAudioData = useCallback(() => {
    if (!masterAnalyserRef.current || isMutedRef.current || !isUnlockedRef.current) return 0;
    
    const dataArray = new Uint8Array(masterAnalyserRef.current.frequencyBinCount);
    masterAnalyserRef.current.getByteFrequencyData(dataArray);
    
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    
    return sum / (dataArray.length * 255);
  }, []);

  useEffect(() => {
    const handleFirstGesture = () => {
      void unlockAudio();
    };

    window.addEventListener('pointerdown', handleFirstGesture, { once: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      stopAmbient();
      stopHeroRoom();
    };
  }, [stopAmbient, stopHeroRoom, unlockAudio]);

  return (
    <AudioStateContext.Provider
      value={{
        isMuted,
        isUnlocked,
        toggleMute,
        unlockAudio,
        startAmbient,
        stopAmbient,
        setHeroRoomTone,
        playBlip,
        playTypingTick,
        playGlitchBurst,
        playHeroSwell,
        playTransitionTone,
        getAudioData,
      }}
    >
      {children}
    </AudioStateContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioStateContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
