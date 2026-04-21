'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { computeAccuracy, computeCPM, computeWPM } from './metrics';

export interface TypingState {
  text: string;
  cursor: number;
  correctChars: number;
  totalKeystrokes: number;
  errors: number;
  perCharErrors: Record<string, number>;
  startedAt: number | null;
  finishedAt: number | null;
  wpm: number;
  cpm: number;
  accuracy: number;
  elapsedMs: number;
  isDone: boolean;
  mistakeIndices: Set<number>;
  nextChar: string | null;
}

export interface UseTypingOptions {
  text: string;
  onFinish?: (snapshot: TypingSnapshot) => void;
}

export interface TypingSnapshot {
  wpm: number;
  cpm: number;
  accuracy: number;
  errors: number;
  totalChars: number;
  durationMs: number;
  perCharErrors: Record<string, number>;
}

export function useTyping({ text, onFinish }: UseTypingOptions) {
  const [cursor, setCursor] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [errors, setErrors] = useState(0);
  const [perCharErrors, setPerCharErrors] = useState<Record<string, number>>({});
  const [mistakeIndices, setMistakeIndices] = useState<Set<number>>(new Set());
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  // Таймер живых метрик
  useEffect(() => {
    if (!startedAt || finishedAt) return;
    const id = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(id);
  }, [startedAt, finishedAt]);

  const reset = useCallback(() => {
    setCursor(0);
    setCorrectChars(0);
    setTotalKeystrokes(0);
    setErrors(0);
    setPerCharErrors({});
    setMistakeIndices(new Set());
    setStartedAt(null);
    setFinishedAt(null);
    setNow(Date.now());
  }, []);

  const handleChar = useCallback(
    (input: string) => {
      if (finishedAt) return;
      if (cursor >= text.length) return;

      const expected = text[cursor];
      const startTime = startedAt ?? Date.now();
      if (!startedAt) setStartedAt(startTime);

      setTotalKeystrokes((v) => v + 1);

      const isMatch = input === expected;
      if (isMatch) {
        setCorrectChars((v) => v + 1);
        const newCursor = cursor + 1;
        setCursor(newCursor);
        if (newCursor >= text.length) {
          const end = Date.now();
          setFinishedAt(end);
        }
      } else {
        setErrors((v) => v + 1);
        setMistakeIndices((prev) => {
          const next = new Set(prev);
          next.add(cursor);
          return next;
        });
        setPerCharErrors((prev) => ({
          ...prev,
          [expected]: (prev[expected] || 0) + 1,
        }));
      }
    },
    [cursor, text, startedAt, finishedAt],
  );

  const handleBackspace = useCallback(() => {
    if (finishedAt) return;
    setCursor((c) => Math.max(0, c - 1));
    setMistakeIndices((prev) => {
      if (!prev.has(cursor - 1)) return prev;
      const next = new Set(prev);
      next.delete(cursor - 1);
      return next;
    });
  }, [cursor, finishedAt]);

  useEffect(() => {
    if (finishedAt && startedAt && onFinishRef.current) {
      const snap: TypingSnapshot = {
        wpm: computeWPM(correctChars, finishedAt - startedAt),
        cpm: computeCPM(correctChars, finishedAt - startedAt),
        accuracy: computeAccuracy(correctChars, totalKeystrokes),
        errors,
        totalChars: text.length,
        durationMs: finishedAt - startedAt,
        perCharErrors,
      };
      onFinishRef.current(snap);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finishedAt]);

  const elapsedMs = useMemo(() => {
    if (!startedAt) return 0;
    return (finishedAt ?? now) - startedAt;
  }, [startedAt, finishedAt, now]);

  const state: TypingState = useMemo(
    () => ({
      text,
      cursor,
      correctChars,
      totalKeystrokes,
      errors,
      perCharErrors,
      startedAt,
      finishedAt,
      wpm: computeWPM(correctChars, elapsedMs),
      cpm: computeCPM(correctChars, elapsedMs),
      accuracy: computeAccuracy(correctChars, totalKeystrokes || 1),
      elapsedMs,
      isDone: finishedAt !== null,
      mistakeIndices,
      nextChar: text[cursor] ?? null,
    }),
    [
      text,
      cursor,
      correctChars,
      totalKeystrokes,
      errors,
      perCharErrors,
      startedAt,
      finishedAt,
      elapsedMs,
      mistakeIndices,
    ],
  );

  return { state, handleChar, handleBackspace, reset };
}
