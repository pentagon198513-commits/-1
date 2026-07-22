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
    <div className="min-w-0 rounded-lg border border-border bg-bg-elev p-4 shadow-soft sm:p-6">
      <p className="typing-text break-words text-2xl leading-relaxed sm:text-3xl">
        {chars.map((ch, i) => {
          const isPast = i < cursor;
          const isCurrent = i === cursor;
          const wasWrong = mistakeIndices.has(i);

          return (
            <span
              key={i}
              className={clsx(
                'relative rounded-sm',
                isPast && !wasWrong && 'text-fg',
                isPast && wasWrong && 'text-danger underline decoration-danger decoration-2',
                !isPast && !isCurrent && 'text-fg-subtle',
                isCurrent && 'bg-accent/20 px-0.5 text-accent ring-1 ring-accent/30',
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
