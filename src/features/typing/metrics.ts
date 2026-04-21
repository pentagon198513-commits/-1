// Расчёт стандартных метрик скорости и точности.
// WPM рассчитывается по классической формуле: (правильные символы / 5) / минуту.
// CPM — число правильных символов в минуту (чаще используется для кириллицы).

export function computeWPM(correctChars: number, durationMs: number): number {
  if (durationMs <= 0) return 0;
  const minutes = durationMs / 60000;
  return Math.round(correctChars / 5 / minutes);
}

export function computeCPM(correctChars: number, durationMs: number): number {
  if (durationMs <= 0) return 0;
  const minutes = durationMs / 60000;
  return Math.round(correctChars / minutes);
}

export function computeAccuracy(correct: number, total: number): number {
  if (total <= 0) return 100;
  return Math.round((correct / total) * 1000) / 10;
}
