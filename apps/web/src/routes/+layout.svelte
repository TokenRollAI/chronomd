<script lang="ts">
  import '../app.css';
  import { theme } from '$lib/stores/theme';

  // Subscribe to keep store alive on client
  $: $theme;
</script>

<slot />
