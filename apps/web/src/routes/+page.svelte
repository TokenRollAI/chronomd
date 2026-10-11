<script lang="ts">
  import type { PageData } from './$types';
  import SiteHeader from '$lib/components/SiteHeader.svelte';
  import Composer from '$lib/components/Composer.svelte';
  import StreamEntry from '$lib/components/StreamEntry.svelte';
  import { groupByDay } from '$lib/utils/time';
  import { invalidateAll } from '$app/navigation';

  export let data: PageData;

  $: timeline = data.timeline;
  $: settings = data.settings;
  $: isLoggedIn = data.isLoggedIn;
  $: days = groupByDay(timeline.items, settings.timezone);
  $: totalPages = Math.max(1, Math.ceil(timeline.total / timeline.limit));
</script>

<svelte:head>
  <title>{settings.site_title}</title>
  <meta name="description" content={settings.site_description} />
</svelte:head>

<div class="min-h-screen bg-canvas">
  <div class="max-w-[600px] mx-auto px-5 md:px-0 pb-12">
    <SiteHeader title={settings.site_title} />

    {#if settings.site_description}
      <p class="-mt-1 md:-mt-2 text-sm text-muted">{settings.site_description}</p>
    {/if}

    {#if isLoggedIn && timeline.page === 1}
      <div class="mt-6 md:mt-7">
        <Composer on:created={invalidateAll} />
      </div>
    {/if}

    <main>
      {#if timeline.items.length === 0}
        <p class="py-24 text-center text-sm text-faint">还没有记录</p>
      {:else}
        {#each days as day, d (day.key)}
          <section>
            <h2 class="flex items-baseline gap-2.5 pt-10 pb-[18px]">
              <span class="font-serif text-lg md:text-xl font-semibold text-ink">{day.label}</span>
              <span class="text-xs md:text-[13px] text-faint">{day.weekday}</span>
            </h2>
            <div>
              {#each day.items as item, i (item.type + item.id)}
                <StreamEntry
                  {item}
                  timeZone={settings.timezone}
                  highlight={timeline.page === 1 && d === 0 && i === 0}
                  last={i === day.items.length - 1}
                />
              {/each}
            </div>
          </section>
        {/each}

        {#if totalPages > 1}
          <nav class="flex items-center justify-center gap-6 pt-12 text-[13px]">
            {#if timeline.page > 1}
              <a href="/?page={timeline.page - 1}" class="text-muted hover:text-ink transition-colors">← 较新</a>
            {/if}
            <span class="font-mono text-xs text-faint">{timeline.page} / {totalPages}</span>
            {#if timeline.page < totalPages}
              <a href="/?page={timeline.page + 1}" class="text-muted hover:text-ink transition-colors">更早的记录 →</a>
            {/if}
          </nav>
        {/if}
      {/if}
    </main>

    <footer class="pt-10 text-center">
      <a href="https://github.com/chronomd/chronomd" class="text-[11px] text-faint hover:text-muted transition-colors">
        Powered by ChronoMD
      </a>
    </footer>
  </div>
</div>
