<script lang="ts">
  export let id: string;
  export let content: string;
  export let createdAt: string;

  let expanded = false;

  $: formattedDate = new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  $: formattedTime = new Date(createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  // 内容预览：截取前 20 个字符
  $: preview = content.length > 20 ? content.slice(0, 20) + '...' : content;
  // 是否需要展开功能（内容超过 20 字符）
  $: needsExpand = content.length > 20;

  function toggle() {
    if (needsExpand) {
      expanded = !expanded;
    }
  }
</script>

{#if expanded}
  <!-- 展开状态：卡片形式 -->
  <button
    type="button"
    on:click={toggle}
    class="w-full text-left bg-white dark:bg-stone-900 rounded-2xl border border-[#0D6E6E] dark:border-teal-500 p-4 transition cursor-pointer"
  >
    <!-- Meta -->
    <div class="flex items-center justify-between mb-2.5">
      <div class="flex items-center gap-2">
        <span class="font-mono text-xs text-[#888888] dark:text-stone-500">
          {formattedDate} · {formattedTime}
        </span>
        <span class="px-2 py-0.5 bg-[#E8F5F5] dark:bg-teal-900/30 text-[#0D6E6E] dark:text-teal-400 text-[11px] font-medium rounded-full">
          Quick Note
        </span>
      </div>
      <svg class="w-4 h-4 text-[#888888] dark:text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
      </svg>
    </div>

    <!-- Content -->
    <p class="text-sm text-[#666666] dark:text-stone-400 leading-relaxed whitespace-pre-wrap">
      {content}
    </p>
  </button>
{:else}
  <!-- 收缩状态：胶囊形式 -->
  <button
    type="button"
    on:click={toggle}
    class="group inline-flex items-center gap-2 h-11 md:h-10 px-4 bg-white dark:bg-stone-900 rounded-full border border-[#E5E5E5] dark:border-stone-700 hover:border-[#0D6E6E] dark:hover:border-teal-500 transition-colors w-full md:w-fit {needsExpand ? 'cursor-pointer' : 'cursor-default'}"
  >
    <span class="font-mono text-xs text-[#888888] dark:text-stone-500 flex-shrink-0">
      {formattedDate}
    </span>
    <span class="px-2 py-0.5 bg-[#E8F5F5] dark:bg-teal-900/30 text-[#0D6E6E] dark:text-teal-400 text-[11px] font-medium rounded-full flex-shrink-0">
      Quick Note
    </span>
    <span class="text-[13px] text-[#666666] dark:text-stone-400 truncate">
      {preview}
    </span>
    {#if needsExpand}
      <svg class="w-4 h-4 text-[#888888] dark:text-stone-500 flex-shrink-0 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
      </svg>
    {/if}
  </button>
{/if}
