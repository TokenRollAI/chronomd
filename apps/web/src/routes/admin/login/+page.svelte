<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { adminApi } from '$lib/api';

  let password = '';
  let error = '';
  let loading = false;

  async function handleLogin(e: Event) {
    e.preventDefault();
    if (!password.trim()) return;

    loading = true;
    error = '';

    try {
      await adminApi.login(password);
      goto('/admin');
    } catch (err) {
      error = 'Invalid password';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Login - ChronoMD Admin</title>
</svelte:head>

<div class="min-h-screen bg-canvas flex items-center justify-center px-5">
  <div class="w-full max-w-[320px]">
    <div class="text-center">
      <h1 class="font-serif text-2xl font-semibold text-ink">ChronoMD</h1>
      <p class="mt-1 text-[13px] text-faint">Admin</p>
    </div>

    <form on:submit={handleLogin} class="mt-8 flex flex-col gap-3">
      <input
        type="password"
        id="password"
        bind:value={password}
        class="field h-10"
        placeholder="Password"
        aria-label="Password"
        autocomplete="current-password"
        disabled={loading}
      />

      {#if error}
        <p class="text-xs text-warn">{error}</p>
      {/if}

      <button type="submit" class="btn-primary h-10" disabled={loading}>
        {loading ? 'Logging in…' : 'Login'}
      </button>
    </form>

    <div class="mt-8 text-center">
      <a href="/" class="text-[13px] text-faint hover:text-ink transition-colors">← Back to site</a>
    </div>
  </div>
</div>
