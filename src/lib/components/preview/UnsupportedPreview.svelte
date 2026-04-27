<script lang="ts">
  import { _ } from "svelte-i18n";
</script>

<div class="flex h-full items-center justify-center">
  <div class="text-center">
    <svg class="mx-auto h-12 w-12 text-[var(--color-text-secondary)]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
    <p class="mt-3 text-sm text-[var(--color-text-secondary)]">
      {$_("preview.notAvailable")}
    </p>
    <p class="mt-1 text-xs text-[var(--color-text-secondary)]/60">
      {$_("preview.downloadHint")}
    </p>
  </div>
</div>
