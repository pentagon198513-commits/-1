'use client';

// Звук клавиатуры — реальные WAV-семплы (click1 из MonkeyType, GPL-3.0).
// Выбран мягкий короткий вариант, чтобы звук не утомлял при длительной печати.
// Несколько вариантов + питч-джиттер создают ощущение настоящей клавиатуры.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

const CLICK_URLS = [
  `${BASE}/sounds/click1_1.wav`,
  `${BASE}/sounds/click1_2.wav`,
  `${BASE}/sounds/click1_3.wav`,
];

const SPACE_URLS = [
  `${BASE}/sounds/click3_1.wav`,
  `${BASE}/sounds/click3_2.wav`,
  `${BASE}/sounds/click3_3.wav`,
];

const ERROR_URL = `${BASE}/sounds/error1.wav`;

let ctx: AudioContext | null = null;
let masterOut: AudioNode | null = null;
let clickBuffers: AudioBuffer[] = [];
let spaceBuffers: AudioBuffer[] = [];
let errorBuffer: AudioBuffer | null = null;
let buffersReady = false;
let buffersLoading: Promise<void> | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor: typeof AudioContext | undefined =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
      // Мягкий мастер-компрессор: сглаживает пики при быстрой печати,
      // повышает воспринимаемую громкость без искажения.
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.knee.value = 12;
      comp.ratio.value = 3;
      comp.attack.value = 0.003;
      comp.release.value = 0.1;
      const makeup = ctx.createGain();
      makeup.gain.value = 1.4;
      comp.connect(makeup).connect(ctx.destination);
      masterOut = comp;
    } catch {
      return null;
    }
  }
  return ctx;
}

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  return window.localStorage.getItem('tt:sound') !== 'off';
}

export function setSoundEnabled(on: boolean) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('tt:sound', on ? 'on' : 'off');
  window.dispatchEvent(new CustomEvent('tt:sound-changed'));
}

export function getVolume(): number {
  if (typeof window === 'undefined') return 0.85;
  const raw = window.localStorage.getItem('tt:sound-vol');
  const n = raw ? parseFloat(raw) : 0.85;
  return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0.85;
}

export function setVolume(v: number) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('tt:sound-vol', String(Math.min(1, Math.max(0, v))));
  window.dispatchEvent(new CustomEvent('tt:sound-changed'));
}

async function loadBuffer(url: string, ac: AudioContext): Promise<AudioBuffer | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const array = await res.arrayBuffer();
    return await ac.decodeAudioData(array);
  } catch {
    return null;
  }
}

async function ensureBuffers(): Promise<void> {
  if (buffersReady) return;
  if (buffersLoading) return buffersLoading;
  const ac = getCtx();
  if (!ac) return;

  buffersLoading = (async () => {
    const [clicks, spaces, err] = await Promise.all([
      Promise.all(CLICK_URLS.map((u) => loadBuffer(u, ac))),
      Promise.all(SPACE_URLS.map((u) => loadBuffer(u, ac))),
      loadBuffer(ERROR_URL, ac),
    ]);
    clickBuffers = clicks.filter((b): b is AudioBuffer => b !== null);
    spaceBuffers = spaces.filter((b): b is AudioBuffer => b !== null);
    errorBuffer = err;
    buffersReady = true;
  })();

  return buffersLoading;
}

// После компрессора сигнал становится тише, поэтому добавляем запас по gain.
const OUTPUT_GAIN_BOOST = 2.2;

function playBuffer(buffer: AudioBuffer, gainVal: number, rateJitter = 0) {
  if (!isSoundEnabled()) return;
  const ac = getCtx();
  const out = masterOut;
  if (!ac || !out) return;
  try {
    if (ac.state === 'suspended') ac.resume();
    const source = ac.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = 1 + (Math.random() - 0.5) * rateJitter;
    const g = ac.createGain();
    g.gain.value = gainVal * getVolume() * OUTPUT_GAIN_BOOST;
    source.connect(g).connect(out);
    source.start();
  } catch {
    // noop
  }
}

// ───── Публичный API ─────

export function playCorrect(char?: string) {
  if (!isSoundEnabled()) return;
  if (!buffersReady) {
    ensureBuffers().then(() => playCorrect(char));
    return;
  }
  if (char === ' ' && spaceBuffers.length > 0) {
    const buf = spaceBuffers[Math.floor(Math.random() * spaceBuffers.length)];
    playBuffer(buf, 0.9, 0.05);
    return;
  }
  if (clickBuffers.length > 0) {
    const buf = clickBuffers[Math.floor(Math.random() * clickBuffers.length)];
    // Небольшая вариация скорости воспроизведения имитирует разницу клавиш.
    playBuffer(buf, 1.0, 0.08);
  }
}

export function playWrong() {
  if (!isSoundEnabled()) return;
  if (!buffersReady) {
    ensureBuffers().then(() => playWrong());
    return;
  }
  if (errorBuffer) playBuffer(errorBuffer, 0.9, 0.04);
}

export function playFinish() {
  if (!isSoundEnabled()) return;
  if (!buffersReady) {
    ensureBuffers().then(() => playFinish());
    return;
  }
  const ac = getCtx();
  const out = masterOut;
  if (!ac || !out) return;
  try {
    if (ac.state === 'suspended') ac.resume();
    const notes = [523, 659, 784];
    notes.forEach((freq, i) => {
      const osc = ac.createOscillator();
      const amp = ac.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t0 = ac.currentTime + i * 0.09;
      amp.gain.setValueAtTime(0, t0);
      amp.gain.linearRampToValueAtTime(Math.min(0.9, getVolume() * 0.9), t0 + 0.01);
      amp.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);
      osc.connect(amp).connect(out);
      osc.start(t0);
      osc.stop(t0 + 0.25);
    });
  } catch {
    // noop
  }
}

export function preloadSounds() {
  void ensureBuffers();
}
