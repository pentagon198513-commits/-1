'use client';

import clsx from '@/lib/clsx';
import type { TypingState } from '@/features/typing/useTyping';

interface Props {
  state: TypingState;
}

export function TypingArea({ state }: Props) {
  const { text, cursor, mistakeIndices } = state;
  const chars = Array.from(text);

  return (
    <div className="rounded-2xl border border-border bg-bg-elev p-6 shadow-soft sm:p-8">
      <p className="typing-text text-2xl leading-relaxed sm:text-3xl">
        {chars.map((ch, i) => {
          const isPast = i < cursor;
          const isCurrent = i === cursor;
          const wasWrong = mistakeIndices.has(i);

          return (
            <span
              key={i}
              className={clsx(
                'relative',
                isPast && !wasWrong && 'text-fg',
                isPast && wasWrong && 'text-danger underline decoration-danger decoration-2',
                !isPast && !isCurrent && 'text-fg-subtle',
                isCurrent && 'bg-accent/20 text-accent rounded-sm px-0.5',
              )}
            >
              {ch === ' ' ? (isCurrent ? '␣' : ' ') : ch}
            </span>
          );
        })}
      </p>
    </div>
  );
}
