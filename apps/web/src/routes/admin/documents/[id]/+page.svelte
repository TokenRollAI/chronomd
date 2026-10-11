<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import { adminApi, type Folder } from '$lib/api';
  import { onMount } from 'svelte';
  import DocumentEditor from '$lib/components/DocumentEditor.svelte';

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
  let status = '';

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
      status = `Saved · ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
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

<DocumentEditor
  mode="edit"
  bind:title
  bind:slug
  bind:summary
  bind:content
  bind:folderId
  bind:isPublished
  bind:isPrivate
  bind:accessCode
  {folders}
  {saving}
  {error}
  {status}
  viewHref="/{doc.slug}"
  on:submit={handleSubmit}
  on:delete={handleDelete}
/>
