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
  <h1 class="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

  <!-- Stats -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="text-sm text-gray-500 mb-1">Total Documents</div>
      <div class="text-3xl font-bold text-gray-900">{stats.totalDocuments}</div>
    </div>
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="text-sm text-gray-500 mb-1">Published</div>
      <div class="text-3xl font-bold text-green-600">{stats.publishedDocuments}</div>
    </div>
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="text-sm text-gray-500 mb-1">Drafts</div>
      <div class="text-3xl font-bold text-amber-600">{stats.draftDocuments}</div>
    </div>
  </div>

  <!-- Recent documents -->
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
      <h2 class="text-lg font-semibold text-gray-900">Recent Documents</h2>
      <a href="/admin/documents/new" class="btn btn-primary text-sm">New Document</a>
    </div>

    {#if recentDocs.length === 0}
      <div class="p-8 text-center text-gray-500">
        No documents yet. <a href="/admin/documents/new" class="text-primary-600 hover:underline">Create your first document</a>.
      </div>
    {:else}
      <div class="divide-y divide-gray-200">
        {#each recentDocs as doc}
          <a href="/admin/documents/{doc.id}" class="block px-6 py-4 hover:bg-gray-50 transition">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium text-gray-900">{doc.title}</div>
                <div class="text-sm text-gray-500 mt-1">
                  {formatDateTime(doc.updated_at)}
                  {#if doc.folder}
                    <span class="mx-1">•</span>
                    <span>{doc.folder.name}</span>
                  {/if}
                </div>
              </div>
              <div class="flex items-center gap-2">
                {#if doc.is_published}
                  <span class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Published</span>
                {:else}
                  <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Draft</span>
                {/if}
                {#if doc.is_private}
                  <span class="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">Private</span>
                {/if}
              </div>
            </div>
          </a>
        {/each}
      </div>
    {/if}

    <div class="px-6 py-4 border-t border-gray-200">
      <a href="/admin/documents" class="text-primary-600 hover:underline text-sm">View all documents →</a>
    </div>
  </div>
</div>
