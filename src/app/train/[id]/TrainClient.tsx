'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { getLesson, LESSONS } from '@/features/lessons/data';
import { useTyping, type TypingSnapshot } from '@/features/typing/useTyping';
import { Keyboard } from '@/components/Keyboard';
import { TypingArea } from '@/components/TypingArea';
import { MetricsBar } from '@/components/MetricsBar';
import { LessonIntro } from '@/components/LessonIntro';
import { HandsGuide } from '@/components/HandsGuide';
import { Button, Container, Card } from '@/components/UI';
import { keyForChar, fingerLabel } from '@/features/keyboard/layout';
import { appendAttempt, loadProfile, saveProfile } from '@/lib/storage';
import { applyAttempt } from '@/features/gamification/xp';
import { playCorrect, playWrong, playFinish, preloadSounds } from '@/features/typing/sound';
import type { AttemptResult, UserProfile } from '@/types';

type Phase = 'intro' | 'training' | 'results';

export default function TrainClient({ lessonId }: { lessonId: string }) {
  const lesson = getLesson(lessonId);
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('intro');
  const [textIndex, setTextIndex] = useState(0);
  const [lastKey, setLastKey] = useState<{ char: string; ok: boolean } | null>(null);
  const [finishSnap, setFinishSnap] = useState<TypingSnapshot | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!lesson) notFound();

  // При открытии урока восстанавливаем сохранённый textIndex и помечаем
  // этот урок как «последний открытый» в профиле (для продолжения после
  // перезагрузки страницы или смены устройства с импортом бэкапа).
  useEffect(() => {
    const profile = loadProfile();
    if (!profile) return;
    const saved = profile.lessonProgress?.[lesson!.id];
    if (saved && typeof saved.textIndex === 'number') {
      const safeIdx = Math.min(saved.textIndex, lesson!.texts.length - 1);
      setTextIndex(safeIdx);
    }
    saveProfile({
      ...profile,
      lastLessonId: lesson!.id,
      lessonProgress: {
        ...(profile.lessonProgress ?? {}),
        [lesson!.id]: {
          textIndex: saved?.textIndex ?? 0,
          updatedAt: Date.now(),
        },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson!.id]);

  const text = useMemo(() => lesson!.texts[textIndex] ?? lesson!.texts[0], [lesson, textIndex]);

  // Сохраняем смену текста в уроке
  useEffect(() => {
    const profile = loadProfile();
    if (!profile) return;
    saveProfile({
      ...profile,
      lessonProgress: {
        ...(profile.lessonProgress ?? {}),
        [lesson!.id]: { textIndex, updatedAt: Date.now() },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textIndex, lesson!.id]);

  const handleFinish = useCallback(
    (snap: TypingSnapshot) => {
      setFinishSnap(snap);
      setPhase('results');
      playFinish();
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
      const profile = loadProfile();
      if (profile) {
        const updated = applyAttempt(profile, attempt);
        saveProfile(updated);
      }
    },
    [lesson],
  );

  const { state, handleChar, handleBackspace, reset } = useTyping({
    text,
    onFinish: handleFinish,
  });

  useEffect(() => {
    if (phase !== 'training') return;
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
      const ok = e.key === expected;
      setLastKey({ char: e.key.toLowerCase(), ok });
      if (ok) playCorrect(e.key);
      else playWrong();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, handleChar, handleBackspace, reset, state.cursor, state.text]);

  useEffect(() => {
    if (phase === 'training') {
      containerRef.current?.focus();
      preloadSounds();
    }
  }, [phase]);

  const target = state.nextChar ? keyForChar(state.nextChar) : undefined;
  const lessonIdx = LESSONS.findIndex((l) => l.id === lesson!.id);
  const nextLesson = LESSONS[lessonIdx + 1];
  const passed =
    finishSnap && finishSnap.accuracy >= lesson!.minAccuracy && finishSnap.wpm >= lesson!.minWPM;

  return (
    <Container>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-accent">
            Уровень {lesson!.level} · Урок {lesson!.order} из {LESSONS.length}
          </div>
          <h1 className="mt-1 text-xl font-semibold sm:text-2xl">{lesson!.title}</h1>
          <p className="text-sm text-fg-muted">{lesson!.description}</p>
        </div>
        <Link href="/lessons" className="text-sm text-fg-muted hover:text-fg">
          ← К урокам
        </Link>
      </div>

      {phase === 'intro' && (
        <LessonIntro
          lesson={lesson!}
          onStart={() => {
            reset();
            setFinishSnap(null);
            setPhase('training');
          }}
        />
      )}

      {phase === 'training' && (
        <div
          ref={containerRef}
          tabIndex={0}
          className="outline-none"
          aria-label="Область тренировки. Начните печатать."
        >
          <div className="mb-4 flex items-center justify-between gap-2">
            <div />
            <Button
              variant="outline"
              onClick={() => {
                reset();
                setFinishSnap(null);
                setPhase('intro');
              }}
            >
              ← Вернуться к объяснению
            </Button>
          </div>

          <div className="mb-4">
            <MetricsBar state={state} />
          </div>

          <div className="mb-4">
            <TypingArea state={state} />
          </div>

          {target && (
            <div className="mb-3 flex flex-wrap items-center justify-center gap-2 text-sm text-fg-muted">
              <span>Следующий символ:</span>
              <span className="rounded-md border border-warning bg-warning/15 px-2 py-0.5 font-mono text-warning">
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

          <div className="mt-6">
            <HandsGuide activeFinger={target?.finger ?? null} showLegend={false} />
          </div>

          <div className="mt-8 text-center text-xs text-fg-subtle">
            Подсказка: Esc — сбросить, Backspace — стереть символ.
          </div>
        </div>
      )}

      {phase === 'results' && finishSnap && (
        <Card className="text-center">
          <div className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
            {passed ? 'Урок пройден' : 'Попробуйте ещё раз'}
          </div>
          <div className="mt-1 text-2xl font-semibold">
            {passed ? '🎉 Отличный результат!' : 'Почти получилось'}
          </div>
          <div className="mt-2 text-sm text-fg-muted">
            Цель: {lesson!.minWPM} WPM · {lesson!.minAccuracy}% точности.
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
                setPhase('training');
              }}
            >
              Следующий текст
            </Button>
            <Button
              onClick={() => {
                reset();
                setFinishSnap(null);
                setPhase('training');
              }}
            >
              Повторить
            </Button>
            {passed && nextLesson && (
              <Button variant="primary" onClick={() => router.push(`/train/${nextLesson.id}`)}>
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
