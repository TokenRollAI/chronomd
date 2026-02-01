<script lang="ts">
  import type { PageData } from './$types';
  import { formatDateTime } from '$lib/utils/markdown';

  export let data: PageData;

  $: stats = data.stats;
  $: recentDocs = data.recentDocuments;
</script>

<svelte:head>
  <title>Dashboard - ChronoMD Admin</title>
</svelte:head>

<div class="p-8">
  <h1 class="text-3xl font-serif font-semibold text-[#1A1A1A] mb-8">Dashboard</h1>

  <!-- Stats -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
    <div class="bg-white rounded-xl border border-[#E5E5E5] p-5">
      <div class="font-mono text-xs font-semibold text-[#888888] tracking-wider uppercase mb-2">Total Documents</div>
      <div class="font-mono text-3xl font-bold text-[#1A1A1A]">{stats.totalDocuments}</div>
    </div>
    <div class="bg-white rounded-xl border border-[#E5E5E5] p-5">
      <div class="font-mono text-xs font-semibold text-[#888888] tracking-wider uppercase mb-2">Published</div>
      <div class="font-mono text-3xl font-bold text-[#0D6E6E]">{stats.publishedDocuments}</div>
    </div>
    <div class="bg-white rounded-xl border border-[#E5E5E5] p-5">
      <div class="font-mono text-xs font-semibold text-[#888888] tracking-wider uppercase mb-2">Drafts</div>
      <div class="font-mono text-3xl font-bold text-[#E07B54]">{stats.draftDocuments}</div>
    </div>
  </div>

  <!-- Recent documents -->
  <div class="bg-white rounded-xl border border-[#E5E5E5]">
    <div class="px-6 py-5 border-b border-[#E5E5E5] flex items-center justify-between">
      <h2 class="text-lg font-serif font-medium text-[#1A1A1A]">Recent Documents</h2>
      <a href="/admin/documents/new" class="inline-flex items-center gap-2 h-9 px-4 bg-[#0D6E6E] text-white text-sm font-medium rounded-lg hover:bg-[#0a5a5a] transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New Document
      </a>
    </div>

    {#if recentDocs.length === 0}
      <div class="p-8 text-center text-[#888888]">
        No documents yet. <a href="/admin/documents/new" class="text-[#0D6E6E] hover:underline">Create your first document</a>.
      </div>
    {:else}
      <div class="divide-y divide-[#F0F0F0]">
        {#each recentDocs as doc}
          <a href="/admin/documents/{doc.id}" class="block px-6 py-4 hover:bg-[#FAFAFA] transition">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-serif font-medium text-[#1A1A1A]">{doc.title}</div>
                <div class="font-mono text-xs text-[#888888] mt-1">
                  {formatDateTime(doc.updated_at)}
                  {#if doc.folder}
                    <span class="mx-1.5">•</span>
                    <span class="text-[#0D6E6E]">{doc.folder.name}</span>
                  {/if}
                </div>
              </div>
              <div class="flex items-center gap-2">
                {#if doc.is_published}
                  <span class="px-2.5 py-1 bg-[#DCFCE7] text-[#16A34A] text-xs font-medium rounded">Published</span>
                {:else}
                  <span class="px-2.5 py-1 bg-[#F0F0F0] text-[#666666] text-xs font-medium rounded">Draft</span>
                {/if}
                {#if doc.is_private}
                  <span class="px-2.5 py-1 bg-amber-50 text-amber-600 text-xs font-medium rounded">Private</span>
                {/if}
              </div>
            </div>
          </a>
        {/each}
      </div>
    {/if}

    <div class="px-6 py-4 border-t border-[#F0F0F0]">
      <a href="/admin/documents" class="inline-flex items-center gap-1.5 text-[#0D6E6E] hover:underline text-sm font-medium">
        View all documents
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </a>
    </div>
  </div>
</div>
