'use client';

// Генерируем мягкие короткие звуки через Web Audio API — без внешних файлов.
// Настройки хранятся в LocalStorage: tt:sound = 'on' | 'off', tt:sound-vol = 0..1

let ctx: AudioContext | null = null;

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
  if (typeof window === 'undefined') return 0.15;
  const raw = window.localStorage.getItem('tt:sound-vol');
  const n = raw ? parseFloat(raw) : 0.15;
  return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0.15;
}

export function setVolume(v: number) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('tt:sound-vol', String(Math.min(1, Math.max(0, v))));
  window.dispatchEvent(new CustomEvent('tt:sound-changed'));
}

function tone(freq: number, durationMs: number, type: OscillatorType = 'sine', gain = 1) {
  if (!isSoundEnabled()) return;
  const ac = getCtx();
  if (!ac) return;
  try {
    if (ac.state === 'suspended') ac.resume();
    const osc = ac.createOscillator();
    const amp = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const vol = getVolume() * gain;
    amp.gain.value = 0;
    amp.gain.linearRampToValueAtTime(vol, ac.currentTime + 0.005);
    amp.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + durationMs / 1000);
    osc.connect(amp).connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + durationMs / 1000 + 0.02);
  } catch {
    // noop
  }
}

// Короткий глухой щелчок — правильная клавиша
export function playCorrect() {
  tone(880, 50, 'sine', 0.6);
}

// Лёгкая ошибка — низкий тревожный тон
export function playWrong() {
  tone(180, 120, 'sawtooth', 0.8);
}

// Успех урока — приятный аккорд
export function playFinish() {
  tone(523, 120, 'sine', 1);
  setTimeout(() => tone(659, 120, 'sine', 1), 80);
  setTimeout(() => tone(784, 200, 'sine', 1), 160);
}
