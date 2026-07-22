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
import type { AttemptResult } from '@/types';

type Phase = 'intro' | 'training' | 'results';

export default function TrainClient({ lessonId }: { lessonId: string }) {
  const lesson = getLesson(lessonId);
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('intro');
  const [textIndex, setTextIndex] = useState(0);
  const [lastKey, setLastKey] = useState<{ char: string; ok: boolean } | null>(null);
  const [finishSnap, setFinishSnap] = useState<TypingSnapshot | null>(null);
  const [isTypingFocused, setIsTypingFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  const processChar = useCallback(
    (input: string) => {
      const expected = state.text[state.cursor];
      handleChar(input);
      const ok = input === expected;
      setLastKey({ char: input.toLowerCase(), ok });
      if (ok) playCorrect(input);
      else playWrong();
    },
    [handleChar, state.cursor, state.text],
  );

  useEffect(() => {
    if (phase !== 'training') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target === inputRef.current) return;
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
      processChar(e.key);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, handleBackspace, processChar, reset]);

  useEffect(() => {
    if (phase === 'training') {
      containerRef.current?.focus();
      inputRef.current?.focus();
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
          className="min-w-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          aria-label="Область тренировки. Начните печатать."
          onClick={() => inputRef.current?.focus()}
          onFocus={() => setIsTypingFocused(true)}
          onBlur={() => setIsTypingFocused(false)}
        >
          <textarea
            ref={inputRef}
            value=""
            aria-label="Поле ввода тренировки"
            className="sr-only"
            onBeforeInput={(e) => {
              const data = (e.nativeEvent as InputEvent).data;
              if (!data) return;
              e.preventDefault();
              for (const char of Array.from(data)) {
                processChar(char);
              }
            }}
            onKeyDown={(e) => {
              if (e.ctrlKey || e.metaKey || e.altKey) return;
              if (e.key === 'Backspace') {
                e.preventDefault();
                handleBackspace();
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                reset();
                setFinishSnap(null);
              }
            }}
            onChange={() => undefined}
          />
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <TrainingCoach
              focused={isTypingFocused}
              started={state.startedAt !== null}
              errors={state.errors}
              accuracy={state.accuracy}
              minWPM={lesson!.minWPM}
              minAccuracy={lesson!.minAccuracy}
            />
            <Button
              variant="outline"
              className="self-start lg:self-auto"
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
            <div className="mb-3 grid gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-fg-muted sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="flex flex-wrap items-center gap-2">
                <span>Следующий символ:</span>
                <span className="rounded-md border border-warning bg-warning/15 px-2 py-0.5 font-mono text-warning">
                  {state.nextChar === ' ' ? '␣' : state.nextChar}
                </span>
                <span>— {fingerLabel(target.finger)}</span>
              </div>
              <span className="text-xs text-fg-subtle">
                Сначала точность, потом скорость
              </span>
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

          <div className="mt-8 rounded-lg border border-border bg-bg-elev px-3 py-2 text-center text-xs text-fg-subtle">
            Esc — сбросить, Backspace — стереть символ. На телефоне тренировка удобнее с внешней клавиатурой.
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
          <div className="mx-auto mt-4 grid max-w-lg gap-3 sm:grid-cols-3">
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

function TrainingCoach({
  focused,
  started,
  errors,
  accuracy,
  minWPM,
  minAccuracy,
}: {
  focused: boolean;
  started: boolean;
  errors: number;
  accuracy: number;
  minWPM: number;
  minAccuracy: number;
}) {
  const message = !started
    ? focused
      ? 'Печатайте текст ниже. Ошибки не страшны, сервис покажет слабые буквы.'
      : 'Нажмите на область тренировки и начните печатать.'
    : errors > 0
      ? 'Есть ошибки. Замедлитесь и возвращайте пальцы на домашний ряд.'
      : 'Ритм хороший. Держите ровный темп и не смотрите на клавиатуру.';

  return (
    <div className="min-w-0 rounded-lg border border-accent/25 bg-accent/10 px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-accent">
        Цель урока: {minWPM} WPM · {minAccuracy}% точности
      </div>
      <div className="mt-1 text-sm text-fg">{message}</div>
      {started && (
        <div className="mt-2 text-xs text-fg-muted">
          Текущая точность: {accuracy}%. Для зачёта важны и скорость, и аккуратность.
        </div>
      )}
    </div>
  );
}

function ResultMetric({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-lg border border-border bg-bg p-4">
      <div className="text-xs uppercase tracking-wide text-fg-subtle">{label}</div>
      <div className="mt-1 flex items-baseline justify-center gap-1">
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
        {unit && <span className="text-xs text-fg-muted">{unit}</span>}
      </div>
    </div>
  );
}
