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

<div class="min-h-screen bg-gray-100 flex items-center justify-center px-4">
  <div class="max-w-md w-full">
    <div class="bg-white rounded-lg shadow-lg p-8">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900">ChronoMD</h1>
        <p class="text-gray-600 mt-1">Admin Login</p>
      </div>

      <form on:submit={handleLogin}>
        <div class="mb-4">
          <label for="password" class="form-label">Password</label>
          <input
            type="password"
            id="password"
            bind:value={password}
            class="form-input"
            placeholder="Enter admin password"
            disabled={loading}
          />
        </div>

        {#if error}
          <p class="text-red-600 text-sm mb-4">{error}</p>
        {/if}

        <button type="submit" class="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div class="mt-6 text-center">
        <a href="/" class="text-sm text-gray-500 hover:text-gray-700">← Back to site</a>
      </div>
    </div>
  </div>
</div>
