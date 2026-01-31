<script lang="ts">
  import type { PageData } from './$types';
  import { renderMarkdown } from '$lib/utils/markdown';
  import { api } from '$lib/api';
  import { unlockedDocuments } from '$lib/stores/auth';
  import { onMount } from 'svelte';
  import { theme } from '$lib/stores/theme';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';

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
      unlockError = '访问码无效';
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
  <title>{doc.title}</title>
  {#if doc.summary}
    <meta name="description" content={doc.summary} />
  {/if}
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" />
</svelte:head>

<div class="min-h-screen bg-stone-50 dark:bg-stone-950 transition-colors">
  <!-- Nav -->
  <nav class="py-6 px-6">
    <div class="max-w-3xl mx-auto flex items-center justify-between">
      <a href="/" class="text-sm text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition">
        ← {settings.site_title}
      </a>
      <ThemeToggle />
    </div>
  </nav>

  <!-- Article -->
  <article class="max-w-3xl mx-auto px-6 pb-20">
    <!-- Header -->
    <header class="mb-12">
      <h1 class="text-2xl md:text-3xl font-medium text-stone-800 dark:text-stone-100 leading-tight">
        {doc.title}
      </h1>
      <div class="flex items-center gap-3 mt-4 text-sm text-stone-400 dark:text-stone-500">
        {#if doc.published_at}
          <time datetime={doc.published_at}>
            {new Date(doc.published_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </time>
        {/if}
        {#if doc.folder}
          <span class="text-stone-300 dark:text-stone-600">/</span>
          <span>{doc.folder.name}</span>
        {/if}
        {#if doc.is_private}
          <span class="inline-flex items-center gap-1 text-amber-500">
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
            </svg>
            私密
          </span>
        {/if}
      </div>
    </header>

    {#if doc.is_locked && !unlockContent}
      <!-- Unlock -->
      <div class="py-16 text-center">
        <div class="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-stone-400 dark:text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p class="text-stone-500 dark:text-stone-400 mb-6">需要访问码查看内容</p>

        <form on:submit|preventDefault={handleUnlock} class="max-w-xs mx-auto">
          <input
            type="password"
            bind:value={accessCode}
            placeholder="输入访问码"
            class="w-full px-4 py-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-center focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 transition text-stone-800 dark:text-stone-200"
            disabled={unlocking}
          />
          {#if unlockError}
            <p class="text-red-500 text-sm mt-2">{unlockError}</p>
          {/if}
          <button
            type="submit"
            class="w-full mt-3 px-4 py-2.5 bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 text-sm rounded-xl hover:bg-stone-700 dark:hover:bg-stone-300 transition disabled:opacity-50"
            disabled={unlocking}
          >
            {unlocking ? '验证中...' : '解锁'}
          </button>
        </form>
      </div>
    {:else}
      <!-- Content -->
      <div class="prose prose-stone dark:prose-invert prose-lg max-w-none
        prose-headings:font-medium
        prose-p:leading-relaxed
        prose-a:underline prose-a:underline-offset-2
        prose-strong:font-medium
        prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-transparent prose-pre:p-0
        prose-blockquote:font-normal
        prose-img:rounded-xl
      ">
        {@html displayContent}
      </div>
    {/if}
  </article>

  <!-- Footer -->
  <footer class="py-8 border-t border-stone-100 dark:border-stone-800">
    <div class="max-w-3xl mx-auto px-6 text-center">
      <a href="/" class="text-sm text-stone-400 dark:text-stone-500 hover:text-stone-500 dark:hover:text-stone-400 transition">
        ← 返回时间线
      </a>
    </div>
  </footer>
</div>
