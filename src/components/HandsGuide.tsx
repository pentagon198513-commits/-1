'use client';

import { fingerColor, fingerLabel, fingerShort } from '@/features/keyboard/layout';
import type { Finger } from '@/types';
import clsx from '@/lib/clsx';

interface Props {
  activeFinger?: Finger | null;
  showLegend?: boolean;
}

type Marker = {
  x: number;
  y: number;
  rx: number;
  ry: number;
  rotate?: number;
};

const HAND_IMAGE_WIDTH = 1456;
const HAND_IMAGE_HEIGHT = 1079;

const ACTIVE_MARKERS: Record<Finger, Marker[]> = {
  'L-pinky': [{ x: 235, y: 626, rx: 34, ry: 105, rotate: -10 }],
  'L-ring': [{ x: 332, y: 545, rx: 34, ry: 118, rotate: 7 }],
  'L-middle': [{ x: 433, y: 541, rx: 36, ry: 126, rotate: 8 }],
  'L-index': [{ x: 531, y: 622, rx: 36, ry: 102, rotate: -7 }],
  thumb: [
    { x: 614, y: 621, rx: 42, ry: 96, rotate: 10 },
    { x: 778, y: 617, rx: 42, ry: 96, rotate: -10 },
  ],
  'R-index': [{ x: 829, y: 617, rx: 38, ry: 112, rotate: 7 }],
  'R-middle': [{ x: 925, y: 548, rx: 38, ry: 126, rotate: -8 }],
  'R-ring': [{ x: 1024, y: 552, rx: 36, ry: 118, rotate: -8 }],
  'R-pinky': [{ x: 1134, y: 630, rx: 34, ry: 104, rotate: 9 }],
};

export function HandsGuide({ activeFinger, showLegend = true }: Props) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  const imageSrc = `${basePath}/typing-hands-reference.png`;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        viewBox={`0 0 ${HAND_IMAGE_WIDTH} ${HAND_IMAGE_HEIGHT}`}
        className="w-full max-w-5xl rounded-2xl border border-border bg-white shadow-[0_24px_58px_rgb(var(--accent)/0.14)]"
        role="img"
        aria-label="Схема постановки рук на клавиатуре с цветными зонами пальцев"
      >
        <defs>
          <filter id="reference-active-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="18" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <image
          href={imageSrc}
          x="0"
          y="0"
          width={HAND_IMAGE_WIDTH}
          height={HAND_IMAGE_HEIGHT}
          preserveAspectRatio="xMidYMid meet"
        />

        {activeFinger && <ActiveFingerOverlay finger={activeFinger} />}
      </svg>

      {showLegend && <FingerLegend activeFinger={activeFinger ?? null} />}
    </div>
  );
}

function ActiveFingerOverlay({ finger }: { finger: Finger }) {
  const color = fingerColor(finger);

  return (
    <g filter="url(#reference-active-glow)">
      {ACTIVE_MARKERS[finger].map((marker, index) => (
        <ellipse
          key={`${finger}-${index}`}
          cx={marker.x}
          cy={marker.y}
          rx={marker.rx}
          ry={marker.ry}
          fill={color}
          fillOpacity="0.22"
          stroke={color}
          strokeOpacity="0.95"
          strokeWidth="6"
          transform={`rotate(${marker.rotate ?? 0} ${marker.x} ${marker.y})`}
        />
      ))}
    </g>
  );
}

function FingerLegend({ activeFinger }: { activeFinger: Finger | null }) {
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
    <div className="grid w-full max-w-2xl grid-cols-2 gap-1.5 text-xs sm:grid-cols-5">
      {all.map((f) => (
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
