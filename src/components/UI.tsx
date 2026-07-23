import clsx from '@/lib/clsx';
import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx('mx-auto w-full max-w-6xl min-w-0 px-4 sm:px-6', className)}>
      {children}
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={clsx(
        'min-w-0 overflow-hidden rounded-lg border border-border bg-bg-elev/90 p-4 shadow-[0_18px_45px_rgb(var(--accent)/0.1)] backdrop-blur sm:p-5',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Button({
  variant = 'primary',
  className,
  ...props
}: ComponentPropsWithoutRef<'button'> & { variant?: 'primary' | 'ghost' | 'outline' }) {
  return (
    <button
      {...props}
      className={clsx(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' &&
          'neon-button bg-gradient-to-r from-accent via-[rgb(var(--neon-cyan))] to-[rgb(var(--neon-pink))] text-accent-fg hover:brightness-110',
        variant === 'ghost' && 'text-fg-muted hover:bg-accent/10 hover:text-fg',
        variant === 'outline' &&
          'border border-accent/35 bg-bg-elev/70 text-fg hover:border-accent hover:bg-accent/10',
        className,
      )}
    />
  );
}

export function LinkButton({
  href,
  children,
  variant = 'primary',
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'ghost' | 'outline';
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition',
        variant === 'primary' &&
          'neon-button bg-gradient-to-r from-accent via-[rgb(var(--neon-cyan))] to-[rgb(var(--neon-pink))] text-accent-fg hover:brightness-110',
        variant === 'ghost' && 'text-fg-muted hover:bg-accent/10 hover:text-fg',
        variant === 'outline' &&
          'border border-accent/35 bg-bg-elev/70 text-fg hover:border-accent hover:bg-accent/10',
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function SectionTitle({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-fg-muted">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}
