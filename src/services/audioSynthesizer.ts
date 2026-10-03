/**
 * Web Audio API Retro Synthesizer
 * Generates vintage procedural audio clips (synth chimes, analog chords, vinyl crackle, arpeggios)
 */

class RetroAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentNodes: { stop: () => void }[] = [];

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

  public stopAll(): void {
    this.currentNodes.forEach((node) => {
      try {
        node.stop();
      } catch {
        // ignore
      }
    });
    this.currentNodes = [];
    this.isPlaying = false;
  }

  public async playAlbumClip(albumTitle: string, yearStr: string = '1975'): Promise<boolean> {
    this.stopAll();
    const ctx = this.getContext();
    this.isPlaying = true;

    const parsedYear = parseInt(yearStr.replace(/\D/g, ''), 10) || 1977;
    const now = ctx.currentTime;
    const duration = 6.5; // 6.5 seconds vintage clip

    // Generate vinyl crackle
    this.playVinylCrackle(ctx, now, duration);

    // Derive scale & root frequency from album title hash
    let hash = 0;
    for (let i = 0; i < albumTitle.length; i++) {
      hash = (hash * 31 + albumTitle.charCodeAt(i)) % 10000;
    }

    const baseRoots = [130.81, 146.83, 164.81, 174.61, 196.0, 220.0]; // C3, D3, E3, F3, G3, A3
    const root = baseRoots[hash % baseRoots.length];

    if (parsedYear < 1974) {
      // Psych-Rock / Mellotron Vibe: Warm organs, tape wow/flutter, trippy arpeggio
      this.playPsychRockClip(ctx, now, root, duration);
    } else if (parsedYear <= 1982) {
      // Classic 70s Analog Moog Synth Vibe: Filter sweep, fat detuned saws, arpeggiator
      this.playAnalogMoogClip(ctx, now, root, duration);
    } else {
      // 80s Digital Chime / FM Synth: Crystal bell harmonics, chorus, delay
      this.playRetro80sChime(ctx, now, root, duration);
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        this.isPlaying = false;
        resolve(true);
      }, duration * 1000);
    });
  }

  private playVinylCrackle(ctx: AudioContext, start: number, duration: number) {
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate subtle pinkish noise with occasional dust pops
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      let sample = (b0 + b1 + b2) * 0.03;

      // Random micro-pops
      if (Math.random() < 0.0006) {
        sample += (Math.random() - 0.5) * 0.4;
      }
      data[i] = sample;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;
    filter.Q.value = 0.8;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, start);
    gain.gain.linearRampToValueAtTime(0.06, start + 0.5);
    gain.gain.setValueAtTime(0.06, start + duration - 0.8);
    gain.gain.linearRampToValueAtTime(0.001, start + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(start);
    noise.stop(start + duration);
    this.currentNodes.push(noise);
  }

  private playAnalogMoogClip(ctx: AudioContext, start: number, root: number, duration: number) {
    // 4-note retro synthesizer arpeggio with resonant filter sweep
    const notes = [root, root * 1.25, root * 1.5, root * 1.875, root * 2.0];
    const stepTime = 0.28;
    const totalSteps = Math.floor((duration - 1) / stepTime);

    // Master filter for Moog sweep
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = 6.0;
    filter.frequency.setValueAtTime(250, start);
    filter.frequency.exponentialRampToValueAtTime(3200, start + duration * 0.5);
    filter.frequency.exponentialRampToValueAtTime(400, start + duration);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.18, start);
    masterGain.gain.setValueAtTime(0.18, start + duration - 1);
    masterGain.gain.linearRampToValueAtTime(0.001, start + duration);

    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    for (let step = 0; step < totalSteps; step++) {
      const stepStart = start + step * stepTime;
      const noteFreq = notes[step % notes.length];

      // Dual detuned oscillators
      [-4, 4].forEach((detune) => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(noteFreq, stepStart);
        osc.detune.setValueAtTime(detune, stepStart);

        const noteGain = ctx.createGain();
        noteGain.gain.setValueAtTime(0.001, stepStart);
        noteGain.gain.linearRampToValueAtTime(0.3, stepStart + 0.03);
        noteGain.gain.exponentialRampToValueAtTime(0.001, stepStart + stepTime * 1.2);

        osc.connect(noteGain);
        noteGain.connect(filter);

        osc.start(stepStart);
        osc.stop(stepStart + stepTime * 1.3);
        this.currentNodes.push(osc);
      });
    }
  }

  private playPsychRockClip(ctx: AudioContext, start: number, root: number, duration: number) {
    // Warm vintage organ chord with slow vibrato / tremolo
    const chordNotes = [root, root * 1.2, root * 1.5, root * 2];

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 4.8; // 4.8Hz tremolo
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.08;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1600;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, start);
    masterGain.gain.linearRampToValueAtTime(0.25, start + 1.2);
    masterGain.gain.setValueAtTime(0.22, start + duration - 1.2);
    masterGain.gain.linearRampToValueAtTime(0.001, start + duration);

    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    chordNotes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      osc.detune.setValueAtTime((idx - 1.5) * 5, start);

      const noteGain = ctx.createGain();
      noteGain.gain.value = 0.2;

      osc.connect(noteGain);
      noteGain.connect(filter);

      osc.start(start);
      osc.stop(start + duration);
      this.currentNodes.push(osc);
    });
  }

  private playRetro80sChime(ctx: AudioContext, start: number, root: number, duration: number) {
    // 80s DX7-style bell chime with FM sparkle
    const bellNotes = [root * 2, root * 2.5, root * 3, root * 4];

    bellNotes.forEach((freq, i) => {
      const noteTime = start + i * 0.45;
      const carrier = ctx.createOscillator();
      const modulator = ctx.createOscillator();
      const modGain = ctx.createGain();
      const noteGain = ctx.createGain();

      carrier.type = 'sine';
      carrier.frequency.setValueAtTime(freq, noteTime);

      modulator.type = 'sine';
      modulator.frequency.setValueAtTime(freq * 3.5, noteTime);
      modGain.gain.setValueAtTime(freq * 1.5, noteTime);
      modGain.gain.exponentialRampToValueAtTime(1, noteTime + 2.0);

      modulator.connect(carrier.frequency);

      noteGain.gain.setValueAtTime(0.001, noteTime);
      noteGain.gain.linearRampToValueAtTime(0.3, noteTime + 0.04);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 2.5);

      carrier.connect(noteGain);
      noteGain.connect(ctx.destination);

      modulator.start(noteTime);
      carrier.start(noteTime);
      modulator.stop(noteTime + 2.6);
      carrier.stop(noteTime + 2.6);

      this.currentNodes.push(carrier);
      this.currentNodes.push(modulator);
    });
  }

  public getPlaybackStatus(): boolean {
    return this.isPlaying;
  }
}

export const audioSynthesizer = new RetroAudioSynthesizer();
