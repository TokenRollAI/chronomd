<script lang="ts">
  import { onMount } from 'svelte';
  import type { MixedTimelineItem } from '$lib/api';
  import { timeOfDay } from '$lib/utils/time';

  export let item: MixedTimelineItem;
  export let timeZone: string | undefined;
  export let highlight = false;
  export let last = false;

  let noteEl: HTMLParagraphElement;
  let expanded = false;
  let overflowing = false;

  $: time = timeOfDay(item.published_at, timeZone);

  onMount(() => {
    if (noteEl) overflowing = noteEl.scrollHeight > noteEl.clientHeight + 1;
  });
</script>

<article class="relative pl-6 md:pl-7 border-l {last ? 'border-transparent' : 'border-line pb-7'}">
  <span
    class="absolute -left-[4px] top-[6.5px] w-[7px] h-[7px] rounded-full {highlight ? 'bg-accent' : 'bg-faint/70'}"
    aria-hidden="true"
  ></span>

  <div class="flex items-center gap-2 h-5">
    <time datetime={item.published_at} class="font-mono text-xs text-faint">{time}</time>
    {#if item.type === 'document' && item.is_private}
      <svg class="w-[11px] h-[11px] text-faint" fill="currentColor" viewBox="0 0 20 20" aria-label="私密">
        <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
      </svg>
    {/if}
  </div>

  {#if item.type === 'note'}
    <p
      bind:this={noteEl}
      class="mt-1.5 text-[15px] leading-[1.75] text-body whitespace-pre-wrap break-words {expanded ? '' : 'line-clamp-6'}"
    >{item.content}</p>
    {#if overflowing}
      <button
        type="button"
        on:click={() => (expanded = !expanded)}
        class="mt-1.5 text-[13px] text-faint hover:text-ink transition-colors"
      >
        {expanded ? '收起' : '展开'}
      </button>
    {/if}
  {:else}
    <a href="/{item.slug}" class="group block mt-1.5">
      <h2 class="font-serif text-lg font-semibold text-ink leading-snug group-hover:text-accent transition-colors">
        {item.title}
      </h2>
      {#if item.summary && !item.is_private}
        <p class="mt-1.5 text-sm leading-[1.7] text-muted line-clamp-2">{item.summary}</p>
      {/if}
      <span class="inline-block mt-1.5 text-[13px] text-accent">
        {item.is_private ? '需要访问码' : '继续阅读 →'}
      </span>
    </a>
  {/if}
</article>
