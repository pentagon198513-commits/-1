'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createProfile,
  getCurrentProfileId,
  listProfiles,
  loadProfile,
  setCurrentProfileId,
} from '@/lib/storage';
import clsx from '@/lib/clsx';

export function ProfileBadge() {
  const [name, setName] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<{ id: string; name: string }[]>([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const refresh = () => {
    const id = getCurrentProfileId();
    if (!id) {
      setName(null);
      return;
    }
    const p = loadProfile(id);
    setName(p?.name ?? null);
    setList(listProfiles().map((x) => ({ id: x.id, name: x.name })));
  };

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener('tt:profile-changed', onChange);
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('tt:profile-changed', onChange);
      window.removeEventListener('click', onClick);
    };
  }, []);

  if (!name) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-md border border-border bg-bg-elev px-3 py-1.5 text-sm text-fg hover:border-fg-muted"
      >
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-fg">
          {name.slice(0, 1).toUpperCase()}
        </span>
        <span className="hidden sm:inline max-w-[9rem] truncate">{name}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-[min(16rem,calc(100vw-2rem))] rounded-lg border border-border bg-bg-elev p-2 shadow-soft">
          <div className="px-2 py-1 text-xs uppercase tracking-wide text-fg-subtle">Профили</div>
          <div className="space-y-1">
            {list.map((p) => {
              const isCurrent = p.id === getCurrentProfileId();
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setCurrentProfileId(p.id);
                    setOpen(false);
                  }}
                  className={clsx(
                    'flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm',
                    isCurrent ? 'bg-accent/10 text-fg' : 'text-fg-muted hover:bg-bg',
                  )}
                >
                  <span className="truncate">{p.name}</span>
                  {isCurrent && <span className="text-xs text-accent">● активный</span>}
                </button>
              );
            })}
          </div>
          {creating ? (
            <div className="mt-2 px-2">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newName.trim()) {
                    createProfile(newName);
                    setCreating(false);
                    setNewName('');
                    setOpen(false);
                  }
                  if (e.key === 'Escape') setCreating(false);
                }}
                placeholder="Имя"
                className="w-full rounded-md border border-border bg-bg px-2 py-1 text-sm outline-none focus:border-accent"
              />
            </div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="mt-2 w-full rounded-md px-2 py-1.5 text-left text-sm text-accent hover:bg-accent/10"
            >
              + Добавить профиль
            </button>
          )}
        </div>
      )}
    </div>
  );
}
