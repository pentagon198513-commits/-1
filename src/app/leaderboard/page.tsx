'use client';

import { useEffect, useState } from 'react';
import { Container, SectionTitle, Card } from '@/components/UI';
import { getCurrentProfileId, listProfiles, loadProfile, loadStats } from '@/lib/storage';

interface Row {
  id: string;
  name: string;
  wpm: number;
  accuracy: number;
  xp: number;
  attempts: number;
  isYou: boolean;
}

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const build = () => {
      const currentId = getCurrentProfileId();
      const list = listProfiles();
      const r: Row[] = list
        .map((s) => {
          const p = loadProfile(s.id);
          const st = loadStats(s.id);
          if (!p) return null;
          return {
            id: s.id,
            name: s.name,
            wpm: st.bestWPM,
            accuracy: st.bestAccuracy,
            xp: p.xp,
            attempts: st.attempts.length,
            isYou: s.id === currentId,
          };
        })
        .filter(Boolean) as Row[];
      r.sort((a, b) => (b.wpm !== a.wpm ? b.wpm - a.wpm : b.accuracy - a.accuracy));
      setRows(r);
    };
    build();
    const onChange = () => build();
    window.addEventListener('tt:profile-changed', onChange);
    return () => window.removeEventListener('tt:profile-changed', onChange);
  }, []);

  return (
    <Container>
      <SectionTitle
        title="Лидерборд сотрудников"
        subtitle="Рейтинг строится по лучшей скорости (WPM). При равенстве — выше тот, у кого точность больше."
      />
      {rows.length === 0 ? (
        <Card>
          <p className="text-fg-muted">
            Пока нет данных — пройдите хотя бы один урок, чтобы попасть в рейтинг.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-bg text-left text-xs uppercase tracking-wide text-fg-subtle">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Сотрудник</th>
                <th className="px-4 py-3 text-right">WPM</th>
                <th className="px-4 py-3 text-right">Точность</th>
                <th className="px-4 py-3 text-right">Попыток</th>
                <th className="px-4 py-3 text-right">XP</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.id}
                  className={r.isYou ? 'bg-accent/5' : 'hover:bg-bg'}
                  style={{ borderBottom: '1px solid rgb(var(--border))' }}
                >
                  <td className="px-4 py-3 tabular-nums text-fg-muted">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">
                    {i === 0 && '🥇 '}
                    {i === 1 && '🥈 '}
                    {i === 2 && '🥉 '}
                    {r.name}
                    {r.isYou && <span className="ml-2 text-xs text-accent">вы</span>}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{r.wpm}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{r.accuracy}%</td>
                  <td className="px-4 py-3 text-right tabular-nums">{r.attempts}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{r.xp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      <p className="mt-4 text-xs text-fg-subtle">
        Рейтинг строится из профилей, заведённых в этом браузере. Единый облачный лидерборд по
        всем сотрудникам — в следующей версии (через Firebase).
      </p>
    </Container>
  );
}
