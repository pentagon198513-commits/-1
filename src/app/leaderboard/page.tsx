'use client';

import { useEffect, useState } from 'react';
import { Container, SectionTitle, Card } from '@/components/UI';
import { loadProfile, loadStats } from '@/lib/storage';
import type { UserProfile, UserStats } from '@/types';

// MVP-версия: лидерборд строится из локальных данных одного пользователя
// + статические демо-записи. В следующей итерации подключаем Firebase / API.
const DEMO_ROWS = [
  { name: 'А. Иванов', wpm: 92, acc: 98, xp: 4250 },
  { name: 'Е. Петрова', wpm: 86, acc: 97, xp: 3980 },
  { name: 'М. Соколов', wpm: 78, acc: 96, xp: 3120 },
  { name: 'К. Орлова', wpm: 71, acc: 98, xp: 2850 },
  { name: 'Д. Кузнецов', wpm: 65, acc: 95, xp: 2410 },
];

export default function LeaderboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    setProfile(loadProfile());
    setStats(loadStats());
  }, []);

  const rows = [...DEMO_ROWS];
  if (profile && stats && stats.bestWPM > 0) {
    rows.push({ name: profile.name + ' (вы)', wpm: stats.bestWPM, acc: stats.bestAccuracy, xp: profile.xp });
  }
  rows.sort((a, b) => b.wpm - a.wpm);

  return (
    <Container>
      <SectionTitle
        title="Лидерборд сотрудников"
        subtitle="В MVP — локальные данные и демонстрационные сотрудники. В продакшн-версии подключается единый бэкенд."
      />
      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg text-left text-xs uppercase tracking-wide text-fg-subtle">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Сотрудник</th>
              <th className="px-4 py-3 text-right">WPM</th>
              <th className="px-4 py-3 text-right">Точность</th>
              <th className="px-4 py-3 text-right">XP</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={r.name + i}
                className="border-b border-border last:border-b-0 hover:bg-bg"
              >
                <td className="px-4 py-3 tabular-nums text-fg-muted">{i + 1}</td>
                <td className="px-4 py-3 font-medium">
                  {i === 0 && '🥇 '}
                  {i === 1 && '🥈 '}
                  {i === 2 && '🥉 '}
                  {r.name}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{r.wpm}</td>
                <td className="px-4 py-3 text-right tabular-nums">{r.acc}%</td>
                <td className="px-4 py-3 text-right tabular-nums">{r.xp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </Container>
  );
}
