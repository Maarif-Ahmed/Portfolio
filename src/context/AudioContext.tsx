'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef } from 'react';

interface AudioContextType {
  playBlip: () => void;
  playSnowStep: () => void;
}

const AudioStateContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastBlipRef = useRef(0);
  const lastSnowStepRef = useRef(0);
  const snowBufferRef = useRef<AudioBuffer | null>(null);
  const snowStepTrackRef = useRef<AudioBuffer | null>(null);
  const snowStepOffsetsRef = useRef<number[] | null>(null);
  const snowStepLoadRef = useRef<Promise<AudioBuffer | null> | null>(null);
  const snowStepIndexRef = useRef(0);

  const getAudioContext = useCallback(async () => {
    if (typeof window === 'undefined') return null;

    if (!audioContextRef.current) {
      const AudioCtor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtor) return null;
      audioContextRef.current = new AudioCtor();
    }

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    return audioContextRef.current;
  }, []);

  const playBlip = useCallback(async () => {
    const now = performance.now();
    if (now - lastBlipRef.current < 48) return;
    lastBlipRef.current = now;

    const ctx = await getAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(1240, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(620, ctx.currentTime + 0.04);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(900, ctx.currentTime);
    filter.Q.setValueAtTime(0.65, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.018, ctx.currentTime + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.055);

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.06);
  }, [getAudioContext]);

  const detectFootstepOffsets = useCallback((buffer: AudioBuffer) => {
    const channel = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;
    const windowSize = Math.max(256, Math.floor(sampleRate * 0.018));
    const hopSize = Math.max(128, Math.floor(sampleRate * 0.009));
    const rmsValues: Array<{ offset: number; value: number }> = [];

    for (let start = 0; start + windowSize < channel.length; start += hopSize) {
      let sum = 0;

      for (let index = 0; index < windowSize; index += 1) {
        const sample = channel[start + index];
        sum += sample * sample;
      }

      rmsValues.push({
        offset: start / sampleRate,
        value: Math.sqrt(sum / windowSize),
      });
    }

    if (!rmsValues.length) {
      return [0];
    }

    const sorted = rmsValues.map((entry) => entry.value).sort((a, b) => a - b);
    const highIndex = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.86));
    const threshold = Math.max(sorted[highIndex] ?? 0, 0.02);
    const minSpacing = 0.16;
    const clipDuration = 0.24;
    const offsets: number[] = [];

    for (let index = 1; index < rmsValues.length - 1; index += 1) {
      const current = rmsValues[index];
      const previous = rmsValues[index - 1];
      const next = rmsValues[index + 1];

      if (!previous || !next) continue;
      if (current.value < threshold) continue;
      if (current.value < previous.value || current.value < next.value) continue;
      if (offsets.length && current.offset - offsets[offsets.length - 1] < minSpacing) continue;
      if (current.offset > buffer.duration - clipDuration) continue;

      offsets.push(Math.max(0, current.offset - 0.015));
    }

    return offsets.length ? offsets : [0];
  }, []);

  const loadSnowStepTrack = useCallback(async (ctx: AudioContext) => {
    if (snowStepTrackRef.current) {
      return snowStepTrackRef.current;
    }

    if (snowStepLoadRef.current) {
      return snowStepLoadRef.current;
    }

    snowStepLoadRef.current = fetch('/hero-terrain/audio/dragon-studio-footsteps-in-the-snow-499652.mp3')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Unable to load provided hero footstep sample.');
        }

        const audioData = await response.arrayBuffer();
        return await ctx.decodeAudioData(audioData.slice(0));
      })
      .then((buffer) => {
        snowStepTrackRef.current = buffer;
        snowStepOffsetsRef.current = detectFootstepOffsets(buffer);
        return buffer;
      })
      .catch(() => null)
      .finally(() => {
        snowStepLoadRef.current = null;
      });

    return snowStepLoadRef.current;
  }, [detectFootstepOffsets]);

  const playFallbackSnowStep = useCallback((ctx: AudioContext) => {
    if (!snowBufferRef.current) {
      const duration = 0.18;
      const length = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const channel = buffer.getChannelData(0);

      for (let index = 0; index < length; index += 1) {
        const progress = index / length;
        const envelope = Math.exp(-progress * 7.2);
        const grit = (Math.random() * 2 - 1) * 0.85;
        const body = Math.sin(progress * Math.PI * 14) * 0.15;
        channel[index] = (grit + body) * envelope;
      }

      snowBufferRef.current = buffer;
    }

    const source = ctx.createBufferSource();
    source.buffer = snowBufferRef.current;
    source.playbackRate.setValueAtTime(0.92 + Math.random() * 0.14, ctx.currentTime);

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(640 + Math.random() * 160, ctx.currentTime);
    bandpass.Q.setValueAtTime(0.55, ctx.currentTime);

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(1280, ctx.currentTime);
    lowpass.Q.setValueAtTime(0.7, ctx.currentTime);

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(85, ctx.currentTime);
    highpass.Q.setValueAtTime(0.45, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12 + Math.random() * 0.025, ctx.currentTime + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.16);

    const impactOscillator = ctx.createOscillator();
    impactOscillator.type = 'triangle';
    impactOscillator.frequency.setValueAtTime(126 + Math.random() * 16, ctx.currentTime);
    impactOscillator.frequency.exponentialRampToValueAtTime(58, ctx.currentTime + 0.1);

    const impactGain = ctx.createGain();
    impactGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    impactGain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.01);
    impactGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-20, ctx.currentTime);
    compressor.knee.setValueAtTime(14, ctx.currentTime);
    compressor.ratio.setValueAtTime(3, ctx.currentTime);
    compressor.attack.setValueAtTime(0.003, ctx.currentTime);
    compressor.release.setValueAtTime(0.12, ctx.currentTime);

    source.connect(bandpass);
    bandpass.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(gain);
    impactOscillator.connect(impactGain);
    impactGain.connect(gain);
    gain.connect(compressor);
    compressor.connect(ctx.destination);

    source.start();
    impactOscillator.start();
    source.stop(ctx.currentTime + 0.18);
    impactOscillator.stop(ctx.currentTime + 0.13);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const unlockAudio = async () => {
      const ctx = await getAudioContext();
      if (ctx) {
        void loadSnowStepTrack(ctx);
      }
    };

    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio);

    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, [getAudioContext, loadSnowStepTrack]);

  const playSnowStep = useCallback(async () => {
    const now = performance.now();
    if (now - lastSnowStepRef.current < 90) return;
    lastSnowStepRef.current = now;

    const ctx = await getAudioContext();
    if (!ctx) return;

    const buffer = await loadSnowStepTrack(ctx);

    if (!buffer) {
      playFallbackSnowStep(ctx);
      return;
    }

    const offsets = snowStepOffsetsRef.current ?? [0];
    const offset = offsets[snowStepIndexRef.current % offsets.length] ?? 0;
    snowStepIndexRef.current += 1;
    const clipDuration = Math.min(0.24, Math.max(0.1, buffer.duration - offset - 0.01));

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.setValueAtTime(0.98 + Math.random() * 0.05, ctx.currentTime);

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(70, ctx.currentTime);
    highpass.Q.setValueAtTime(0.35, ctx.currentTime);

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(1800, ctx.currentTime);
    lowpass.Q.setValueAtTime(0.6, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.28, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + clipDuration);

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-18, ctx.currentTime);
    compressor.knee.setValueAtTime(12, ctx.currentTime);
    compressor.ratio.setValueAtTime(2.8, ctx.currentTime);
    compressor.attack.setValueAtTime(0.002, ctx.currentTime);
    compressor.release.setValueAtTime(0.08, ctx.currentTime);

    source.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(compressor);
    compressor.connect(ctx.destination);

    source.start(ctx.currentTime, offset, clipDuration);
    source.stop(ctx.currentTime + clipDuration + 0.02);
  }, [getAudioContext, loadSnowStepTrack, playFallbackSnowStep]);

  return (
    <AudioStateContext.Provider value={{ playBlip, playSnowStep }}>
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
