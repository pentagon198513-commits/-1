'use client';

import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Переключить тему"
      className="rounded-lg border border-border bg-bg-elev px-3 py-1.5 text-sm text-fg-muted hover:text-fg hover:border-fg-muted"
    >
      {theme === 'dark' ? '☀︎ Светлая' : '☾ Тёмная'}
    </button>
  );
}
