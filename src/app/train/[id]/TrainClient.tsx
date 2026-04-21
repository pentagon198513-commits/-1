'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { getLesson, LESSONS } from '@/features/lessons/data';
import { useTyping, type TypingSnapshot } from '@/features/typing/useTyping';
import { Keyboard } from '@/components/Keyboard';
import { TypingArea } from '@/components/TypingArea';
import { MetricsBar } from '@/components/MetricsBar';
import { Button, Container, Card } from '@/components/UI';
import { keyForChar, fingerLabel } from '@/features/keyboard/layout';
import {
  appendAttempt,
  loadProfile,
  saveProfile,
} from '@/lib/storage';
import { applyAttempt } from '@/features/gamification/xp';
import type { AttemptResult, UserProfile } from '@/types';

function getInitialProfile(): UserProfile {
  return {
    id: 'local',
    name: 'Сотрудник',
    createdAt: Date.now(),
    xp: 0,
    level: 1,
    streakDays: 0,
    lastActiveDay: null,
    completedLessons: [],
    achievements: [],
  };
}

export default function TrainClient({ lessonId }: { lessonId: string }) {
  const lesson = getLesson(lessonId);
  const router = useRouter();
  const [textIndex, setTextIndex] = useState(0);
  const [lastKey, setLastKey] = useState<{ char: string; ok: boolean } | null>(null);
  const [finishSnap, setFinishSnap] = useState<TypingSnapshot | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!lesson) notFound();

  const text = useMemo(() => lesson!.texts[textIndex] ?? lesson!.texts[0], [lesson, textIndex]);

  const handleFinish = useCallback(
    (snap: TypingSnapshot) => {
      setFinishSnap(snap);
      const attempt: AttemptResult = {
        lessonId: lesson!.id,
        wpm: snap.wpm,
        cpm: snap.cpm,
        accuracy: snap.accuracy,
        errors: snap.errors,
        totalChars: snap.totalChars,
        durationMs: snap.durationMs,
        timestamp: Date.now(),
        perCharErrors: snap.perCharErrors,
      };
      appendAttempt(attempt);
      const profile = loadProfile() ?? getInitialProfile();
      const updated = applyAttempt(profile, attempt);
      saveProfile(updated);
    },
    [lesson],
  );

  const { state, handleChar, handleBackspace, reset } = useTyping({
    text,
    onFinish: handleFinish,
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
        return;
      }
      if (e.key === 'Escape') {
        reset();
        setFinishSnap(null);
        return;
      }
      if (e.key.length !== 1) return;
      e.preventDefault();
      const expected = state.text[state.cursor];
      handleChar(e.key);
      setLastKey({ char: e.key.toLowerCase(), ok: e.key === expected });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleChar, handleBackspace, reset, state.cursor, state.text]);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const target = state.nextChar ? keyForChar(state.nextChar) : undefined;
  const lessonIdx = LESSONS.findIndex((l) => l.id === lesson!.id);
  const nextLesson = LESSONS[lessonIdx + 1];

  const passed =
    finishSnap && finishSnap.accuracy >= lesson!.minAccuracy && finishSnap.wpm >= lesson!.minWPM;

  return (
    <Container>
      <div
        ref={containerRef}
        tabIndex={0}
        className="outline-none"
        aria-label="Область тренировки. Начните печатать."
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-accent">
              Уровень {lesson!.level} · Урок {lesson!.order}
            </div>
            <h1 className="mt-1 text-xl font-semibold sm:text-2xl">{lesson!.title}</h1>
            <p className="text-sm text-fg-muted">{lesson!.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                reset();
                setFinishSnap(null);
              }}
            >
              Заново
            </Button>
            <Link href="/lessons" className="text-sm text-fg-muted hover:text-fg">
              ← К урокам
            </Link>
          </div>
        </div>

        <div className="mb-4">
          <MetricsBar state={state} />
        </div>

        <div className="mb-4">
          <TypingArea state={state} />
        </div>

        {target && (
          <div className="mb-3 text-center text-sm text-fg-muted">
            Следующий символ:
            <span className="mx-2 rounded-md border border-warning bg-warning/15 px-2 py-0.5 font-mono text-warning">
              {state.nextChar === ' ' ? '␣' : state.nextChar}
            </span>
            <span>— {fingerLabel(target.finger)}</span>
          </div>
        )}

        <Keyboard
          nextChar={state.nextChar}
          lastCorrect={lastKey?.ok ? lastKey.char : null}
          lastWrong={lastKey && !lastKey.ok ? lastKey.char : null}
        />

        {finishSnap && (
          <Card className="mt-6 text-center">
            <div className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
              {passed ? 'Урок пройден' : 'Попробуйте ещё раз'}
            </div>
            <div className="mt-1 text-2xl font-semibold">
              {passed ? '🎉 Отличный результат!' : 'Почти получилось'}
            </div>
            <div className="mx-auto mt-4 grid max-w-lg grid-cols-3 gap-3">
              <ResultMetric label="Скорость" value={`${finishSnap.cpm}`} unit="зн/мин" />
              <ResultMetric label="Точность" value={`${finishSnap.accuracy}`} unit="%" />
              <ResultMetric label="WPM" value={`${finishSnap.wpm}`} unit="" />
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const next = (textIndex + 1) % lesson!.texts.length;
                  setTextIndex(next);
                  reset();
                  setFinishSnap(null);
                }}
              >
                Следующий текст
              </Button>
              <Button
                onClick={() => {
                  reset();
                  setFinishSnap(null);
                }}
              >
                Повторить
              </Button>
              {passed && nextLesson && (
                <Button
                  variant="primary"
                  onClick={() => router.push(`/train/${nextLesson.id}`)}
                >
                  Следующий урок →
                </Button>
              )}
            </div>
            <div className="mt-4">
              <Link href="/stats" className="text-sm text-accent">
                Посмотреть статистику →
              </Link>
            </div>
          </Card>
        )}

        <div className="mt-8 text-center text-xs text-fg-subtle">
          Подсказка: Esc — сбросить, Backspace — стереть символ.
        </div>
      </div>
    </Container>
  );
}

function ResultMetric({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-xl border border-border bg-bg p-4">
      <div className="text-xs uppercase tracking-wide text-fg-subtle">{label}</div>
      <div className="mt-1 flex items-baseline justify-center gap-1">
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
        {unit && <span className="text-xs text-fg-muted">{unit}</span>}
      </div>
    </div>
  );
}
