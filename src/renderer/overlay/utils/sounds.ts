/**
 * miniGamba Audio Engine
 * Procedural HD Sound Effects synthesized using Web Audio API.
 * Features realistic physical modeling: resonant filters, FM synthesis,
 * metallic clinks, card snaps, mechanical reel clicks, and polyphonic fanfares.
 */

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let isMuted = false;

function getCtx(): AudioContext {
  if (!ctx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AudioCtx();
    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.7, ctx.currentTime);
    masterGain.connect(ctx.destination);
  }
  return ctx;
}

function getMaster(): GainNode {
  getCtx();
  return masterGain!;
}

function resume(): void {
  const c = getCtx();
  if (c.state === 'suspended') {
    c.resume().catch(() => {});
  }
}

export function setMuted(muted: boolean): void {
  isMuted = muted;
  if (masterGain && ctx) {
    masterGain.gain.setValueAtTime(muted ? 0 : 0.7, ctx.currentTime);
  }
}

export function isAudioMuted(): boolean {
  return isMuted;
}

// ── Low-Level Synthesizer Primitives ────────────────────────────────────────

function tone(
  freq: number,
  type: OscillatorType,
  start: number,
  dur: number,
  gain: number,
  options?: { freqEnd?: number; filterFreq?: number; filterQ?: number }
): void {
  if (isMuted) return;
  const c = getCtx();
  const t = c.currentTime + start;
  const end = t + dur;

  const oscNode = c.createOscillator();
  oscNode.type = type;
  oscNode.frequency.setValueAtTime(Math.max(20, freq), t);
  if (options?.freqEnd !== undefined) {
    oscNode.frequency.exponentialRampToValueAtTime(Math.max(20, options.freqEnd), end);
  }

  const gainNode = c.createGain();
  gainNode.gain.setValueAtTime(gain, t);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, end);

  if (options?.filterFreq) {
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(options.filterFreq, t);
    filter.Q.setValueAtTime(options.filterQ ?? 1, t);
    oscNode.connect(filter);
    filter.connect(gainNode);
  } else {
    oscNode.connect(gainNode);
  }

  gainNode.connect(getMaster());
  oscNode.start(t);
  oscNode.stop(end + 0.02);
}

function noiseBurst(
  start: number,
  dur: number,
  gain: number,
  options?: { filterType?: BiquadFilterType; filterFreq?: number; filterQ?: number }
): void {
  if (isMuted) return;
  const c = getCtx();
  const bufferSize = Math.max(1, Math.ceil(dur * c.sampleRate));
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = c.createBufferSource();
  source.buffer = buffer;

  const t = c.currentTime + start;
  const end = t + dur;

  const gainNode = c.createGain();
  gainNode.gain.setValueAtTime(gain, t);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, end);

  if (options?.filterFreq) {
    const filter = c.createBiquadFilter();
    filter.type = options.filterType || 'bandpass';
    filter.frequency.setValueAtTime(options.filterFreq, t);
    filter.Q.setValueAtTime(options.filterQ || 2, t);
    source.connect(filter);
    filter.connect(gainNode);
  } else {
    source.connect(gainNode);
  }

  gainNode.connect(getMaster());
  source.start(t);
  source.stop(end + 0.02);
}

// ── High-Fidelity Casino Sound Effects ──────────────────────────────────────

/** Crisp UI interaction click with subtle warmth */
export function playClick(): void {
  try {
    resume();
    tone(1400, 'sine', 0, 0.03, 0.15, { freqEnd: 800 });
  } catch (_e) { /* ignore */ }
}

/** Ceramic casino chip placement clink */
export function playBet(): void {
  try {
    resume();
    // High metallic chime + short transient
    tone(2800, 'sine', 0, 0.05, 0.18, { freqEnd: 1900 });
    tone(4200, 'triangle', 0.005, 0.04, 0.12, { freqEnd: 3200 });
    noiseBurst(0, 0.02, 0.08, { filterFreq: 3000, filterQ: 4 });
  } catch (_e) { /* ignore */ }
}

/** Physical card dealing swoosh and felt snap */
export function playCardDeal(): void {
  try {
    resume();
    noiseBurst(0, 0.06, 0.14, { filterFreq: 1800, filterQ: 2 });
    tone(750, 'sine', 0.02, 0.05, 0.12, { freqEnd: 350 });
  } catch (_e) { /* ignore */ }
}

/** Physical card flip snap */
export function playCardFlip(): void {
  try {
    resume();
    noiseBurst(0, 0.04, 0.16, { filterFreq: 2400, filterQ: 3 });
    tone(950, 'triangle', 0.01, 0.04, 0.15, { freqEnd: 480 });
  } catch (_e) { /* ignore */ }
}

/** 3D Coin flip spin: rhythmic metallic whir in air */
export function playCoinFlip(): void {
  try {
    resume();
    for (let i = 0; i < 6; i++) {
      tone(1200 + i * 80, 'sine', i * 0.07, 0.05, 0.12 - i * 0.015);
    }
  } catch (_e) { /* ignore */ }
}

/** Metallic coin landing with double bounce */
export function playCoinLand(): void {
  try {
    resume();
    tone(1850, 'triangle', 0, 0.08, 0.22, { freqEnd: 1400 });
    tone(2200, 'sine', 0.07, 0.06, 0.15, { freqEnd: 1750 });
    tone(2600, 'sine', 0.13, 0.04, 0.09, { freqEnd: 2400 });
  } catch (_e) { /* ignore */ }
}

/** Slot machine reel spinning whir */
export function playSpin(): void {
  try {
    resume();
    tone(180, 'sawtooth', 0, 0.8, 0.15, { freqEnd: 120, filterFreq: 600 });
    noiseBurst(0, 0.8, 0.06, { filterFreq: 800, filterQ: 1 });
  } catch (_e) { /* ignore */ }
}

/** Mechanical reel lock/stop ratchet thud */
export function playReelStop(reelIndex = 0): void {
  try {
    resume();
    const baseFreq = 220 + reelIndex * 40;
    tone(baseFreq, 'triangle', 0, 0.09, 0.25, { freqEnd: 80 });
    noiseBurst(0, 0.04, 0.2, { filterFreq: 1200, filterQ: 3 });
  } catch (_e) { /* ignore */ }
}

/** Wheel of fortune flapper peg tick */
export function playPegTick(): void {
  try {
    resume();
    tone(2100, 'sine', 0, 0.02, 0.15, { freqEnd: 900 });
    noiseBurst(0, 0.015, 0.12, { filterFreq: 3200, filterQ: 5 });
  } catch (_e) { /* ignore */ }
}

/** Wheel of fortune full spin cycle with slowing ticks */
export function playWheelSpin(): void {
  try {
    resume();
    for (let i = 0; i < 24; i++) {
      const delay = i * 0.04 + i * i * 0.0045;
      if (delay > 3.8) break;
      setTimeout(() => {
        playPegTick();
      }, delay * 1000);
    }
  } catch (_e) { /* ignore */ }
}

/** Shuffling dice cup and table impact */
export function playDiceRoll(): void {
  try {
    resume();
    // Shaking in cup
    for (let i = 0; i < 5; i++) {
      const t = i * 0.06;
      noiseBurst(t, 0.04, 0.12, { filterFreq: 1400, filterQ: 2 });
      tone(400 + Math.random() * 300, 'triangle', t, 0.04, 0.1);
    }
    // Final table roll impacts
    setTimeout(() => {
      tone(320, 'sine', 0, 0.08, 0.25, { freqEnd: 140 });
      tone(280, 'sine', 0.06, 0.07, 0.2, { freqEnd: 120 });
    }, 380);
  } catch (_e) { /* ignore */ }
}

/** Race horse galloping hooves rhythm */
export function playHorseGallop(): void {
  try {
    resume();
    for (let i = 0; i < 14; i++) {
      const t = i * 0.11;
      noiseBurst(t, 0.05, 0.14, { filterFreq: 450, filterQ: 1.5 });
      tone(160, 'sine', t, 0.04, 0.16, { freqEnd: 80 });
    }
  } catch (_e) { /* ignore */ }
}

/** Granular scratch card foil scraping */
export function playScratch(): void {
  try {
    resume();
    noiseBurst(0, 0.08, 0.16, { filterFreq: 2600 + Math.random() * 800, filterQ: 3 });
  } catch (_e) { /* ignore */ }
}

/** Reveal item / mystery tile */
export function playReveal(): void {
  try {
    resume();
    tone(880, 'sine', 0, 0.08, 0.2, { freqEnd: 1200 });
  } catch (_e) { /* ignore */ }
}

/** Mine Sweeper explosion blast with deep sub-bass */
export function playExplosion(): void {
  try {
    resume();
    tone(90, 'sawtooth', 0, 0.5, 0.4, { freqEnd: 30, filterFreq: 250 });
    noiseBurst(0, 0.45, 0.35, { filterFreq: 500, filterQ: 1 });
  } catch (_e) { /* ignore */ }
}

/** Standard payout win jingle (cheerful major triad) */
export function playWin(): void {
  try {
    resume();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      tone(freq, 'sine', idx * 0.09, 0.22, 0.28);
      tone(freq * 2, 'triangle', idx * 0.09 + 0.01, 0.14, 0.1);
    });
  } catch (_e) { /* ignore */ }
}

/** Big Win / Jackpot fanfare (polyphonic triumphant arpeggio) */
export function playBigWin(): void {
  try {
    resume();
    const notes = [
      523.25, 659.25, 783.99, 1046.5,
      880.0, 1046.5, 1318.5, 1567.98,
      1046.5, 1318.5, 1567.98, 2093.0
    ];
    notes.forEach((freq, idx) => {
      tone(freq, 'triangle', idx * 0.065, 0.25, 0.25);
      tone(freq, 'sine', idx * 0.065, 0.3, 0.2);
    });
  } catch (_e) { /* ignore */ }
}

/** Loss sound (subtle descending minor chords, not grating) */
export function playLoss(): void {
  try {
    resume();
    tone(392.0, 'sine', 0, 0.15, 0.2, { freqEnd: 349.23 });
    tone(311.13, 'sine', 0.12, 0.2, 0.2, { freqEnd: 261.63 });
  } catch (_e) { /* ignore */ }
}

/** Cash out chimes */
export function playCashOut(): void {
  try {
    resume();
    const notes = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6
    notes.forEach((freq, idx) => {
      tone(freq, 'sine', idx * 0.07, 0.18, 0.25);
    });
  } catch (_e) { /* ignore */ }
}

/** Streak level up sound */
export function playStreakUp(streak: number): void {
  try {
    resume();
    const base = 440 + Math.min(streak, 10) * 60;
    tone(base, 'sine', 0, 0.12, 0.22, { freqEnd: base * 1.5 });
  } catch (_e) { /* ignore */ }
}
