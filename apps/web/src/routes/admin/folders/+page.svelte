<script lang="ts">
  import type { PageData } from './$types';
  import { adminApi, type Folder } from '$lib/api';

  export let data: PageData;

  let folders = data.folders;

  let showForm = false;
  let editingId: string | null = null;
  let name = '';
  let slug = '';
  let parentId = '';
  let sortOrder = 0;

  let saving = false;
  let error = '';

  function startCreate() {
    editingId = null;
    name = '';
    slug = '';
    parentId = '';
    sortOrder = 0;
    showForm = true;
    error = '';
  }

  function startEdit(folder: Folder) {
    editingId = folder.id;
    name = folder.name;
    slug = folder.slug;
    parentId = folder.parent_id || '';
    sortOrder = folder.sort_order;
    showForm = true;
    error = '';
  }

  function cancelForm() {
    showForm = false;
    editingId = null;
    error = '';
  }

  async function handleSubmit() {
    if (!name.trim()) {
      error = 'Name is required';
      return;
    }

    saving = true;
    error = '';

    try {
      if (editingId) {
        const updated = await adminApi.updateFolder(editingId, {
          name,
          slug: slug || undefined,
          parent_id: parentId || null,
          sort_order: sortOrder
        });
        folders = folders.map((f) => (f.id === editingId ? updated : f));
      } else {
        const created = await adminApi.createFolder({
          name,
          slug: slug || undefined,
          parent_id: parentId || undefined,
          sort_order: sortOrder
        });
        folders = [...folders, created];
      }
      cancelForm();
    } catch (err) {
      error = 'Failed to save folder';
    } finally {
      saving = false;
    }
  }

  async function handleDelete(folder: Folder) {
    if (!confirm(`Delete folder "${folder.name}"? Documents in this folder will be moved to no folder.`)) return;

    try {
      await adminApi.deleteFolder(folder.id);
      folders = folders.filter((f) => f.id !== folder.id);
    } catch (err) {
      alert('Failed to delete folder');
    }
  }

  function getParentName(parentId: string | null): string {
    if (!parentId) return '-';
    const parent = folders.find((f) => f.id === parentId);
    return parent?.name || '-';
  }
</script>

<svelte:head>
  <title>Folders - ChronoMD Admin</title>
</svelte:head>

<div class="admin-page">
  <div class="flex items-center justify-between gap-4">
    <h1 class="admin-title">Folders</h1>
    {#if !showForm}
      <button on:click={startCreate} class="btn-primary">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New folder
      </button>
    {/if}
  </div>

  {#if showForm}
    <form on:submit|preventDefault={handleSubmit} class="card p-5 md:p-6 mt-6 max-w-xl">
      <h2 class="text-sm font-medium text-ink">{editingId ? 'Edit folder' : 'New folder'}</h2>

      {#if error}
        <div class="alert-error mt-4">{error}</div>
      {/if}

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        <div>
          <label for="name" class="field-label">Name</label>
          <input type="text" id="name" bind:value={name} class="field" required />
        </div>
        <div>
          <label for="slug" class="field-label">Slug</label>
          <input type="text" id="slug" bind:value={slug} class="field font-mono text-[13px]" placeholder="auto-generated" />
        </div>
        <div>
          <label for="parent" class="field-label">Parent</label>
          <select id="parent" bind:value={parentId} class="field">
            <option value="">No parent</option>
            {#each folders.filter((f) => f.id !== editingId) as folder}
              <option value={folder.id}>{folder.name}</option>
            {/each}
          </select>
        </div>
        <div>
          <label for="sortOrder" class="field-label">Sort order</label>
          <input type="number" id="sortOrder" bind:value={sortOrder} class="field" />
        </div>
      </div>

      <div class="flex justify-end gap-2 mt-6">
        <button type="button" on:click={cancelForm} class="btn-ghost">Cancel</button>
        <button type="submit" class="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : editingId ? 'Save' : 'Create'}
        </button>
      </div>
    </form>
  {/if}

  <div class="card overflow-hidden mt-6">
    {#if folders.length === 0}
      <p class="px-5 py-10 text-center text-sm text-faint">
        No folders yet. <button on:click={startCreate} class="text-accent hover:underline">Create one</button>.
      </p>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-xs text-faint">
              <th class="px-5 py-3 font-medium">Name</th>
              <th class="px-5 py-3 font-medium">Slug</th>
              <th class="hidden md:table-cell px-5 py-3 font-medium">Parent</th>
              <th class="hidden md:table-cell px-5 py-3 font-medium">Order</th>
              <th class="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {#each folders as folder (folder.id)}
              <tr class="border-t border-line hover:bg-ink/[0.02] transition-colors">
                <td class="px-5 py-3.5 whitespace-nowrap font-medium text-ink">{folder.name}</td>
                <td class="px-5 py-3.5 whitespace-nowrap font-mono text-xs text-muted">{folder.slug}</td>
                <td class="hidden md:table-cell px-5 py-3.5 whitespace-nowrap text-muted">{getParentName(folder.parent_id)}</td>
                <td class="hidden md:table-cell px-5 py-3.5 whitespace-nowrap font-mono text-xs text-muted">{folder.sort_order}</td>
                <td class="px-5 py-3.5 whitespace-nowrap text-right text-[13px]">
                  <button on:click={() => startEdit(folder)} class="text-muted hover:text-ink mr-4">Edit</button>
                  <button on:click={() => handleDelete(folder)} class="text-muted hover:text-warn">Delete</button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>
