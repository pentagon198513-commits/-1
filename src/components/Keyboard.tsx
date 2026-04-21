'use client';

import { ROWS, fingerColor, keyForChar } from '@/features/keyboard/layout';
import type { KeyDef } from '@/types';
import clsx from '@/lib/clsx';

interface Props {
  nextChar: string | null;
  lastCorrect?: string | null;
  lastWrong?: string | null;
  highlightFingers?: boolean;
}

export function Keyboard({
  nextChar,
  lastCorrect,
  lastWrong,
  highlightFingers = true,
}: Props) {
  const target = nextChar ? keyForChar(nextChar) : undefined;

  const rowOffsets: Record<number, string> = {
    0: '',
    1: 'pl-4',
    2: 'pl-6',
    3: 'pl-10',
    4: 'pl-0',
  };

  return (
    <div className="mx-auto w-full max-w-3xl rounded-2xl border border-border bg-bg-elev p-3 shadow-soft sm:p-4">
      {[0, 1, 2, 3, 4].map((rowIdx) => (
        <div
          key={rowIdx}
          className={clsx('flex justify-center gap-1 py-0.5', rowOffsets[rowIdx])}
        >
          {ROWS[rowIdx as 0 | 1 | 2 | 3 | 4].map((k) => (
            <Key
              key={k.code}
              k={k}
              isTarget={target?.code === k.code}
              isLastCorrect={lastCorrect === k.char}
              isLastWrong={lastWrong === k.char}
              highlightFinger={highlightFingers && target?.finger === k.finger}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function Key({
  k,
  isTarget,
  isLastCorrect,
  isLastWrong,
  highlightFinger,
}: {
  k: KeyDef;
  isTarget: boolean;
  isLastCorrect: boolean;
  isLastWrong: boolean;
  highlightFinger: boolean;
}) {
  const width = k.width ?? 1;
  const baseWidth = 40; // px per unit
  return (
    <div
      className={clsx(
        'relative flex h-10 items-center justify-center rounded-md border text-sm font-medium select-none',
        'transition-all duration-150',
        isTarget
          ? 'border-warning bg-warning/15 text-warning animate-pulseKey'
          : isLastWrong
            ? 'border-danger bg-danger/15 text-danger'
            : isLastCorrect
              ? 'border-success bg-success/10 text-success'
              : 'border-border bg-bg text-fg-muted',
      )}
      style={{
        width: baseWidth * width,
        borderTopColor: highlightFinger ? fingerColor(k.finger) : undefined,
        borderTopWidth: highlightFinger ? 3 : 1,
      }}
      aria-label={k.label ?? k.char}
    >
      <span className="uppercase">{k.label ?? k.char}</span>
    </div>
  );
}
