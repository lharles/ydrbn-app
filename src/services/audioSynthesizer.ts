/**
 * Web Audio API Algorithmic Synthesizer Engine with Hybrid Stem Mixing
 * Generates multi-instrument retro music clips, rhythmic arpeggios,
 * analog percussion, and layered vintage stem recordings.
 */

import { AlbumEntry } from '../types';
import { getOrSelectStemsForAlbum, loadStemBuffer } from './stemAudioService';

export type TurntableRpm = 33 | 45 | 16;

const BASE_STEM_URL = `${(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}/audio/stems/`;

export class RetroAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private activeNodes: { stop: () => void }[] = [];
  private activeBufferSources: AudioBufferSourceNode[] = [];
  private activeHtmlAudio: HTMLAudioElement | null = null;
  private activeTimeouts: NodeJS.Timeout[] = [];
  private pendingResolve: ((val: boolean) => void) | null = null;
  private analyser: AnalyserNode | null = null;
  private freqData: Uint8Array<ArrayBuffer> | null = null;
  private currentRpm: TurntableRpm = 33;
  private isAtjPlayingNow = false;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getRpm(): TurntableRpm {
    return this.currentRpm;
  }

  public getRateMultiplier(rpm: TurntableRpm = this.currentRpm): number {
    if (rpm === 45) return 1.35;
    if (rpm === 16) return 0.55;
    return 1.0;
  }

  public setRpm(rpm: TurntableRpm): void {
    this.currentRpm = rpm;
    if (this.isAtjPlayingNow) return;

    const rate = this.getRateMultiplier(rpm);
    if (this.ctx && this.isPlaying) {
      const now = this.ctx.currentTime;
      this.activeBufferSources.forEach((src) => {
        try {
          src.playbackRate.setTargetAtTime(rate, now, 0.04);
        } catch {
          // ignore stopped source
        }
      });
    }
  }

  public stopAll(): void {
    this.activeTimeouts.forEach((t) => clearTimeout(t));
    this.activeTimeouts = [];

    this.activeNodes.forEach((node) => {
      try {
        node.stop();
      } catch {
        // node already stopped
      }
    });
    this.activeNodes = [];
    this.activeBufferSources = [];

    if (this.activeHtmlAudio) {
      try {
        this.activeHtmlAudio.onended = null;
        this.activeHtmlAudio.onerror = null;
        this.activeHtmlAudio.pause();
        this.activeHtmlAudio.currentTime = 0;
      } catch {
        // ignore
      }
      this.activeHtmlAudio = null;
    }

    this.isPlaying = false;
    this.isAtjPlayingNow = false;

    if (this.pendingResolve) {
      const res = this.pendingResolve;
      this.pendingResolve = null;
      res(false);
    }
  }

  /**
   * Dedicated full-length streaming player for ATJ.mp3.
   * Uses native HTMLAudioElement instead of Web Audio decodeAudioData
   * so the full song plays 100% to completion without buffer truncation.
   */
  private playAtjFullTrack(): Promise<boolean> {
    return new Promise((resolve) => {
      this.pendingResolve = resolve;
      const audio = new Audio(`${BASE_STEM_URL}ATJ.mp3`);
      audio.preload = 'auto';
      audio.loop = false;
      audio.volume = 1.0;
      this.activeHtmlAudio = audio;

      audio.onended = () => {
        this.activeHtmlAudio = null;
        this.isPlaying = false;
        this.isAtjPlayingNow = false;
        this.pendingResolve = null;
        resolve(true);
      };

      audio.onerror = (err) => {
        console.warn('[AudioSynthesizer] ATJ playback error:', err);
        this.activeHtmlAudio = null;
        this.isPlaying = false;
        this.isAtjPlayingNow = false;
        this.pendingResolve = null;
        resolve(false);
      };

      audio.play().catch((err) => {
        console.warn('[AudioSynthesizer] ATJ play() rejected:', err);
        this.activeHtmlAudio = null;
        this.isPlaying = false;
        this.isAtjPlayingNow = false;
        this.pendingResolve = null;
        resolve(false);
      });
    });
  }

  public async playAlbumClip(
    albumId: string,
    seedTitle: string,
    yearStr: string = '1975',
    preset?: AlbumEntry['audioPreset']
  ): Promise<boolean> {
    this.stopAll();
    this.isPlaying = true;

    // 1. Resolve or retrieve the permanent stem plan for this specific album drop
    const plan = getOrSelectStemsForAlbum(albumId, yearStr);
    const isAtj = plan.isAtjFanfare || plan.stems.includes('ATJ.mp3');
    this.isAtjPlayingNow = isAtj;

    // 2. If ATJ.mp3 is triggered, fire fanfare and stream full song via native HTMLAudioElement
    if (isAtj) {
      window.dispatchEvent(new CustomEvent('ydrbn-atj-fanfare'));
      return this.playAtjFullTrack();
    }

    const ctx = this.getContext();
    if (ctx.state === 'suspended') {
      await ctx.resume().catch(() => {});
    }

    const rate = this.getRateMultiplier(this.currentRpm);
    const parsedYear = parseInt(yearStr.replace(/\D/g, ''), 10) || 1977;

    // 3. Pre-load stem audio buffers
    const loadedBuffers = await Promise.all(
      plan.stems.map((filename) => loadStemBuffer(filename, ctx))
    );

    if (!this.isPlaying) return false;

    const validBuffers = loadedBuffers.filter((b): b is AudioBuffer => b !== null);

    let maxDuration = 6.2;
    if (validBuffers.length > 0) {
      const stemMax = Math.max(...validBuffers.map((b) => b.duration / rate));
      maxDuration = Math.max(stemMax, 5.0);
    }
    const duration = Math.min(maxDuration, 18.0);
    const now = ctx.currentTime;

    // 4. Master Output Bus with analog compressor
    const masterComp = ctx.createDynamicsCompressor();
    masterComp.threshold.setValueAtTime(-18, now);
    masterComp.knee.setValueAtTime(12, now);
    masterComp.ratio.setValueAtTime(4, now);
    masterComp.attack.setValueAtTime(0.005, now);
    masterComp.release.setValueAtTime(0.15, now);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.linearRampToValueAtTime(0.75, now + 0.3);
    masterGain.gain.setValueAtTime(0.75, now + Math.max(0.35, duration - 0.5));
    masterGain.gain.linearRampToValueAtTime(0.001, now + duration);

    masterComp.connect(masterGain);
    masterGain.connect(ctx.destination);

    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 64;
    this.analyser.smoothingTimeConstant = 0.72;
    this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
    masterGain.connect(this.analyser);

    // 5. Play Continuous needle-drop vinyl crackle
    this.playVinylCrackle(ctx, masterComp, now, duration);

    // 6. Trigger Sample Stems through master compression
    if (validBuffers.length > 0) {
      const stemVol = plan.isSoloHarmonica ? 0.95 : 0.8 / Math.sqrt(validBuffers.length);
      validBuffers.forEach((buffer) => {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.setValueAtTime(rate, now);

        const stemGain = ctx.createGain();
        stemGain.gain.setValueAtTime(stemVol, now);

        source.connect(stemGain);
        stemGain.connect(masterComp);

        source.start(now);
        this.activeNodes.push(source);
        this.activeBufferSources.push(source);
      });
    }

    // 7. Play Procedural Synth attenuated to 25% volume
    const shouldPlaySynth = plan.enableSynthBacking || validBuffers.length === 0;

    if (shouldPlaySynth && !plan.isSoloHarmonica) {
      const synthSubGain = ctx.createGain();
      synthSubGain.gain.setValueAtTime(0.25, now);
      synthSubGain.connect(masterComp);

      let hash = 0;
      for (let i = 0; i < seedTitle.length; i++) {
        hash = (hash * 31 + seedTitle.charCodeAt(i)) % 100000;
      }
      const baseRoots = [110.0, 130.81, 146.83, 164.81, 174.61, 196.0];
      const root = baseRoots[hash % baseRoots.length] * rate;

      const modernPresets: AlbumEntry['audioPreset'][] = [
        'analog-synth',
        'post-punk',
        'krautrock',
        'ambient-drone',
      ];

      const activePreset: AlbumEntry['audioPreset'] =
        preset ||
        (parsedYear < 1974
          ? 'psych-rock'
          : parsedYear <= 1978
          ? 'krautrock'
          : parsedYear <= 1983
          ? 'analog-synth'
          : parsedYear <= 1989
          ? 'post-punk'
          : modernPresets[hash % modernPresets.length]);

      switch (activePreset) {
        case 'analog-synth':
          this.playAnalogSynthRoutine(ctx, synthSubGain, now, duration, root, hash, rate);
          break;
        case 'krautrock':
          this.playKrautrockRoutine(ctx, synthSubGain, now, duration, root, hash, rate);
          break;
        case 'post-punk':
          this.playPostPunkRoutine(ctx, synthSubGain, now, duration, root, hash, rate);
          break;
        case 'psych-rock':
          this.playPsychRockRoutine(ctx, synthSubGain, now, duration, root, hash, rate);
          break;
        case 'ambient-drone':
        default:
          this.playAmbientDroneRoutine(ctx, synthSubGain, now, duration, root, hash);
          break;
      }
    }

    return new Promise((resolve) => {
      this.pendingResolve = resolve;
      const timeout = setTimeout(() => {
        this.pendingResolve = null;
        this.isPlaying = false;
        this.isAtjPlayingNow = false;
        resolve(true);
      }, duration * 1000);
      this.activeTimeouts.push(timeout);
    });
  }

  // =========================================================================
  // SYNTHESIS ROUTINES
  // =========================================================================
  private playAnalogSynthRoutine(
    ctx: AudioContext,
    out: AudioNode,
    start: number,
    duration: number,
    root: number,
    hash: number,
    rate: number
  ) {
    const semitones = [0, 3, 5, 7, 10, 12, 15, 12, 7, 10, 5, 3];
    const stepTime = 0.16 / rate;
    const totalSteps = Math.floor((duration - 0.4) / stepTime);

    for (let i = 0; i < totalSteps; i++) {
      const noteStart = start + i * stepTime;
      const semi = semitones[(i + (hash % 4)) % semitones.length];
      const freq = root * 2 * Math.pow(2, semi / 12);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.setValueAtTime(6.5, noteStart);
      filter.frequency.setValueAtTime(3200, noteStart);
      filter.frequency.exponentialRampToValueAtTime(350, noteStart + stepTime * 0.95);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, noteStart);
      gain.gain.linearRampToValueAtTime(0.24, noteStart + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + stepTime * 0.9);

      [-5, 5].forEach((cents) => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, noteStart);
        osc.detune.setValueAtTime(cents, noteStart);

        osc.connect(gain);
        gain.connect(filter);
        filter.connect(out);

        osc.start(noteStart);
        osc.stop(noteStart + stepTime);
        this.activeNodes.push(osc);
      });

      if (i % 4 === 0) {
        this.triggerKick(ctx, out, noteStart, 0.28);
      }
    }
  }

  private playKrautrockRoutine(
    ctx: AudioContext,
    out: AudioNode,
    start: number,
    duration: number,
    root: number,
    hash: number,
    rate: number
  ) {
    const stepTime = 0.24 / rate;
    const totalSteps = Math.floor((duration - 0.4) / stepTime);
    const bassScale = [0, 0, 7, 0, 5, 0, 3, 5];

    for (let i = 0; i < totalSteps; i++) {
      const stepStart = start + i * stepTime;
      const semi = bassScale[(i + (hash % 2)) % bassScale.length];
      const freq = root * Math.pow(2, semi / 12);

      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, stepStart);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, stepStart);
      filter.frequency.exponentialRampToValueAtTime(280, stepStart + stepTime * 0.9);
      filter.Q.setValueAtTime(4.0, stepStart);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, stepStart);
      gain.gain.linearRampToValueAtTime(0.3, stepStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, stepStart + stepTime * 0.85);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(out);

      osc.start(stepStart);
      osc.stop(stepStart + stepTime);
      this.activeNodes.push(osc);

      if (i % 2 === 0) {
        this.triggerKick(ctx, out, stepStart, 0.32);
      } else {
        this.triggerSnare(ctx, out, stepStart, 0.18);
      }
      this.triggerHiHat(ctx, out, stepStart + stepTime * 0.5, 0.08);
    }
  }

  private playPostPunkRoutine(
    ctx: AudioContext,
    out: AudioNode,
    start: number,
    duration: number,
    root: number,
    hash: number,
    rate: number
  ) {
    const stepTime = 0.22 / rate;
    const totalSteps = Math.floor((duration - 0.4) / stepTime);
    const riff = [0, 1, 3, 5, 7, 5, 3, 1, 0, 7, 5, 3];

    for (let i = 0; i < totalSteps; i++) {
      const stepStart = start + i * stepTime;
      const semi = riff[(i + (hash % 3)) % riff.length];
      const freq = root * Math.pow(2, semi / 12);

      [-8, 0, 8].forEach((detune, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx === 1 ? 'square' : 'triangle';
        osc.frequency.setValueAtTime(freq, stepStart);
        osc.detune.setValueAtTime(detune, stepStart);

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, stepStart);
        filter.Q.setValueAtTime(1.8, stepStart);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.001, stepStart);
        gain.gain.linearRampToValueAtTime(0.18, stepStart + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, stepStart + stepTime * 0.9);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(out);

        osc.start(stepStart);
        osc.stop(stepStart + stepTime);
        this.activeNodes.push(osc);
      });

      if (i % 4 === 0) {
        this.triggerKick(ctx, out, stepStart, 0.3);
      }
      if (i % 4 === 2) {
        this.triggerSnare(ctx, out, stepStart, 0.22);
      }
    }
  }

  private playPsychRockRoutine(
    ctx: AudioContext,
    out: AudioNode,
    start: number,
    duration: number,
    root: number,
    hash: number,
    rate: number
  ) {
    const chordNotes = [root, root * 1.2, root * 1.5, root * 2.0];
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(4.8 * rate, start);

    chordNotes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      lfo.connect(osc.frequency);

      const noteGain = ctx.createGain();
      noteGain.gain.setValueAtTime(0.001, start);
      noteGain.gain.linearRampToValueAtTime(0.14, start + 0.8);
      noteGain.gain.setValueAtTime(0.14, start + duration - 0.8);
      noteGain.gain.linearRampToValueAtTime(0.001, start + duration);

      osc.connect(noteGain);
      noteGain.connect(out);

      osc.start(start);
      osc.stop(start + duration);
      this.activeNodes.push(osc);
    });

    lfo.start(start);
    lfo.stop(start + duration);
    this.activeNodes.push(lfo);

    const leadSteps = [12, 15, 17, 19, 17, 15, 12, 7];
    const stepTime = 0.36 / rate;
    const totalSteps = Math.floor((duration - 1.2) / stepTime);

    for (let s = 0; s < totalSteps; s++) {
      const noteStart = start + 0.6 + s * stepTime;
      const semi = leadSteps[(s + (hash % 3)) % leadSteps.length];
      const freq = root * Math.pow(2, semi / 12);

      const leadOsc = ctx.createOscillator();
      leadOsc.type = 'sawtooth';
      leadOsc.frequency.setValueAtTime(freq, noteStart);

      const leadFilter = ctx.createBiquadFilter();
      leadFilter.type = 'lowpass';
      leadFilter.frequency.setValueAtTime(2200, noteStart);
      leadFilter.Q.setValueAtTime(3.0, noteStart);

      const leadGain = ctx.createGain();
      leadGain.gain.setValueAtTime(0.001, noteStart);
      leadGain.gain.linearRampToValueAtTime(0.18, noteStart + 0.03);
      leadGain.gain.exponentialRampToValueAtTime(0.001, noteStart + stepTime * 0.9);

      leadOsc.connect(leadFilter);
      leadFilter.connect(leadGain);
      leadGain.connect(out);

      leadOsc.start(noteStart);
      leadOsc.stop(noteStart + stepTime);
      this.activeNodes.push(leadOsc);
    }
  }

  private playAmbientDroneRoutine(
    ctx: AudioContext,
    out: AudioNode,
    start: number,
    duration: number,
    root: number,
    hash: number
  ) {
    const padNotes = [root * 0.5, root, root * 1.5, root * 2.25];

    padNotes.forEach((freq, idx) => {
      [-1.5, 1.5].forEach((detune) => {
        const osc = ctx.createOscillator();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        osc.detune.setValueAtTime(detune, start);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(350, start);
        filter.frequency.linearRampToValueAtTime(1400, start + duration * 0.5);
        filter.frequency.linearRampToValueAtTime(400, start + duration);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.16, start + 1.5);
        gain.gain.setValueAtTime(0.16, start + duration - 1.5);
        gain.gain.linearRampToValueAtTime(0.001, start + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(out);

        osc.start(start);
        osc.stop(start + duration);
        this.activeNodes.push(osc);
      });
    });

    const bellIntervals = [19, 24, 26, 31];
    bellIntervals.forEach((semi, i) => {
      const bellTime = start + 0.8 + i * 1.1;
      const freq = root * Math.pow(2, semi / 12) * (1 + (hash % 3) * 0.05);

      const bell = ctx.createOscillator();
      bell.type = 'sine';
      bell.frequency.setValueAtTime(freq, bellTime);

      const bellGain = ctx.createGain();
      bellGain.gain.setValueAtTime(0.001, bellTime);
      bellGain.gain.linearRampToValueAtTime(0.08, bellTime + 0.02);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, bellTime + 1.8);

      bell.connect(bellGain);
      bellGain.connect(out);

      bell.start(bellTime);
      bell.stop(bellTime + 1.9);
      this.activeNodes.push(bell);
    });
  }

  // =========================================================================
  // ANALOG PERCUSSION & LOOPING VINYL CRACKLE
  // =========================================================================
  private triggerKick(ctx: AudioContext, out: AudioNode, time: number, vol: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(36, time + 0.12);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

    osc.connect(gain);
    gain.connect(out);

    osc.start(time);
    osc.stop(time + 0.15);
    this.activeNodes.push(osc);
  }

  private triggerSnare(ctx: AudioContext, out: AudioNode, time: number, vol: number) {
    const bufferSize = ctx.sampleRate * 0.12;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1600, time);
    filter.Q.setValueAtTime(1.2, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.11);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(out);

    noise.start(time);
    noise.stop(time + 0.12);
    this.activeNodes.push(noise);

    const osc = ctx.createOscillator();
    const thudGain = ctx.createGain();
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.08);

    thudGain.gain.setValueAtTime(vol * 0.5, time);
    thudGain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);

    osc.connect(thudGain);
    thudGain.connect(out);

    osc.start(time);
    osc.stop(time + 0.1);
    this.activeNodes.push(osc);
  }

  private triggerHiHat(ctx: AudioContext, out: AudioNode, time: number, vol: number) {
    const bufferSize = ctx.sampleRate * 0.04;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.035);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(out);

    noise.start(time);
    noise.stop(time + 0.04);
    this.activeNodes.push(noise);
  }

  private playVinylCrackle(ctx: AudioContext, out: AudioNode, start: number, duration: number) {
    const loopSeconds = 4.0;
    const bufferSize = Math.floor(ctx.sampleRate * loopSeconds);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0,
      b1 = 0,
      b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      let sample = (b0 + b1 + b2) * 0.025;

      if (Math.random() < 0.0007) {
        sample += (Math.random() - 0.5) * 0.35;
      }
      data[i] = sample;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1900;
    filter.Q.value = 0.7;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, start);
    gain.gain.linearRampToValueAtTime(0.06, start + 0.4);
    gain.gain.setValueAtTime(0.06, start + Math.max(0.5, duration - 0.6));
    gain.gain.linearRampToValueAtTime(0.001, start + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(out);

    // Must call start() BEFORE scheduling stop()
    noise.start(start);
    noise.stop(start + duration);
    this.activeNodes.push(noise);
  }

  public getPlaybackStatus(): boolean {
    return this.isPlaying;
  }

  public getAudioLevels(): { left: number; right: number } {
    if (!this.isPlaying) {
      return { left: 0, right: 0 };
    }
    if (this.isAtjPlayingNow && this.activeHtmlAudio && !this.activeHtmlAudio.paused) {
      const t = performance.now() * 0.012;
      return {
        left: Math.min(1, 0.55 + Math.abs(Math.sin(t)) * 0.4),
        right: Math.min(1, 0.5 + Math.abs(Math.cos(t * 1.17)) * 0.45),
      };
    }
    if (!this.analyser || !this.freqData) {
      return { left: 0, right: 0 };
    }
    this.analyser.getByteFrequencyData(this.freqData);
    let lowSum = 0;
    let highSum = 0;
    const half = Math.floor(this.freqData.length / 2);
    for (let i = 0; i < half; i++) lowSum += this.freqData[i];
    for (let i = half; i < this.freqData.length; i++) highSum += this.freqData[i];

    const left = Math.min(1, (lowSum / (half * 200)) * 1.25);
    const right = Math.min(1, (highSum / (half * 160)) * 1.45);
    return { left, right };
  }
}

export const audioSynthesizer = new RetroAudioSynthesizer();