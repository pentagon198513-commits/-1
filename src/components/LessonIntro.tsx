'use client';

import { useMemo, useState } from 'react';
import { Keyboard } from './Keyboard';
import { HandsGuide } from './HandsGuide';
import { Button, Card } from './UI';
import {
  fingerColor,
  fingerLabel,
  keyForChar,
  HOME_KEYS_BY_FINGER,
} from '@/features/keyboard/layout';
import type { Finger, Lesson } from '@/types';
import clsx from '@/lib/clsx';

interface Props {
  lesson: Lesson;
  onStart: () => void;
}

export function LessonIntro({ lesson, onStart }: Props) {
  const [step, setStep] = useState(0);
  const totalSteps = 3;

  const charsInLesson = useMemo(() => {
    const set = new Set<string>();
    lesson.texts.forEach((t) => {
      for (const c of t.toLowerCase()) {
        if (c !== ' ' && keyForChar(c)) set.add(c);
      }
    });
    return set;
  }, [lesson]);

  const fingersInLesson = useMemo(() => {
    const set = new Set<Finger>();
    charsInLesson.forEach((c) => {
      const k = keyForChar(c);
      if (k) set.add(k.finger);
    });
    return Array.from(set);
  }, [charsInLesson]);

  const next = () => (step < totalSteps - 1 ? setStep(step + 1) : onStart());
  const prev = () => step > 0 && setStep(step - 1);

  return (
    <div className="min-w-0 space-y-6">
      <Card>
        <div className="mb-4 flex items-center gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={clsx(
                'h-1 flex-1 rounded-full transition',
                i <= step ? 'bg-accent' : 'bg-border',
              )}
            />
          ))}
        </div>

        {step === 0 && <StepPosture />}
        {step === 1 && (
          <StepKeys lesson={lesson} charsInLesson={charsInLesson} />
        )}
        {step === 2 && (
          <StepFingers
            lesson={lesson}
            charsInLesson={charsInLesson}
            fingersInLesson={fingersInLesson}
          />
        )}

        <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <Button variant="ghost" onClick={prev} disabled={step === 0}>
            ← Назад
          </Button>
          <div className="text-center text-xs text-fg-subtle">
            Шаг {step + 1} из {totalSteps}
          </div>
          <Button onClick={next} className="justify-self-end">
            {step < totalSteps - 1 ? 'Далее →' : 'Начать тренировку'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function StepPosture() {
  return (
    <div className="min-w-0">
      <h2 className="text-xl font-semibold">Шаг 1. Посадка рук</h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-fg-muted">
        Базовая позиция — домашний ряд. Указательные пальцы ставятся на клавиши{' '}
        <span className="rounded-md border border-accent/40 bg-accent/10 px-1.5 py-0.5 font-mono text-accent">
          А
        </span>{' '}
        и{' '}
        <span className="rounded-md border border-accent/40 bg-accent/10 px-1.5 py-0.5 font-mono text-accent">
          О
        </span>{' '}
        — на них есть физические «пупырышки», которые позволяют ориентироваться на ощупь.
      </p>

      <div className="mt-5">
        <HandsGuide />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Hint
          title="Левая рука"
          text="Мизинец — Ф, безымянный — Ы, средний — В, указательный — А. Пробел — большой палец."
        />
        <Hint
          title="Правая рука"
          text="Указательный — О, средний — Л, безымянный — Д, мизинец — Ж. Пробел — большой палец."
        />
      </div>

      <div className="mt-5 rounded-xl border border-border bg-bg p-4 text-sm text-fg-muted">
        <strong className="text-fg">Правило №1:</strong> не смотрим на клавиатуру. После каждого
        нажатия пальцы возвращаются на домашний ряд. Спина прямая, запястья не провисают.
      </div>
    </div>
  );
}

function StepKeys({
  lesson,
  charsInLesson,
}: {
  lesson: Lesson;
  charsInLesson: Set<string>;
}) {
  const newChars = lesson.newChars ?? [];
  return (
    <div className="min-w-0">
      <h2 className="text-xl font-semibold">Шаг 2. Клавиши этого урока</h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-fg-muted">
        На клавиатуре ниже подсвечены только те клавиши, которые встречаются в этом уроке.
        {newChars.length > 0 && ' Зелёной рамкой выделены новые буквы.'}
      </p>

      {newChars.length > 0 && (
        <div className="mt-4">
          <div className="text-xs uppercase tracking-wide text-fg-subtle">
            Новые буквы
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {newChars.map((c) => {
              const k = keyForChar(c);
              return (
                <div
                  key={c}
                  className="flex min-w-0 items-center gap-2 rounded-lg border border-success/50 bg-success/10 px-3 py-2"
                >
                  <span className="shrink-0 font-mono text-lg text-success">{c}</span>
                  {k && (
                    <span className="min-w-0 truncate text-xs text-fg-muted">
                      · {fingerLabel(k.finger)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-5">
        <Keyboard
          nextChar={null}
          activeCharsFilter={charsInLesson}
          highlightFingers={false}
          compact
        />
      </div>
    </div>
  );
}

function StepFingers({
  lesson,
  charsInLesson,
  fingersInLesson,
}: {
  lesson: Lesson;
  charsInLesson: Set<string>;
  fingersInLesson: Finger[];
}) {
  const [hoveredFinger, setHoveredFinger] = useState<Finger | null>(null);

  const charsByFinger = useMemo(() => {
    const map = new Map<Finger, string[]>();
    charsInLesson.forEach((c) => {
      const k = keyForChar(c);
      if (k) {
        const arr = map.get(k.finger) ?? [];
        arr.push(c);
        map.set(k.finger, arr);
      }
    });
    return map;
  }, [charsInLesson]);

  return (
    <div className="min-w-0">
      <h2 className="text-xl font-semibold">Шаг 3. Какой палец что нажимает</h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-fg-muted">
        Каждому пальцу — свои клавиши. Наведите курсор на палец — подсветятся его клавиши.
      </p>

      <div className="mt-5">
        <HandsGuide activeFinger={hoveredFinger} />
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {fingersInLesson.map((f) => {
          const chars = charsByFinger.get(f) ?? [];
          return (
            <div
              key={f}
              onMouseEnter={() => setHoveredFinger(f)}
              onMouseLeave={() => setHoveredFinger(null)}
              className={clsx(
                'flex min-w-0 flex-col gap-2 rounded-lg border px-3 py-2 transition sm:flex-row sm:items-center sm:justify-between',
                hoveredFinger === f
                  ? 'border-accent bg-accent/5'
                  : 'border-border bg-bg-elev',
              )}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: fingerColor(f) }}
                />
                <span className="min-w-0 truncate text-sm">{fingerLabel(f)}</span>
                <span className="shrink-0 text-xs text-fg-subtle">
                  · дом. {HOME_KEYS_BY_FINGER[f] === ' ' ? '␣' : HOME_KEYS_BY_FINGER[f]}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {chars.map((c) => (
                  <span
                    key={c}
                    className="rounded-md border border-border bg-bg px-2 py-0.5 font-mono text-sm"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {lesson.kind === 'drill' && (
        <div className="mt-5 rounded-xl border border-border bg-bg p-4 text-sm text-fg-muted">
          <strong className="text-fg">Совет:</strong> не торопитесь. Сначала точность, потом
          скорость. Лучше 20 WPM без ошибок, чем 40 WPM с 10 исправлениями.
        </div>
      )}
    </div>
  );
}

function Hint({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-border bg-bg p-4">
      <div className="text-sm font-semibold">{title}</div>
      <p className="mt-1 text-sm text-fg-muted">{text}</p>
    </div>
  );
}
