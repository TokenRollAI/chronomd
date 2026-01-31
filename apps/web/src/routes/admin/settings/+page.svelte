<script lang="ts">
  import type { PageData } from './$types';
  import { adminApi } from '$lib/api';

  export let data: PageData;

  let settings = { ...data.settings };
  let saving = false;
  let saved = false;
  let error = '';

  async function handleSubmit() {
    saving = true;
    saved = false;
    error = '';

    try {
      await adminApi.updateSettings(settings);
      saved = true;
      setTimeout(() => saved = false, 3000);
    } catch (err) {
      error = 'Failed to save settings';
    } finally {
      saving = false;
    }
  }
</script>

<svelte:head>
  <title>Settings - ChronoMD Admin</title>
</svelte:head>

<div class="p-8">
  <h1 class="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

  <form on:submit|preventDefault={handleSubmit} class="max-w-xl">
    {#if error}
      <div class="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6">{error}</div>
    {/if}
    {#if saved}
      <div class="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6">Settings saved!</div>
    {/if}

    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Site Settings</h2>

      <div class="space-y-4">
        <div>
          <label for="site_title" class="form-label">Site Title</label>
          <input type="text" id="site_title" bind:value={settings.site_title} class="form-input" />
        </div>

        <div>
          <label for="site_description" class="form-label">Site Description</label>
          <textarea id="site_description" bind:value={settings.site_description} class="form-input" rows="3"></textarea>
        </div>

        <div>
          <label for="timezone" class="form-label">Timezone</label>
          <input type="text" id="timezone" bind:value={settings.timezone} class="form-input" placeholder="UTC" />
        </div>

        <div>
          <label for="posts_per_page" class="form-label">Posts Per Page</label>
          <input type="number" id="posts_per_page" bind:value={settings.posts_per_page} class="form-input" min="1" max="100" />
        </div>
      </div>
    </div>

    <div class="flex justify-end">
      <button type="submit" class="btn btn-primary" disabled={saving}>
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  </form>
</div>
