import type { KeyDef, Finger } from '@/types';

// Полная раскладка офисной клавиатуры ЙЦУКЕН:
// — F-row: Esc, F1–F12 (с визуальными зазорами между группами F1-F4/F5-F8/F9-F12)
// — Числовой ряд с Backspace
// — ЙЦУКЕН ряд с Tab и \
// — Домашний ряд с Caps Lock и Enter
// — Нижний ряд с двумя Shift
// — Нижняя линия: Ctrl, Win, Alt, Пробел, Alt, Win, Menu, Ctrl
// — Отдельный блок стрелок: ←↑↓→

export const RU_LAYOUT: KeyDef[] = [
  // ───── Row 0: F-row ─────
  { char: '', finger: 'L-pinky', hand: 'left', row: 0, code: 'Escape', label: 'Esc', isModifier: true },
  { char: '', finger: 'L-pinky', hand: 'left', row: 0, code: 'F1', label: 'F1', isModifier: true, gapBefore: 0.5 },
  { char: '', finger: 'L-ring', hand: 'left', row: 0, code: 'F2', label: 'F2', isModifier: true },
  { char: '', finger: 'L-middle', hand: 'left', row: 0, code: 'F3', label: 'F3', isModifier: true },
  { char: '', finger: 'L-index', hand: 'left', row: 0, code: 'F4', label: 'F4', isModifier: true },
  { char: '', finger: 'L-index', hand: 'left', row: 0, code: 'F5', label: 'F5', isModifier: true, gapBefore: 0.5 },
  { char: '', finger: 'R-index', hand: 'right', row: 0, code: 'F6', label: 'F6', isModifier: true },
  { char: '', finger: 'R-index', hand: 'right', row: 0, code: 'F7', label: 'F7', isModifier: true },
  { char: '', finger: 'R-middle', hand: 'right', row: 0, code: 'F8', label: 'F8', isModifier: true },
  { char: '', finger: 'R-ring', hand: 'right', row: 0, code: 'F9', label: 'F9', isModifier: true, gapBefore: 0.5 },
  { char: '', finger: 'R-ring', hand: 'right', row: 0, code: 'F10', label: 'F10', isModifier: true },
  { char: '', finger: 'R-pinky', hand: 'right', row: 0, code: 'F11', label: 'F11', isModifier: true },
  { char: '', finger: 'R-pinky', hand: 'right', row: 0, code: 'F12', label: 'F12', isModifier: true },

  // ───── Row 1: Ё 1 2 3 4 5 6 7 8 9 0 - = Backspace ─────
  { char: 'ё', finger: 'L-pinky', hand: 'left', row: 1, code: 'Backquote' },
  { char: '1', finger: 'L-pinky', hand: 'left', row: 1, code: 'Digit1' },
  { char: '2', finger: 'L-ring', hand: 'left', row: 1, code: 'Digit2' },
  { char: '3', finger: 'L-middle', hand: 'left', row: 1, code: 'Digit3' },
  { char: '4', finger: 'L-index', hand: 'left', row: 1, code: 'Digit4' },
  { char: '5', finger: 'L-index', hand: 'left', row: 1, code: 'Digit5' },
  { char: '6', finger: 'R-index', hand: 'right', row: 1, code: 'Digit6' },
  { char: '7', finger: 'R-index', hand: 'right', row: 1, code: 'Digit7' },
  { char: '8', finger: 'R-middle', hand: 'right', row: 1, code: 'Digit8' },
  { char: '9', finger: 'R-ring', hand: 'right', row: 1, code: 'Digit9' },
  { char: '0', finger: 'R-pinky', hand: 'right', row: 1, code: 'Digit0' },
  { char: '-', finger: 'R-pinky', hand: 'right', row: 1, code: 'Minus' },
  { char: '=', finger: 'R-pinky', hand: 'right', row: 1, code: 'Equal' },
  { char: '', finger: 'R-pinky', hand: 'right', row: 1, code: 'Backspace', width: 2, label: '⌫ Backspace', isModifier: true },

  // ───── Row 2: Tab Й Ц У К Е Н Г Ш Щ З Х Ъ \ ─────
  { char: '', finger: 'L-pinky', hand: 'left', row: 2, code: 'Tab', width: 1.5, label: 'Tab', isModifier: true },
  { char: 'й', finger: 'L-pinky', hand: 'left', row: 2, code: 'KeyQ' },
  { char: 'ц', finger: 'L-ring', hand: 'left', row: 2, code: 'KeyW' },
  { char: 'у', finger: 'L-middle', hand: 'left', row: 2, code: 'KeyE' },
  { char: 'к', finger: 'L-index', hand: 'left', row: 2, code: 'KeyR' },
  { char: 'е', finger: 'L-index', hand: 'left', row: 2, code: 'KeyT' },
  { char: 'н', finger: 'R-index', hand: 'right', row: 2, code: 'KeyY' },
  { char: 'г', finger: 'R-index', hand: 'right', row: 2, code: 'KeyU' },
  { char: 'ш', finger: 'R-middle', hand: 'right', row: 2, code: 'KeyI' },
  { char: 'щ', finger: 'R-ring', hand: 'right', row: 2, code: 'KeyO' },
  { char: 'з', finger: 'R-pinky', hand: 'right', row: 2, code: 'KeyP' },
  { char: 'х', finger: 'R-pinky', hand: 'right', row: 2, code: 'BracketLeft' },
  { char: 'ъ', finger: 'R-pinky', hand: 'right', row: 2, code: 'BracketRight' },
  { char: '\\', finger: 'R-pinky', hand: 'right', row: 2, code: 'Backslash', width: 1.5 },

  // ───── Row 3: Caps Ф Ы В А П Р О Л Д Ж Э Enter ─────
  { char: '', finger: 'L-pinky', hand: 'left', row: 3, code: 'CapsLock', width: 1.75, label: 'Caps Lock', isModifier: true },
  { char: 'ф', finger: 'L-pinky', hand: 'left', row: 3, code: 'KeyA' },
  { char: 'ы', finger: 'L-ring', hand: 'left', row: 3, code: 'KeyS' },
  { char: 'в', finger: 'L-middle', hand: 'left', row: 3, code: 'KeyD' },
  { char: 'а', finger: 'L-index', hand: 'left', row: 3, code: 'KeyF', homeKey: true },
  { char: 'п', finger: 'L-index', hand: 'left', row: 3, code: 'KeyG' },
  { char: 'р', finger: 'R-index', hand: 'right', row: 3, code: 'KeyH' },
  { char: 'о', finger: 'R-index', hand: 'right', row: 3, code: 'KeyJ', homeKey: true },
  { char: 'л', finger: 'R-middle', hand: 'right', row: 3, code: 'KeyK' },
  { char: 'д', finger: 'R-ring', hand: 'right', row: 3, code: 'KeyL' },
  { char: 'ж', finger: 'R-pinky', hand: 'right', row: 3, code: 'Semicolon' },
  { char: 'э', finger: 'R-pinky', hand: 'right', row: 3, code: 'Quote' },
  { char: '', finger: 'R-pinky', hand: 'right', row: 3, code: 'Enter', width: 2.25, label: '⏎ Enter', isModifier: true },

  // ───── Row 4: Shift Я Ч С М И Т Ь Б Ю . Shift ─────
  { char: '', finger: 'L-pinky', hand: 'left', row: 4, code: 'ShiftLeft', width: 2.25, label: '⇧ Shift', isModifier: true },
  { char: 'я', finger: 'L-pinky', hand: 'left', row: 4, code: 'KeyZ' },
  { char: 'ч', finger: 'L-ring', hand: 'left', row: 4, code: 'KeyX' },
  { char: 'с', finger: 'L-middle', hand: 'left', row: 4, code: 'KeyC' },
  { char: 'м', finger: 'L-index', hand: 'left', row: 4, code: 'KeyV' },
  { char: 'и', finger: 'L-index', hand: 'left', row: 4, code: 'KeyB' },
  { char: 'т', finger: 'R-index', hand: 'right', row: 4, code: 'KeyN' },
  { char: 'ь', finger: 'R-index', hand: 'right', row: 4, code: 'KeyM' },
  { char: 'б', finger: 'R-middle', hand: 'right', row: 4, code: 'Comma' },
  { char: 'ю', finger: 'R-ring', hand: 'right', row: 4, code: 'Period' },
  { char: '.', finger: 'R-pinky', hand: 'right', row: 4, code: 'Slash' },
  { char: '', finger: 'R-pinky', hand: 'right', row: 4, code: 'ShiftRight', width: 2.75, label: '⇧ Shift', isModifier: true },

  // ───── Row 5: Ctrl Win Alt Space Alt Win Menu Ctrl ─────
  { char: '', finger: 'L-pinky', hand: 'left', row: 5, code: 'ControlLeft', width: 1.25, label: 'Ctrl', isModifier: true },
  { char: '', finger: 'L-pinky', hand: 'left', row: 5, code: 'MetaLeft', width: 1.25, label: 'Win', isModifier: true },
  { char: '', finger: 'L-pinky', hand: 'left', row: 5, code: 'AltLeft', width: 1.25, label: 'Alt', isModifier: true },
  { char: ' ', finger: 'thumb', hand: 'left', row: 5, code: 'Space', width: 6.25, label: 'Пробел' },
  { char: '', finger: 'R-pinky', hand: 'right', row: 5, code: 'AltRight', width: 1.25, label: 'Alt', isModifier: true },
  { char: '', finger: 'R-pinky', hand: 'right', row: 5, code: 'MetaRight', width: 1.25, label: 'Win', isModifier: true },
  { char: '', finger: 'R-pinky', hand: 'right', row: 5, code: 'ContextMenu', width: 1.25, label: '≡', isModifier: true },
  { char: '', finger: 'R-pinky', hand: 'right', row: 5, code: 'ControlRight', width: 1.25, label: 'Ctrl', isModifier: true },
];

// Отдельный блок стрелок справа от основной клавиатуры
export const ARROW_KEYS: KeyDef[] = [
  { char: '', finger: 'R-pinky', hand: 'right', row: 4, code: 'ArrowUp', label: '↑', isModifier: true, group: 'arrows' },
  { char: '', finger: 'R-pinky', hand: 'right', row: 5, code: 'ArrowLeft', label: '←', isModifier: true, group: 'arrows' },
  { char: '', finger: 'R-pinky', hand: 'right', row: 5, code: 'ArrowDown', label: '↓', isModifier: true, group: 'arrows' },
  { char: '', finger: 'R-pinky', hand: 'right', row: 5, code: 'ArrowRight', label: '→', isModifier: true, group: 'arrows' },
];

const byChar = new Map<string, KeyDef>();
RU_LAYOUT.filter((k) => k.char && !k.isModifier).forEach((k) => byChar.set(k.char, k));

export function keyForChar(ch: string): KeyDef | undefined {
  if (!ch) return undefined;
  return byChar.get(ch.toLowerCase());
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

export function fingerShort(finger: Finger): string {
  const map: Record<Finger, string> = {
    'L-pinky': 'Л-мизинец',
    'L-ring': 'Л-безым.',
    'L-middle': 'Л-средний',
    'L-index': 'Л-указат.',
    thumb: 'Б.палец',
    'R-index': 'П-указат.',
    'R-middle': 'П-средний',
    'R-ring': 'П-безым.',
    'R-pinky': 'П-мизинец',
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

export const ALL_FINGERS: Finger[] = [
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

export const HOME_KEYS_BY_FINGER: Record<Finger, string> = {
  'L-pinky': 'ф',
  'L-ring': 'ы',
  'L-middle': 'в',
  'L-index': 'а',
  thumb: ' ',
  'R-index': 'о',
  'R-middle': 'л',
  'R-ring': 'д',
  'R-pinky': 'ж',
};

export const ROWS: Record<0 | 1 | 2 | 3 | 4 | 5, KeyDef[]> = {
  0: RU_LAYOUT.filter((k) => k.row === 0),
  1: RU_LAYOUT.filter((k) => k.row === 1),
  2: RU_LAYOUT.filter((k) => k.row === 2),
  3: RU_LAYOUT.filter((k) => k.row === 3),
  4: RU_LAYOUT.filter((k) => k.row === 4),
  5: RU_LAYOUT.filter((k) => k.row === 5),
};

export function keysForFinger(finger: Finger): KeyDef[] {
  return RU_LAYOUT.filter((k) => k.finger === finger && !k.isModifier);
}
