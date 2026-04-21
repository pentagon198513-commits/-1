'use client';

import type { AttemptResult, UserProfile, UserStats } from '@/types';

// Абстракция над LocalStorage, чтобы позже заменить на Firebase без переписывания UI.

const KEYS = {
  profile: 'tt:profile',
  stats: 'tt:stats',
  theme: 'tt:theme',
  leaderboardOptIn: 'tt:lb-optin',
} as const;

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
    // quota or private mode — silently ignore
  }
}

export function loadProfile(): UserProfile | null {
  return safeGet<UserProfile | null>(KEYS.profile, null);
}

export function saveProfile(p: UserProfile) {
  safeSet(KEYS.profile, p);
}

export function loadStats(): UserStats {
  return safeGet<UserStats>(KEYS.stats, {
    attempts: [],
    problemChars: {},
    totalTimeMs: 0,
    bestWPM: 0,
    bestAccuracy: 0,
  });
}

export function saveStats(s: UserStats) {
  safeSet(KEYS.stats, s);
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

export function getTheme(): 'light' | 'dark' | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(KEYS.theme);
  return raw === 'light' || raw === 'dark' ? raw : null;
}

export function setTheme(t: 'light' | 'dark') {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEYS.theme, t);
}

export function resetAll() {
  if (typeof window === 'undefined') return;
  Object.values(KEYS).forEach((k) => window.localStorage.removeItem(k));
}
