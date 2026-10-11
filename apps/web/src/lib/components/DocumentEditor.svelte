<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Folder } from '$lib/api';

  export let mode: 'new' | 'edit';
  export let title = '';
  export let slug = '';
  export let summary = '';
  export let content = '';
  export let folderId = '';
  export let isPublished = false;
  export let isPrivate = false;
  export let accessCode = '';
  export let folders: Folder[] = [];
  export let saving = false;
  export let error = '';
  export let status = '';
  export let viewHref = '';

  const dispatch = createEventDispatcher<{ submit: void; delete: void }>();

  function submit() {
    if (!saving) dispatch('submit');
  }

  function handleKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      submit();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<form on:submit|preventDefault={submit} class="max-w-[1200px] px-5 py-5 md:px-14 md:py-8">
  <!-- Top bar -->
  <div class="flex items-center justify-between gap-4">
    <nav class="flex items-center gap-2 text-[13px]">
      <a href="/admin/documents" class="text-muted hover:text-ink transition-colors">Documents</a>
      <span class="text-faint">/</span>
      <span class="text-ink">{mode === 'new' ? 'New' : 'Edit'}</span>
    </nav>
    <div class="flex items-center gap-3 md:gap-4">
      {#if status}
        <span class="hidden md:inline text-xs text-faint">{status}</span>
      {/if}
      {#if viewHref}
        <a href={viewHref} target="_blank" class="btn-ghost">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View
        </a>
      {/if}
      <button type="submit" class="btn-primary" disabled={saving}>
        {saving ? 'Saving…' : mode === 'new' ? 'Create' : 'Save'}
      </button>
    </div>
  </div>

  {#if error}
    <div class="alert-error mt-5">{error}</div>
  {/if}

  <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_272px] gap-8 mt-6 md:mt-7">
    <!-- Editor -->
    <div class="flex flex-col gap-3 min-w-0">
      <input
        type="text"
        bind:value={title}
        placeholder="Title"
        aria-label="Title"
        required
        class="w-full bg-transparent font-serif text-2xl md:text-[32px] font-semibold leading-tight text-ink placeholder:text-faint/70 outline-none"
      />
      <input
        type="text"
        bind:value={summary}
        placeholder="Add a summary (optional)"
        aria-label="Summary"
        class="w-full bg-transparent text-sm text-body placeholder:text-faint outline-none"
      />
      <textarea
        bind:value={content}
        aria-label="Content"
        required
        spellcheck="false"
        class="mt-2 w-full min-h-[55vh] lg:min-h-[64vh] resize-y card px-5 py-4 font-mono text-[13px] leading-[1.75] text-body outline-none focus:border-faint/70 transition-colors"
      ></textarea>
    </div>

    <!-- Settings -->
    <aside class="flex flex-col gap-5 lg:pt-1">
      <div>
        <label for="slug" class="field-label">Slug</label>
        <input id="slug" type="text" bind:value={slug} placeholder="auto-generated" class="field font-mono text-[13px]" />
      </div>

      <div>
        <label for="folder" class="field-label">Folder</label>
        <select id="folder" bind:value={folderId} class="field">
          <option value="">No folder</option>
          {#each folders as folder}
            <option value={folder.id}>{folder.name}</option>
          {/each}
        </select>
      </div>

      <hr class="border-line" />

      <label class="flex items-center justify-between gap-4 cursor-pointer">
        <span>
          <span class="block text-[13px] font-medium text-ink">Published</span>
          <span class="block text-xs text-faint mt-0.5">Show on the public stream</span>
        </span>
        <input type="checkbox" bind:checked={isPublished} class="peer sr-only" />
        <span class="switch" aria-hidden="true"></span>
      </label>

      <label class="flex items-center justify-between gap-4 cursor-pointer">
        <span>
          <span class="block text-[13px] font-medium text-ink">Private</span>
          <span class="block text-xs text-faint mt-0.5">Requires an access code</span>
        </span>
        <input type="checkbox" bind:checked={isPrivate} class="peer sr-only" />
        <span class="switch" aria-hidden="true"></span>
      </label>

      {#if isPrivate}
        <div>
          <label for="accessCode" class="field-label">
            {mode === 'edit' ? 'New access code (leave empty to keep)' : 'Access code'}
          </label>
          <input id="accessCode" type="text" bind:value={accessCode} placeholder="Access code" class="field" />
        </div>
      {/if}

      {#if mode === 'edit'}
        <hr class="border-line" />
        <button
          type="button"
          on:click={() => dispatch('delete')}
          class="self-start text-[13px] text-warn hover:opacity-80"
        >
          Delete document
        </button>
      {/if}
    </aside>
  </div>
</form>
