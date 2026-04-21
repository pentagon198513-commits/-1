import type { KeyDef, Finger } from '@/types';

// Раскладка ЙЦУКЕН с привязкой пальцев по стандарту слепой печати.
// row: 0 — цифровой, 1 — верхний, 2 — домашний, 3 — нижний, 4 — пробел.
export const RU_LAYOUT: KeyDef[] = [
  // Row 0 — numbers
  { char: 'ё', finger: 'L-pinky', hand: 'left', row: 0, code: 'Backquote' },
  { char: '1', finger: 'L-pinky', hand: 'left', row: 0, code: 'Digit1' },
  { char: '2', finger: 'L-ring', hand: 'left', row: 0, code: 'Digit2' },
  { char: '3', finger: 'L-middle', hand: 'left', row: 0, code: 'Digit3' },
  { char: '4', finger: 'L-index', hand: 'left', row: 0, code: 'Digit4' },
  { char: '5', finger: 'L-index', hand: 'left', row: 0, code: 'Digit5' },
  { char: '6', finger: 'R-index', hand: 'right', row: 0, code: 'Digit6' },
  { char: '7', finger: 'R-index', hand: 'right', row: 0, code: 'Digit7' },
  { char: '8', finger: 'R-middle', hand: 'right', row: 0, code: 'Digit8' },
  { char: '9', finger: 'R-ring', hand: 'right', row: 0, code: 'Digit9' },
  { char: '0', finger: 'R-pinky', hand: 'right', row: 0, code: 'Digit0' },
  { char: '-', finger: 'R-pinky', hand: 'right', row: 0, code: 'Minus' },
  { char: '=', finger: 'R-pinky', hand: 'right', row: 0, code: 'Equal' },
  // Row 1 — top
  { char: 'й', finger: 'L-pinky', hand: 'left', row: 1, code: 'KeyQ' },
  { char: 'ц', finger: 'L-ring', hand: 'left', row: 1, code: 'KeyW' },
  { char: 'у', finger: 'L-middle', hand: 'left', row: 1, code: 'KeyE' },
  { char: 'к', finger: 'L-index', hand: 'left', row: 1, code: 'KeyR' },
  { char: 'е', finger: 'L-index', hand: 'left', row: 1, code: 'KeyT' },
  { char: 'н', finger: 'R-index', hand: 'right', row: 1, code: 'KeyY' },
  { char: 'г', finger: 'R-index', hand: 'right', row: 1, code: 'KeyU' },
  { char: 'ш', finger: 'R-middle', hand: 'right', row: 1, code: 'KeyI' },
  { char: 'щ', finger: 'R-ring', hand: 'right', row: 1, code: 'KeyO' },
  { char: 'з', finger: 'R-pinky', hand: 'right', row: 1, code: 'KeyP' },
  { char: 'х', finger: 'R-pinky', hand: 'right', row: 1, code: 'BracketLeft' },
  { char: 'ъ', finger: 'R-pinky', hand: 'right', row: 1, code: 'BracketRight' },
  // Row 2 — home
  { char: 'ф', finger: 'L-pinky', hand: 'left', row: 2, code: 'KeyA' },
  { char: 'ы', finger: 'L-ring', hand: 'left', row: 2, code: 'KeyS' },
  { char: 'в', finger: 'L-middle', hand: 'left', row: 2, code: 'KeyD' },
  { char: 'а', finger: 'L-index', hand: 'left', row: 2, code: 'KeyF' },
  { char: 'п', finger: 'L-index', hand: 'left', row: 2, code: 'KeyG' },
  { char: 'р', finger: 'R-index', hand: 'right', row: 2, code: 'KeyH' },
  { char: 'о', finger: 'R-index', hand: 'right', row: 2, code: 'KeyJ' },
  { char: 'л', finger: 'R-middle', hand: 'right', row: 2, code: 'KeyK' },
  { char: 'д', finger: 'R-ring', hand: 'right', row: 2, code: 'KeyL' },
  { char: 'ж', finger: 'R-pinky', hand: 'right', row: 2, code: 'Semicolon' },
  { char: 'э', finger: 'R-pinky', hand: 'right', row: 2, code: 'Quote' },
  // Row 3 — bottom
  { char: 'я', finger: 'L-pinky', hand: 'left', row: 3, code: 'KeyZ' },
  { char: 'ч', finger: 'L-ring', hand: 'left', row: 3, code: 'KeyX' },
  { char: 'с', finger: 'L-middle', hand: 'left', row: 3, code: 'KeyC' },
  { char: 'м', finger: 'L-index', hand: 'left', row: 3, code: 'KeyV' },
  { char: 'и', finger: 'L-index', hand: 'left', row: 3, code: 'KeyB' },
  { char: 'т', finger: 'R-index', hand: 'right', row: 3, code: 'KeyN' },
  { char: 'ь', finger: 'R-index', hand: 'right', row: 3, code: 'KeyM' },
  { char: 'б', finger: 'R-middle', hand: 'right', row: 3, code: 'Comma' },
  { char: 'ю', finger: 'R-ring', hand: 'right', row: 3, code: 'Period' },
  { char: '.', finger: 'R-pinky', hand: 'right', row: 3, code: 'Slash' },
  // Row 4 — space
  { char: ' ', finger: 'thumb', hand: 'left', row: 4, code: 'Space', width: 6, label: 'Пробел' },
];

const byChar = new Map<string, KeyDef>();
RU_LAYOUT.forEach((k) => byChar.set(k.char, k));

export function keyForChar(ch: string): KeyDef | undefined {
  const lower = ch.toLowerCase();
  return byChar.get(lower);
}

export function fingerLabel(finger: Finger): string {
  const map: Record<Finger, string> = {
    'L-pinky': 'Левый мизинец',
    'L-ring': 'Левый безымянный',
    'L-middle': 'Левый средний',
    'L-index': 'Левый указательный',
    thumb: 'Большой палец',
    'R-index': 'Правый указательный',
    'R-middle': 'Правый средний',
    'R-ring': 'Правый безымянный',
    'R-pinky': 'Правый мизинец',
  };
  return map[finger];
}

export function fingerColor(finger: Finger): string {
  const map: Record<Finger, string> = {
    'L-pinky': '#f472b6',
    'L-ring': '#a78bfa',
    'L-middle': '#60a5fa',
    'L-index': '#34d399',
    thumb: '#9ca3af',
    'R-index': '#fbbf24',
    'R-middle': '#fb923c',
    'R-ring': '#f87171',
    'R-pinky': '#e879f9',
  };
  return map[finger];
}

export const ROWS: Record<0 | 1 | 2 | 3 | 4, KeyDef[]> = {
  0: RU_LAYOUT.filter((k) => k.row === 0),
  1: RU_LAYOUT.filter((k) => k.row === 1),
  2: RU_LAYOUT.filter((k) => k.row === 2),
  3: RU_LAYOUT.filter((k) => k.row === 3),
  4: RU_LAYOUT.filter((k) => k.row === 4),
};
