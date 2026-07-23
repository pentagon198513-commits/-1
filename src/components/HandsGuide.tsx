'use client';

import { fingerColor, fingerLabel, fingerShort } from '@/features/keyboard/layout';
import type { Finger } from '@/types';
import clsx from '@/lib/clsx';

interface Props {
  activeFinger?: Finger | null;
  showLegend?: boolean;
}

type KeyTile = {
  label: string;
  sub?: string;
  finger?: Finger;
  width?: number;
  home?: boolean;
};

type FingerSpec = {
  finger: Finger;
  x: number;
  y: number;
  w: number;
  h: number;
  lean: number;
  joints: number[];
};

const KEY = 48;
const GAP = 8;
const KEY_RX = 7;

const KEY_ROWS: KeyTile[][] = [
  [
    { label: '~', sub: 'Ё', finger: 'L-pinky' },
    { label: '!', sub: '1', finger: 'L-pinky' },
    { label: '@', sub: '2', finger: 'L-ring' },
    { label: '#', sub: '3', finger: 'L-middle' },
    { label: '$', sub: '4', finger: 'L-index' },
    { label: '%', sub: '5', finger: 'L-index' },
    { label: '^', sub: '6', finger: 'R-index' },
    { label: '&', sub: '7', finger: 'R-index' },
    { label: '*', sub: '8', finger: 'R-middle' },
    { label: '(', sub: '9', finger: 'R-ring' },
    { label: ')', sub: '0', finger: 'R-pinky' },
    { label: '-', sub: '=' },
    { label: '←', width: 1.45 },
  ],
  [
    { label: 'Tab', width: 1.45 },
    { label: 'Й', finger: 'L-pinky' },
    { label: 'Ц', finger: 'L-ring' },
    { label: 'У', finger: 'L-middle' },
    { label: 'К', finger: 'L-index' },
    { label: 'Е', finger: 'L-index' },
    { label: 'Н', finger: 'R-index' },
    { label: 'Г', finger: 'R-index' },
    { label: 'Ш', finger: 'R-middle' },
    { label: 'Щ', finger: 'R-ring' },
    { label: 'Х', finger: 'R-pinky' },
    { label: 'Ъ', finger: 'R-pinky' },
    { label: '\\' },
  ],
  [
    { label: 'Caps', width: 1.75 },
    { label: 'Ф', finger: 'L-pinky', home: true },
    { label: 'Ы', finger: 'L-ring', home: true },
    { label: 'В', finger: 'L-middle', home: true },
    { label: 'А', finger: 'L-index', home: true },
    { label: 'П', finger: 'L-index' },
    { label: 'Р', finger: 'R-index' },
    { label: 'О', finger: 'R-index', home: true },
    { label: 'Л', finger: 'R-middle', home: true },
    { label: 'Д', finger: 'R-ring', home: true },
    { label: 'Ж', finger: 'R-pinky', home: true },
    { label: 'Enter', width: 1.85 },
  ],
  [
    { label: 'Shift', width: 2.15 },
    { label: 'Я', finger: 'L-pinky' },
    { label: 'Ч', finger: 'L-ring' },
    { label: 'С', finger: 'L-middle' },
    { label: 'М', finger: 'L-index' },
    { label: 'И', finger: 'L-index' },
    { label: 'Т', finger: 'R-index' },
    { label: 'Ь', finger: 'R-index' },
    { label: 'Б', finger: 'R-middle' },
    { label: 'Ю', finger: 'R-ring' },
    { label: '.', sub: ',', finger: 'R-pinky' },
    { label: 'Shift', width: 1.8 },
  ],
  [
    { label: 'Ctrl', width: 1.25 },
    { label: 'Win', width: 1.2 },
    { label: 'Alt', width: 1.2 },
    { label: 'Пробел', finger: 'thumb', width: 5.9 },
    { label: 'Alt', width: 1.2 },
    { label: 'Win', width: 1.2 },
    { label: 'Menu', width: 1.2 },
    { label: 'Ctrl', width: 1.25 },
  ],
];

const LEFT_FINGERS: FingerSpec[] = [
  { finger: 'L-pinky', x: 18, y: 76, w: 34, h: 122, lean: -11, joints: [118, 158] },
  { finger: 'L-ring', x: 70, y: 34, w: 36, h: 170, lean: -4, joints: [92, 151] },
  { finger: 'L-middle', x: 126, y: 28, w: 39, h: 181, lean: 2, joints: [88, 154] },
  { finger: 'L-index', x: 181, y: 72, w: 37, h: 146, lean: 11, joints: [121, 166] },
];

const RIGHT_FINGERS: FingerSpec[] = [
  { finger: 'R-pinky', x: 18, y: 76, w: 34, h: 122, lean: -11, joints: [118, 158] },
  { finger: 'R-ring', x: 70, y: 34, w: 36, h: 170, lean: -4, joints: [92, 151] },
  { finger: 'R-middle', x: 126, y: 28, w: 39, h: 181, lean: 2, joints: [88, 154] },
  { finger: 'R-index', x: 181, y: 72, w: 37, h: 146, lean: 11, joints: [121, 166] },
];

export function HandsGuide({ activeFinger, showLegend = true }: Props) {
  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        viewBox="0 0 980 560"
        className="w-full max-w-5xl drop-shadow-[0_20px_44px_rgb(var(--accent)/0.16)]"
        role="img"
        aria-label="Схема постановки рук на клавиатуре с цветными зонами пальцев"
      >
        <defs>
          <linearGradient id="guide-skin-main" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#fff0dc" />
            <stop offset="54%" stopColor="#f4c49d" />
            <stop offset="100%" stopColor="#d48b5d" />
          </linearGradient>
          <linearGradient id="guide-skin-side" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#ffd9b9" />
            <stop offset="100%" stopColor="#c87b50" />
          </linearGradient>
          <radialGradient id="guide-palm-light" cx="46%" cy="24%" r="78%">
            <stop offset="0%" stopColor="#fff6e9" stopOpacity="0.62" />
            <stop offset="60%" stopColor="#f6caa6" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#b86748" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="guide-key-face" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#eef2f7" />
          </linearGradient>
          <filter id="guide-card-shadow" x="-8%" y="-10%" width="116%" height="130%">
            <feDropShadow dx="0" dy="14" stdDeviation="15" floodColor="#1d1240" floodOpacity="0.13" />
          </filter>
          <filter id="guide-active-glow" x="-45%" y="-45%" width="190%" height="190%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect x="22" y="18" width="936" height="328" rx="18" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
        <Keyboard active={activeFinger ?? null} />
        <FingerRoutes active={activeFinger ?? null} />

        <Hand x={132} y={222} fingers={LEFT_FINGERS} active={activeFinger ?? null} />
        <Hand x={602} y={222} fingers={RIGHT_FINGERS} active={activeFinger ?? null} mirror />
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

function Keyboard({ active }: { active: Finger | null }) {
  return (
    <g filter="url(#guide-card-shadow)">
      {KEY_ROWS.map((row, index) => (
        <KeyRow key={index} row={row} y={38 + index * 62} startX={rowStart(index)} active={active} />
      ))}
    </g>
  );
}

function KeyRow({ row, y, startX, active }: { row: KeyTile[]; y: number; startX: number; active: Finger | null }) {
  return (
    <g>
      {row.map((key, index) => {
        const width = (key.width ?? 1) * KEY;
        const x =
          startX +
          row.slice(0, index).reduce((sum, item) => sum + (item.width ?? 1) * KEY + GAP, 0);
        return <KeyCap key={`${key.label}-${index}`} tile={key} x={x} y={y} width={width} active={active} />;
      })}
    </g>
  );
}

function KeyCap({ tile, x, y, width, active }: { tile: KeyTile; x: number; y: number; width: number; active: Finger | null }) {
  const color = tile.finger ? fingerColor(tile.finger) : '#94a3b8';
  const isActive = tile.finger === active;
  const isColored = Boolean(tile.finger);

  return (
    <g filter={isActive ? 'url(#guide-active-glow)' : undefined}>
      <rect
        x={x}
        y={y}
        width={width}
        height={KEY}
        rx={KEY_RX}
        fill={isColored ? color : 'url(#guide-key-face)'}
        fillOpacity={isColored ? (isActive ? 0.36 : 0.18) : 1}
        stroke={isActive ? color : isColored ? color : '#94a3b8'}
        strokeOpacity={isActive ? 0.9 : 0.48}
        strokeWidth={isActive ? 2.6 : 1.2}
      />
      <rect x={x + 4} y={y + 4} width={width - 8} height={KEY - 8} rx={5} fill="#ffffff" opacity="0.42" />
      {tile.home && <circle cx={x + width / 2} cy={y + KEY - 10} r="4.5" fill={color} opacity="0.8" />}
      <text
        x={x + width / 2}
        y={tile.sub ? y + 20 : y + 31}
        textAnchor="middle"
        fontSize={width > KEY * 1.4 ? 15 : 24}
        fontWeight={800}
        fill="#0f172a"
      >
        {tile.label}
      </text>
      {tile.sub && (
        <text x={x + width / 2} y={y + 38} textAnchor="middle" fontSize="18" fontWeight={800} fill="#0f172a">
          {tile.sub}
        </text>
      )}
    </g>
  );
}

function FingerRoutes({ active }: { active: Finger | null }) {
  const routes: Array<{ finger: Finger; x: number; y1: number; y2: number }> = [
    { finger: 'L-pinky', x: 156, y1: 34, y2: 226 },
    { finger: 'L-ring', x: 245, y1: 34, y2: 226 },
    { finger: 'L-middle', x: 321, y1: 34, y2: 226 },
    { finger: 'L-index', x: 432, y1: 34, y2: 226 },
    { finger: 'R-index', x: 544, y1: 34, y2: 226 },
    { finger: 'R-middle', x: 657, y1: 34, y2: 226 },
    { finger: 'R-ring', x: 733, y1: 34, y2: 226 },
    { finger: 'R-pinky', x: 821, y1: 34, y2: 226 },
  ];

  return (
    <g>
      {routes.map(({ finger, x, y1, y2 }) => {
        const color = fingerColor(finger);
        const isActive = active === finger;
        return (
          <g key={finger} filter={isActive ? 'url(#guide-active-glow)' : undefined}>
            <path
              d={`M ${x} ${y1} L ${x} ${y2}`}
              stroke={color}
              strokeWidth={isActive ? 3.6 : 2.2}
              strokeDasharray="7 7"
              strokeLinecap="round"
              opacity={isActive ? 0.9 : 0.42}
            />
            <circle cx={x} cy={y1} r={isActive ? 6.5 : 4.8} fill={color} opacity={isActive ? 1 : 0.82} />
          </g>
        );
      })}
    </g>
  );
}

function Hand({
  x,
  y,
  fingers,
  active,
  mirror = false,
}: {
  x: number;
  y: number;
  fingers: FingerSpec[];
  active: Finger | null;
  mirror?: boolean;
}) {
  const transform = `translate(${x}, ${y}) ${mirror ? 'scale(-1,1) translate(-250,0)' : ''}`;

  return (
    <g transform={transform}>
      <ellipse cx={126} cy={286} rx={112} ry={20} fill="rgb(var(--accent) / 0.12)" />
      <Wrist active={active === 'thumb'} />
      {fingers.map((item) => (
        <FingerShape key={item.finger} {...item} active={active} />
      ))}
      <Palm active={active === 'thumb'} />
      <Thumb active={active === 'thumb'} />
    </g>
  );
}

function Wrist({ active }: { active: boolean }) {
  return (
    <path
      d="M78 226 C98 246, 155 247, 176 226 L194 330 L58 330 Z"
      fill={active ? fingerColor('thumb') : 'url(#guide-skin-side)'}
      opacity={active ? 0.72 : 1}
      stroke="#8b5a3c"
      strokeOpacity="0.34"
      strokeWidth="1.7"
    />
  );
}

function FingerShape({ finger, x, y, w, h, lean, joints, active }: FingerSpec & { active: Finger | null }) {
  const isActive = active === finger;
  const color = fingerColor(finger);
  const path = fingerPath(x, y, w, h, lean);

  return (
    <g filter={isActive ? 'url(#guide-active-glow)' : undefined}>
      <path d={path} fill="url(#guide-skin-main)" stroke="#8b5a3c" strokeOpacity="0.36" strokeWidth="1.8" />
      <path d={fingerBandPath(x, y, w, h, lean)} fill={color} opacity={isActive ? 0.48 : 0.34} />
      <path d={path} fill={color} opacity={isActive ? 0.18 : 0} />
      <path d={nailPath(x, y, w)} fill="#fff0e4" stroke="#a86e4d" strokeOpacity="0.42" strokeWidth="1" />
      {joints.map((jy) => (
        <path
          key={jy}
          d={`M ${x + w * 0.2} ${jy} C ${x + w * 0.44} ${jy + 6}, ${x + w * 0.72} ${jy + 6}, ${
            x + w * 0.9
          } ${jy}`}
          fill="none"
          stroke="#8b5a3c"
          strokeOpacity="0.14"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}

function Palm({ active }: { active: boolean }) {
  const color = fingerColor('thumb');

  return (
    <g filter={active ? 'url(#guide-active-glow)' : undefined}>
      <path
        d="M50 156 C58 125, 88 112, 116 122 C132 111, 166 116, 185 134 C211 157, 216 196, 203 232 C187 274, 158 299, 112 300 C75 301, 48 270, 39 229 C34 203, 39 174, 50 156 Z"
        fill="url(#guide-skin-main)"
        stroke="#8b5a3c"
        strokeOpacity="0.36"
        strokeWidth="1.8"
      />
      <path
        d="M50 156 C58 125, 88 112, 116 122 C132 111, 166 116, 185 134 C211 157, 216 196, 203 232 C187 274, 158 299, 112 300 C75 301, 48 270, 39 229 C34 203, 39 174, 50 156 Z"
        fill={color}
        opacity={active ? 0.25 : 0}
      />
      <path
        d="M62 166 C91 184, 159 184, 192 165 C194 203, 164 238, 113 241 C78 243, 54 211, 62 166 Z"
        fill="url(#guide-palm-light)"
      />
      <path d="M60 180 C88 202, 160 203, 193 180" fill="none" stroke="#8b5a3c" strokeOpacity="0.15" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M76 229 C102 244, 149 244, 174 227" fill="none" stroke="#8b5a3c" strokeOpacity="0.13" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M72 153 C89 166, 116 168, 134 154" fill="none" stroke="#8b5a3c" strokeOpacity="0.12" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M66 260 C68 276, 75 286, 84 294" fill="none" stroke="#b96f45" strokeOpacity="0.11" strokeWidth="2" strokeLinecap="round" />
      <path d="M126 261 C124 277, 119 289, 113 299" fill="none" stroke="#b96f45" strokeOpacity="0.11" strokeWidth="2" strokeLinecap="round" />
      <path d="M178 254 C176 271, 170 283, 162 293" fill="none" stroke="#b96f45" strokeOpacity="0.11" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function Thumb({ active }: { active: boolean }) {
  const color = fingerColor('thumb');
  const path =
    'M175 166 C202 148, 235 158, 244 184 C252 207, 233 224, 204 219 C181 216, 151 198, 152 184 C153 176, 162 170, 175 166 Z';

  return (
    <g filter={active ? 'url(#guide-active-glow)' : undefined}>
      <path d={path} fill="url(#guide-skin-side)" stroke="#8b5a3c" strokeOpacity="0.36" strokeWidth="1.8" />
      <path d={path} fill={color} opacity={active ? 0.44 : 0.26} />
      <path d="M199 181 C188 193, 172 195, 161 186" fill="none" stroke="#fff3e6" strokeOpacity="0.62" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M174 204 C187 212, 203 213, 217 207" fill="none" stroke="#8b5a3c" strokeOpacity="0.13" strokeWidth="1.6" strokeLinecap="round" />
    </g>
  );
}

function rowStart(index: number) {
  const starts = [52, 52, 52, 52, 52];
  return starts[index] ?? 52;
}

function fingerPath(x: number, y: number, w: number, h: number, lean: number) {
  return [
    `M ${x + w * 0.12} ${y + h}`,
    `C ${x + lean - 7} ${y + h * 0.72}, ${x + lean * 0.6} ${y + h * 0.27}, ${x + w * 0.3} ${y + 15}`,
    `C ${x + w * 0.42} ${y + 1}, ${x + w * 0.77} ${y + 1}, ${x + w * 0.91} ${y + 15}`,
    `C ${x + w + lean * 0.58} ${y + h * 0.3}, ${x + w + lean + 7} ${y + h * 0.74}, ${x + w * 0.86} ${
      y + h
    }`,
    `C ${x + w * 0.66} ${y + h + 11}, ${x + w * 0.34} ${y + h + 11}, ${x + w * 0.12} ${y + h}`,
    'Z',
  ].join(' ');
}

function fingerBandPath(x: number, y: number, w: number, h: number, lean: number) {
  return [
    `M ${x + w * 0.16} ${y + h * 0.38}`,
    `C ${x + lean} ${y + h * 0.58}, ${x + lean - 3} ${y + h * 0.78}, ${x + w * 0.18} ${y + h * 0.9}`,
    `C ${x + w * 0.38} ${y + h * 0.99}, ${x + w * 0.66} ${y + h * 0.99}, ${x + w * 0.84} ${y + h * 0.9}`,
    `C ${x + w + lean + 3} ${y + h * 0.74}, ${x + w + lean * 0.3} ${y + h * 0.56}, ${x + w * 0.83} ${
      y + h * 0.38
    }`,
    `C ${x + w * 0.62} ${y + h * 0.45}, ${x + w * 0.36} ${y + h * 0.45}, ${x + w * 0.16} ${y + h * 0.38}`,
    'Z',
  ].join(' ');
}

function nailPath(x: number, y: number, w: number) {
  return [
    `M ${x + w * 0.27} ${y + 25}`,
    `C ${x + w * 0.36} ${y + 14}, ${x + w * 0.69} ${y + 14}, ${x + w * 0.8} ${y + 25}`,
    `C ${x + w * 0.68} ${y + 18}, ${x + w * 0.4} ${y + 18}, ${x + w * 0.27} ${y + 25}`,
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
