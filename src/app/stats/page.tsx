'use client';

import { useEffect, useMemo, useState } from 'react';
import { Container, Card, SectionTitle, LinkButton, Button } from '@/components/UI';
import { loadProfile, loadStats, resetAll } from '@/lib/storage';
import type { UserProfile, UserStats } from '@/types';
import { levelFromXP } from '@/features/gamification/xp';
import { ACHIEVEMENTS, getUnlockedAchievements } from '@/features/gamification/achievements';
import { LESSONS } from '@/features/lessons/data';
import clsx from '@/lib/clsx';

export default function StatsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    setProfile(loadProfile());
    setStats(loadStats());
  }, []);

  if (!profile || !stats) {
    return (
      <Container>
        <SectionTitle title="Статистика" />
        <Card>
          <p className="text-fg-muted">Начните проходить уроки — здесь появится прогресс.</p>
          <div className="mt-4">
            <LinkButton href="/lessons">Перейти к урокам</LinkButton>
          </div>
        </Card>
      </Container>
    );
  }

  const { level, into, needed } = levelFromXP(profile.xp);
  const unlocked = getUnlockedAchievements(profile, stats);
  const unlockedIds = new Set(unlocked.map((a) => a.id));

  const recent = [...stats.attempts].slice(-20).reverse();
  const avgWPM =
    stats.attempts.length > 0
      ? Math.round(stats.attempts.reduce((s, a) => s + a.wpm, 0) / stats.attempts.length)
      : 0;
  const avgAcc =
    stats.attempts.length > 0
      ? Math.round(stats.attempts.reduce((s, a) => s + a.accuracy, 0) / stats.attempts.length)
      : 0;

  const topProblems = Object.entries(stats.problemChars)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const completionPct = Math.round((profile.completedLessons.length / LESSONS.length) * 100);

  return (
    <Container>
      <SectionTitle
        title="Ваша статистика"
        subtitle={`Уровень ${level} · ${profile.xp} XP · серия ${profile.streakDays} дн.`}
        actions={
          <Button
            variant="ghost"
            onClick={() => {
              if (confirm('Сбросить весь прогресс?')) {
                resetAll();
                window.location.reload();
              }
            }}
          >
            Сбросить
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Лучшая скорость" value={`${stats.bestWPM}`} unit="WPM" />
        <StatCard label="Лучшая точность" value={`${stats.bestAccuracy}`} unit="%" />
        <StatCard label="Средняя WPM" value={`${avgWPM}`} unit="" />
        <StatCard label="Прогресс уроков" value={`${completionPct}`} unit="%" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold">Последние попытки</h3>
          {recent.length === 0 ? (
            <p className="mt-3 text-sm text-fg-muted">Ещё нет данных.</p>
          ) : (
            <Sparkline values={stats.attempts.map((a) => a.wpm)} />
          )}
          <div className="mt-4 divide-y divide-border">
            {recent.map((a, i) => (
              <div key={i} className="flex items-center justify-between py-2 text-sm">
                <span className="text-fg-muted">
                  {new Date(a.timestamp).toLocaleString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="font-mono">{a.lessonId}</span>
                <span className="tabular-nums">
                  {a.wpm} WPM · {a.accuracy}% · {a.errors} ош.
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">XP до следующего уровня</h3>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-bg">
            <div
              className="h-full bg-accent"
              style={{ width: `${Math.round((into / needed) * 100)}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-fg-muted">
            {into} / {needed} XP
          </div>

          <h3 className="mt-6 text-lg font-semibold">Проблемные буквы</h3>
          {topProblems.length === 0 ? (
            <p className="mt-2 text-sm text-fg-muted">Пока нет явных слабых мест 👍</p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {topProblems.map(([ch, count]) => (
                <div
                  key={ch}
                  className="flex items-center gap-2 rounded-md border border-border px-2 py-1 text-sm"
                >
                  <span className="font-mono">{ch === ' ' ? '␣' : ch}</span>
                  <span className="text-xs text-fg-muted">×{count}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="mt-8">
        <SectionTitle title="Достижения" subtitle={`${unlocked.length} из ${ACHIEVEMENTS.length}`} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACHIEVEMENTS.map((a) => {
            const done = unlockedIds.has(a.id);
            return (
              <div
                key={a.id}
                className={clsx(
                  'flex items-center gap-3 rounded-xl border p-4',
                  done ? 'border-accent/50 bg-accent/5' : 'border-border bg-bg-elev opacity-60',
                )}
              >
                <div className="text-2xl">{a.icon}</div>
                <div>
                  <div className="text-sm font-semibold">{a.title}</div>
                  <div className="text-xs text-fg-muted">{a.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Container>
  );
}

function StatCard({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-2xl border border-border bg-bg-elev p-4 shadow-soft">
      <div className="text-xs uppercase tracking-wide text-fg-subtle">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-3xl font-semibold tabular-nums">{value}</span>
        {unit && <span className="text-xs text-fg-muted">{unit}</span>}
      </div>
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const w = 600;
  const h = 80;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const step = w / (values.length - 1);
  const points = values
    .map((v, i) => `${i * step},${h - ((v - min) / range) * h}`)
    .join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 h-20 w-full">
      <polyline
        fill="none"
        stroke="rgb(var(--accent))"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
    </svg>
  );
}
