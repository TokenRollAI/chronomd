<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte';
  import { adminApi } from '$lib/api';

  const MAX = 500;
  const dispatch = createEventDispatcher<{ created: void }>();

  let content = '';
  let focused = false;
  let submitting = false;
  let error = '';
  let textarea: HTMLTextAreaElement;

  $: count = content.length;
  $: canSubmit = content.trim().length > 0 && count <= MAX && !submitting;
  $: active = focused || content.length > 0;

  function autosize() {
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  async function submit() {
    if (!canSubmit) return;
    submitting = true;
    error = '';
    try {
      await adminApi.createQuickNote(content.trim());
      content = '';
      await tick();
      autosize();
      dispatch('created');
    } catch (err) {
      error = err instanceof Error ? err.message : '记录失败，请重试';
    } finally {
      submitting = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      submit();
    } else if (e.key === 'Escape') {
      textarea.blur();
    }
  }
</script>

<form
  on:submit|preventDefault={submit}
  class="bg-surface border rounded-2xl px-4 md:px-[18px] pt-3.5 pb-3 transition-colors {active ? 'border-faint/60' : 'border-line'}"
>
  <textarea
    bind:this={textarea}
    bind:value={content}
    on:input={autosize}
    on:focus={() => (focused = true)}
    on:blur={() => (focused = false)}
    on:keydown={handleKeydown}
    rows="1"
    maxlength={MAX}
    placeholder="此刻在想什么…"
    aria-label="快速记录"
    class="block w-full resize-none bg-transparent text-[15px] leading-[1.75] text-ink placeholder:text-faint outline-none max-h-[50vh]"
  ></textarea>

  {#if error}
    <p class="mt-2 text-xs text-warn">{error}</p>
  {/if}

  <div class="flex items-center justify-between mt-2 {active ? '' : 'hidden'}">
    <span class="font-mono text-[11px] {count > MAX * 0.9 ? 'text-warn' : 'text-faint'}">
      {count} / {MAX}
      <span class="hidden md:inline ml-2">⌘ + Enter 发送</span>
    </span>
    <button
      type="submit"
      disabled={!canSubmit}
      on:mousedown|preventDefault
      class="h-[30px] px-3.5 rounded-full bg-accent text-accent-fg text-[13px] font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {submitting ? '记录中…' : '记录'}
    </button>
  </div>
</form>
