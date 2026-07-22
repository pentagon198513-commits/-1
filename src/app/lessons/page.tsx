'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Container, SectionTitle, Card } from '@/components/UI';
import { LEVELS, getLessonsByLevel } from '@/features/lessons/data';
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

      <Card className="mb-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold">Маршрут обучения</div>
            <p className="text-sm text-fg-muted">
              Проходите уроки по порядку: точность открывает скорость.
            </p>
          </div>
          <div className="text-sm tabular-nums text-fg-muted">{progress.percent}%</div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-bg">
          <div className="h-full bg-accent" style={{ width: `${progress.percent}%` }} />
        </div>
      </Card>

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
                    <Link key={l.id} href={`/train/${l.id}`} className="block">
                      <Card
                        className={clsx(
                          'h-full transition',
                          status === 'completed' && 'border-success/40 bg-success/5',
                          status === 'current' && 'border-accent bg-accent/5 ring-2 ring-accent/30',
                          status === 'available' && 'hover:border-accent/50',
                        )}
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex min-w-0 items-center gap-2 text-xs">
                            <StatusBadge status={status} />
                            <span className="text-fg-subtle">#{l.order}</span>
                          </div>
                          <div className="text-xs text-fg-muted sm:text-right">
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
                      </Card>
                    </Link>
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

function StatusBadge({ status }: { status: 'completed' | 'current' | 'available' }) {
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
      Доступно
    </span>
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
