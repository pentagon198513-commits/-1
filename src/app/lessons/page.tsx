'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Container, SectionTitle, Card } from '@/components/UI';
import { LESSONS, LEVELS, getLessonsByLevel } from '@/features/lessons/data';
import { getLessonStatus, overallProgress } from '@/features/lessons/progress';
import { loadProfile } from '@/lib/storage';
import type { UserProfile } from '@/types';
import clsx from '@/lib/clsx';

export default function LessonsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const refresh = () => setProfile(loadProfile());
    refresh();
    window.addEventListener('tt:profile-changed', refresh);
    return () => window.removeEventListener('tt:profile-changed', refresh);
  }, []);

  const progress = overallProgress(profile);

  return (
    <Container>
      <SectionTitle
        title="Программа обучения"
        subtitle={`${progress.completed} из ${progress.total} уроков пройдено · ${progress.percent}%`}
      />

      <div className="space-y-8">
        {LEVELS.map((level) => {
          const lessons = getLessonsByLevel(level);
          return (
            <section key={level}>
              <div className="mb-3 flex items-baseline gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-accent">
                  Уровень {level}
                </span>
                <h2 className="text-xl font-semibold">{levelTitle(level)}</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {lessons.map((l) => {
                  const status = getLessonStatus(l.id, profile);
                  return (
                    <Card
                      key={l.id}
                      className={clsx(
                        'flex h-full flex-col transition',
                        status === 'completed' && 'border-success/40 bg-success/5',
                        status === 'current' && 'border-accent bg-accent/5 ring-2 ring-accent/30',
                        status === 'locked' && 'opacity-70',
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs">
                          <StatusBadge status={status} />
                          <span className="text-fg-subtle">#{l.order}</span>
                        </div>
                        <div className="text-xs text-fg-muted">
                          цель: {l.minWPM} WPM · {l.minAccuracy}%
                        </div>
                      </div>
                      <div className="mt-2 text-base font-semibold">{l.title}</div>
                      <p className="mt-1 text-sm text-fg-muted">{l.description}</p>
                      {l.newChars && l.newChars.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {l.newChars.map((c) => (
                            <span
                              key={c}
                              className="rounded-md border border-accent/40 bg-accent/10 px-2 py-0.5 text-xs font-mono text-accent"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-auto pt-4">
                        <LessonAction lessonId={l.id} status={status} />
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </Container>
  );
}

type LessonStatus = 'completed' | 'current' | 'locked';

function StatusBadge({ status }: { status: LessonStatus }) {
  if (status === 'completed')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success">
        ✓ Пройдено
      </span>
    );
  if (status === 'current')
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
        → Текущий
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-bg px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-fg-subtle">
      🔒 Заблокирован
    </span>
  );
}

function LessonAction({ lessonId, status }: { lessonId: string; status: LessonStatus }) {
  if (status === 'locked') {
    return (
      <div className="rounded-lg border border-border bg-bg px-3 py-2 text-center text-xs text-fg-subtle">
        Сначала выполните норму предыдущего урока
      </div>
    );
  }
  if (status === 'completed') {
    return (
      <Link
        href={`/train/${lessonId}`}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-success/40 bg-success/10 px-4 py-2 text-sm font-medium text-success transition hover:bg-success/15"
      >
        ↻ Повторить урок
      </Link>
    );
  }
  return (
    <Link
      href={`/train/${lessonId}`}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition hover:brightness-110"
    >
      Начать урок →
    </Link>
  );
}

function levelTitle(level: number): string {
  return (
    {
      1: 'Домашний ряд',
      2: 'Расширение букв',
      3: 'Верхний ряд',
      4: 'Нижний ряд',
      5: 'Слова',
      6: 'Предложения',
      7: 'Абзацы',
      8: 'Скоростная печать',
    }[level] ?? 'Уровень'
  );
}
