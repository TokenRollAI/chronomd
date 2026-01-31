import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

function createThemeStore() {
  let initial: Theme = 'light';

  if (browser) {
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) {
      initial = stored;
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      initial = 'dark';
    }
  }

  const { subscribe, set, update } = writable<Theme>(initial);

  function apply(theme: Theme) {
    if (!browser) return;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }

  // Apply on init
  if (browser) apply(initial);

  return {
    subscribe,
    toggle: () => {
      update((current) => {
        const next = current === 'light' ? 'dark' : 'light';
        apply(next);
        return next;
      });
    },
    set: (theme: Theme) => {
      apply(theme);
      set(theme);
    },
  };
}

export const theme = createThemeStore();
