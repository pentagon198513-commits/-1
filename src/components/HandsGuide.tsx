'use client';

import { fingerColor, fingerLabel, fingerShort } from '@/features/keyboard/layout';
import type { Finger } from '@/types';
import clsx from '@/lib/clsx';

interface Props {
  activeFinger?: Finger | null;
  showLegend?: boolean;
}

// Абстрактная, но узнаваемая визуализация двух рук.
// Пальцы — скруглённые прямоугольники, активный — увеличивается и светится.
// Палец раскрашен в цвет из общей палитры пальцев.
export function HandsGuide({ activeFinger, showLegend = true }: Props) {
  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        viewBox="0 0 560 240"
        className="w-full max-w-xl"
        role="img"
        aria-label="Схема расположения рук на клавиатуре"
      >
        {/* Левая рука */}
        <Hand
          x={30}
          mirror={false}
          fingers={['L-pinky', 'L-ring', 'L-middle', 'L-index']}
          thumb="thumb"
          active={activeFinger ?? null}
        />
        {/* Правая рука */}
        <Hand
          x={320}
          mirror
          fingers={['R-pinky', 'R-ring', 'R-middle', 'R-index']}
          thumb="thumb"
          active={activeFinger ?? null}
        />
      </svg>

      {showLegend && (
        <div className="grid w-full max-w-2xl grid-cols-2 gap-1 text-xs sm:grid-cols-5">
          {(
            [
              'L-pinky',
              'L-ring',
              'L-middle',
              'L-index',
              'thumb',
              'R-index',
              'R-middle',
              'R-ring',
              'R-pinky',
            ] as Finger[]
          ).map((f) => (
            <div
              key={f}
              className={clsx(
                'flex items-center gap-2 rounded-md border border-border px-2 py-1',
                activeFinger === f && 'border-accent bg-accent/10',
              )}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: fingerColor(f) }}
              />
              <span className="text-fg-muted">{fingerShort(f)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Hand({
  x,
  mirror,
  fingers,
  thumb,
  active,
}: {
  x: number;
  mirror: boolean;
  fingers: Finger[];
  thumb: Finger;
  active: Finger | null;
}) {
  // Длины: мизинец, безымянный, средний, указательный — от края к центру
  // Для левой руки: pinky (крайний слева), ring, middle, index
  // Для правой (mirror=true) — отражение по горизонтали
  const fingerData = [
    { finger: fingers[0], offset: 0, length: 75 }, // pinky
    { finger: fingers[1], offset: 25, length: 100 }, // ring
    { finger: fingers[2], offset: 50, length: 115 }, // middle
    { finger: fingers[3], offset: 75, length: 100 }, // index
  ];

  const palmX = 0;
  const palmY = 110;
  const palmW = 130;
  const palmH = 95;

  const content = (
    <g>
      {/* Ладонь */}
      <rect
        x={palmX}
        y={palmY}
        width={palmW}
        height={palmH}
        rx={24}
        fill="rgb(var(--bg-elev))"
        stroke="rgb(var(--border))"
        strokeWidth={1.5}
      />
      {/* Пальцы */}
      {fingerData.map(({ finger, offset, length }) => {
        const isActive = active === finger;
        const fx = 10 + offset;
        const fy = palmY - length + 10;
        const fw = 20;
        return (
          <g key={finger}>
            <rect
              x={fx}
              y={fy}
              width={fw}
              height={length}
              rx={12}
              fill={isActive ? fingerColor(finger) : 'rgb(var(--bg-elev))'}
              stroke={isActive ? fingerColor(finger) : 'rgb(var(--border))'}
              strokeWidth={isActive ? 3 : 1.5}
              opacity={isActive ? 1 : 0.85}
            />
            {/* Ноготок */}
            <rect
              x={fx + 4}
              y={fy + 3}
              width={fw - 8}
              height={6}
              rx={3}
              fill={isActive ? 'white' : 'rgb(var(--fg-subtle))'}
              opacity={0.5}
            />
            {/* Цветная метка у основания */}
            <circle
              cx={fx + fw / 2}
              cy={palmY - 2}
              r={5}
              fill={fingerColor(finger)}
              opacity={isActive ? 1 : 0.5}
            />
          </g>
        );
      })}
      {/* Большой палец */}
      <rect
        x={mirror ? -30 : palmW - 20}
        y={palmY + 30}
        width={50}
        height={22}
        rx={11}
        fill={active === thumb ? fingerColor(thumb) : 'rgb(var(--bg-elev))'}
        stroke={active === thumb ? fingerColor(thumb) : 'rgb(var(--border))'}
        strokeWidth={active === thumb ? 3 : 1.5}
        transform={`rotate(${mirror ? 25 : -25} ${mirror ? 0 : palmW} ${palmY + 40})`}
      />
    </g>
  );

  return (
    <g transform={`translate(${x}, 10) ${mirror ? 'scale(-1,1) translate(-130, 0)' : ''}`}>
      {content}
      {/* Надпись над рукой */}
      <text
        x={mirror ? -65 : 65}
        y={5}
        textAnchor="middle"
        fontSize={12}
        fill="rgb(var(--fg-subtle))"
        transform={mirror ? 'scale(-1,1)' : undefined}
      >
        {mirror ? 'Правая' : 'Левая'}
      </text>
    </g>
  );
}

export function FingerLegendRow({ active }: { active?: Finger | null }) {
  const all: Finger[] = [
    'L-pinky',
    'L-ring',
    'L-middle',
    'L-index',
    'thumb',
    'R-index',
    'R-middle',
    'R-ring',
    'R-pinky',
  ];
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
      {all.map((f) => (
        <div
          key={f}
          className={clsx(
            'flex items-center gap-1.5 rounded-full border px-2 py-1 transition',
            active === f
              ? 'border-accent bg-accent/10 text-fg'
              : 'border-border text-fg-muted',
          )}
          title={fingerLabel(f)}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: fingerColor(f) }}
          />
          <span>{fingerShort(f)}</span>
        </div>
      ))}
    </div>
  );
}
