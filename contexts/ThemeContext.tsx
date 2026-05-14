'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getTheme, setTheme as persistTheme } from '@/lib/storage';
import type { Theme } from '@/types';

type Resolved = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  resolved: Resolved;
  setTheme: (next: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemPrefersDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyResolved(resolved: Resolved) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', resolved === 'dark');
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolved, setResolved] = useState<Resolved>('dark');

  useEffect(() => {
    const stored = getTheme();
    const next = stored === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : stored;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage after mount; SSR can't read it
    setThemeState(stored);
    setResolved(next);
  }, []);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    function handle(e: MediaQueryListEvent) {
      const next: Resolved = e.matches ? 'dark' : 'light';
      setResolved(next);
      applyResolved(next);
    }
    mq.addEventListener('change', handle);
    return () => mq.removeEventListener('change', handle);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    persistTheme(next);
    setThemeState(next);
    const r: Resolved = next === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : next;
    setResolved(r);
    applyResolved(r);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext must be used inside <ThemeProvider>');
  return ctx;
}
