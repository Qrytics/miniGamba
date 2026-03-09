/**
 * Sound effects for mini-games using the Web Audio API.
 * All sounds are synthesised procedurally — no audio files required.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
  }
  return ctx;
}

function resume() {
  const c = getCtx();
  if (c.state === 'suspended') {
    c.resume().catch(() => {});
  }
}

// --- Primitive helpers ---

function osc(
  frequency: number,
  type: OscillatorType,
  startTime: number,
  endTime: number,
  gain: number,
  freqEnd?: number,
): void {
  const c = getCtx();
  const gainNode = c.createGain();
  gainNode.gain.setValueAtTime(gain, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, endTime);
  gainNode.connect(c.destination);

  const oscNode = c.createOscillator();
  oscNode.type = type;
  oscNode.frequency.setValueAtTime(frequency, startTime);
  if (freqEnd !== undefined) {
    oscNode.frequency.exponentialRampToValueAtTime(freqEnd, endTime);
  }
  oscNode.connect(gainNode);
  oscNode.start(startTime);
  oscNode.stop(endTime + 0.01);
}

function noise(startTime: number, endTime: number, gain: number): void {
  const c = getCtx();
  const bufferSize = Math.ceil((endTime - startTime) * c.sampleRate);
  if (bufferSize <= 0) return;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = c.createBufferSource();
  source.buffer = buffer;

  const gainNode = c.createGain();
  gainNode.gain.setValueAtTime(gain, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, endTime);
  source.connect(gainNode);
  gainNode.connect(c.destination);
  source.start(startTime);
}

// --- Public sound effects ---

export function playWin(): void {
  try {
    resume();
    const c = getCtx();
    const t = c.currentTime;
    osc(440, 'sine', t, t + 0.15, 0.4);
    osc(554, 'sine', t + 0.12, t + 0.27, 0.35);
    osc(659, 'sine', t + 0.24, t + 0.45, 0.4);
    osc(880, 'sine', t + 0.36, t + 0.65, 0.45);
  } catch (_e) { /* ignore audio errors */ }
}

export function playBigWin(): void {
  try {
    resume();
    const c = getCtx();
    const t = c.currentTime;
    [261, 329, 392, 523, 659, 784, 1047].forEach((f, i) => {
      osc(f, 'triangle', t + i * 0.07, t + i * 0.07 + 0.18, 0.35);
    });
  } catch (_e) { /* ignore audio errors */ }
}

export function playLoss(): void {
  try {
    resume();
    const c = getCtx();
    const t = c.currentTime;
    osc(440, 'sawtooth', t, t + 0.1, 0.25);
    osc(330, 'sawtooth', t + 0.08, t + 0.25, 0.25);
    osc(220, 'sawtooth', t + 0.2, t + 0.45, 0.3);
  } catch (_e) { /* ignore audio errors */ }
}

export function playClick(): void {
  try {
    resume();
    const c = getCtx();
    const t = c.currentTime;
    osc(1200, 'square', t, t + 0.04, 0.15);
  } catch (_e) { /* ignore audio errors */ }
}

export function playSpin(): void {
  try {
    resume();
    const c = getCtx();
    const t = c.currentTime;
    osc(200, 'sawtooth', t, t + 1.2, 0.2, 800);
    noise(t, t + 1.2, 0.05);
  } catch (_e) { /* ignore audio errors */ }
}

export function playCardDeal(): void {
  try {
    resume();
    const c = getCtx();
    const t = c.currentTime;
    noise(t, t + 0.08, 0.12);
    osc(800, 'triangle', t, t + 0.07, 0.1);
  } catch (_e) { /* ignore audio errors */ }
}

export function playCoinFlip(): void {
  try {
    resume();
    const c = getCtx();
    const t = c.currentTime;
    osc(600, 'sine', t, t + 0.6, 0.2, 1200);
  } catch (_e) { /* ignore audio errors */ }
}

export function playReveal(): void {
  try {
    resume();
    const c = getCtx();
    const t = c.currentTime;
    osc(900, 'sine', t, t + 0.1, 0.2, 400);
  } catch (_e) { /* ignore audio errors */ }
}

export function playWheelSpin(): void {
  try {
    resume();
    const c = getCtx();
    const t = c.currentTime;
    for (let i = 0; i < 20; i++) {
      const delay = i * 0.04 + i * i * 0.003;
      if (delay > 3) break;
      osc(1800, 'square', t + delay, t + delay + 0.02, 0.12);
    }
  } catch (_e) { /* ignore audio errors */ }
}

export function playDiceRoll(): void {
  try {
    resume();
    const c = getCtx();
    const t = c.currentTime;
    for (let i = 0; i < 6; i++) {
      noise(t + i * 0.06, t + i * 0.06 + 0.05, 0.15);
      osc(400 + Math.random() * 400, 'square', t + i * 0.06, t + i * 0.06 + 0.04, 0.1);
    }
  } catch (_e) { /* ignore audio errors */ }
}

export function playHorseGallop(): void {
  try {
    resume();
    const c = getCtx();
    const t = c.currentTime;
    for (let i = 0; i < 12; i++) {
      noise(t + i * 0.12, t + i * 0.12 + 0.06, 0.12);
    }
  } catch (_e) { /* ignore audio errors */ }
}

export function playScratch(): void {
  try {
    resume();
    const c = getCtx();
    const t = c.currentTime;
    noise(t, t + 0.15, 0.2);
  } catch (_e) { /* ignore audio errors */ }
}

export function playBet(): void {
  try {
    resume();
    const c = getCtx();
    const t = c.currentTime;
    osc(880, 'sine', t, t + 0.12, 0.18);
  } catch (_e) { /* ignore audio errors */ }
}
