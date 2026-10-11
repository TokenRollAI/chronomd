<script lang="ts">
  import type { PageData } from './$types';
  import { adminApi, type AdminDocument } from '$lib/api';
  import DocumentRow from '$lib/components/DocumentRow.svelte';

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

<div class="admin-page">
  <div class="flex items-center justify-between gap-4">
    <h1 class="admin-title">Documents</h1>
    <a href="/admin/documents/new" class="btn-primary">
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      New document
    </a>
  </div>

  <p class="mt-2 text-[13px] text-faint">{total} {total === 1 ? 'document' : 'documents'}</p>

  <div class="card overflow-hidden mt-6">
    {#if documents.length === 0}
      <p class="px-5 py-10 text-center text-sm text-faint">
        No documents yet. <a href="/admin/documents/new" class="text-accent hover:underline">Create one</a>.
      </p>
    {:else}
      {#each documents as doc (doc.id)}
        <DocumentRow {doc}>
          <div class="flex items-center gap-0.5 flex-shrink-0">
            <a
              href="/{doc.slug}"
              target="_blank"
              class="p-2 rounded-md text-faint hover:text-ink transition-colors"
              title="View"
              aria-label="View {doc.title}"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <button
              on:click={() => deleteDoc(doc)}
              class="p-2 rounded-md text-faint hover:text-warn transition-colors disabled:opacity-40"
              disabled={deleting === doc.id}
              title="Delete"
              aria-label="Delete {doc.title}"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </DocumentRow>
      {/each}

      {#if documents.length < total}
        <div class="px-5 py-4 border-t border-line text-center">
          <button on:click={loadMore} class="btn-ghost" disabled={loading}>
            {loading ? 'Loading…' : 'Load more'}
          </button>
        </div>
      {/if}
    {/if}
  </div>
</div>
