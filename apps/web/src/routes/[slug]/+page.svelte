<script lang="ts">
  import type { PageData } from './$types';
  import { renderMarkdown } from '$lib/utils/markdown';
  import { api } from '$lib/api';
  import { unlockedDocuments } from '$lib/stores/auth';
  import { onMount } from 'svelte';
  import { theme } from '$lib/stores/theme';
  import SiteHeader from '$lib/components/SiteHeader.svelte';
  import { fullDateTime } from '$lib/utils/time';

  export let data: PageData;

  let accessCode = '';
  let unlockError = '';
  let unlocking = false;

  $: doc = data.document;
  $: settings = data.settings;
  $: content = data.renderedContent || '';

  let unlockContent = '';

  async function handleUnlock() {
    if (!accessCode.trim()) return;

    unlocking = true;
    unlockError = '';

    try {
      const result = await api.unlockDocument(doc.slug, accessCode);
      if (result.unlocked) {
        unlockedDocuments.unlock(doc.slug);
        doc = result.document;
        unlockContent = await renderMarkdown(doc.content);
      }
    } catch (err) {
      unlockError = '访问码不正确';
    } finally {
      unlocking = false;
      accessCode = '';
    }
  }

  $: displayContent = unlockContent || content;

  onMount(async () => {
    const mermaidBlocks = document.querySelectorAll('code.language-mermaid');
    if (mermaidBlocks.length > 0) {
      const mermaid = (await import('mermaid')).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: $theme === 'dark' ? 'dark' : 'neutral',
        fontFamily: 'Inter, system-ui, sans-serif',
      });

      for (const block of mermaidBlocks) {
        const pre = block.parentElement;
        if (!pre) continue;
        const container = document.createElement('div');
        container.className = 'mermaid-diagram';
        try {
          const id = `mermaid-${Math.random().toString(36).slice(2, 8)}`;
          const { svg } = await mermaid.render(id, block.textContent || '');
          container.innerHTML = svg;
          pre.replaceWith(container);
        } catch {
          // Leave code block as-is if mermaid fails
        }
      }
    }
  });
</script>

<svelte:head>
  <title>{doc.title} · {settings.site_title}</title>
  {#if doc.summary}
    <meta name="description" content={doc.summary} />
  {/if}
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" />
</svelte:head>

<div class="min-h-screen bg-canvas">
  <div class="max-w-[680px] mx-auto px-5 md:px-0 pb-14">
    <SiteHeader title={settings.site_title} />

    <a href="/" class="text-[13px] text-faint hover:text-ink transition-colors">← 时间流</a>

    <article>
      <header class="pt-6 md:pt-8 pb-7 md:pb-8 border-b border-line">
        <div class="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
          {#if doc.published_at}
            <time datetime={doc.published_at} class="font-mono text-faint">
              {fullDateTime(doc.published_at, settings.timezone)}
            </time>
          {/if}
          {#if doc.folder}
            <span class="text-faint">·</span>
            <span class="text-accent">{doc.folder.name}</span>
          {/if}
          {#if doc.is_private}
            <span class="text-faint">·</span>
            <span class="inline-flex items-center gap-1 text-faint">
              <svg class="w-[11px] h-[11px]" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
              </svg>
              私密
            </span>
          {/if}
        </div>
        <h1 class="mt-3.5 font-serif text-[28px] md:text-[34px] font-semibold leading-tight text-ink">
          {doc.title}
        </h1>
      </header>

      {#if doc.is_locked && !unlockContent}
        <div class="py-16 md:py-20 text-center">
          <p class="text-sm text-muted">这条记录需要访问码</p>
          <form on:submit|preventDefault={handleUnlock} class="max-w-[260px] mx-auto mt-6 flex flex-col gap-3">
            <input
              type="password"
              bind:value={accessCode}
              placeholder="访问码"
              aria-label="访问码"
              class="field h-10 text-center"
              disabled={unlocking}
            />
            {#if unlockError}
              <p class="text-xs text-warn">{unlockError}</p>
            {/if}
            <button type="submit" class="btn-primary h-10" disabled={unlocking}>
              {unlocking ? '验证中…' : '解锁'}
            </button>
          </form>
        </div>
      {:else}
        <div class="prose prose-base md:prose-lg max-w-none pt-8 md:pt-9 prose-p:leading-[1.85] prose-img:rounded-xl">
          {@html displayContent}
        </div>
      {/if}
    </article>

    <footer class="mt-14 pt-6 border-t border-line">
      <a href="/" class="text-[13px] text-muted hover:text-ink transition-colors">← 回到时间流</a>
    </footer>
  </div>
</div>
