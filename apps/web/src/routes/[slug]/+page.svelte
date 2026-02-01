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
      unlockError = 'Invalid access code';
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
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600&display=swap" rel="stylesheet">
</svelte:head>

<div class="min-h-screen bg-[#FAFAFA] dark:bg-stone-950 transition-colors">
  <!-- Header -->
  <header class="h-20 px-12 flex items-center justify-between border-b border-[#E5E5E5] dark:border-stone-800 bg-white dark:bg-stone-900">
    <h1 class="text-2xl font-serif font-semibold text-[#1A1A1A] dark:text-stone-100">
      {settings.site_title}
    </h1>
    <div class="flex items-center gap-6">
      <a href="/" class="flex items-center gap-2 text-sm text-[#666666] dark:text-stone-400 hover:text-[#1A1A1A] dark:hover:text-stone-200 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </a>
      <ThemeToggle />
    </div>
  </header>

  <!-- Article -->
  <article class="max-w-3xl mx-auto px-6 py-12">
    <!-- Article Header -->
    <header class="mb-10 pb-8 border-b border-[#E5E5E5] dark:border-stone-800">
      <h1 class="text-4xl font-serif font-semibold text-[#1A1A1A] dark:text-stone-100 leading-tight mb-4">
        {doc.title}
      </h1>
      <div class="flex items-center gap-4 text-sm">
        {#if doc.published_at}
          <time datetime={doc.published_at} class="font-mono text-xs text-[#888888] dark:text-stone-500">
            {new Date(doc.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </time>
        {/if}
        {#if doc.folder}
          <span class="w-1 h-1 rounded-full bg-[#E5E5E5] dark:bg-stone-600"></span>
          <span class="text-sm text-[#0D6E6E] dark:text-teal-400">{doc.folder.name}</span>
        {/if}
        {#if doc.is_private}
          <span class="inline-flex items-center gap-1.5 text-amber-500 text-sm">
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
            </svg>
            Private
          </span>
        {/if}
      </div>
    </header>

    {#if doc.is_locked && !unlockContent}
      <!-- Unlock Form -->
      <div class="py-16 text-center">
        <div class="w-16 h-16 rounded-full bg-[#F0F0F0] dark:bg-stone-800 flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-[#888888] dark:text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p class="text-[#666666] dark:text-stone-400 mb-6">Access code required to view content</p>

        <form on:submit|preventDefault={handleUnlock} class="max-w-xs mx-auto">
          <input
            type="password"
            bind:value={accessCode}
            placeholder="Enter access code"
            class="w-full px-4 py-3 bg-white dark:bg-stone-900 border border-[#E5E5E5] dark:border-stone-700 rounded-lg text-center focus:outline-none focus:border-[#0D6E6E] dark:focus:border-teal-500 transition text-[#1A1A1A] dark:text-stone-200"
            disabled={unlocking}
          />
          {#if unlockError}
            <p class="text-red-500 text-sm mt-2">{unlockError}</p>
          {/if}
          <button
            type="submit"
            class="w-full mt-4 px-4 py-3 bg-[#0D6E6E] text-white text-sm font-medium rounded-lg hover:bg-[#0a5a5a] transition disabled:opacity-50"
            disabled={unlocking}
          >
            {unlocking ? 'Verifying...' : 'Unlock'}
          </button>
        </form>
      </div>
    {:else}
      <!-- Content -->
      <div class="prose prose-stone dark:prose-invert prose-lg max-w-none
        prose-headings:font-serif prose-headings:font-semibold
        prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
        prose-p:leading-relaxed prose-p:text-[#666666] dark:prose-p:text-stone-400
        prose-a:text-[#0D6E6E] dark:prose-a:text-teal-400 prose-a:underline prose-a:underline-offset-2
        prose-strong:font-medium prose-strong:text-[#1A1A1A] dark:prose-strong:text-stone-200
        prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-[#1E293B] prose-pre:rounded-lg prose-pre:p-5
        prose-blockquote:font-normal prose-blockquote:border-l-[#0D6E6E] prose-blockquote:text-[#666666] dark:prose-blockquote:text-stone-400
        prose-img:rounded-xl
      ">
        {@html displayContent}
      </div>
    {/if}
  </article>

  <!-- Footer -->
  <footer class="py-8 border-t border-[#E5E5E5] dark:border-stone-800">
    <div class="max-w-3xl mx-auto px-6 text-center">
      <a href="/" class="inline-flex items-center gap-2 text-sm text-[#888888] dark:text-stone-500 hover:text-[#0D6E6E] dark:hover:text-teal-400 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to timeline
      </a>
    </div>
  </footer>
</div>
