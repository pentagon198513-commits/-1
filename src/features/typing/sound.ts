'use client';

// Реалистичный звук клавиатуры через Web Audio API.
// Каждый клик собирается из 4 составляющих:
//   1. Ударный транзиент — микросекундный всплеск (импульс)
//   2. Основной клик — полоса вокруг 2–3 кГц (акустика пластика о пластик)
//   3. Тело клавиши — низкочастотный thud (резонанс корпуса)
//   4. Высокочастотная «искра» — шум > 5 кГц, короткий хвост (подпружинивание)
// Плюс DynamicsCompressor на выходе — воспринимаемая громкость выше без клиппинга.

let ctx: AudioContext | null = null;
let masterOut: AudioNode | null = null;
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
      // Мастер-компрессор — поднимает воспринимаемую громкость,
      // сглаживает пики при быстрой печати.
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.knee.value = 12;
      comp.ratio.value = 4;
      comp.attack.value = 0.002;
      comp.release.value = 0.08;
      const makeup = ctx.createGain();
      makeup.gain.value = 1.6; // пост-компрессорный gain
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
  if (typeof window === 'undefined') return 1.0;
  const raw = window.localStorage.getItem('tt:sound-vol');
  const n = raw ? parseFloat(raw) : 1.0;
  return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 1.0;
}

export function setVolume(v: number) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('tt:sound-vol', String(Math.min(1, Math.max(0, v))));
  window.dispatchEvent(new CustomEvent('tt:sound-changed'));
}

// ───── Синтез клика ─────

interface ClickConfig {
  duration: number;
  // Основной клик
  clickFreq: number;
  clickQ: number;
  clickGain: number;
  // Тело (низ)
  bodyFreq: number;
  bodyGain: number;
  // Искра (верх)
  sparkleGain: number;
  // Огибающая
  attack: number;
  decay: number;
  // Ударный транзиент
  impactGain: number;
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

  // 1) Ударный транзиент — экспоненциально затухающий импульс 2 мс.
  //    Он даёт ту самую «физическую» атаку нажатия.
  const impactLen = Math.max(2, Math.floor(sampleRate * 0.002));
  const impactBuf = offline.createBuffer(1, impactLen, sampleRate);
  const impactData = impactBuf.getChannelData(0);
  for (let i = 0; i < impactLen; i++) {
    impactData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (impactLen / 3));
  }
  const impact = offline.createBufferSource();
  impact.buffer = impactBuf;
  const impactGain = offline.createGain();
  impactGain.gain.value = cfg.impactGain;
  impact.connect(impactGain).connect(offline.destination);
  impact.start(0);

  // 2) Основной клик — bandpass-отфильтрованный шум (пластик по пластику).
  const click = makeNoise();
  const clickFilter = offline.createBiquadFilter();
  clickFilter.type = 'bandpass';
  clickFilter.frequency.value = cfg.clickFreq;
  clickFilter.Q.value = cfg.clickQ;
  const clickG = offline.createGain();
  clickG.gain.setValueAtTime(0, 0);
  clickG.gain.linearRampToValueAtTime(cfg.clickGain, cfg.attack);
  clickG.gain.exponentialRampToValueAtTime(0.0001, cfg.attack + cfg.decay);
  click.connect(clickFilter).connect(clickG).connect(offline.destination);
  click.start();

  // 3) Тело — lowpass-глушённый шум, резонанс корпуса клавиатуры.
  if (cfg.bodyGain > 0) {
    const body = makeNoise();
    const bodyFilter = offline.createBiquadFilter();
    bodyFilter.type = 'lowpass';
    bodyFilter.frequency.value = cfg.bodyFreq;
    const bodyG = offline.createGain();
    bodyG.gain.setValueAtTime(0, 0);
    bodyG.gain.linearRampToValueAtTime(cfg.bodyGain, cfg.attack);
    bodyG.gain.exponentialRampToValueAtTime(0.0001, cfg.attack + cfg.decay * 0.75);
    body.connect(bodyFilter).connect(bodyG).connect(offline.destination);
    body.start();
  }

  // 4) Высокочастотная «искра» > 5 кГц — даёт ощущение свежести и точности.
  if (cfg.sparkleGain > 0) {
    const sparkle = makeNoise();
    const spFilter = offline.createBiquadFilter();
    spFilter.type = 'highpass';
    spFilter.frequency.value = 5200;
    const spG = offline.createGain();
    spG.gain.setValueAtTime(0, 0);
    spG.gain.linearRampToValueAtTime(cfg.sparkleGain, cfg.attack);
    spG.gain.exponentialRampToValueAtTime(0.0001, cfg.attack + cfg.decay * 0.35);
    sparkle.connect(spFilter).connect(spG).connect(offline.destination);
    sparkle.start();
  }

  return await offline.startRendering();
}

async function ensureBuffers(): Promise<void> {
  if (buffersReady) return;
  if (buffersLoading) return buffersLoading;
  const ac = getCtx();
  if (!ac) return;

  buffersLoading = (async () => {
    // Пять вариаций кликов с разным характером. Случайный выбор при нажатии
    // плюс питч-джиттер даёт ощущение «настоящей» клавиатуры.
    const variations: ClickConfig[] = [
      { duration: 0.08, clickFreq: 2700, clickQ: 7, clickGain: 1.0, bodyFreq: 420, bodyGain: 0.55, sparkleGain: 0.25, attack: 0.0008, decay: 0.06, impactGain: 0.7 },
      { duration: 0.075, clickFreq: 3200, clickQ: 8, clickGain: 1.0, bodyFreq: 380, bodyGain: 0.5, sparkleGain: 0.3, attack: 0.0008, decay: 0.055, impactGain: 0.8 },
      { duration: 0.08, clickFreq: 2400, clickQ: 5, clickGain: 1.0, bodyFreq: 460, bodyGain: 0.6, sparkleGain: 0.22, attack: 0.001, decay: 0.065, impactGain: 0.65 },
      { duration: 0.072, clickFreq: 2900, clickQ: 6.5, clickGain: 1.0, bodyFreq: 400, bodyGain: 0.55, sparkleGain: 0.28, attack: 0.0008, decay: 0.058, impactGain: 0.75 },
      { duration: 0.085, clickFreq: 2200, clickQ: 5.5, clickGain: 1.0, bodyFreq: 500, bodyGain: 0.62, sparkleGain: 0.2, attack: 0.001, decay: 0.07, impactGain: 0.6 },
    ];
    clickBuffers = await Promise.all(variations.map((v) => renderKeyClick(ac, v)));

    // Пробел — более глубокий «деревянный» удар: большая клавиша, больше корпуса.
    spaceBuffer = await renderKeyClick(ac, {
      duration: 0.11,
      clickFreq: 1400,
      clickQ: 3.5,
      clickGain: 0.9,
      bodyFreq: 240,
      bodyGain: 0.85,
      sparkleGain: 0.1,
      attack: 0.0015,
      decay: 0.09,
      impactGain: 0.95,
    });

    // Ошибка — тяжёлый низкочастотный «thud» без искры.
    errorBuffer = await renderKeyClick(ac, {
      duration: 0.22,
      clickFreq: 380,
      clickQ: 3,
      clickGain: 0.9,
      bodyFreq: 160,
      bodyGain: 1.0,
      sparkleGain: 0,
      attack: 0.003,
      decay: 0.2,
      impactGain: 1.0,
    });

    buffersReady = true;
  })();

  return buffersLoading;
}

// ───── Воспроизведение ─────

// Итоговый gain приходится поднимать сильно: после всех фильтров и
// мастер-компрессора сигнал становится ~в 3 раза тише, плюс современные
// ноутбуки по умолчанию тихие. Значение подобрано эмпирически.
const OUTPUT_GAIN_BOOST = 9.0;

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
    // Компрессор ограничивает пики → можно не бояться высокого gain.
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
  if (char === ' ' && spaceBuffer) {
    playBuffer(spaceBuffer, 0.95, 0.06);
    return;
  }
  const buf = clickBuffers[Math.floor(Math.random() * clickBuffers.length)];
  if (buf) playBuffer(buf, 1.0, 0.18);
}

export function playWrong() {
  if (!isSoundEnabled()) return;
  if (!buffersReady) {
    ensureBuffers().then(() => playWrong());
    return;
  }
  if (errorBuffer) playBuffer(errorBuffer, 1.0, 0.04);
  const ac = getCtx();
  const out = masterOut;
  if (!ac || !out) return;
  try {
    if (ac.state === 'suspended') ac.resume();
    const osc = ac.createOscillator();
    const amp = ac.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ac.currentTime + 0.14);
    amp.gain.setValueAtTime(0, ac.currentTime);
    amp.gain.linearRampToValueAtTime(getVolume() * 0.8, ac.currentTime + 0.005);
    amp.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.18);
    osc.connect(amp).connect(out);
    osc.start();
    osc.stop(ac.currentTime + 0.2);
  } catch {
    // noop
  }
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
      amp.gain.linearRampToValueAtTime(Math.min(1.0, getVolume() * 1.0), t0 + 0.01);
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
