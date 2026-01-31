<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import { adminApi, type Folder } from '$lib/api';
  import { onMount } from 'svelte';

  export let data: PageData;

  let doc = data.document;

  let title = doc.title;
  let slug = doc.slug;
  let summary = doc.summary || '';
  let content = doc.content;
  let folderId = doc.folder_id || '';
  let isPublished = Boolean(doc.is_published);
  let isPrivate = Boolean(doc.is_private);
  let accessCode = '';

  let folders: Folder[] = [];
  let saving = false;
  let error = '';
  let saved = false;

  onMount(async () => {
    folders = await adminApi.getFolders();
  });

  async function handleSubmit() {
    if (!title.trim()) {
      error = 'Title is required';
      return;
    }
    if (!content.trim()) {
      error = 'Content is required';
      return;
    }

    saving = true;
    error = '';
    saved = false;

    try {
      await adminApi.updateDocument(doc.id, {
        title,
        slug,
        summary: summary || undefined,
        content,
        folder_id: folderId || null,
        is_published: isPublished,
        is_private: isPrivate,
        access_code: isPrivate && accessCode ? accessCode : undefined
      });
      saved = true;
      setTimeout(() => saved = false, 3000);
    } catch (err) {
      error = 'Failed to save document';
    } finally {
      saving = false;
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    try {
      await adminApi.deleteDocument(doc.id);
      goto('/admin/documents');
    } catch (err) {
      error = 'Failed to delete document';
    }
  }
</script>

<svelte:head>
  <title>Edit: {doc.title} - ChronoMD Admin</title>
</svelte:head>

<div class="p-8">
  <div class="flex items-center justify-between mb-8">
    <h1 class="text-2xl font-bold text-gray-900">Edit Document</h1>
    <div class="flex items-center gap-4">
      <a href="/{doc.slug}" target="_blank" class="text-gray-500 hover:text-gray-700">
        View →
      </a>
      <button on:click={handleDelete} class="text-red-600 hover:text-red-700">
        Delete
      </button>
    </div>
  </div>

  <form on:submit|preventDefault={handleSubmit} class="max-w-4xl">
    {#if error}
      <div class="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
    {/if}
    {#if saved}
      <div class="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6">Document saved!</div>
    {/if}

    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label for="title" class="form-label">Title *</label>
          <input type="text" id="title" bind:value={title} class="form-input" required />
        </div>
        <div>
          <label for="slug" class="form-label">Slug</label>
          <input type="text" id="slug" bind:value={slug} class="form-input" />
        </div>
      </div>

      <div class="mt-6">
        <label for="summary" class="form-label">Summary (optional)</label>
        <input type="text" id="summary" bind:value={summary} class="form-input" />
      </div>

      <div class="mt-6">
        <label for="folder" class="form-label">Folder (optional)</label>
        <select id="folder" bind:value={folderId} class="form-input">
          <option value="">No folder</option>
          {#each folders as folder}
            <option value={folder.id}>{folder.name}</option>
          {/each}
        </select>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <label for="content" class="form-label">Content *</label>
      <textarea
        id="content"
        bind:value={content}
        class="form-input font-mono text-sm"
        rows="20"
        required
      ></textarea>
    </div>

    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h3 class="font-medium text-gray-900 mb-4">Publishing Options</h3>

      <div class="space-y-4">
        <label class="flex items-center gap-3">
          <input type="checkbox" bind:checked={isPublished} class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
          <span>Published</span>
        </label>

        <label class="flex items-center gap-3">
          <input type="checkbox" bind:checked={isPrivate} class="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
          <span>Private (requires access code)</span>
        </label>

        {#if isPrivate}
          <div class="ml-7">
            <label for="accessCode" class="form-label">New Access Code (leave empty to keep current)</label>
            <input type="text" id="accessCode" bind:value={accessCode} class="form-input" placeholder="Enter new access code" />
          </div>
        {/if}
      </div>
    </div>

    <div class="flex justify-end gap-4">
      <a href="/admin/documents" class="btn btn-secondary">Cancel</a>
      <button type="submit" class="btn btn-primary" disabled={saving}>
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  </form>
</div>
