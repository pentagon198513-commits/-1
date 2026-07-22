'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { SoundControls } from './SoundControls';
import { LogoMark } from './LogoMark';
import { ProfileBadge } from './ProfileBadge';
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
      <nav className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <Link href="/" className="flex min-w-0 items-center gap-2 text-sm font-semibold">
            <LogoMark />
            <span className="truncate">Слепая печать</span>
          </Link>
          <div className="flex shrink-0 items-center gap-1.5 md:hidden">
            <ProfileBadge />
            <SoundControls />
            <ThemeToggle compact />
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <div className="scrollbar-none -mx-1 flex min-w-0 flex-1 gap-1 overflow-x-auto px-1 md:flex-none md:overflow-visible">
            {links.map((l) => {
              const active = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={clsx(
                    'shrink-0 rounded-md px-3 py-1.5 text-sm',
                    active
                      ? 'bg-bg-elev text-fg'
                      : 'text-fg-muted hover:bg-bg-elev hover:text-fg',
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <ProfileBadge />
          <SoundControls />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
