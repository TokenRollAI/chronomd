<script lang="ts">
  import type { PageData } from './$types';
  import { goto, invalidateAll } from '$app/navigation';
  import { page } from '$app/stores';
  import { adminApi, type QuickNote } from '$lib/api';

  export let data: PageData;

  $: notes = data.notes.items as QuickNote[];
  $: filter = data.filter;

  let archiving: string | null = null;
  let deleting: string | null = null;

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    });
  }

  async function toggleArchive(note: QuickNote) {
    archiving = note.id;
    try {
      await adminApi.updateQuickNote(note.id, { is_archived: !note.is_archived });
      await invalidateAll();
    } catch (err) {
      alert('Failed to update note');
    } finally {
      archiving = null;
    }
  }

  async function deleteNote(note: QuickNote) {
    if (!confirm('Delete this note? This cannot be undone.')) return;

    deleting = note.id;
    try {
      await adminApi.deleteQuickNote(note.id);
      await invalidateAll();
    } catch (err) {
      alert('Failed to delete note');
    } finally {
      deleting = null;
    }
  }

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'archived', label: 'Archived' }
  ];

  function setFilter(newFilter: string) {
    const url = new URL($page.url);
    if (newFilter === 'all') {
      url.searchParams.delete('filter');
    } else {
      url.searchParams.set('filter', newFilter);
    }
    goto(url.toString(), { replaceState: true });
  }
</script>

<svelte:head>
  <title>Quick Notes - ChronoMD Admin</title>
</svelte:head>

<div class="admin-page">
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <h1 class="admin-title">Quick Notes</h1>

    <div class="inline-flex self-start p-0.5 rounded-full border border-line" role="tablist">
      {#each filters as f}
        <button
          role="tab"
          aria-selected={filter === f.key}
          on:click={() => setFilter(f.key)}
          class="h-8 px-3.5 rounded-full text-[13px] transition-colors {filter === f.key ? 'bg-ink/[0.06] text-ink font-medium' : 'text-muted hover:text-ink'}"
        >
          {f.label}
        </button>
      {/each}
    </div>
  </div>

  <p class="mt-2 text-[13px] text-faint">
    {notes.length} {notes.length === 1 ? 'note' : 'notes'} · New notes are written from the
    <a href="/" class="text-accent hover:underline">stream</a>.
  </p>

  <div class="card overflow-hidden mt-6">
    {#if notes.length === 0}
      <p class="px-5 py-10 text-center text-sm text-faint">
        {#if filter === 'archived'}
          No archived notes.
        {:else if filter === 'active'}
          No active notes.
        {:else}
          No quick notes yet.
        {/if}
      </p>
    {:else}
      {#each notes as note (note.id)}
        <div class="group flex items-start gap-3 px-4 md:px-5 py-4 border-t border-line first:border-t-0">
          <div class="flex-1 min-w-0">
            <p class="text-sm leading-relaxed whitespace-pre-wrap break-words {note.is_archived ? 'text-faint' : 'text-body'}">{note.content}</p>
            <div class="flex items-center gap-2.5 mt-2 text-xs">
              <span class="font-mono text-faint">{formatDate(note.created_at)}</span>
              {#if note.is_archived}
                <span class="text-faint">· Archived</span>
              {/if}
            </div>
          </div>

          <div class="flex items-center gap-0.5 flex-shrink-0 md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100 transition-opacity">
            <button
              on:click={() => toggleArchive(note)}
              disabled={archiving === note.id}
              class="p-2 rounded-md text-faint hover:text-ink transition-colors disabled:opacity-40"
              title={note.is_archived ? 'Restore' : 'Archive'}
              aria-label={note.is_archived ? 'Restore' : 'Archive'}
            >
              {#if note.is_archived}
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              {:else}
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              {/if}
            </button>
            <button
              on:click={() => deleteNote(note)}
              disabled={deleting === note.id}
              class="p-2 rounded-md text-faint hover:text-warn transition-colors disabled:opacity-40"
              title="Delete"
              aria-label="Delete"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>
