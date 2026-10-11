<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { adminApi } from '$lib/api';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';

  async function handleLogout() {
    await adminApi.logout();
    goto('/admin/login');
  }

  $: currentPath = $page.url.pathname;
  $: isLogin = currentPath.startsWith('/admin/login');

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: 'layout-dashboard' },
    { href: '/admin/quick-notes', label: 'Quick Notes', short: 'Notes', icon: 'message-square' },
    { href: '/admin/documents', label: 'Documents', short: 'Docs', icon: 'file-text' },
    { href: '/admin/folders', label: 'Folders', icon: 'folder' },
    { href: '/admin/settings', label: 'Settings', icon: 'settings' }
  ];

  const icons: Record<string, string> = {
    'layout-dashboard': 'M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zm10-2a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5z',
    'file-text': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    'message-square': 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z',
    'folder': 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
    'settings': 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    'external-link': 'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14',
    'log-out': 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
  };

  function isActive(href: string) {
    if (href === '/admin') return currentPath === '/admin';
    return currentPath.startsWith(href);
  }
</script>

{#if isLogin}
  <slot />
{:else}
  <div class="min-h-screen bg-canvas md:flex">
    <!-- Desktop Sidebar -->
    <aside class="hidden md:flex sticky top-0 h-screen w-[232px] flex-shrink-0 flex-col gap-7 px-4 pt-7 pb-6 border-r border-line">
      <a href="/admin" class="px-2.5">
        <div class="font-serif text-xl font-semibold text-ink">ChronoMD</div>
        <div class="text-xs text-faint mt-0.5">Admin</div>
      </a>

      <nav class="flex-1">
        <ul class="space-y-0.5">
          {#each navItems as item}
            {@const active = isActive(item.href)}
            <li>
              <a
                href={item.href}
                class="flex items-center gap-2.5 h-9 px-2.5 rounded-lg text-sm transition-colors {active ? 'bg-accent/[0.07] text-ink font-medium' : 'text-muted hover:text-ink hover:bg-ink/[0.03]'}"
              >
                <svg class="w-4 h-4 {active ? 'text-accent' : 'text-faint'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d={icons[item.icon]} />
                </svg>
                {item.label}
              </a>
            </li>
          {/each}
        </ul>
      </nav>

      <div class="space-y-0.5">
        <a href="/" class="flex items-center gap-2.5 h-8 px-2.5 text-[13px] text-muted hover:text-ink transition-colors">
          <svg class="w-3.5 h-3.5 text-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d={icons['external-link']} />
          </svg>
          View site
        </a>
        <button on:click={handleLogout} class="flex items-center gap-2.5 h-8 px-2.5 w-full text-[13px] text-muted hover:text-ink transition-colors">
          <svg class="w-3.5 h-3.5 text-faint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d={icons['log-out']} />
          </svg>
          Logout
        </button>
        <div class="px-1.5 pt-1"><ThemeToggle /></div>
      </div>
    </aside>

    <!-- Mobile Header -->
    <header class="md:hidden h-14 px-5 flex items-center justify-between border-b border-line">
      <a href="/admin" class="font-serif text-lg font-semibold text-ink">ChronoMD</a>
      <div class="flex items-center gap-1">
        <a href="/" class="p-2 text-faint hover:text-ink" aria-label="View site">
          <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d={icons['external-link']} />
          </svg>
        </a>
        <button on:click={handleLogout} class="p-2 text-faint hover:text-ink" aria-label="Logout">
          <svg class="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d={icons['log-out']} />
          </svg>
        </button>
        <ThemeToggle />
      </div>
    </header>

    <main class="flex-1 min-w-0 pb-20 md:pb-0">
      <slot />
    </main>

    <!-- Mobile Bottom Tab Bar -->
    <nav class="md:hidden fixed bottom-0 inset-x-0 z-40 h-16 pb-[env(safe-area-inset-bottom)] bg-canvas/90 backdrop-blur border-t border-line flex items-center justify-around px-2">
      {#each navItems as item}
        {@const active = isActive(item.href)}
        <a href={item.href} class="flex flex-col items-center gap-1 px-3 py-1.5 {active ? 'text-accent' : 'text-faint'}">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d={icons[item.icon]} />
          </svg>
          <span class="text-[10px] font-medium">{item.short || item.label}</span>
        </a>
      {/each}
    </nav>
  </div>
{/if}
