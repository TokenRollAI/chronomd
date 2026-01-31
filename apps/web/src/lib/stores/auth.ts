import { writable } from 'svelte/store';

function createAuthStore() {
  const { subscribe, set, update } = writable<{
    isAuthenticated: boolean;
    loading: boolean;
  }>({
    isAuthenticated: false,
    loading: true
  });

  return {
    subscribe,
    setAuthenticated: (value: boolean) => {
      update((state) => ({ ...state, isAuthenticated: value, loading: false }));
    },
    setLoading: (value: boolean) => {
      update((state) => ({ ...state, loading: value }));
    },
    logout: () => {
      set({ isAuthenticated: false, loading: false });
    }
  };
}

export const auth = createAuthStore();

// Unlocked documents store (for private documents)
function createUnlockedStore() {
  const { subscribe, update } = writable<Set<string>>(new Set());

  return {
    subscribe,
    unlock: (slug: string) => {
      update((slugs) => {
        slugs.add(slug);
        return slugs;
      });
    },
    isUnlocked: (slugs: Set<string>, slug: string) => slugs.has(slug),
    getAll: (slugs: Set<string>) => Array.from(slugs)
  };
}

export const unlockedDocuments = createUnlockedStore();
