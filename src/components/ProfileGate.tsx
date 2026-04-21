'use client';

import { useEffect, useState } from 'react';
import { createProfile, getCurrentProfileId, listProfiles, setCurrentProfileId } from '@/lib/storage';
import { Button } from './UI';

// Первый экран при входе: если ещё нет ни одного профиля — предлагаем создать.
// Если профили есть, но не выбран активный — даём выбрать.
export function ProfileGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [needsCreate, setNeedsCreate] = useState(false);
  const [needsPick, setNeedsPick] = useState(false);
  const [name, setName] = useState('');

  const refresh = () => {
    const list = listProfiles();
    const current = getCurrentProfileId();
    if (list.length === 0) {
      setNeedsCreate(true);
      setNeedsPick(false);
    } else if (!current) {
      setNeedsCreate(false);
      setNeedsPick(true);
    } else {
      setNeedsCreate(false);
      setNeedsPick(false);
    }
    setReady(true);
  };

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener('tt:profile-changed', onChange);
    return () => window.removeEventListener('tt:profile-changed', onChange);
  }, []);

  if (!ready) return null;

  if (needsCreate) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur">
        <div className="mx-4 w-full max-w-md rounded-2xl border border-border bg-bg-elev p-6 shadow-soft">
          <h2 className="text-xl font-semibold">Добро пожаловать!</h2>
          <p className="mt-2 text-sm text-fg-muted">
            Как вас зовут? Это имя будет показано в вашем профиле и в лидерборде.
          </p>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && name.trim()) {
                createProfile(name);
                refresh();
              }
            }}
            placeholder="Например, Анна Иванова"
            className="mt-4 w-full rounded-lg border border-border bg-bg px-3 py-2 text-base outline-none focus:border-accent"
          />
          <div className="mt-4 flex justify-end">
            <Button
              disabled={!name.trim()}
              onClick={() => {
                createProfile(name);
                refresh();
              }}
            >
              Создать профиль
            </Button>
          </div>
          <p className="mt-4 text-xs text-fg-subtle">
            Данные хранятся в вашем браузере. Несколько сотрудников на одном компьютере могут
            завести отдельные профили и переключаться между ними.
          </p>
        </div>
      </div>
    );
  }

  if (needsPick) {
    const list = listProfiles();
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur">
        <div className="mx-4 w-full max-w-md rounded-2xl border border-border bg-bg-elev p-6 shadow-soft">
          <h2 className="text-xl font-semibold">Выберите профиль</h2>
          <div className="mt-4 space-y-2">
            {list.map((p) => (
              <button
                key={p.id}
                onClick={() => setCurrentProfileId(p.id)}
                className="flex w-full items-center justify-between rounded-lg border border-border bg-bg px-4 py-3 text-left hover:border-accent"
              >
                <span className="font-medium">{p.name}</span>
                <span className="text-xs text-fg-subtle">
                  {new Date(p.createdAt).toLocaleDateString('ru-RU')}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="outline" onClick={() => setNeedsCreate(true)}>
              + Новый профиль
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
