'use client';

// Генерируем реалистичный звук клавиатуры через Web Audio API.
// Стратегия: pre-render нескольких вариантов клика в OfflineAudioContext →
// кэшируем как AudioBuffer → проигрываем BufferSource со случайным выбором
// и небольшим отклонением частоты, чтобы звук не повторялся.

let ctx: AudioContext | null = null;
let clickBuffers: AudioBuffer[] = [];
let errorBuffer: AudioBuffer | null = null;
let spaceBuffer: AudioBuffer | null = null;
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
  if (typeof window === 'undefined') return 0.75;
  const raw = window.localStorage.getItem('tt:sound-vol');
  const n = raw ? parseFloat(raw) : 0.75;
  return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0.75;
}

export function setVolume(v: number) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('tt:sound-vol', String(Math.min(1, Math.max(0, v))));
  window.dispatchEvent(new CustomEvent('tt:sound-changed'));
}

// ───── Генерация клика клавиатуры ─────

interface ClickConfig {
  duration: number;
  clickFreq: number;
  clickQ: number;
  bodyFreq: number;
  bodyGain: number;
  attack: number;
  decay: number;
}

async function renderKeyClick(ac: AudioContext, cfg: ClickConfig): Promise<AudioBuffer> {
  const sampleRate = ac.sampleRate;
  const length = Math.floor(sampleRate * cfg.duration);
  const offline = new OfflineAudioContext(1, length, sampleRate);

  const makeNoise = () => {
    const b = offline.createBuffer(1, length, sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < length; i++) d[i] = Math.random() * 2 - 1;
    const s = offline.createBufferSource();
    s.buffer = b;
    return s;
  };

  // Острый «щелчок» (высокочастотная составляющая) — bandpass вокруг clickFreq
  const click = makeNoise();
  const clickFilter = offline.createBiquadFilter();
  clickFilter.type = 'bandpass';
  clickFilter.frequency.value = cfg.clickFreq;
  clickFilter.Q.value = cfg.clickQ;
  const clickGain = offline.createGain();
  clickGain.gain.setValueAtTime(0, 0);
  clickGain.gain.linearRampToValueAtTime(1, cfg.attack);
  clickGain.gain.exponentialRampToValueAtTime(0.0001, cfg.attack + cfg.decay);
  click.connect(clickFilter).connect(clickGain).connect(offline.destination);
  click.start();

  // «Тело» клавиши — глухой низкочастотный подудар через lowpass
  if (cfg.bodyGain > 0) {
    const body = makeNoise();
    const bodyFilter = offline.createBiquadFilter();
    bodyFilter.type = 'lowpass';
    bodyFilter.frequency.value = cfg.bodyFreq;
    const bodyGain = offline.createGain();
    bodyGain.gain.setValueAtTime(0, 0);
    bodyGain.gain.linearRampToValueAtTime(cfg.bodyGain, cfg.attack);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, cfg.attack + cfg.decay * 0.7);
    body.connect(bodyFilter).connect(bodyGain).connect(offline.destination);
    body.start();
  }

  return await offline.startRendering();
}

async function ensureBuffers(): Promise<void> {
  if (buffersReady) return;
  if (buffersLoading) return buffersLoading;
  const ac = getCtx();
  if (!ac) return;

  buffersLoading = (async () => {
    // Три лёгких вариации кликов — разные частоты и длительности,
    // чтобы печать не звучала как повторяющийся семпл.
    const variations: ClickConfig[] = [
      { duration: 0.06, clickFreq: 2800, clickQ: 6, bodyFreq: 380, bodyGain: 0.45, attack: 0.001, decay: 0.045 },
      { duration: 0.055, clickFreq: 3100, clickQ: 7, bodyFreq: 350, bodyGain: 0.4, attack: 0.001, decay: 0.04 },
      { duration: 0.065, clickFreq: 2500, clickQ: 5, bodyFreq: 420, bodyGain: 0.5, attack: 0.001, decay: 0.05 },
    ];
    clickBuffers = await Promise.all(variations.map((v) => renderKeyClick(ac, v)));

    // Пробел — более глухой, «деревянный» удар (пробел больше и тяжелее)
    spaceBuffer = await renderKeyClick(ac, {
      duration: 0.085,
      clickFreq: 1400,
      clickQ: 3.5,
      bodyFreq: 220,
      bodyGain: 0.7,
      attack: 0.002,
      decay: 0.07,
    });

    // Ошибка — низкий глухой удар с долгим хвостом (как падение предмета)
    errorBuffer = await renderKeyClick(ac, {
      duration: 0.18,
      clickFreq: 420,
      clickQ: 3,
      bodyFreq: 180,
      bodyGain: 0.8,
      attack: 0.003,
      decay: 0.15,
    });

    buffersReady = true;
  })();

  return buffersLoading;
}

// После прохождения через bandpass шум теряет до ~70% амплитуды,
// поэтому выходной gain приходится поднимать значительно выше 1.0,
// чтобы итоговый клик был слышен на комфортной громкости.
const OUTPUT_GAIN_BOOST = 3.2;

function playBuffer(buffer: AudioBuffer, gainVal: number, rateJitter = 0) {
  if (!isSoundEnabled()) return;
  const ac = getCtx();
  if (!ac) return;
  try {
    if (ac.state === 'suspended') ac.resume();
    const source = ac.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = 1 + (Math.random() - 0.5) * rateJitter;
    const g = ac.createGain();
    g.gain.value = Math.min(1, gainVal * getVolume() * OUTPUT_GAIN_BOOST);
    source.connect(g).connect(ac.destination);
    source.start();
  } catch {
    // noop
  }
}

// ───── Публичный API ─────

// Правильная клавиша — случайный вариант клика с лёгкой вариацией питча
export function playCorrect(char?: string) {
  if (!isSoundEnabled()) return;
  if (!buffersReady) {
    ensureBuffers().then(() => playCorrect(char));
    return;
  }
  if (char === ' ' && spaceBuffer) {
    playBuffer(spaceBuffer, 0.9, 0.08);
    return;
  }
  const buf = clickBuffers[Math.floor(Math.random() * clickBuffers.length)];
  if (buf) playBuffer(buf, 1.0, 0.14);
}

// Ошибка — более глухой, низкий звук
export function playWrong() {
  if (!isSoundEnabled()) return;
  if (!buffersReady) {
    ensureBuffers().then(() => playWrong());
    return;
  }
  if (errorBuffer) playBuffer(errorBuffer, 0.9, 0.06);
}

// Завершение урока — короткий «перезвон» трёх кликов
export function playFinish() {
  if (!isSoundEnabled()) return;
  if (!buffersReady) {
    ensureBuffers().then(() => playFinish());
    return;
  }
  const ac = getCtx();
  if (!ac || clickBuffers.length === 0) return;
  try {
    if (ac.state === 'suspended') ac.resume();
    // Три последовательных «взлетающих» тона — через оscillator для мягкости
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
      osc.connect(amp).connect(ac.destination);
      osc.start(t0);
      osc.stop(t0 + 0.25);
    });
  } catch {
    // noop
  }
}

// Предзагрузка при первом взаимодействии пользователя
export function preloadSounds() {
  void ensureBuffers();
}
