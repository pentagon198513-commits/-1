'use client';

import { useEffect, useRef, useState } from 'react';
import {
  getVolume,
  isSoundEnabled,
  setSoundEnabled,
  setVolume,
  playCorrect,
} from '@/features/typing/sound';

export function SoundControls() {
  const [on, setOn] = useState(true);
  const [vol, setVol] = useState(0.9);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOn(isSoundEnabled());
    setVol(getVolume());
    const onChange = () => {
      setOn(isSoundEnabled());
      setVol(getVolume());
    };
    window.addEventListener('tt:sound-changed', onChange);
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('tt:sound-changed', onChange);
      window.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        title="Настройки звука"
        aria-label="Настройки звука"
        className="rounded-lg border border-border bg-bg-elev px-3 py-1.5 text-sm text-fg-muted hover:text-fg hover:border-fg-muted"
      >
        {on ? (vol < 0.01 ? '🔈' : vol < 0.5 ? '🔉' : '🔊') : '🔇'}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-lg border border-border bg-bg-elev p-3 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
              Звук клавиатуры
            </div>
            <button
              onClick={() => setSoundEnabled(!on)}
              className="text-xs text-accent hover:underline"
            >
              {on ? 'выключить' : 'включить'}
            </button>
          </div>

          <div className={on ? '' : 'opacity-50 pointer-events-none'}>
            <label className="mt-3 block">
              <div className="flex items-center justify-between text-xs text-fg-muted">
                <span>Громкость</span>
                <span className="tabular-nums">{Math.round(vol * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={vol}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setVol(v);
                  setVolume(v);
                }}
                onMouseUp={() => playCorrect()}
                onTouchEnd={() => playCorrect()}
                className="mt-1 w-full accent-[rgb(var(--accent))]"
              />
            </label>

            <button
              onClick={() => playCorrect()}
              className="mt-3 w-full rounded-md border border-border bg-bg px-3 py-1.5 text-xs text-fg-muted hover:text-fg hover:border-fg-muted"
            >
              Тестовый клик
            </button>
          </div>

          <div className="mt-3 text-[11px] leading-relaxed text-fg-subtle">
            Правильная клавиша — короткий клик. Ошибка — глухой низкий тон.
            Пробел — более тяжёлый удар.
          </div>
        </div>
      )}
    </div>
  );
}
