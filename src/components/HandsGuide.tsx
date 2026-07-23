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

const FINGER_MARKERS: Record<Finger, Marker[]> = {
  'L-pinky': [{ x: 235, y: 626, rx: 34, ry: 105, rotate: -10 }],
  'L-ring': [{ x: 332, y: 545, rx: 35, ry: 121, rotate: 7 }],
  'L-middle': [{ x: 433, y: 541, rx: 38, ry: 130, rotate: 8 }],
  'L-index': [{ x: 531, y: 622, rx: 37, ry: 105, rotate: -7 }],
  thumb: [
    { x: 614, y: 621, rx: 43, ry: 98, rotate: 10 },
    { x: 778, y: 617, rx: 43, ry: 98, rotate: -10 },
  ],
  'R-index': [{ x: 829, y: 617, rx: 40, ry: 114, rotate: 7 }],
  'R-middle': [{ x: 925, y: 548, rx: 40, ry: 130, rotate: -8 }],
  'R-ring': [{ x: 1024, y: 552, rx: 37, ry: 121, rotate: -8 }],
  'R-pinky': [{ x: 1134, y: 630, rx: 34, ry: 104, rotate: 9 }],
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

        <FingerOverlays activeFinger={activeFinger ?? null} />
      </svg>

      {showLegend && <FingerLegend activeFinger={activeFinger ?? null} />}
    </div>
  );
}

function FingerOverlays({ activeFinger }: { activeFinger: Finger | null }) {
  return (
    <g>
      {FINGER_ORDER.map((finger) => (
        <FingerOverlay key={finger} finger={finger} active={activeFinger === finger} />
      ))}
    </g>
  );
}

function FingerOverlay({ finger, active }: { finger: Finger; active: boolean }) {
  const color = fingerColor(finger);

  return (
    <g filter={active ? 'url(#reference-active-glow)' : undefined}>
      {FINGER_MARKERS[finger].map((marker, index) => (
        <ellipse
          key={`${finger}-${index}`}
          className={active ? 'animate-pulse' : undefined}
          cx={marker.x}
          cy={marker.y}
          rx={active ? marker.rx + 5 : marker.rx}
          ry={active ? marker.ry + 7 : marker.ry}
          fill={color}
          fillOpacity={active ? 0.34 : 0.1}
          stroke={color}
          strokeOpacity={active ? 0.95 : 0}
          strokeWidth={active ? 8 : 0}
          transform={`rotate(${marker.rotate ?? 0} ${marker.x} ${marker.y})`}
        />
      ))}
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
