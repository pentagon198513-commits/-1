'use client';

import { fingerColor, fingerLabel, fingerShort } from '@/features/keyboard/layout';
import type { Finger } from '@/types';
import clsx from '@/lib/clsx';

interface Props {
  activeFinger?: Finger | null;
  showLegend?: boolean;
}

export function HandsGuide({ activeFinger, showLegend = true }: Props) {
  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        viewBox="0 0 720 300"
        className="w-full max-w-3xl drop-shadow-[0_18px_34px_rgb(var(--accent)/0.14)]"
        role="img"
        aria-label="Реалистичная схема расположения рук на клавиатуре"
      >
        <defs>
          <linearGradient id="skin" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#fff1df" />
            <stop offset="55%" stopColor="#f3caa8" />
            <stop offset="100%" stopColor="#d99b73" />
          </linearGradient>
          <linearGradient id="skinShadow" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#f7d7bb" />
            <stop offset="100%" stopColor="#c88764" />
          </linearGradient>
          <radialGradient id="palmGlow" cx="50%" cy="35%" r="70%">
            <stop offset="0%" stopColor="rgb(var(--neon-cyan))" stopOpacity="0.16" />
            <stop offset="100%" stopColor="rgb(var(--accent))" stopOpacity="0" />
          </radialGradient>
          <filter id="activeGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <Hand
          x={78}
          label="Левая"
          mirror={false}
          fingers={['L-pinky', 'L-ring', 'L-middle', 'L-index']}
          active={activeFinger ?? null}
        />
        <Hand
          x={420}
          label="Правая"
          mirror
          fingers={['R-pinky', 'R-ring', 'R-middle', 'R-index']}
          active={activeFinger ?? null}
        />
      </svg>

      {showLegend && (
        <div className="grid w-full max-w-2xl grid-cols-2 gap-1.5 text-xs sm:grid-cols-5">
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
                'flex items-center gap-2 rounded-md border border-border bg-bg-elev/75 px-2 py-1 shadow-[0_0_18px_rgb(var(--accent)/0.07)]',
                activeFinger === f && 'border-accent bg-accent/10 text-fg',
              )}
            >
              <span
                className="h-2.5 w-2.5 rounded-full shadow-[0_0_12px_currentColor]"
                style={{ backgroundColor: fingerColor(f), color: fingerColor(f) }}
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
  label,
  mirror,
  fingers,
  active,
}: {
  x: number;
  label: string;
  mirror: boolean;
  fingers: Finger[];
  active: Finger | null;
}) {
  const fingerData = [
    { finger: fingers[0], x: 12, y: 88, w: 28, h: 104, lean: -8, joints: [128, 160] },
    { finger: fingers[1], x: 50, y: 50, w: 31, h: 142, lean: -4, joints: [98, 145] },
    { finger: fingers[2], x: 91, y: 34, w: 32, h: 158, lean: 0, joints: [86, 140] },
    { finger: fingers[3], x: 134, y: 58, w: 34, h: 134, lean: 6, joints: [104, 148] },
  ];

  const transform = `translate(${x}, 20) ${mirror ? 'scale(-1,1) translate(-220, 0)' : ''}`;

  return (
    <g transform={transform}>
      <text
        x={110}
        y={14}
        textAnchor="middle"
        fontSize={13}
        fontWeight={600}
        fill="rgb(var(--fg-subtle))"
        transform={mirror ? 'scale(-1,1) translate(-220,0)' : undefined}
      >
        {label}
      </text>

      <ellipse cx={111} cy={248} rx={94} ry={18} fill="rgb(var(--accent) / 0.12)" />

      {fingerData.map((item) => (
        <FingerShape key={item.finger} {...item} active={active} />
      ))}

      <Palm active={active === 'thumb'} />

      <Thumb active={active === 'thumb'} mirror={mirror} />

      <path
        d="M55 218 C82 238, 134 239, 170 217"
        fill="none"
        stroke="#b97d5d"
        strokeOpacity="0.24"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M78 208 C101 220, 132 220, 154 207"
        fill="none"
        stroke="#b97d5d"
        strokeOpacity="0.18"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </g>
  );
}

function FingerShape({
  finger,
  x,
  y,
  w,
  h,
  lean,
  joints,
  active,
}: {
  finger: Finger;
  x: number;
  y: number;
  w: number;
  h: number;
  lean: number;
  joints: number[];
  active: Finger | null;
}) {
  const isActive = active === finger;
  const color = fingerColor(finger);

  return (
    <g filter={isActive ? 'url(#activeGlow)' : undefined}>
      <path
        d={[
          `M ${x + w * 0.22} ${y + h}`,
          `C ${x + lean} ${y + h * 0.72}, ${x + lean * 0.6} ${y + h * 0.28}, ${x + w * 0.35} ${y + 12}`,
          `C ${x + w * 0.46} ${y + 2}, ${x + w * 0.78} ${y + 2}, ${x + w * 0.88} ${y + 13}`,
          `C ${x + w + lean * 0.5} ${y + h * 0.3}, ${x + w + lean * 0.4} ${y + h * 0.72}, ${x + w * 0.78} ${y + h}`,
          `C ${x + w * 0.62} ${y + h + 8}, ${x + w * 0.38} ${y + h + 8}, ${x + w * 0.22} ${y + h}`,
          'Z',
        ].join(' ')}
        fill={isActive ? color : 'url(#skin)'}
        stroke={isActive ? color : '#b97d5d'}
        strokeOpacity={isActive ? 0.95 : 0.34}
        strokeWidth={isActive ? 3 : 1.4}
      />
      <path
        d={`M ${x + w * 0.32} ${y + 21} C ${x + w * 0.48} ${y + 15}, ${x + w * 0.72} ${y + 15}, ${x + w * 0.82} ${y + 22}`}
        fill="none"
        stroke={isActive ? 'white' : '#fff8f0'}
        strokeOpacity="0.68"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {joints.map((jy) => (
        <path
          key={jy}
          d={`M ${x + 7} ${jy} C ${x + w * 0.42} ${jy + 5}, ${x + w * 0.72} ${jy + 5}, ${x + w - 6} ${jy}`}
          fill="none"
          stroke={isActive ? 'white' : '#9d6b52'}
          strokeOpacity={isActive ? 0.38 : 0.17}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      ))}
      <circle
        cx={x + w / 2}
        cy={195}
        r={isActive ? 7 : 5}
        fill={color}
        opacity={isActive ? 1 : 0.62}
      />
    </g>
  );
}

function Palm({ active }: { active: boolean }) {
  return (
    <g filter={active ? 'url(#activeGlow)' : undefined}>
      <path
        d="M45 174 C43 138, 67 121, 98 124 L143 126 C178 128, 199 154, 193 190 C188 225, 159 249, 110 249 C70 249, 47 222, 45 174 Z"
        fill={active ? fingerColor('thumb') : 'url(#skin)'}
        stroke={active ? fingerColor('thumb') : '#b97d5d'}
        strokeOpacity={active ? 0.95 : 0.32}
        strokeWidth={active ? 3 : 1.5}
      />
      <path
        d="M57 171 C83 183, 153 181, 181 165 C176 198, 154 226, 112 228 C78 230, 58 206, 57 171 Z"
        fill="url(#palmGlow)"
      />
      <path
        d="M78 156 C93 171, 129 173, 148 158"
        fill="none"
        stroke="#9d6b52"
        strokeOpacity="0.16"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </g>
  );
}

function Thumb({ active, mirror }: { active: boolean; mirror: boolean }) {
  const color = fingerColor('thumb');
  return (
    <g filter={active ? 'url(#activeGlow)' : undefined}>
      <path
        d={mirror
          ? 'M54 176 C20 173, 0 190, 9 212 C18 234, 53 222, 76 201 C84 193, 77 178, 54 176 Z'
          : 'M166 176 C200 173, 220 190, 211 212 C202 234, 167 222, 144 201 C136 193, 143 178, 166 176 Z'}
        fill={active ? color : 'url(#skinShadow)'}
        stroke={active ? color : '#b97d5d'}
        strokeOpacity={active ? 0.95 : 0.34}
        strokeWidth={active ? 3 : 1.5}
      />
      <path
        d={mirror
          ? 'M25 195 C35 204, 50 205, 63 195'
          : 'M195 195 C185 204, 170 205, 157 195'}
        fill="none"
        stroke={active ? 'white' : '#fff5ea'}
        strokeOpacity="0.5"
        strokeWidth="3"
        strokeLinecap="round"
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
              ? 'border-accent bg-accent/10 text-fg shadow-[0_0_18px_rgb(var(--accent)/0.16)]'
              : 'border-border bg-bg-elev/70 text-fg-muted',
          )}
          title={fingerLabel(f)}
        >
          <span
            className="h-2 w-2 rounded-full shadow-[0_0_10px_currentColor]"
            style={{ backgroundColor: fingerColor(f), color: fingerColor(f) }}
          />
          <span>{fingerShort(f)}</span>
        </div>
      ))}
    </div>
  );
}
