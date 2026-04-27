<!-- 右键菜单组件 -->
<script lang="ts">
  let { x = 0, y = 0, items, onClose } = $props<{
    x: number;
    y: number;
    items: { label: string; icon?: string; action: () => void }[];
    onClose: () => void;
  }>();

  function handleClickOutside(e: Event) {
    const target = e.target as HTMLElement;
    if (!target.closest(".context-menu")) {
      onClose();
    }
  }

  $effect(() => {
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("contextmenu", onClose);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("contextmenu", onClose);
    };
  });
</script>

<div
  class="context-menu fixed z-50 min-w-[140px] rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] py-1 shadow-lg"
  style="left: {x}px; top: {y}px;"
  onclick={onClose}
>
  {#each items as item}
    <button
      class="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-accent)]"
      onclick={item.action}
    >
      {#if item.icon}
        <span class="w-4 text-center">{item.icon}</span>
      {/if}
      <span>{item.label}</span>
    </button>
  {/each}
</div>
