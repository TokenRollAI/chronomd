<script lang="ts">
  import { goto } from '$app/navigation';
  import { adminApi, type Folder } from '$lib/api';
  import { onMount } from 'svelte';
  import DocumentEditor from '$lib/components/DocumentEditor.svelte';

  let title = '';
  let slug = '';
  let summary = '';
  let content = '# Hello World\n\nStart writing your document here...';
  let folderId = '';
  let isPublished = false;
  let isPrivate = false;
  let accessCode = '';

  let folders: Folder[] = [];
  let saving = false;
  let error = '';

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
      const doc = await adminApi.createDocument({
        title,
        slug: slug || undefined,
        summary: summary || undefined,
        content,
        folder_id: folderId || undefined,
        is_published: isPublished,
        is_private: isPrivate,
        access_code: isPrivate && accessCode ? accessCode : undefined
      });
      goto(`/admin/documents/${doc.id}`);
    } catch (err) {
      error = 'Failed to create document';
    } finally {
      saving = false;
    }
  }
</script>

<svelte:head>
  <title>New Document - ChronoMD Admin</title>
</svelte:head>

<DocumentEditor
  mode="new"
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
  on:submit={handleSubmit}
/>
