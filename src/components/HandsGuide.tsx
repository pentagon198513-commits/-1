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
  rotate: number;
};

const FINGER_ORDER: Finger[] = [
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

const LEFT_FINGERS: FingerSpec[] = [
  { finger: 'L-pinky', x: 58, y: 105, w: 30, h: 142, rotate: -18 },
  { finger: 'L-ring', x: 105, y: 48, w: 34, h: 190, rotate: 8 },
  { finger: 'L-middle', x: 154, y: 36, w: 36, h: 205, rotate: 7 },
  { finger: 'L-index', x: 210, y: 100, w: 35, h: 158, rotate: -7 },
];

const RIGHT_FINGERS: FingerSpec[] = [
  { finger: 'R-pinky', x: 58, y: 105, w: 30, h: 142, rotate: -18 },
  { finger: 'R-ring', x: 105, y: 48, w: 34, h: 190, rotate: 8 },
  { finger: 'R-middle', x: 154, y: 36, w: 36, h: 205, rotate: 7 },
  { finger: 'R-index', x: 210, y: 100, w: 35, h: 158, rotate: -7 },
];

export function HandsGuide({ activeFinger, showLegend = true }: Props) {
  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        viewBox="0 0 760 390"
        className="w-full max-w-4xl drop-shadow-[0_18px_34px_rgb(var(--accent)/0.14)]"
        role="img"
        aria-label="Схема постановки рук с цветными зонами пальцев"
      >
        <defs>
          <linearGradient id="hand-skin" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#fff0dc" />
            <stop offset="55%" stopColor="#f4c49d" />
            <stop offset="100%" stopColor="#d18a5c" />
          </linearGradient>
          <linearGradient id="hand-side" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#ffd8b7" />
            <stop offset="100%" stopColor="#c98256" />
          </linearGradient>
          <radialGradient id="hand-palm-light" cx="45%" cy="28%" r="75%">
            <stop offset="0%" stopColor="#fff6e8" stopOpacity="0.72" />
            <stop offset="62%" stopColor="#f5c6a0" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#b86748" stopOpacity="0" />
          </radialGradient>
          <filter id="active-finger-glow" x="-55%" y="-55%" width="210%" height="210%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <Hand x={64} y={22} fingers={LEFT_FINGERS} active={activeFinger ?? null} />
        <Hand x={432} y={22} fingers={RIGHT_FINGERS} active={activeFinger ?? null} mirror />
      </svg>

      {showLegend && <FingerLegend activeFinger={activeFinger ?? null} />}
    </div>
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
  const transform = `translate(${x}, ${y}) ${mirror ? 'scale(-1,1) translate(-280,0)' : ''}`;

  return (
    <g transform={transform}>
      <ellipse cx="140" cy="340" rx="118" ry="18" fill="rgb(var(--accent) / 0.12)" />
      <Wrist active={active === 'thumb'} />
      {fingers.map((finger) => (
        <FingerShape key={finger.finger} {...finger} active={active === finger.finger} />
      ))}
      <Palm active={active === 'thumb'} />
      <Thumb active={active === 'thumb'} />
    </g>
  );
}

function Wrist({ active }: { active: boolean }) {
  return (
    <path
      d="M86 270 C105 292, 176 292, 194 270 L210 390 L70 390 Z"
      fill={active ? fingerColor('thumb') : 'url(#hand-side)'}
      fillOpacity={active ? 0.78 : 1}
      stroke="#8b5a3c"
      strokeOpacity="0.34"
      strokeWidth="1.8"
    />
  );
}

function Palm({ active }: { active: boolean }) {
  const color = fingerColor('thumb');

  return (
    <g filter={active ? 'url(#active-finger-glow)' : undefined}>
      <path
        d="M62 188 C70 148, 103 132, 135 144 C155 128, 192 140, 212 173 C236 213, 226 282, 193 322 C166 356, 107 357, 78 321 C54 291, 49 226, 62 188 Z"
        fill="url(#hand-skin)"
        stroke="#8b5a3c"
        strokeOpacity="0.38"
        strokeWidth="1.9"
      />
      <path
        d="M62 188 C70 148, 103 132, 135 144 C155 128, 192 140, 212 173 C236 213, 226 282, 193 322 C166 356, 107 357, 78 321 C54 291, 49 226, 62 188 Z"
        fill={color}
        opacity={active ? 0.28 : 0}
      />
      <path
        d="M74 198 C106 222, 180 222, 207 196 C209 239, 180 274, 137 277 C95 280, 66 242, 74 198 Z"
        fill="url(#hand-palm-light)"
      />
      <path d="M73 218 C102 241, 178 240, 207 217" fill="none" stroke="#8b5a3c" strokeOpacity="0.14" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M86 273 C113 289, 165 289, 193 270" fill="none" stroke="#8b5a3c" strokeOpacity="0.12" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M88 314 C96 333, 107 346, 121 354" fill="none" stroke="#b96f45" strokeOpacity="0.1" strokeWidth="2" strokeLinecap="round" />
      <path d="M178 306 C173 328, 162 345, 148 354" fill="none" stroke="#b96f45" strokeOpacity="0.1" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function FingerShape({ finger, x, y, w, h, rotate, active }: FingerSpec & { active: boolean }) {
  const color = fingerColor(finger);
  const cx = x + w / 2;
  const cy = y + h / 2;

  return (
    <g transform={`rotate(${rotate} ${cx} ${cy})`} filter={active ? 'url(#active-finger-glow)' : undefined}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={w / 2}
        fill="url(#hand-skin)"
        stroke="#8b5a3c"
        strokeOpacity="0.4"
        strokeWidth="1.8"
      />
      <rect
        x={x + 2}
        y={y + h * 0.18}
        width={w - 4}
        height={h * 0.38}
        rx={(w - 4) / 2}
        fill={color}
        opacity={active ? 0.52 : 0.38}
      />
      <rect
        x={x - 4}
        y={y - 4}
        width={w + 8}
        height={h + 8}
        rx={(w + 8) / 2}
        fill={color}
        opacity={active ? 0.2 : 0}
        stroke={color}
        strokeOpacity={active ? 0.95 : 0}
        strokeWidth={active ? 5 : 0}
      />
      <path
        d={`M ${x + 7} ${y + 24} C ${x + 12} ${y + 13}, ${x + w - 12} ${y + 13}, ${x + w - 7} ${y + 24}`}
        fill="none"
        stroke="#fff3e6"
        strokeOpacity="0.72"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d={`M ${x + 7} ${y + h * 0.62} C ${x + w / 2} ${y + h * 0.67}, ${x + w - 7} ${y + h * 0.62}`} fill="none" stroke="#8b5a3c" strokeOpacity="0.14" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  );
}

function Thumb({ active }: { active: boolean }) {
  const color = fingerColor('thumb');

  return (
    <g filter={active ? 'url(#active-finger-glow)' : undefined}>
      <path
        d="M213 202 C240 176, 272 183, 278 210 C284 236, 257 254, 226 244 C202 237, 182 219, 188 207 C192 199, 202 200, 213 202 Z"
        fill="url(#hand-side)"
        stroke="#8b5a3c"
        strokeOpacity="0.38"
        strokeWidth="1.8"
      />
      <path
        d="M213 202 C240 176, 272 183, 278 210 C284 236, 257 254, 226 244 C202 237, 182 219, 188 207 C192 199, 202 200, 213 202 Z"
        fill={color}
        opacity={active ? 0.42 : 0.28}
      />
      <path
        d="M240 206 C227 220, 207 219, 195 208"
        fill="none"
        stroke="#fff3e6"
        strokeOpacity="0.7"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      {active && (
        <path
          d="M213 202 C240 176, 272 183, 278 210 C284 236, 257 254, 226 244 C202 237, 182 219, 188 207 C192 199, 202 200, 213 202 Z"
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeOpacity="0.95"
        />
      )}
    </g>
  );
}

function FingerLegend({ activeFinger }: { activeFinger: Finger | null }) {
  return (
    <div className="grid w-full max-w-2xl grid-cols-2 gap-1.5 text-xs sm:grid-cols-5">
      {FINGER_ORDER.map((f) => (
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
  );
}

export function FingerLegendRow({ active }: { active?: Finger | null }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
      {FINGER_ORDER.map((f) => (
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
