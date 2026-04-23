'use client';

import { fingerColor, fingerLabel, fingerShort } from '@/features/keyboard/layout';
import type { Finger } from '@/types';
import clsx from '@/lib/clsx';

interface Props {
  activeFinger?: Finger | null;
  showLegend?: boolean;
}

// Анатомическая схема рук. Ладонь — органичная форма, пальцы сужаются
// к кончикам, с костяшками и ноготками. Активный палец подсвечивается
// цветом из общей палитры пальцев.
export function HandsGuide({ activeFinger, showLegend = true }: Props) {
  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        viewBox="0 0 560 260"
        className="w-full max-w-xl"
        role="img"
        aria-label="Схема расположения рук на клавиатуре"
      >
        <defs>
          <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(var(--bg-elev))" />
            <stop offset="100%" stopColor="rgb(var(--bg))" />
          </linearGradient>
          <linearGradient id="skin-shade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgb(var(--bg-elev))" stopOpacity="1" />
            <stop offset="50%" stopColor="rgb(var(--bg-elev))" stopOpacity="1" />
            <stop offset="100%" stopColor="rgb(var(--bg))" stopOpacity="1" />
          </linearGradient>
        </defs>

        <Hand
          x={30}
          mirror={false}
          fingers={['L-pinky', 'L-ring', 'L-middle', 'L-index']}
          thumb="thumb"
          active={activeFinger ?? null}
        />
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

// Геометрия 4 пальцев (кроме большого).
// cx — горизонтальный центр относительно левого края ладони (0..130).
// length — длина от основания пальца.
// tilt — угол наклона в градусах (пальцы чуть веером).
// bw/tw — ширина у основания / у кончика (палец сужается).
const FINGER_GEOM = [
  { cx: 18, length: 70, tilt: -9, bw: 18, tw: 14 }, // мизинец
  { cx: 46, length: 100, tilt: -3, bw: 21, tw: 16 }, // безымянный
  { cx: 74, length: 118, tilt: 1, bw: 22, tw: 17 }, // средний
  { cx: 102, length: 102, tilt: 5, bw: 21, tw: 16 }, // указательный
] as const;

const PALM_TOP = 118;
const PALM_W = 130;

// Контур ладони: расширяется у оснований пальцев, мягко сужается к запястью.
// Отдельный "бугор" у большого пальца справа.
const PALM_PATH = `
  M 6,${PALM_TOP + 8}
  C -2,${PALM_TOP + 45} 0,${PALM_TOP + 88} 16,${PALM_TOP + 115}
  C 30,${PALM_TOP + 128} 95,${PALM_TOP + 128} 110,${PALM_TOP + 112}
  C 128,${PALM_TOP + 90} 138,${PALM_TOP + 55} 130,${PALM_TOP + 22}
  C 127,${PALM_TOP + 6} 113,${PALM_TOP - 2} 102,${PALM_TOP}
  L 20,${PALM_TOP}
  C 11,${PALM_TOP + 1} 7,${PALM_TOP + 4} 6,${PALM_TOP + 8}
  Z
`;

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
  return (
    <g transform={`translate(${x}, 10)`}>
      {/* Подпись над рукой — не отражаем, чтобы буквы были читаемы */}
      <text
        x={67}
        y={5}
        textAnchor="middle"
        fontSize={12}
        fill="rgb(var(--fg-subtle))"
      >
        {mirror ? 'Правая' : 'Левая'}
      </text>

      <g transform={mirror ? 'scale(-1,1) translate(-135, 0)' : undefined}>
        {/* Линии ладонных складок — для глубины */}
        <path d={PALM_PATH} fill="url(#skin)" stroke="rgb(var(--border))" strokeWidth={1.5} />
        <path
          d={`M 30,${PALM_TOP + 40} Q 60,${PALM_TOP + 55} 100,${PALM_TOP + 35}`}
          stroke="rgb(var(--border))"
          strokeWidth={0.8}
          fill="none"
          opacity={0.4}
        />
        <path
          d={`M 25,${PALM_TOP + 62} Q 60,${PALM_TOP + 78} 95,${PALM_TOP + 68}`}
          stroke="rgb(var(--border))"
          strokeWidth={0.8}
          fill="none"
          opacity={0.35}
        />
        <path
          d={`M 35,${PALM_TOP + 30} Q 40,${PALM_TOP + 70} 55,${PALM_TOP + 105}`}
          stroke="rgb(var(--border))"
          strokeWidth={0.8}
          fill="none"
          opacity={0.3}
        />

        {/* Большой палец */}
        <ThumbShape
          baseX={115}
          baseY={PALM_TOP + 42}
          active={active === thumb}
          color={fingerColor(thumb)}
        />

        {/* Остальные пальцы */}
        {FINGER_GEOM.map((geom, i) => {
          const finger = fingers[i];
          return (
            <FingerShape
              key={finger}
              geom={geom}
              active={active === finger}
              color={fingerColor(finger)}
            />
          );
        })}
      </g>
    </g>
  );
}

function FingerShape({
  geom,
  active,
  color,
}: {
  geom: (typeof FINGER_GEOM)[number];
  active: boolean;
  color: string;
}) {
  const { cx, length, tilt, bw, tw } = geom;
  const tipR = tw / 2;
  const yBase = PALM_TOP + 6;
  const yTip = yBase - length;
  const bxL = cx - bw / 2;
  const bxR = cx + bw / 2;
  const txL = cx - tw / 2;
  const txR = cx + tw / 2;

  // Сужающийся силуэт пальца с закруглённым кончиком.
  const d = `
    M ${bxL},${yBase}
    C ${bxL - 1},${yBase - length * 0.45} ${txL - 1},${yTip + length * 0.22} ${txL},${yTip + tipR}
    Q ${txL},${yTip} ${cx},${yTip}
    Q ${txR},${yTip} ${txR},${yTip + tipR}
    C ${txR + 1},${yTip + length * 0.22} ${bxR + 1},${yBase - length * 0.45} ${bxR},${yBase}
    Z
  `;

  const k1y = yTip + length * 0.3;
  const k2y = yTip + length * 0.62;

  return (
    <g transform={`rotate(${tilt} ${cx} ${yBase})`}>
      {/* Силуэт пальца */}
      <path
        d={d}
        fill={active ? color : 'url(#skin)'}
        stroke={active ? color : 'rgb(var(--border))'}
        strokeWidth={active ? 2.2 : 1.3}
        opacity={active ? 1 : 0.92}
      />
      {/* Костяшки — две складки */}
      <path
        d={`M ${cx - tw / 2 + 2},${k1y} Q ${cx},${k1y + 1.6} ${cx + tw / 2 - 2},${k1y}`}
        stroke={active ? 'rgba(0,0,0,0.25)' : 'rgb(var(--border))'}
        strokeWidth={0.8}
        fill="none"
        opacity={active ? 0.7 : 0.5}
      />
      <path
        d={`M ${cx - tw / 2 + 1.5},${k2y} Q ${cx},${k2y + 1.6} ${cx + tw / 2 - 1.5},${k2y}`}
        stroke={active ? 'rgba(0,0,0,0.25)' : 'rgb(var(--border))'}
        strokeWidth={0.8}
        fill="none"
        opacity={active ? 0.7 : 0.5}
      />
      {/* Ноготок */}
      <ellipse
        cx={cx}
        cy={yTip + 5}
        rx={tw / 2 - 2.5}
        ry={3}
        fill={active ? 'rgba(255,255,255,0.85)' : 'rgb(var(--fg-subtle))'}
        opacity={active ? 0.85 : 0.4}
      />
      {/* Цветная метка у основания — быстрая навигация глазом */}
      <circle
        cx={cx}
        cy={yBase - 1}
        r={4}
        fill={color}
        opacity={active ? 1 : 0.55}
        stroke={active ? 'rgb(var(--bg))' : 'none'}
        strokeWidth={active ? 1.2 : 0}
      />
    </g>
  );
}

function ThumbShape({
  baseX,
  baseY,
  active,
  color,
}: {
  baseX: number;
  baseY: number;
  active: boolean;
  color: string;
}) {
  const w = 26;
  const len = 58;
  // Большой палец — более массивный, с одной явной костяшкой.
  const d = `
    M 0,0
    C -3,${-len * 0.35} -1,${-len * 0.75} ${w / 2 - 2},${-len + 4}
    Q ${w / 2},${-len} ${w / 2 + 2},${-len + 4}
    C ${w + 1},${-len * 0.75} ${w + 3},${-len * 0.35} ${w},0
    Z
  `;

  return (
    <g transform={`translate(${baseX}, ${baseY}) rotate(38)`}>
      <path
        d={d}
        fill={active ? color : 'url(#skin)'}
        stroke={active ? color : 'rgb(var(--border))'}
        strokeWidth={active ? 2.2 : 1.3}
        opacity={active ? 1 : 0.92}
      />
      {/* Костяшка большого пальца */}
      <path
        d={`M 3,${-len * 0.5} Q ${w / 2},${-len * 0.5 + 2} ${w - 3},${-len * 0.5}`}
        stroke={active ? 'rgba(0,0,0,0.25)' : 'rgb(var(--border))'}
        strokeWidth={0.8}
        fill="none"
        opacity={active ? 0.7 : 0.5}
      />
      {/* Ноготок */}
      <ellipse
        cx={w / 2}
        cy={-len + 7}
        rx={w / 2 - 4}
        ry={3.5}
        fill={active ? 'rgba(255,255,255,0.85)' : 'rgb(var(--fg-subtle))'}
        opacity={active ? 0.85 : 0.4}
      />
      {/* Цветная метка у основания */}
      <circle
        cx={w / 2}
        cy={-3}
        r={4.5}
        fill={color}
        opacity={active ? 1 : 0.55}
        stroke={active ? 'rgb(var(--bg))' : 'none'}
        strokeWidth={active ? 1.2 : 0}
      />
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
