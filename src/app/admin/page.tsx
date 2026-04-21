'use client';

import { useEffect, useState } from 'react';
import { Container, SectionTitle, Card, Button } from '@/components/UI';
import { loadProfile, loadStats, saveProfile } from '@/lib/storage';
import type { UserProfile, UserStats } from '@/types';

// MVP-версия админки: редактируем имя, экспортируем/импортируем данные.
// Полноценное управление группами требует бэкенда и запланировано на v2.
export default function AdminPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [name, setName] = useState('');

  useEffect(() => {
    const p = loadProfile();
    setProfile(p);
    setStats(loadStats());
    if (p) setName(p.name);
  }, []);

  const saveName = () => {
    if (!profile) return;
    const next = { ...profile, name };
    saveProfile(next);
    setProfile(next);
  };

  const exportJson = () => {
    const payload = { profile, stats };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'typing-trainer-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container>
      <SectionTitle
        title="Админ-панель"
        subtitle="MVP: базовое управление профилем и данными. Управление группами/командами появится после подключения бэкенда."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold">Профиль сотрудника</h3>
          <label className="mt-3 block text-sm text-fg-muted">Имя</label>
          <input
            className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="mt-3">
            <Button onClick={saveName} disabled={!name}>
              Сохранить
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Экспорт данных</h3>
          <p className="mt-2 text-sm text-fg-muted">
            Сохраните JSON-файл с прогрессом. Пригодится при переезде на новый компьютер или при
            подключении централизованного бэкенда.
          </p>
          <div className="mt-3">
            <Button variant="outline" onClick={exportJson}>
              Скачать JSON
            </Button>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold">Дорожная карта команды</h3>
          <ul className="mt-3 space-y-1 text-sm text-fg-muted">
            <li>· Централизованный бэкенд (Firebase / Supabase)</li>
            <li>· Группы и роли: админ / тимлид / сотрудник</li>
            <li>· Статистика по команде, сравнение результатов</li>
            <li>· Назначение обязательных курсов и дедлайнов</li>
            <li>· Экспорт отчётов в CSV/PDF</li>
          </ul>
        </Card>
      </div>
    </Container>
  );
}
