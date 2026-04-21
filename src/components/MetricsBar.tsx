'use client';

import type { TypingState } from '@/features/typing/useTyping';

interface Props {
  state: TypingState;
  timeLimitSec?: number;
}

export function MetricsBar({ state, timeLimitSec }: Props) {
  const elapsedSec = Math.floor(state.elapsedMs / 1000);
  const remaining = timeLimitSec ? Math.max(0, timeLimitSec - elapsedSec) : null;
  const progress = state.text.length > 0 ? Math.round((state.cursor / state.text.length) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      <Metric label="Скорость" value={state.cpm} unit="зн/мин" />
      <Metric label="WPM" value={state.wpm} unit="" />
      <Metric label="Точность" value={`${state.accuracy}`} unit="%" />
      <Metric label="Ошибки" value={state.errors} unit="" />
      <Metric
        label={remaining !== null ? 'Осталось' : 'Прогресс'}
        value={remaining !== null ? `${remaining}` : `${progress}`}
        unit={remaining !== null ? 'c' : '%'}
      />
    </div>
  );
}

function Metric({ label, value, unit }: { label: string; value: string | number; unit: string }) {
  return (
    <div className="rounded-xl border border-border bg-bg-elev px-4 py-3 shadow-soft">
      <div className="text-xs uppercase tracking-wide text-fg-subtle">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
        {unit && <span className="text-xs text-fg-muted">{unit}</span>}
      </div>
    </div>
  );
}
