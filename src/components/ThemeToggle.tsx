'use client';

import { useTheme } from './ThemeProvider';

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggle } = useTheme();
  const icon = theme === 'dark' ? '☀︎' : '☾';
  return (
    <button
      onClick={toggle}
      aria-label="Переключить тему"
      className="rounded-md border border-border bg-bg-elev px-3 py-1.5 text-sm text-fg-muted hover:border-fg-muted hover:text-fg"
    >
      {compact ? icon : `${icon} ${theme === 'dark' ? 'Светлая' : 'Тёмная'}`}
    </button>
  );
}
