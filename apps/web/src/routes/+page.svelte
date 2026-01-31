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
</svelte:head>

<div class="min-h-screen bg-stone-50 dark:bg-stone-950 transition-colors">
  <!-- Header -->
  <header class="py-16 px-6">
    <div class="max-w-2xl mx-auto text-center relative">
      <div class="absolute right-0 top-0">
        <ThemeToggle />
      </div>
      <h1 class="text-2xl font-medium text-stone-800 dark:text-stone-100 tracking-wide">
        {settings.site_title}
      </h1>
      {#if settings.site_subtitle}
        <p class="text-stone-500 dark:text-stone-400 mt-2">{settings.site_subtitle}</p>
      {/if}
    </div>
  </header>

  <!-- Timeline -->
  <main class="max-w-2xl mx-auto px-6 pb-20">
    {#if timeline.items.length === 0}
      <div class="text-center py-20">
        <div class="w-12 h-12 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center mx-auto mb-4">
          <svg class="w-6 h-6 text-stone-400 dark:text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke-width="1.5"/>
            <path stroke-linecap="round" stroke-width="1.5" d="M12 6v6l4 2"/>
          </svg>
        </div>
        <p class="text-stone-400 dark:text-stone-500">时间胶囊是空的</p>
        <p class="text-stone-300 dark:text-stone-600 text-sm mt-1">记录尚未开始</p>
      </div>
    {:else}
      <div class="relative">
        <!-- Timeline line -->
        <div class="absolute left-[7px] top-4 bottom-4 w-px bg-stone-200 dark:bg-stone-800"></div>

        {#each yearGroups as group}
          <!-- Year marker -->
          <div class="relative flex items-center gap-4 mb-8 mt-12 first:mt-0">
            <div class="w-4 h-4 rounded-full bg-stone-800 dark:bg-stone-200 border-4 border-stone-50 dark:border-stone-950 z-10"></div>
            <span class="text-sm font-medium text-stone-800 dark:text-stone-200 tracking-wider">{group.year}</span>
          </div>

          <!-- Capsules -->
          {#each group.items as item}
            <a
              href="/{item.slug}"
              class="group relative flex items-start gap-6 mb-6 pl-10"
            >
              <!-- Timeline dot -->
              <div class="absolute left-[5px] top-2 w-[6px] h-[6px] rounded-full bg-stone-300 dark:bg-stone-600 group-hover:bg-stone-500 dark:group-hover:bg-stone-400 transition-colors"></div>

              <!-- Capsule -->
              <div class="flex-1 py-4 px-5 bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm group-hover:shadow-md group-hover:border-stone-200 dark:group-hover:border-stone-700 transition-all duration-200">
                <div class="flex items-center gap-3 mb-2">
                  <time class="text-xs text-stone-400 dark:text-stone-500 tabular-nums">
                    {new Date(item.published_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                  </time>
                  {#if item.folder}
                    <span class="text-xs text-stone-300 dark:text-stone-600">/</span>
                    <span class="text-xs text-stone-400 dark:text-stone-500">{item.folder.name}</span>
                  {/if}
                  {#if item.is_private}
                    <svg class="w-3 h-3 text-amber-400 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
                    </svg>
                  {/if}
                </div>

                <h2 class="text-stone-700 dark:text-stone-200 font-medium group-hover:text-stone-900 dark:group-hover:text-white transition-colors">
                  {item.title}
                </h2>

                {#if item.summary}
                  <p class="text-sm text-stone-400 dark:text-stone-500 mt-2 line-clamp-2">{item.summary}</p>
                {/if}
              </div>
            </a>
          {/each}
        {/each}

        <!-- End marker -->
        <div class="relative flex items-center gap-4 mt-8">
          <div class="w-2 h-2 rounded-full bg-stone-200 dark:bg-stone-700 ml-1"></div>
        </div>
      </div>

      <!-- Pagination -->
      {#if timeline.total > timeline.limit}
        <div class="flex justify-center gap-6 mt-16 pt-8 border-t border-stone-100 dark:border-stone-800">
          {#if timeline.page > 1}
            <a href="/?page={timeline.page - 1}" class="text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition">
              ← 更早的记录
            </a>
          {/if}
          <span class="text-sm text-stone-300 dark:text-stone-600">
            {timeline.page} / {Math.ceil(timeline.total / timeline.limit)}
          </span>
          {#if timeline.page * timeline.limit < timeline.total}
            <a href="/?page={timeline.page + 1}" class="text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition">
              更近的记录 →
            </a>
          {/if}
        </div>
      {/if}
    {/if}
  </main>

  <!-- Footer -->
  <footer class="py-8 text-center">
    <p class="text-xs text-stone-300 dark:text-stone-600">
      <a href="https://github.com/chronomd/chronomd" class="hover:text-stone-400 dark:hover:text-stone-500 transition">ChronoMD</a>
    </p>
  </footer>
</div>
