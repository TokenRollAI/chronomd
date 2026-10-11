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

<div class="admin-page">
  <h1 class="admin-title">Settings</h1>

  <form on:submit|preventDefault={handleSubmit} class="max-w-xl mt-8">
    {#if error}
      <div class="alert-error mb-6">{error}</div>
    {/if}

    <div class="flex flex-col gap-5">
      <div>
        <label for="site_title" class="field-label">Site title</label>
        <input type="text" id="site_title" bind:value={settings.site_title} class="field" />
      </div>

      <div>
        <label for="site_description" class="field-label">Site description</label>
        <textarea id="site_description" bind:value={settings.site_description} class="field" rows="3"></textarea>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label for="timezone" class="field-label">Timezone</label>
          <input type="text" id="timezone" bind:value={settings.timezone} class="field font-mono text-[13px]" placeholder="Asia/Shanghai" />
          <p class="mt-1.5 text-xs text-faint">Used to group the stream by day.</p>
        </div>
        <div>
          <label for="posts_per_page" class="field-label">Entries per page</label>
          <input type="number" id="posts_per_page" bind:value={settings.posts_per_page} class="field" min="1" max="100" />
        </div>
      </div>
    </div>

    <div class="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-line">
      {#if saved}
        <span class="text-xs text-accent">Saved</span>
      {/if}
      <button type="submit" class="btn-primary" disabled={saving}>
        {saving ? 'Saving…' : 'Save settings'}
      </button>
    </div>
  </form>
</div>
