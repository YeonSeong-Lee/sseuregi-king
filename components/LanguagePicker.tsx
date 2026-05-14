'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { Locale } from '@/types';
import { setLang } from '@/lib/storage';

const LANGUAGES: { code: Locale; flag: string; label: string }[] = [
  { code: 'en', flag: '🇺🇸', label: 'English' },
  { code: 'zh', flag: '🇨🇳', label: '中文' },
  { code: 'ja', flag: '🇯🇵', label: '日本語' },
  { code: 'ru', flag: '🇷🇺', label: 'Русский' },
];

export function LanguagePicker({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function switchLocale(newLocale: Locale) {
    setLang(newLocale);
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 text-fg-muted text-xs bg-surface-elev hover:bg-surface-soft border border-line-strong rounded-full px-3 py-1.5 transition-colors"
      >
        🌐 {locale.toUpperCase()} ▾
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-surface-elev border border-line-strong rounded-xl overflow-hidden z-50 min-w-[120px] shadow-lg">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => switchLocale(lang.code)}
              className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm text-left transition-colors ${
                lang.code === locale
                  ? 'bg-accent/15 text-fg'
                  : 'text-fg-muted hover:bg-surface-soft'
              }`}
            >
              {lang.flag} {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
