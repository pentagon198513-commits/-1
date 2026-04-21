'use client';

import { useEffect, useState } from 'react';
import { Container, SectionTitle, Card, Button } from '@/components/UI';
import {
  createProfile,
  deleteProfile,
  exportAll,
  getCurrentProfileId,
  importAll,
  listProfiles,
  loadProfile,
  renameProfile,
  resetCurrentProfile,
  setCurrentProfileId,
} from '@/lib/storage';
import type { UserProfile } from '@/types';
import clsx from '@/lib/clsx';

export default function AdminPage() {
  const [current, setCurrent] = useState<UserProfile | null>(null);
  const [list, setList] = useState<{ id: string; name: string; createdAt: number }[]>([]);
  const [newName, setNewName] = useState('');

  const refresh = () => {
    setList(listProfiles());
    setCurrent(loadProfile());
  };

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener('tt:profile-changed', onChange);
    return () => window.removeEventListener('tt:profile-changed', onChange);
  }, []);

  const handleCreate = () => {
    if (!newName.trim()) return;
    createProfile(newName);
    setNewName('');
    refresh();
  };

  const handleExport = () => {
    const payload = exportAll();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `typing-trainer-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(String(reader.result));
        importAll(payload, 'merge');
        refresh();
        alert('Импортировано успешно.');
      } catch (e) {
        alert('Ошибка импорта: ' + (e as Error).message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Container>
      <SectionTitle
        title="Админ-панель"
        subtitle="Управление профилями сотрудников, резервное копирование и восстановление данных."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold">Профили в этом браузере</h3>
          <p className="mt-1 text-sm text-fg-muted">
            Несколько сотрудников на одном компьютере могут иметь независимые профили и
            переключаться между ними.
          </p>
          <div className="mt-4 space-y-2">
            {list.map((p) => {
              const isCurrent = p.id === getCurrentProfileId();
              return (
                <div
                  key={p.id}
                  className={clsx(
                    'flex items-center justify-between gap-2 rounded-lg border px-3 py-2',
                    isCurrent ? 'border-accent bg-accent/5' : 'border-border bg-bg',
                  )}
                >
                  <input
                    defaultValue={p.name}
                    onBlur={(e) => {
                      if (e.target.value !== p.name) {
                        renameProfile(p.id, e.target.value);
                        refresh();
                      }
                    }}
                    className="flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-sm outline-none focus:border-border focus:bg-bg-elev"
                  />
                  <span className="whitespace-nowrap text-xs text-fg-subtle">
                    {new Date(p.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                  {!isCurrent && (
                    <Button variant="ghost" onClick={() => setCurrentProfileId(p.id)}>
                      Активировать
                    </Button>
                  )}
                  {list.length > 1 && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        if (confirm(`Удалить профиль «${p.name}»? Это действие необратимо.`)) {
                          deleteProfile(p.id);
                          refresh();
                        }
                      }}
                    >
                      Удалить
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Имя нового сотрудника"
              className="flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <Button onClick={handleCreate} disabled={!newName.trim()}>
              + Создать
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Резервные копии</h3>
          <p className="mt-1 text-sm text-fg-muted">
            Скачайте JSON-файл со всеми профилями. Для переноса на новый компьютер или
            восстановления — загрузите файл обратно.
          </p>
          <div className="mt-4 space-y-3">
            <Button variant="outline" onClick={handleExport}>
              ⬇ Скачать всё (JSON)
            </Button>
            <label className="block">
              <span className="mb-1 block text-xs text-fg-muted">
                Загрузить файл (добавит к существующим профилям)
              </span>
              <input
                type="file"
                accept="application/json"
                onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
                className="block w-full text-sm text-fg-muted file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-accent-fg hover:file:brightness-110"
              />
            </label>
          </div>

          {current && (
            <div className="mt-6 border-t border-border pt-4">
              <h4 className="text-sm font-semibold">Сбросить прогресс текущего профиля</h4>
              <p className="mt-1 text-xs text-fg-muted">
                Обнулит XP, уровни, историю попыток для «{current.name}». Сам профиль останется.
              </p>
              <div className="mt-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (confirm('Сбросить прогресс текущего профиля?')) {
                      resetCurrentProfile();
                      refresh();
                    }
                  }}
                >
                  Сбросить прогресс
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold">Облачная синхронизация (в разработке)</h3>
          <p className="mt-2 text-sm text-fg-muted">
            Сейчас все данные хранятся локально в браузере. Для синхронизации между
            компьютерами сотрудников и единого лидерборда компании будет подключён Firebase —
            это бесплатно для небольших команд и не требует своего сервера.
          </p>
          <ul className="mt-3 space-y-1 text-sm text-fg-muted">
            <li>· Единый лидерборд по всей компании</li>
            <li>· Группы и роли (админ / тимлид / сотрудник)</li>
            <li>· Назначение обязательных курсов и дедлайнов</li>
            <li>· Экспорт отчётов в CSV/PDF</li>
          </ul>
        </Card>
      </div>
    </Container>
  );
}
