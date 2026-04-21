import { LESSONS } from './data';
import type { UserProfile } from '@/types';

// Логика определения «следующего урока» для продолжения:
// 1. Если есть lastLessonId и урок ещё не пройден — возвращаем его
// 2. Иначе — первый не пройденный урок в порядке order
// 3. Если все пройдены — последний (для повторения)
export function resolveContinueLesson(profile: UserProfile | null): string {
  if (!profile) return LESSONS[0].id;
  const completed = new Set(profile.completedLessons);

  if (profile.lastLessonId && !completed.has(profile.lastLessonId)) {
    const exists = LESSONS.find((l) => l.id === profile.lastLessonId);
    if (exists) return exists.id;
  }

  const next = LESSONS.find((l) => !completed.has(l.id));
  if (next) return next.id;

  return LESSONS[LESSONS.length - 1].id;
}

export function getLessonStatus(
  lessonId: string,
  profile: UserProfile | null,
): 'completed' | 'current' | 'available' {
  if (!profile) return 'available';
  if (profile.completedLessons.includes(lessonId)) return 'completed';
  const current = resolveContinueLesson(profile);
  if (current === lessonId) return 'current';
  return 'available';
}

export function overallProgress(profile: UserProfile | null): {
  completed: number;
  total: number;
  percent: number;
} {
  const total = LESSONS.length;
  const completed = profile ? profile.completedLessons.filter((id) => LESSONS.some((l) => l.id === id)).length : 0;
  return { completed, total, percent: Math.round((completed / total) * 100) };
}
