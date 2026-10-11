<script lang="ts">
  import type { AdminDocument } from '$lib/api';

  export let doc: AdminDocument;

  function shortDate(iso: string) {
    const d = new Date(iso);
    const sameYear = d.getFullYear() === new Date().getFullYear();
    return d.toLocaleString('en-US', {
      ...(sameYear ? {} : { year: 'numeric' }),
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    });
  }
</script>

<div class="group flex items-center gap-3 md:gap-4 px-4 md:px-5 min-h-[56px] py-3 border-t border-line first:border-t-0 hover:bg-ink/[0.02] transition-colors">
  <a href="/admin/documents/{doc.id}" class="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
    <span class="flex items-center gap-2 min-w-0 md:flex-1">
      <span class="truncate text-sm font-medium text-ink">{doc.title}</span>
      {#if doc.is_private}
        <svg class="w-3 h-3 flex-shrink-0 text-faint" fill="currentColor" viewBox="0 0 20 20" aria-label="Private">
          <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
        </svg>
      {/if}
    </span>
    <span class="flex items-center gap-3 md:gap-4 text-xs">
      <span class="flex-shrink-0 md:w-16 truncate text-muted {doc.folder ? '' : 'hidden md:block'}">{doc.folder?.name || ''}</span>
      <span class="flex-shrink-0 inline-flex items-center gap-1.5 md:w-[76px] text-muted">
        <span class="w-1.5 h-1.5 rounded-full {doc.is_published ? 'bg-accent' : 'bg-warn'}"></span>
        {doc.is_published ? 'Published' : 'Draft'}
      </span>
      <span class="font-mono text-faint whitespace-nowrap md:w-[150px] md:text-right">{shortDate(doc.updated_at)}</span>
    </span>
  </a>
  <slot />
</div>
