import { writable } from 'svelte/store';

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
