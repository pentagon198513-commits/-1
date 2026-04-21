import type { Metadata } from 'next';
import '@/styles/globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Navigation } from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Слепая печать — Тренажёр для сотрудников',
  description: 'Современный веб-тренажёр слепой печати на русском языке.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Navigation />
          <main className="pb-16 pt-8 animate-fade-in">{children}</main>
          <footer className="border-t border-border py-6 text-center text-xs text-fg-subtle">
            Made with care · Внутренний тренажёр компании
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
