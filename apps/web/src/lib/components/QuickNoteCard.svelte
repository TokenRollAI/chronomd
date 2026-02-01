<script lang="ts">
  export let id: string;
  export let content: string;
  export let createdAt: string;

  $: formattedDate = new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  $: formattedTime = new Date(createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
</script>

<div class="bg-white dark:bg-stone-900 rounded-xl border border-[#E5E5E5] dark:border-stone-700 p-4 md:p-4 transition hover:border-[#0D6E6E] dark:hover:border-teal-500">
  <!-- Meta -->
  <div class="flex items-center gap-2 mb-2">
    <span class="font-mono text-xs text-[#888888] dark:text-stone-500">
      {formattedDate} · {formattedTime}
    </span>
    <span class="px-2 py-0.5 bg-[#E8F5F5] dark:bg-teal-900/30 text-[#0D6E6E] dark:text-teal-400 text-[11px] font-medium rounded-full">
      Quick Note
    </span>
  </div>

  <!-- Content -->
  <p class="text-sm text-[#666666] dark:text-stone-400 leading-relaxed whitespace-pre-wrap">
    {content}
  </p>
</div>
