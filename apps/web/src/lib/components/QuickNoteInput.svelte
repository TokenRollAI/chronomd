<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { adminApi } from '$lib/api';

  const dispatch = createEventDispatcher<{ created: { id: string; content: string; created_at: string } }>();

  let content = '';
  let isExpanded = false;
  let isSubmitting = false;
  let error = '';

  $: charCount = content.length;
  $: canSubmit = content.trim().length > 0 && charCount <= 500 && !isSubmitting;

  function handleFocus() {
    isExpanded = true;
  }

  function handleClose() {
    isExpanded = false;
    content = '';
    error = '';
  }

  async function handleSubmit() {
    if (!canSubmit) return;

    isSubmitting = true;
    error = '';

    try {
      const note = await adminApi.createQuickNote(content.trim());
      dispatch('created', { id: note.id, content: note.content, created_at: note.created_at });
      content = '';
      isExpanded = false;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to create note';
    } finally {
      isSubmitting = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      handleClose();
    }
    if (e.key === 'Enter' && e.metaKey && canSubmit) {
      handleSubmit();
    }
  }
</script>

{#if isExpanded}
  <!-- Expanded Input Panel -->
  <div class="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/30" on:click={handleClose} on:keydown={handleKeydown}>
    <div
      class="w-full md:w-[480px] bg-white dark:bg-stone-900 md:rounded-2xl shadow-xl"
      on:click|stopPropagation
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-[#E5E5E5] dark:border-stone-700">
        <div class="flex items-center gap-2">
          <svg class="w-[18px] h-[18px] text-[#0D6E6E] dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span class="font-semibold text-[#1A1A1A] dark:text-stone-100">Quick Note</span>
        </div>
        <button on:click={handleClose} class="w-7 h-7 rounded-full bg-[#F8F8F8] dark:bg-stone-800 flex items-center justify-center">
          <svg class="w-4 h-4 text-[#888888] dark:text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="p-5">
        <textarea
          bind:value={content}
          placeholder="记录一个想法..."
          class="w-full h-32 p-4 bg-[#FAFAFA] dark:bg-stone-800 border border-[#E5E5E5] dark:border-stone-700 rounded-xl resize-none focus:outline-none focus:border-[#0D6E6E] dark:focus:border-teal-500 text-[#1A1A1A] dark:text-stone-200 placeholder-[#AAAAAA] dark:placeholder-stone-500"
          maxlength="500"
          autofocus
        ></textarea>

        {#if error}
          <p class="text-red-500 text-sm mt-2">{error}</p>
        {/if}

        <!-- Footer -->
        <div class="flex items-center justify-between mt-4">
          <span class="font-mono text-xs text-[#AAAAAA] dark:text-stone-500">{charCount} / 500</span>
          <button
            on:click={handleSubmit}
            disabled={!canSubmit}
            class="flex items-center gap-2 h-10 px-5 bg-[#0D6E6E] text-white text-sm font-medium rounded-full hover:bg-[#0a5a5a] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            发布
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Collapsed Input Bar -->
<div class="fixed bottom-0 left-0 right-0 bg-white dark:bg-stone-900 border-t border-[#E5E5E5] dark:border-stone-700 z-40">
  <div class="flex items-center gap-3 h-14 md:h-12 px-4 md:px-6 max-w-screen-xl mx-auto">
    <svg class="w-[18px] h-[18px] text-[#0D6E6E] dark:text-teal-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
    <button
      on:click={handleFocus}
      class="flex-1 text-left text-[#AAAAAA] dark:text-stone-500 text-sm"
    >
      记录一个想法...
    </button>
    <button
      on:click={handleFocus}
      class="w-8 h-8 bg-[#0D6E6E] rounded-full flex items-center justify-center flex-shrink-0"
    >
      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  </div>
</div>
