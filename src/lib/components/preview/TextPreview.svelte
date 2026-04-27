<script lang="ts">
  import { _, t } from "svelte-i18n";
  import { get } from "svelte/store";
  import { saveContent, getFileName } from "../../stores/preview.svelte";
  import { showToast } from "../../stores/toast.svelte";
  import { showConfirm } from "../../stores/dialog.svelte";

  let { data, editing = false } = $props<{
    data: string;
    editing: boolean;
  }>();

  let content = $state("");

  $effect(() => {
    content = data;
  });

  function tr(key: string, options?: { values?: Record<string, string | number> }): string {
    return get(t)(key, options)?.toString() || "";
  }

  async function handleSave() {
    const fileName = getFileName() || "";
    const confirmed = await showConfirm(
      tr("dialog.saveConfirm", { values: { name: fileName } }),
      tr("dialog.confirmTitle"),
      tr("dialog.confirmOk"),
      tr("dialog.confirmCancel"),
    );
    if (confirmed) {
      try {
        await saveContent(content);
        showToast($t("preview.fileSaved"), "success");
      } catch (e) {
        showToast($t("preview.saveFailed") + " " + e, "error");
      }
    }
  }
</script>

<div class="flex h-full flex-col">
  {#if editing}
    <div class="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-1.5">
      <button
        class="rounded-md bg-green-500 px-3 py-1 text-xs text-white hover:bg-green-600"
        onclick={handleSave}
      >
        {$_("preview.save")}
      </button>
    </div>
  {/if}
  <div class="flex-1 overflow-auto">
    {#if editing}
      <textarea
        bind:value={content}
        class="h-full w-full resize-none bg-[var(--color-bg-primary)] p-4 font-mono text-sm outline-none"
        spellcheck="false"
      ></textarea>
    {:else}
      <pre class="p-4 font-mono text-sm whitespace-pre-wrap">{data}</pre>
    {/if}
  </div>
</div>
