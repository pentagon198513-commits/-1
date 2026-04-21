'use client';

import type { AttemptResult, UserProfile, UserStats } from '@/types';

// Мульти-профильное хранилище. Каждый профиль живёт под своим ID.
// Ключи:
//   tt:profile-list — список всех профилей в этом браузере
//   tt:current      — ID активного профиля
//   tt:profile:<id> — UserProfile
//   tt:stats:<id>   — UserStats

const KEYS = {
  profileList: 'tt:profile-list',
  current: 'tt:current',
  profile: (id: string) => `tt:profile:${id}`,
  stats: (id: string) => `tt:stats:${id}`,
  theme: 'tt:theme',
} as const;

export interface ProfileSummary {
  id: string;
  name: string;
  createdAt: number;
}

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // noop
  }
}

function genId(): string {
  return 'p_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// ───── Profiles list ─────

export function listProfiles(): ProfileSummary[] {
  return safeGet<ProfileSummary[]>(KEYS.profileList, []);
}

export function getCurrentProfileId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(KEYS.current);
}

export function setCurrentProfileId(id: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEYS.current, id);
  window.dispatchEvent(new CustomEvent('tt:profile-changed'));
}

export function createProfile(name: string): ProfileSummary {
  const id = genId();
  const summary: ProfileSummary = { id, name: name.trim() || 'Без имени', createdAt: Date.now() };
  const list = listProfiles();
  list.push(summary);
  safeSet(KEYS.profileList, list);

  const profile: UserProfile = {
    id,
    name: summary.name,
    createdAt: summary.createdAt,
    xp: 0,
    level: 1,
    streakDays: 0,
    lastActiveDay: null,
    completedLessons: [],
    achievements: [],
  };
  safeSet(KEYS.profile(id), profile);
  safeSet(KEYS.stats(id), emptyStats());
  setCurrentProfileId(id);
  return summary;
}

export function renameProfile(id: string, name: string) {
  const list = listProfiles();
  const s = list.find((p) => p.id === id);
  if (s) {
    s.name = name.trim() || s.name;
    safeSet(KEYS.profileList, list);
  }
  const p = safeGet<UserProfile | null>(KEYS.profile(id), null);
  if (p) {
    p.name = s?.name ?? p.name;
    safeSet(KEYS.profile(id), p);
  }
  window.dispatchEvent(new CustomEvent('tt:profile-changed'));
}

export function deleteProfile(id: string) {
  if (typeof window === 'undefined') return;
  const list = listProfiles().filter((p) => p.id !== id);
  safeSet(KEYS.profileList, list);
  window.localStorage.removeItem(KEYS.profile(id));
  window.localStorage.removeItem(KEYS.stats(id));
  if (getCurrentProfileId() === id) {
    if (list.length > 0) setCurrentProfileId(list[0].id);
    else window.localStorage.removeItem(KEYS.current);
  }
  window.dispatchEvent(new CustomEvent('tt:profile-changed'));
}

// ───── Current profile data ─────

function emptyStats(): UserStats {
  return {
    attempts: [],
    problemChars: {},
    totalTimeMs: 0,
    bestWPM: 0,
    bestAccuracy: 0,
  };
}

export function loadProfile(id?: string): UserProfile | null {
  const pid = id ?? getCurrentProfileId();
  if (!pid) return null;
  return safeGet<UserProfile | null>(KEYS.profile(pid), null);
}

export function saveProfile(p: UserProfile) {
  safeSet(KEYS.profile(p.id), p);
  // Синхронизируем имя в списке
  const list = listProfiles();
  const s = list.find((x) => x.id === p.id);
  if (s && s.name !== p.name) {
    s.name = p.name;
    safeSet(KEYS.profileList, list);
  }
}

export function loadStats(id?: string): UserStats {
  const pid = id ?? getCurrentProfileId();
  if (!pid) return emptyStats();
  return safeGet<UserStats>(KEYS.stats(pid), emptyStats());
}

export function saveStats(s: UserStats, id?: string) {
  const pid = id ?? getCurrentProfileId();
  if (!pid) return;
  safeSet(KEYS.stats(pid), s);
}

export function appendAttempt(attempt: AttemptResult) {
  const stats = loadStats();
  stats.attempts.push(attempt);
  stats.totalTimeMs += attempt.durationMs;
  if (attempt.wpm > stats.bestWPM) stats.bestWPM = attempt.wpm;
  if (attempt.accuracy > stats.bestAccuracy) stats.bestAccuracy = attempt.accuracy;
  for (const [ch, n] of Object.entries(attempt.perCharErrors)) {
    stats.problemChars[ch] = (stats.problemChars[ch] || 0) + n;
  }
  saveStats(stats);
  return stats;
}

// ───── Export / Import ─────

export interface ExportPayload {
  version: 2;
  profiles: Array<{ summary: ProfileSummary; profile: UserProfile; stats: UserStats }>;
  exportedAt: number;
}

export function exportAll(): ExportPayload {
  const list = listProfiles();
  const profiles = list
    .map((s) => {
      const profile = loadProfile(s.id);
      const stats = loadStats(s.id);
      return profile ? { summary: s, profile, stats } : null;
    })
    .filter(Boolean) as ExportPayload['profiles'];
  return { version: 2, profiles, exportedAt: Date.now() };
}

export function importAll(payload: ExportPayload, mode: 'merge' | 'replace' = 'merge') {
  if (!payload || payload.version !== 2) throw new Error('Неподдерживаемый формат файла');
  if (mode === 'replace') {
    // Полностью заменяем
    listProfiles().forEach((p) => deleteProfile(p.id));
  }
  const list = listProfiles();
  for (const entry of payload.profiles) {
    // Если такой профиль уже есть — заменяем; иначе добавляем
    const exists = list.find((p) => p.id === entry.summary.id);
    if (!exists) list.push(entry.summary);
    safeSet(KEYS.profile(entry.summary.id), entry.profile);
    safeSet(KEYS.stats(entry.summary.id), entry.stats);
  }
  safeSet(KEYS.profileList, list);
  if (!getCurrentProfileId() && list.length > 0) setCurrentProfileId(list[0].id);
  window.dispatchEvent(new CustomEvent('tt:profile-changed'));
}

// ───── Theme ─────

export function getTheme(): 'light' | 'dark' | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(KEYS.theme);
  return raw === 'light' || raw === 'dark' ? raw : null;
}

export function setTheme(t: 'light' | 'dark') {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEYS.theme, t);
}

export function resetCurrentProfile() {
  const pid = getCurrentProfileId();
  if (!pid) return;
  const p = loadProfile(pid);
  if (p) {
    const cleared: UserProfile = {
      ...p,
      xp: 0,
      level: 1,
      streakDays: 0,
      lastActiveDay: null,
      completedLessons: [],
      achievements: [],
    };
    saveProfile(cleared);
  }
  saveStats(emptyStats(), pid);
  window.dispatchEvent(new CustomEvent('tt:profile-changed'));
}
