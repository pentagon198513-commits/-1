'use client';

import { fingerColor, fingerLabel, fingerShort } from '@/features/keyboard/layout';
import type { Finger } from '@/types';
import clsx from '@/lib/clsx';

interface Props {
  activeFinger?: Finger | null;
  showLegend?: boolean;
}

type FingerSpec = {
  finger: Finger;
  x: number;
  y: number;
  w: number;
  h: number;
  lean: number;
  joints: number[];
};

const LEFT_FINGERS: FingerSpec[] = [
  { finger: 'L-pinky', x: 42, y: 94, w: 30, h: 118, lean: -7, joints: [135, 174] },
  { finger: 'L-ring', x: 80, y: 58, w: 34, h: 154, lean: -3, joints: [108, 162] },
  { finger: 'L-middle', x: 121, y: 42, w: 36, h: 170, lean: 0, joints: [98, 158] },
  { finger: 'L-index', x: 165, y: 68, w: 35, h: 144, lean: 6, joints: [118, 166] },
];

const RIGHT_FINGERS: FingerSpec[] = [
  { finger: 'R-pinky', x: 42, y: 94, w: 30, h: 118, lean: -7, joints: [135, 174] },
  { finger: 'R-ring', x: 80, y: 58, w: 34, h: 154, lean: -3, joints: [108, 162] },
  { finger: 'R-middle', x: 121, y: 42, w: 36, h: 170, lean: 0, joints: [98, 158] },
  { finger: 'R-index', x: 165, y: 68, w: 35, h: 144, lean: 6, joints: [118, 166] },
];

export function HandsGuide({ activeFinger, showLegend = true }: Props) {
  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        viewBox="0 0 760 330"
        className="w-full max-w-4xl drop-shadow-[0_18px_34px_rgb(var(--accent)/0.14)]"
        role="img"
        aria-label="Реалистичная схема расположения рук на клавиатуре"
      >
        <defs>
          <linearGradient id="skin-main" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#fff0dc" />
            <stop offset="48%" stopColor="#f0c19b" />
            <stop offset="100%" stopColor="#d18a61" />
          </linearGradient>
          <linearGradient id="skin-side" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#f8d4b5" />
            <stop offset="100%" stopColor="#bf7955" />
          </linearGradient>
          <radialGradient id="palm-light" cx="42%" cy="24%" r="76%">
            <stop offset="0%" stopColor="#fff5e8" stopOpacity="0.58" />
            <stop offset="58%" stopColor="#f4c6a3" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#b86748" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hand-neon" cx="50%" cy="45%" r="68%">
            <stop offset="0%" stopColor="rgb(var(--neon-cyan))" stopOpacity="0.16" />
            <stop offset="100%" stopColor="rgb(var(--accent))" stopOpacity="0" />
          </radialGradient>
          <filter id="hand-soft-shadow" x="-30%" y="-25%" width="160%" height="160%">
            <feDropShadow dx="0" dy="16" stdDeviation="14" floodColor="#7c3aed" floodOpacity="0.14" />
          </filter>
          <filter id="active-finger-glow" x="-45%" y="-45%" width="190%" height="190%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <Hand x={72} label="Левая" fingers={LEFT_FINGERS} active={activeFinger ?? null} />
        <Hand x={442} label="Правая" fingers={RIGHT_FINGERS} active={activeFinger ?? null} mirror />
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
  fingers,
  active,
  mirror = false,
}: {
  x: number;
  label: string;
  fingers: FingerSpec[];
  active: Finger | null;
  mirror?: boolean;
}) {
  const transform = `translate(${x}, 20) ${mirror ? 'scale(-1,1) translate(-252,0)' : ''}`;
  const labelTransform = mirror ? 'scale(-1,1) translate(-252,0)' : undefined;

  return (
    <g transform={transform}>
      <text
        x={126}
        y={15}
        textAnchor="middle"
        fontSize={14}
        fontWeight={700}
        fill="rgb(var(--fg-subtle))"
        transform={labelTransform}
      >
        {label}
      </text>

      <ellipse cx={126} cy={284} rx={104} ry={19} fill="rgb(var(--accent) / 0.12)" />

      <g filter="url(#hand-soft-shadow)">
        <Wrist active={active === 'thumb'} />
        {fingers.map((item) => (
          <FingerShape key={item.finger} {...item} active={active} />
        ))}
        <Palm active={active === 'thumb'} />
        <Thumb active={active === 'thumb'} />
      </g>
    </g>
  );
}

function Wrist({ active }: { active: boolean }) {
  return (
    <path
      d="M82 235 C99 249, 154 249, 171 234 L190 314 L61 314 Z"
      fill={active ? fingerColor('thumb') : 'url(#skin-side)'}
      opacity={active ? 0.72 : 1}
      stroke={active ? fingerColor('thumb') : '#9e6548'}
      strokeOpacity={active ? 0.78 : 0.22}
      strokeWidth="1.5"
    />
  );
}

function FingerShape({ finger, x, y, w, h, lean, joints, active }: FingerSpec & { active: Finger | null }) {
  const isActive = active === finger;
  const color = fingerColor(finger);
  const path = fingerPath(x, y, w, h, lean);

  return (
    <g filter={isActive ? 'url(#active-finger-glow)' : undefined}>
      <path
        d={path}
        fill="url(#skin-main)"
        stroke="#9e6548"
        strokeOpacity="0.28"
        strokeWidth="1.4"
      />
      <path d={path} fill={color} opacity={isActive ? 0.38 : 0} />
      <path
        d={nailPath(x, y, w)}
        fill="#fff7ec"
        stroke="#d59a78"
        strokeOpacity="0.3"
        strokeWidth="0.9"
      />
      {joints.map((jy) => (
        <path
          key={jy}
          d={`M ${x + w * 0.23} ${jy} C ${x + w * 0.42} ${jy + 6}, ${x + w * 0.72} ${jy + 6}, ${
            x + w * 0.88
          } ${jy}`}
          fill="none"
          stroke={isActive ? color : '#8f5a41'}
          strokeOpacity={isActive ? 0.42 : 0.16}
          strokeWidth={isActive ? 2.2 : 1.5}
          strokeLinecap="round"
        />
      ))}
      <circle
        cx={x + w * 0.5}
        cy={211}
        r={isActive ? 8 : 5.5}
        fill={color}
        opacity={isActive ? 1 : 0.6}
      />
    </g>
  );
}

function Palm({ active }: { active: boolean }) {
  const color = fingerColor('thumb');

  return (
    <g filter={active ? 'url(#active-finger-glow)' : undefined}>
      <path
        d="M52 162 C58 134, 84 119, 112 126 C126 116, 157 118, 178 131 C205 148, 215 184, 204 219 C190 260, 158 277, 111 274 C73 272, 49 248, 43 211 C40 191, 43 174, 52 162 Z"
        fill="url(#skin-main)"
        stroke="#9e6548"
        strokeOpacity="0.3"
        strokeWidth="1.5"
      />
      <path
        d="M52 162 C58 134, 84 119, 112 126 C126 116, 157 118, 178 131 C205 148, 215 184, 204 219 C190 260, 158 277, 111 274 C73 272, 49 248, 43 211 C40 191, 43 174, 52 162 Z"
        fill={color}
        opacity={active ? 0.34 : 0}
      />
      <path
        d="M63 169 C90 183, 158 181, 190 164 C188 197, 161 229, 113 232 C77 234, 57 207, 63 169 Z"
        fill="url(#palm-light)"
      />
      <path d="M62 176 C84 197, 158 198, 187 176" fill="none" stroke="#8f5a41" strokeOpacity="0.16" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M78 222 C101 235, 146 235, 170 220" fill="none" stroke="#8f5a41" strokeOpacity="0.16" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M72 152 C89 164, 113 166, 130 154" fill="none" stroke="#8f5a41" strokeOpacity="0.13" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M45 200 C74 219, 173 218, 205 196" fill="url(#hand-neon)" opacity="0.8" />
    </g>
  );
}

function Thumb({ active }: { active: boolean }) {
  const color = fingerColor('thumb');
  const path =
    'M171 176 C198 164, 226 174, 233 197 C240 218, 221 230, 195 225 C176 222, 151 203, 153 190 C154 183, 161 179, 171 176 Z';

  return (
    <g filter={active ? 'url(#active-finger-glow)' : undefined}>
      <path
        d={path}
        fill="url(#skin-side)"
        stroke={active ? color : '#9e6548'}
        strokeOpacity={active ? 0.9 : 0.32}
        strokeWidth={active ? 3 : 1.5}
      />
      <path d={path} fill={color} opacity={active ? 0.38 : 0} />
      <path
        d="M193 191 C184 201, 171 202, 160 194"
        fill="none"
        stroke="#fff4e7"
        strokeOpacity="0.56"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M174 211 C184 218, 199 220, 212 215" fill="none" stroke="#8f5a41" strokeOpacity="0.16" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M162 184 C170 192, 177 200, 184 211" fill="none" stroke="#8f5a41" strokeOpacity="0.13" strokeWidth="1.4" strokeLinecap="round" />
    </g>
  );
}

function fingerPath(x: number, y: number, w: number, h: number, lean: number) {
  return [
    `M ${x + w * 0.16} ${y + h}`,
    `C ${x + lean - 4} ${y + h * 0.72}, ${x + lean * 0.55} ${y + h * 0.28}, ${x + w * 0.31} ${y + 14}`,
    `C ${x + w * 0.43} ${y + 1}, ${x + w * 0.75} ${y + 1}, ${x + w * 0.89} ${y + 14}`,
    `C ${x + w + lean * 0.55} ${y + h * 0.3}, ${x + w + lean + 4} ${y + h * 0.73}, ${x + w * 0.83} ${y + h}`,
    `C ${x + w * 0.65} ${y + h + 10}, ${x + w * 0.35} ${y + h + 10}, ${x + w * 0.16} ${y + h}`,
    'Z',
  ].join(' ');
}

function nailPath(x: number, y: number, w: number) {
  return [
    `M ${x + w * 0.28} ${y + 25}`,
    `C ${x + w * 0.36} ${y + 15}, ${x + w * 0.67} ${y + 15}, ${x + w * 0.78} ${y + 25}`,
    `C ${x + w * 0.68} ${y + 18}, ${x + w * 0.4} ${y + 18}, ${x + w * 0.28} ${y + 25}`,
    'Z',
  ].join(' ');
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
