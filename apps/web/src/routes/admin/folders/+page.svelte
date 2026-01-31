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

<div class="p-8">
  <div class="flex items-center justify-between mb-8">
    <h1 class="text-2xl font-bold text-gray-900">Folders</h1>
    <button on:click={startCreate} class="btn btn-primary">New Folder</button>
  </div>

  {#if showForm}
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 max-w-xl">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">
        {editingId ? 'Edit Folder' : 'New Folder'}
      </h2>

      <form on:submit|preventDefault={handleSubmit}>
        {#if error}
          <div class="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
        {/if}

        <div class="space-y-4">
          <div>
            <label for="name" class="form-label">Name *</label>
            <input type="text" id="name" bind:value={name} class="form-input" required />
          </div>

          <div>
            <label for="slug" class="form-label">Slug (optional)</label>
            <input type="text" id="slug" bind:value={slug} class="form-input" placeholder="auto-generated" />
          </div>

          <div>
            <label for="parent" class="form-label">Parent Folder</label>
            <select id="parent" bind:value={parentId} class="form-input">
              <option value="">No parent</option>
              {#each folders.filter((f) => f.id !== editingId) as folder}
                <option value={folder.id}>{folder.name}</option>
              {/each}
            </select>
          </div>

          <div>
            <label for="sortOrder" class="form-label">Sort Order</label>
            <input type="number" id="sortOrder" bind:value={sortOrder} class="form-input" />
          </div>
        </div>

        <div class="flex justify-end gap-4 mt-6">
          <button type="button" on:click={cancelForm} class="btn btn-secondary">Cancel</button>
          <button type="submit" class="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Folder'}
          </button>
        </div>
      </form>
    </div>
  {/if}

  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    {#if folders.length === 0}
      <div class="p-8 text-center text-gray-500">
        No folders yet. <button on:click={startCreate} class="text-primary-600 hover:underline">Create your first folder</button>.
      </div>
    {:else}
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-200 bg-gray-50">
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          {#each folders as folder}
            <tr class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{folder.name}</td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-500">{folder.slug}</td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-500">{getParentName(folder.parent_id)}</td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-500">{folder.sort_order}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <button on:click={() => startEdit(folder)} class="text-primary-600 hover:text-primary-700 mr-4">
                  Edit
                </button>
                <button on:click={() => handleDelete(folder)} class="text-red-600 hover:text-red-700">
                  Delete
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</div>
