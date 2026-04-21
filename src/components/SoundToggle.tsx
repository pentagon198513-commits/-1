'use client';

import { useEffect, useState } from 'react';
import { isSoundEnabled, setSoundEnabled } from '@/features/typing/sound';

export function SoundToggle() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    setOn(isSoundEnabled());
    const onChange = () => setOn(isSoundEnabled());
    window.addEventListener('tt:sound-changed', onChange);
    return () => window.removeEventListener('tt:sound-changed', onChange);
  }, []);

  return (
    <button
      onClick={() => setSoundEnabled(!on)}
      aria-label={on ? 'Выключить звук' : 'Включить звук'}
      title={on ? 'Звук включён' : 'Звук выключен'}
      className="rounded-lg border border-border bg-bg-elev px-3 py-1.5 text-sm text-fg-muted hover:text-fg hover:border-fg-muted"
    >
      {on ? '🔊' : '🔇'}
    </button>
  );
}
