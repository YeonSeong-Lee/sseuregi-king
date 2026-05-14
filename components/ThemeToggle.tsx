'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useThemeContext } from '@/contexts/ThemeContext';
import type { Theme } from '@/types';

const OPTIONS: { value: Theme; icon: string; key: 'system' | 'light' | 'dark' }[] = [
  { value: 'system', icon: '💻', key: 'system' },
  { value: 'light', icon: '☀️', key: 'light' },
  { value: 'dark', icon: '🌙', key: 'dark' },
];

export function ThemeToggle() {
  const t = useTranslations('theme');
  const { theme, resolved, setTheme } = useThemeContext();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const triggerIcon = resolved === 'dark' ? '🌙' : '☀️';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={t('aria_label')}
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-center text-xs bg-surface-elev hover:bg-surface-soft border border-line-strong text-fg-muted rounded-full w-8 h-8 transition-colors"
      >
        <span aria-hidden="true">{triggerIcon}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-surface-elev border border-line-strong rounded-xl overflow-hidden z-50 min-w-[140px] shadow-lg">
          {OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { setTheme(opt.value); setOpen(false); }}
              className={`flex items-center gap-2 w-full px-3 py-2.5 text-sm text-left transition-colors ${
                theme === opt.value
                  ? 'bg-accent/15 text-fg'
                  : 'text-fg-muted hover:bg-surface-soft'
              }`}
            >
              <span aria-hidden="true">{opt.icon}</span>
              {t(opt.key)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
