<script lang="ts">
  import ThemeToggle from './ThemeToggle.svelte';

  export let title: string;
</script>

<header class="h-16 md:h-24 flex items-center justify-between">
  <a href="/" class="font-serif text-xl md:text-[22px] font-semibold text-ink hover:opacity-70 transition-opacity">
    {title}
  </a>
  <ThemeToggle />
</header>
