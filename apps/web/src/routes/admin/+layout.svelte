<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { adminApi } from '$lib/api';

  async function handleLogout() {
    await adminApi.logout();
    goto('/admin/login');
  }

  $: currentPath = $page.url.pathname;

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: 'layout-dashboard' },
    { href: '/admin/documents', label: 'Documents', icon: 'file-text' },
    { href: '/admin/folders', label: 'Folders', icon: 'folder' },
    { href: '/admin/settings', label: 'Settings', icon: 'settings' }
  ];

  function getIcon(name: string) {
    const icons: Record<string, string> = {
      'layout-dashboard': 'M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zm10-2a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5z',
      'file-text': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      'folder': 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
      'settings': 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      'external-link': 'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14',
      'log-out': 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
    };
    return icons[name] || '';
  }
</script>

<svelte:head>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600&display=swap" rel="stylesheet">
</svelte:head>

<div class="min-h-screen bg-[#FAFAFA] flex">
  <!-- Sidebar -->
  <aside class="w-64 bg-white border-r border-[#E5E5E5] flex flex-col">
    <div class="p-6 border-b border-[#E5E5E5]">
      <a href="/admin" class="text-xl font-serif font-semibold text-[#1A1A1A]">ChronoMD</a>
      <p class="text-[#888888] text-sm mt-1">Admin Panel</p>
    </div>

    <nav class="flex-1 p-3">
      <ul class="space-y-1">
        {#each navItems as item}
          <li>
            <a
              href={item.href}
              class="flex items-center gap-3 px-4 py-2.5 rounded-lg transition {currentPath === item.href ? 'bg-[#0D6E6E] text-white' : 'text-[#666666] hover:bg-[#F0F0F0]'}"
            >
              <svg class="w-5 h-5" fill={currentPath === item.href ? 'none' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={getIcon(item.icon)} />
              </svg>
              <span class="text-sm font-medium">{item.label}</span>
            </a>
          </li>
        {/each}
      </ul>
    </nav>

    <div class="p-4 border-t border-[#E5E5E5]">
      <a href="/" class="flex items-center gap-3 text-[#666666] hover:text-[#1A1A1A] text-sm mb-3 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={getIcon('external-link')} />
        </svg>
        View Site
      </a>
      <button on:click={handleLogout} class="flex items-center gap-3 text-[#666666] hover:text-[#1A1A1A] text-sm w-full transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={getIcon('log-out')} />
        </svg>
        Logout
      </button>
    </div>
  </aside>

  <!-- Main content -->
  <main class="flex-1 overflow-auto">
    <slot />
  </main>
</div>

<style>
  :global(.admin-sidebar) {
    width: 16rem;
  }
</style>
