<script lang="ts">
  import type { PageData } from './$types';
  import DocumentRow from '$lib/components/DocumentRow.svelte';

  export let data: PageData;

  $: stats = data.stats;
  $: recentDocs = data.recentDocuments;
  $: statItems = [
    { label: 'Quick notes', value: stats.quickNotes, color: 'text-ink' },
    { label: 'Documents', value: stats.totalDocuments, color: 'text-ink' },
    { label: 'Published', value: stats.publishedDocuments, color: 'text-accent' },
    { label: 'Drafts', value: stats.draftDocuments, color: 'text-warn' }
  ];
</script>

<svelte:head>
  <title>Dashboard - ChronoMD Admin</title>
</svelte:head>

<div class="admin-page">
  <div class="flex items-center justify-between gap-4">
    <h1 class="admin-title">Dashboard</h1>
    <a href="/admin/documents/new" class="btn-primary">
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      New document
    </a>
  </div>

  <dl class="grid grid-cols-2 md:grid-cols-4 gap-y-6 mt-8 md:mt-9">
    {#each statItems as s}
      <div>
        <dd class="font-serif text-3xl md:text-[34px] font-medium leading-none {s.color}">{s.value}</dd>
        <dt class="mt-2 text-xs text-faint">{s.label}</dt>
      </div>
    {/each}
  </dl>

  <section class="mt-10 md:mt-12">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-[13px] font-medium text-muted">Recently updated</h2>
      <a href="/admin/documents" class="text-[13px] text-accent hover:opacity-80">All documents →</a>
    </div>

    <div class="card overflow-hidden">
      {#if recentDocs.length === 0}
        <p class="px-5 py-10 text-center text-sm text-faint">
          No documents yet. <a href="/admin/documents/new" class="text-accent hover:underline">Create one</a>.
        </p>
      {:else}
        {#each recentDocs as doc (doc.id)}
          <DocumentRow {doc} />
        {/each}
      {/if}
    </div>
  </section>
</div>
