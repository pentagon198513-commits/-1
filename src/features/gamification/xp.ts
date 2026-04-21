import type { AttemptResult, UserProfile } from '@/types';

// Формула: XP = символы * точность/100 * бонус_за_скорость
export function xpForAttempt(a: AttemptResult): number {
  const base = a.totalChars * (a.accuracy / 100);
  const speedBonus = 1 + Math.max(0, (a.wpm - 20) / 100);
  return Math.round(base * speedBonus);
}

// Уровень пользователя растёт нелинейно: чем выше уровень, тем больше нужно XP.
export function levelFromXP(xp: number): { level: number; into: number; needed: number } {
  let level = 1;
  let needed = 100;
  let remaining = xp;
  while (remaining >= needed) {
    remaining -= needed;
    level += 1;
    needed = Math.round(needed * 1.25);
  }
  return { level, into: remaining, needed };
}

export function applyAttempt(profile: UserProfile, attempt: AttemptResult): UserProfile {
  const gained = xpForAttempt(attempt);
  const xp = profile.xp + gained;
  const { level } = levelFromXP(xp);
  const today = new Date().toISOString().slice(0, 10);
  let streak = profile.streakDays;
  if (profile.lastActiveDay !== today) {
    const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    streak = profile.lastActiveDay === y ? profile.streakDays + 1 : 1;
  }
  const completed = new Set(profile.completedLessons);
  if (attempt.accuracy >= 90) completed.add(attempt.lessonId);

  return {
    ...profile,
    xp,
    level,
    streakDays: streak,
    lastActiveDay: today,
    completedLessons: Array.from(completed),
  };
}
