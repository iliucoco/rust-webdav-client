<script lang="ts">
  import type { FileMetadata } from "../../types";
  import { getFileCategory, formatFileSize, formatDate, getFileIcon } from "../../utils/file-types";

  let { item, selected = false, onselect, ondblclick, oncheckbox, oncontextmenu } = $props<{
    item: FileMetadata;
    selected: boolean;
    onselect: () => void;
    ondblclick: () => void;
    oncheckbox: () => void;
    oncontextmenu: (e: MouseEvent) => void;
  }>();

  const category = getFileCategory(item.name, item.content_type);
  const icon = getFileIcon(category, item.is_dir);

  function handleCheckboxClick(e: Event) {
    e.stopPropagation();
    oncheckbox();
  }
</script>

<div
  class="grid grid-cols-[auto_1fr_100px_160px] gap-4 border-b border-[var(--color-border)] px-4 py-2 text-left text-sm transition-colors items-center {selected
    ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
    : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]'}"
  role="row"
  oncontextmenu={oncontextmenu}
>
  <!-- 选择框 -->
  <div class="shrink-0">
    <input
      type="checkbox"
      bind:checked={selected}
      onclick={handleCheckboxClick}
    />
  </div>
  <!-- 文件图标和名称 -->
  <button class="flex items-center gap-2 truncate w-full text-left" onclick={onselect} ondblclick={ondblclick}>
    {#if item.is_dir}
      <svg class="h-4 w-4 shrink-0 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/></svg>
    {:else}
      <svg class="h-4 w-4 shrink-0 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    {/if}
    <span class="truncate">{item.name}</span>
  </button>
  <!-- 文件大小 -->
  <span class="text-right text-[var(--color-text-secondary)]">{item.is_dir ? "-" : formatFileSize(item.size)}</span>
  <!-- 修改时间 -->
  <span class="text-[var(--color-text-secondary)]">{formatDate(item.modified)}</span>
</div>
