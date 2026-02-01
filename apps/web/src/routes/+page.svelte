<script lang="ts">
  import type { PageData } from './$types';
  import { formatDate } from '$lib/utils/markdown';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';

  export let data: PageData;

  $: timeline = data.timeline;
  $: settings = data.settings;

  function groupByYear(items: typeof timeline.items) {
    const groups: { year: string; items: typeof items }[] = [];
    let currentYear = '';

    for (const item of items) {
      const year = new Date(item.published_at).getFullYear().toString();
      if (year !== currentYear) {
        currentYear = year;
        groups.push({ year, items: [item] });
      } else {
        groups[groups.length - 1].items.push(item);
      }
    }
    return groups;
  }

  $: yearGroups = groupByYear(timeline.items);
</script>

<svelte:head>
  <title>{settings.site_title}</title>
  <meta name="description" content={settings.site_description} />
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600&display=swap" rel="stylesheet">
</svelte:head>

<div class="min-h-screen bg-[#FAFAFA] dark:bg-stone-950 transition-colors">
  <!-- Header -->
  <header class="h-20 px-12 flex items-center justify-between border-b border-[#E5E5E5] dark:border-stone-800 bg-white dark:bg-stone-900">
    <h1 class="text-2xl font-serif font-semibold text-[#1A1A1A] dark:text-stone-100">
      {settings.site_title}
    </h1>
    <ThemeToggle />
  </header>

  <!-- Main Content -->
  <main class="flex gap-12 px-12 py-12">
    <!-- Timeline Navigation -->
    <div class="w-32 flex-shrink-0">
      {#if yearGroups.length > 0}
        {#each yearGroups as group, i}
          <div class="flex items-center gap-3 {i > 0 ? 'mt-16' : ''}">
            <div class="w-2.5 h-2.5 rounded-full bg-[#0D6E6E] dark:bg-teal-400"></div>
            <span class="font-mono text-sm font-semibold text-[#1A1A1A] dark:text-stone-200">{group.year}</span>
          </div>
          <div class="ml-[5px] w-0.5 h-auto min-h-[80px] bg-[#E5E5E5] dark:bg-stone-700 mt-3">
            {#each group.items as _, j}
              <div class="relative -left-[3px] mt-6 first:mt-0">
                <div class="w-2 h-2 rounded-full bg-[#E5E5E5] dark:bg-stone-600"></div>
              </div>
            {/each}
          </div>
        {/each}
      {/if}
    </div>

    <!-- Content Area -->
    <div class="flex-1 max-w-3xl">
      {#if timeline.items.length === 0}
        <div class="text-center py-20">
          <div class="w-12 h-12 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-stone-400 dark:text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke-width="1.5"/>
              <path stroke-linecap="round" stroke-width="1.5" d="M12 6v6l4 2"/>
            </svg>
          </div>
          <p class="text-[#888888] dark:text-stone-500">No documents yet</p>
        </div>
      {:else}
        <div class="flex flex-col gap-3">
          {#each timeline.items as item}
            <a
              href="/{item.slug}"
              class="group inline-flex items-center gap-3 h-9 px-4 bg-white dark:bg-stone-900 rounded-full border border-[#E5E5E5] dark:border-stone-700 hover:border-[#0D6E6E] dark:hover:border-teal-500 transition-colors w-fit"
            >
              <time class="font-mono text-xs text-[#888888] dark:text-stone-500">
                {new Date(item.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </time>
              <span class="w-1 h-1 rounded-full bg-[#E5E5E5] dark:bg-stone-600"></span>
              <span class="text-sm font-medium text-[#1A1A1A] dark:text-stone-200 group-hover:text-[#0D6E6E] dark:group-hover:text-teal-400 transition-colors">
                {item.title}
              </span>
              {#if item.is_private}
                <svg class="w-3 h-3 text-amber-400 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
                </svg>
              {/if}
            </a>
          {/each}
        </div>

        <!-- Pagination -->
        {#if timeline.total > timeline.limit}
          <div class="flex justify-center gap-6 mt-16 pt-8 border-t border-[#E5E5E5] dark:border-stone-800">
            {#if timeline.page > 1}
              <a href="/?page={timeline.page - 1}" class="text-sm text-[#888888] dark:text-stone-400 hover:text-[#0D6E6E] dark:hover:text-teal-400 transition">
                ← Previous
              </a>
            {/if}
            <span class="text-sm text-[#AAAAAA] dark:text-stone-600">
              {timeline.page} / {Math.ceil(timeline.total / timeline.limit)}
            </span>
            {#if timeline.page * timeline.limit < timeline.total}
              <a href="/?page={timeline.page + 1}" class="text-sm text-[#888888] dark:text-stone-400 hover:text-[#0D6E6E] dark:hover:text-teal-400 transition">
                Next →
              </a>
            {/if}
          </div>
        {/if}
      {/if}
    </div>
  </main>

  <!-- Footer -->
  <footer class="py-8 text-center">
    <p class="text-xs text-[#CCCCCC] dark:text-stone-600">
      Powered by <a href="https://github.com/chronomd/chronomd" class="hover:text-[#888888] dark:hover:text-stone-500 transition">ChronoMD</a>
    </p>
  </footer>
</div>
