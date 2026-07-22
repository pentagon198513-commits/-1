'use client';

import { useEffect, useRef, useState } from 'react';
import {
  getStyle,
  getVolume,
  isSoundEnabled,
  listStyles,
  playCorrect,
  setSoundEnabled,
  setStyle,
  setVolume,
  type SoundStyle,
} from '@/features/typing/sound';
import clsx from '@/lib/clsx';

export function SoundControls() {
  const [on, setOn] = useState(true);
  const [vol, setVol] = useState(0.85);
  const [style, setStyleState] = useState<SoundStyle>('mechanical');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const styles = listStyles();

  useEffect(() => {
    const refresh = () => {
      setOn(isSoundEnabled());
      setVol(getVolume());
      setStyleState(getStyle());
    };
    refresh();
    window.addEventListener('tt:sound-changed', refresh);
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('tt:sound-changed', refresh);
      window.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        title="Настройки звука"
        aria-label="Настройки звука"
        className="rounded-md border border-border bg-bg-elev px-3 py-1.5 text-sm text-fg-muted hover:border-fg-muted hover:text-fg"
      >
        {on ? (vol < 0.01 ? '🔈' : vol < 0.5 ? '🔉' : '🔊') : '🔇'}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-[min(18rem,calc(100vw-2rem))] rounded-lg border border-border bg-bg-elev p-3 shadow-soft">
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
            {/* Стиль звука */}
            <div className="mt-3">
              <div className="text-xs text-fg-muted">Стиль</div>
              <div className="mt-1 space-y-1">
                {styles.map((s) => {
                  const active = s.id === style;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        setStyle(s.id);
                        // Небольшая задержка чтобы буфер загрузился перед тестом
                        setTimeout(() => playCorrect(), 120);
                      }}
                      className={clsx(
                        'flex w-full items-start justify-between rounded-md border px-2 py-1.5 text-left',
                        active
                          ? 'border-accent bg-accent/10'
                          : 'border-border bg-bg hover:border-fg-muted',
                      )}
                    >
                      <div>
                        <div className="text-sm font-medium">{s.label}</div>
                        <div className="text-[11px] text-fg-muted">{s.description}</div>
                      </div>
                      {active && <span className="text-xs text-accent">●</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Громкость */}
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
            Звуки взяты из Monkeytype. Для пробела используется отдельный семпл.
          </div>
        </div>
      )}
    </div>
  );
}
