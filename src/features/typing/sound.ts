'use client';

// Звук клавиатуры — реальные WAV-семплы из Monkeytype (GPL-3.0).
// По умолчанию: mechanical — механическая клавиатура с насыщенным кликом
// и коротким хвостом, как в кино и на стримах.
// Пользователь может переключить стиль в настройках звука.

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export type SoundStyle = 'mechanical' | 'soft' | 'typewriter' | 'clack';

interface StylePack {
  label: string;
  description: string;
  clicks: string[];
  space: string[];
  error: string;
  rateJitter: number;
}

const PACKS: Record<SoundStyle, StylePack> = {
  mechanical: {
    label: 'Механическая',
    description: 'Cherry MX-подобный клак — как в кино',
    clicks: [
      `${BASE}/sounds/click5_1.wav`,
      `${BASE}/sounds/click5_2.wav`,
      `${BASE}/sounds/click5_3.wav`,
      `${BASE}/sounds/click5_4.wav`,
      `${BASE}/sounds/click5_5.wav`,
      `${BASE}/sounds/click5_6.wav`,
    ],
    space: [
      `${BASE}/sounds/click5_4.wav`,
      `${BASE}/sounds/click5_5.wav`,
    ],
    error: `${BASE}/sounds/error2.wav`,
    rateJitter: 0.06,
  },
  clack: {
    label: 'Clack',
    description: 'Короткий мощный клак',
    clicks: [
      `${BASE}/sounds/click6_1.wav`,
      `${BASE}/sounds/click6_2.wav`,
      `${BASE}/sounds/click6_3.wav`,
    ],
    space: [
      `${BASE}/sounds/click6_1.wav`,
      `${BASE}/sounds/click6_2.wav`,
    ],
    error: `${BASE}/sounds/error1.wav`,
    rateJitter: 0.05,
  },
  typewriter: {
    label: 'Печатная машинка',
    description: 'Классический стук из старых фильмов',
    clicks: [
      `${BASE}/sounds/click4_1.wav`,
      `${BASE}/sounds/click4_2.wav`,
      `${BASE}/sounds/click4_3.wav`,
    ],
    space: [
      `${BASE}/sounds/click4_1.wav`,
    ],
    error: `${BASE}/sounds/error3.wav`,
    rateJitter: 0.04,
  },
  soft: {
    label: 'Ноутбук',
    description: 'Тихий мягкий клик, не утомляет',
    clicks: [
      `${BASE}/sounds/click1_1.wav`,
      `${BASE}/sounds/click1_2.wav`,
      `${BASE}/sounds/click1_3.wav`,
    ],
    space: [
      `${BASE}/sounds/click3_1.wav`,
      `${BASE}/sounds/click3_2.wav`,
    ],
    error: `${BASE}/sounds/error1.wav`,
    rateJitter: 0.08,
  },
};

export function listStyles(): Array<{ id: SoundStyle; label: string; description: string }> {
  return (Object.keys(PACKS) as SoundStyle[]).map((id) => ({
    id,
    label: PACKS[id].label,
    description: PACKS[id].description,
  }));
}

let ctx: AudioContext | null = null;
let masterOut: AudioNode | null = null;
let clickBuffers: AudioBuffer[] = [];
let spaceBuffers: AudioBuffer[] = [];
let errorBuffer: AudioBuffer | null = null;
let loadedStyle: SoundStyle | null = null;
let buffersLoading: Promise<void> | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor: typeof AudioContext | undefined =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16;
      comp.knee.value = 10;
      comp.ratio.value = 3;
      comp.attack.value = 0.003;
      comp.release.value = 0.1;
      const makeup = ctx.createGain();
      makeup.gain.value = 1.5;
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

export function getStyle(): SoundStyle {
  if (typeof window === 'undefined') return 'mechanical';
  const raw = window.localStorage.getItem('tt:sound-style');
  if (raw && raw in PACKS) return raw as SoundStyle;
  return 'mechanical';
}
export function setStyle(s: SoundStyle) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('tt:sound-style', s);
  // сброс кэша буферов → перезагрузка при следующем нажатии
  loadedStyle = null;
  buffersLoading = null;
  clickBuffers = [];
  spaceBuffers = [];
  errorBuffer = null;
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
  const desired = getStyle();
  if (loadedStyle === desired) return;
  if (buffersLoading) return buffersLoading;
  const ac = getCtx();
  if (!ac) return;

  const pack = PACKS[desired];
  buffersLoading = (async () => {
    const [clicks, spaces, err] = await Promise.all([
      Promise.all(pack.clicks.map((u) => loadBuffer(u, ac))),
      Promise.all(pack.space.map((u) => loadBuffer(u, ac))),
      loadBuffer(pack.error, ac),
    ]);
    clickBuffers = clicks.filter((b): b is AudioBuffer => b !== null);
    spaceBuffers = spaces.filter((b): b is AudioBuffer => b !== null);
    errorBuffer = err;
    loadedStyle = desired;
  })();
  try {
    await buffersLoading;
  } finally {
    buffersLoading = null;
  }
}

const OUTPUT_GAIN_BOOST = 2.0;

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

export function playCorrect(char?: string) {
  if (!isSoundEnabled()) return;
  if (loadedStyle !== getStyle()) {
    ensureBuffers().then(() => playCorrect(char));
    return;
  }
  const pack = PACKS[loadedStyle ?? 'mechanical'];
  if (char === ' ' && spaceBuffers.length > 0) {
    const buf = spaceBuffers[Math.floor(Math.random() * spaceBuffers.length)];
    playBuffer(buf, 0.95, pack.rateJitter * 0.7);
    return;
  }
  if (clickBuffers.length > 0) {
    const buf = clickBuffers[Math.floor(Math.random() * clickBuffers.length)];
    playBuffer(buf, 1.0, pack.rateJitter);
  }
}

export function playWrong() {
  if (!isSoundEnabled()) return;
  if (loadedStyle !== getStyle()) {
    ensureBuffers().then(() => playWrong());
    return;
  }
  if (errorBuffer) playBuffer(errorBuffer, 0.95, 0.04);
}

export function playFinish() {
  if (!isSoundEnabled()) return;
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
