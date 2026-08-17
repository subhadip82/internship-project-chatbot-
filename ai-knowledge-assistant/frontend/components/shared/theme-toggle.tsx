'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const initialTheme = document.documentElement.getAttribute('data-theme') || window.localStorage.getItem('theme') || 'dark';
    const current = initialTheme === 'light' ? 'light' : 'dark';
    setTheme(current);
    document.documentElement.setAttribute('data-theme', current);

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ theme: 'dark' | 'light' }>;
      const nextTheme = customEvent.detail?.theme || document.documentElement.getAttribute('data-theme') || 'dark';
      setTheme(nextTheme === 'light' ? 'light' : 'dark');
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'theme' && e.newValue) {
        const next = e.newValue === 'light' ? 'light' : 'dark';
        setTheme(next);
        document.documentElement.setAttribute('data-theme', next);
      }
    };

    window.addEventListener('app-theme-change', handleThemeChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('app-theme-change', handleThemeChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    window.localStorage.setItem('theme', next);
    window.dispatchEvent(new CustomEvent('app-theme-change', { detail: { theme: next } }));
  };

  if (!mounted) {
    return (
      <div
        className="h-9 w-9 rounded-xl border opacity-50"
        style={{
          backgroundColor: 'var(--card-inner)',
          borderColor: 'var(--card-border)',
        }}
      />
    );
  }

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={toggleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-xl border transition-all hover:border-slate-400 shadow-sm"
      style={{
        backgroundColor: 'var(--card-inner)',
        borderColor: 'var(--card-border)',
        color: 'var(--text-primary)',
      }}
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-blue-600 transition-transform duration-300 -rotate-12 hover:rotate-0" />
      )}
    </button>
  );
}

export default ThemeToggle;
