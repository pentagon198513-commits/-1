'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import clsx from '@/lib/clsx';

const links = [
  { href: '/', label: 'Главная' },
  { href: '/lessons', label: 'Уроки' },
  { href: '/stats', label: 'Статистика' },
  { href: '/leaderboard', label: 'Лидерборд' },
  { href: '/admin', label: 'Админ' },
];

export function Navigation() {
  const pathname = usePathname() || '/';
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-bg/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
          <span className="inline-block h-6 w-6 rounded-md bg-accent"></span>
          <span>Слепая печать</span>
        </Link>
        <div className="hidden gap-1 sm:flex">
          {links.map((l) => {
            const active = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={clsx(
                  'rounded-lg px-3 py-1.5 text-sm',
                  active
                    ? 'bg-bg-elev text-fg'
                    : 'text-fg-muted hover:text-fg hover:bg-bg-elev',
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
        <ThemeToggle />
      </nav>
    </header>
  );
}
