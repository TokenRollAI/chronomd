<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import { adminApi, type AdminDocument } from '$lib/api';
  import { formatDateTime } from '$lib/utils/markdown';

  export let data: PageData;

  let documents = data.documents.items;
  let total = data.documents.total;
  let page = 1;
  let loading = false;
  let deleting: string | null = null;

  async function loadMore() {
    if (loading) return;
    loading = true;
    page++;
    const result = await adminApi.getDocuments({ page });
    documents = [...documents, ...result.items];
    loading = false;
  }

  async function deleteDoc(doc: AdminDocument) {
    if (!confirm(`Delete "${doc.title}"? This cannot be undone.`)) return;

    deleting = doc.id;
    try {
      await adminApi.deleteDocument(doc.id);
      documents = documents.filter((d) => d.id !== doc.id);
      total--;
    } catch (err) {
      alert('Failed to delete document');
    } finally {
      deleting = null;
    }
  }
</script>

<svelte:head>
  <title>Documents - ChronoMD Admin</title>
</svelte:head>

<div class="p-8">
  <div class="flex items-center justify-between mb-8">
    <h1 class="text-2xl font-bold text-gray-900">Documents</h1>
    <a href="/admin/documents/new" class="btn btn-primary">New Document</a>
  </div>

  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    {#if documents.length === 0}
      <div class="p-8 text-center text-gray-500">
        No documents yet. <a href="/admin/documents/new" class="text-primary-600 hover:underline">Create your first document</a>.
      </div>
    {:else}
      <div class="divide-y divide-gray-200">
        {#each documents as doc}
          <div class="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
            <a href="/admin/documents/{doc.id}" class="flex-1">
              <div class="font-medium text-gray-900">{doc.title}</div>
              <div class="text-sm text-gray-500 mt-1">
                {formatDateTime(doc.updated_at)}
                {#if doc.folder}
                  <span class="mx-1">•</span>
                  <span>{doc.folder.name}</span>
                {/if}
              </div>
            </a>
            <div class="flex items-center gap-3">
              {#if doc.is_published}
                <span class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Published</span>
              {:else}
                <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Draft</span>
              {/if}
              {#if doc.is_private}
                <span class="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">Private</span>
              {/if}
              <a href="/{doc.slug}" target="_blank" class="text-gray-400 hover:text-gray-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <button
                on:click={() => deleteDoc(doc)}
                class="text-gray-400 hover:text-red-600"
                disabled={deleting === doc.id}
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        {/each}
      </div>

      {#if documents.length < total}
        <div class="px-6 py-4 border-t border-gray-200 text-center">
          <button on:click={loadMore} class="btn btn-secondary" disabled={loading}>
            {loading ? 'Loading...' : 'Load more'}
          </button>
        </div>
      {/if}
    {/if}
  </div>
</div>
