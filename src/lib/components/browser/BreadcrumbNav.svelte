<script lang="ts">
  import { _ } from "svelte-i18n";

  let { segments, navigateTo } = $props<{
    segments: { name: string; path: string }[];
    navigateTo: (path: string) => void;
  }>();

  function displayName(segment: { name: string; path: string }, i: number): string {
    if (i === 0) return $_("browser.root")?.toString() || segment.name;
    return segment.name;
  }
</script>

<nav class="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto text-sm">
  {#each segments as segment, i}
    {#if i > 0}
      <span class="text-[var(--color-text-secondary)]">/</span>
    {/if}
    <button
      class="shrink-0 rounded px-1.5 py-0.5 hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-accent)] {i === segments.length - 1
        ? 'font-medium text-[var(--color-text-primary)]'
        : 'text-[var(--color-text-secondary)]'}"
      onclick={() => navigateTo(segment.path)}
    >
      {displayName(segment, i)}
    </button>
  {/each}
</nav>
