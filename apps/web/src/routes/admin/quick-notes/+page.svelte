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
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
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

<div class="p-5 md:p-8">
  <!-- Header -->
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
    <h1 class="text-2xl md:text-3xl font-serif font-semibold text-[#1A1A1A]">Quick Notes</h1>

    <!-- Filter Tabs -->
    <div class="flex bg-white rounded-lg border border-[#E5E5E5] overflow-hidden">
      <button
        on:click={() => setFilter('all')}
        class="px-4 py-2 text-sm font-medium transition {filter === 'all' ? 'bg-[#0D6E6E] text-white' : 'text-[#666666] hover:bg-[#F0F0F0]'}"
      >
        All
      </button>
      <button
        on:click={() => setFilter('active')}
        class="px-4 py-2 text-sm font-medium transition {filter === 'active' ? 'bg-[#0D6E6E] text-white' : 'text-[#666666] hover:bg-[#F0F0F0]'}"
      >
        Active
      </button>
      <button
        on:click={() => setFilter('archived')}
        class="px-4 py-2 text-sm font-medium transition {filter === 'archived' ? 'bg-[#0D6E6E] text-white' : 'text-[#666666] hover:bg-[#F0F0F0]'}"
      >
        Archived
      </button>
    </div>
  </div>

  <!-- Notes List -->
  <div class="bg-white rounded-xl border border-[#E5E5E5]">
    {#if notes.length === 0}
      <div class="p-8 text-center text-[#888888]">
        {#if filter === 'archived'}
          No archived notes.
        {:else if filter === 'active'}
          No active notes.
        {:else}
          No quick notes yet. Create one from the homepage.
        {/if}
      </div>
    {:else}
      <!-- Header -->
      <div class="px-5 py-4 border-b border-[#F0F0F0]">
        <span class="text-sm text-[#888888]">{notes.length} {notes.length === 1 ? 'note' : 'notes'}</span>
      </div>

      <!-- Notes -->
      <div class="divide-y divide-[#F0F0F0]">
        {#each notes as note (note.id)}
          <div class="px-5 py-4 flex flex-col md:flex-row md:items-start gap-3 {note.is_archived ? 'bg-[#F8F8F8]' : ''}">
            <!-- Content -->
            <div class="flex-1 min-w-0">
              <p class="text-sm md:text-base {note.is_archived ? 'text-[#888888]' : 'text-[#1A1A1A]'} whitespace-pre-wrap break-words">
                {note.content}
              </p>
              <div class="flex flex-wrap items-center gap-2 mt-2">
                <span class="text-xs text-[#AAAAAA]">{formatDate(note.created_at)}</span>
                {#if note.is_archived}
                  <span class="px-2 py-0.5 bg-[#F0F0F0] text-[#888888] text-xs rounded-full">Archived</span>
                {:else}
                  <span class="px-2 py-0.5 bg-[#E8F5E9] text-[#2E7D32] text-xs rounded-full">Active</span>
                {/if}
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 md:gap-1">
              <button
                on:click={() => toggleArchive(note)}
                disabled={archiving === note.id}
                class="p-2 rounded-md text-[#AAAAAA] hover:text-[#666666] hover:bg-[#F0F0F0] transition disabled:opacity-50"
                title={note.is_archived ? 'Restore' : 'Archive'}
              >
                {#if note.is_archived}
                  <!-- Restore icon -->
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                {:else}
                  <!-- Archive icon -->
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                {/if}
              </button>
              <button
                on:click={() => deleteNote(note)}
                disabled={deleting === note.id}
                class="p-2 rounded-md text-[#AAAAAA] hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                title="Delete"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
