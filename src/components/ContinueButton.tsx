'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadProfile } from '@/lib/storage';
import { getLesson } from '@/features/lessons/data';
import { resolveContinueLesson, overallProgress } from '@/features/lessons/progress';

export function ContinueButton() {
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [progress, setProgress] = useState({ completed: 0, total: 0, percent: 0 });
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const refresh = () => {
      const p = loadProfile();
      setLessonId(resolveContinueLesson(p));
      setProgress(overallProgress(p));
      setStarted(Boolean(p && (p.lastLessonId || p.completedLessons.length > 0)));
    };
    refresh();
    window.addEventListener('tt:profile-changed', refresh);
    return () => window.removeEventListener('tt:profile-changed', refresh);
  }, []);

  if (!lessonId) return null;
  const lesson = getLesson(lessonId);
  if (!lesson) return null;

  return (
    <Link
      href={`/train/${lessonId}`}
      className="group block overflow-hidden rounded-2xl border border-accent/40 bg-accent/5 p-5 transition hover:border-accent"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-accent">
            {started ? 'Продолжить обучение' : 'Начать обучение'}
          </div>
          <div className="mt-1 text-lg font-semibold">{lesson.title}</div>
          <div className="text-sm text-fg-muted">
            Уровень {lesson.level} · Урок {lesson.order} из {progress.total}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-fg-subtle">Пройдено уроков</div>
            <div className="text-sm tabular-nums">
              {progress.completed} / {progress.total}
            </div>
          </div>
          <div className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg group-hover:brightness-110">
            {started ? 'Продолжить →' : 'Начать →'}
          </div>
        </div>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-bg">
        <div
          className="h-full bg-accent transition-all"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
    </Link>
  );
}
