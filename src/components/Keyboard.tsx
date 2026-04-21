'use client';

import { ROWS, ARROW_KEYS, fingerColor, keyForChar } from '@/features/keyboard/layout';
import type { KeyDef } from '@/types';
import clsx from '@/lib/clsx';

interface Props {
  nextChar?: string | null;
  lastCorrect?: string | null;
  lastWrong?: string | null;
  highlightFingers?: boolean;
  showFingerStripes?: boolean;
  activeCharsFilter?: Set<string> | null;
  compact?: boolean;
}

export function Keyboard({
  nextChar,
  lastCorrect,
  lastWrong,
  highlightFingers = true,
  showFingerStripes = true,
  activeCharsFilter = null,
  compact = false,
}: Props) {
  const target = nextChar ? keyForChar(nextChar) : undefined;
  const unit = compact ? 28 : 42;
  const gap = 4;

  return (
    <div className="mx-auto w-full overflow-x-auto">
      <div className="mx-auto inline-flex items-end gap-3 rounded-xl border border-border bg-bg-elev p-3 shadow-soft sm:p-4">
        {/* Основная клавиатура */}
        <div>
          {([0, 1, 2, 3, 4, 5] as const).map((rowIdx) => (
            <div
              key={rowIdx}
              className="flex items-center"
              style={{
                gap,
                marginTop: rowIdx === 0 ? 0 : rowIdx === 1 ? gap * 2 : gap,
              }}
            >
              {ROWS[rowIdx].map((k) => (
                <Key
                  key={k.code}
                  k={k}
                  unit={unit}
                  isTarget={!k.isModifier && target?.code === k.code}
                  isLastCorrect={!k.isModifier && lastCorrect === k.char}
                  isLastWrong={!k.isModifier && lastWrong === k.char}
                  highlightFinger={highlightFingers && !k.isModifier && target?.finger === k.finger}
                  showStripe={showFingerStripes}
                  dimmed={
                    activeCharsFilter !== null &&
                    !k.isModifier &&
                    k.char !== '' &&
                    !activeCharsFilter.has(k.char)
                  }
                />
              ))}
            </div>
          ))}
        </div>

        {/* Блок стрелок — отдельно справа, по высоте совпадает с нижними рядами */}
        <div className="flex flex-col items-center" style={{ gap }}>
          <div style={{ height: unit * 4 + gap * 4 }} />
          <div style={{ display: 'flex', gap }}>
            <div style={{ width: unit }} />
            <ArrowKey k={ARROW_KEYS[0]} unit={unit} />
            <div style={{ width: unit }} />
          </div>
          <div style={{ display: 'flex', gap }}>
            <ArrowKey k={ARROW_KEYS[1]} unit={unit} />
            <ArrowKey k={ARROW_KEYS[2]} unit={unit} />
            <ArrowKey k={ARROW_KEYS[3]} unit={unit} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ArrowKey({ k, unit }: { k: KeyDef; unit: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-md border border-border/80 bg-bg text-fg-subtle shadow-[inset_0_-2px_0_rgba(0,0,0,0.06)]"
      style={{ width: unit, height: unit, fontSize: 16 }}
      aria-label={k.label}
    >
      {k.label}
    </div>
  );
}

function Key({
  k,
  unit,
  isTarget,
  isLastCorrect,
  isLastWrong,
  highlightFinger,
  showStripe,
  dimmed,
}: {
  k: KeyDef;
  unit: number;
  isTarget: boolean;
  isLastCorrect: boolean;
  isLastWrong: boolean;
  highlightFinger: boolean;
  showStripe: boolean;
  dimmed: boolean;
}) {
  const width = (k.width ?? 1) * unit + ((k.width ?? 1) - 1) * 4;
  const height = unit;
  const stripe = showStripe && !k.isModifier ? fingerColor(k.finger) : undefined;
  const gapBefore = k.gapBefore ? k.gapBefore * unit : 0;

  return (
    <>
      {gapBefore > 0 && <div style={{ width: gapBefore }} aria-hidden />}
      <div
        className={clsx(
          'relative flex items-center justify-center rounded-md border text-sm font-medium select-none',
          'transition-all duration-150 shadow-[inset_0_-2px_0_rgba(0,0,0,0.06)]',
          k.isModifier && 'bg-bg text-fg-subtle border-border/80',
          !k.isModifier &&
            !isTarget &&
            !isLastWrong &&
            !isLastCorrect &&
            'bg-bg-elev text-fg border-border',
          isTarget && 'border-warning bg-warning/20 text-warning animate-pulseKey ring-2 ring-warning/40',
          isLastWrong && 'border-danger bg-danger/20 text-danger',
          isLastCorrect && 'border-success bg-success/15 text-success',
          dimmed && 'opacity-30',
        )}
        style={{ width, height }}
        aria-label={k.label ?? k.char}
      >
        {stripe && (
          <div
            className="absolute left-1 right-1 top-0.5 h-0.5 rounded-full"
            style={{ backgroundColor: stripe, opacity: highlightFinger ? 1 : 0.35 }}
          />
        )}
        <span
          className="uppercase leading-none"
          style={{ fontSize: k.isModifier ? (k.label && k.label.length > 3 ? 9 : 10) : 13 }}
        >
          {k.label ?? k.char}
        </span>
        {k.homeKey && (
          <div className="absolute bottom-1.5 left-1/2 h-0.5 w-3 -translate-x-1/2 rounded-full bg-fg-muted" />
        )}
      </div>
    </>
  );
}
