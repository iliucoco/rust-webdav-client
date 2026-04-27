<script lang="ts">
  import { _ } from "svelte-i18n";
</script>

<div class="flex flex-1 items-center justify-center">
  <div class="text-center">
    <svg class="mx-auto h-16 w-16 text-[var(--color-text-secondary)]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
    <p class="mt-4 text-lg font-medium text-[var(--color-text-secondary)]">{$_("empty.title")}</p>
    <p class="mt-1 text-sm text-[var(--color-text-secondary)]/60">{$_("empty.subtitle")}</p>
  </div>
</div>
