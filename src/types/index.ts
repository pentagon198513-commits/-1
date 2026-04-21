export type Finger =
  | 'L-pinky'
  | 'L-ring'
  | 'L-middle'
  | 'L-index'
  | 'thumb'
  | 'R-index'
  | 'R-middle'
  | 'R-ring'
  | 'R-pinky';

export type Hand = 'left' | 'right';

export interface KeyDef {
  char: string;
  shifted?: string;
  finger: Finger;
  hand: Hand;
  row: 0 | 1 | 2 | 3 | 4 | 5;
  group?: 'main' | 'arrows';
  gapBefore?: number;
  width?: number;
  code: string;
  label?: string;
  isModifier?: boolean;
  homeKey?: boolean;
}

export type LessonKind = 'drill' | 'words' | 'sentences' | 'paragraphs' | 'speed';

export interface Lesson {
  id: string;
  level: number;
  order: number;
  title: string;
  description: string;
  kind: LessonKind;
  newChars?: string[];
  texts: string[];
  minAccuracy: number;
  minWPM: number;
}

export interface AttemptResult {
  lessonId: string;
  wpm: number;
  cpm: number;
  accuracy: number;
  errors: number;
  totalChars: number;
  durationMs: number;
  timestamp: number;
  perCharErrors: Record<string, number>;
}

export interface UserProfile {
  id: string;
  name: string;
  createdAt: number;
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDay: string | null;
  completedLessons: string[];
  achievements: string[];
}

export interface UserStats {
  attempts: AttemptResult[];
  problemChars: Record<string, number>;
  totalTimeMs: number;
  bestWPM: number;
  bestAccuracy: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  check: (profile: UserProfile, stats: UserStats) => boolean;
}
