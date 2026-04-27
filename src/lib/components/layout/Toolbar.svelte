<script lang="ts">
  import { _, t } from "svelte-i18n";
  import { get } from "svelte/store";
  import {
    getCurrentPath,
    getPathSegments,
    navigateTo,
    refresh,
    getLoading,
    getSelectedPaths,
    renameItem,
    moveItems,
    copyItems,
  } from "../../stores/browser.svelte";
  import { showToast } from "../../stores/toast.svelte";
  import { showConfirm } from "../../stores/dialog.svelte";
  import { api } from "../../api";
  import BreadcrumbNav from "../browser/BreadcrumbNav.svelte";

  function tr(key: string, options?: { values?: Record<string, string | number> }): string {
    return get(t)(key, options)?.toString() || "";
  }

  /** 操作模式 - 用于批量操作时选择目标目录 */
  let actionMode = $state<{ type: "copy" | "move"; paths: string[] } | null>(null);

  /** 重命名 - 使用弹窗形式 */
  async function startRename() {
    const paths = Array.from(getSelectedPaths());
    if (paths.length !== 1) {
      showToast("请选择一个文件进行重命名", "info");
      return;
    }
    const currentName = paths[0].split("/").pop() || "";
    const newName = prompt("请输入新名称:", currentName);
    if (newName && newName.trim() && newName.trim() !== currentName) {
      const confirmed = await showConfirm(
        tr("dialog.renameConfirm", { values: { oldName: currentName, newName: newName.trim() } }),
        tr("dialog.confirmTitle"),
        tr("dialog.confirmOk"),
        tr("dialog.confirmCancel"),
      );
      if (confirmed) {
        await renameItem(paths[0], newName.trim());
      }
    }
  }

  /** 开始批量复制模式 */
  export function startCopy() {
    const paths = Array.from(getSelectedPaths());
    if (paths.length === 0) return;
    actionMode = { type: "copy", paths };
  }

  /** 开始批量移动模式 */
  export function startMove() {
    const paths = Array.from(getSelectedPaths());
    if (paths.length === 0) return;
    actionMode = { type: "move", paths };
  }

  /** 取消批量操作 */
  function cancelActionMode() {
    actionMode = null;
  }

  /** 确认执行批量操作 - 复制/移动到当前目录 */
  async function confirmActionMode() {
    if (!actionMode) return;
    const targetDir = getCurrentPath();
    const count = actionMode.paths.length;
    const messageKey = actionMode.type === "copy" ? "dialog.copyConfirmMany" : "dialog.moveConfirmMany";
    const confirmed = await showConfirm(
      tr(messageKey, { values: { count, target: targetDir } }),
      tr("dialog.confirmTitle"),
      tr("dialog.confirmOk"),
      tr("dialog.confirmCancel"),
    );
    if (confirmed) {
      if (actionMode.type === "copy") {
        await copyItems(actionMode.paths, targetDir);
      } else {
        await moveItems(actionMode.paths, targetDir);
      }
      cancelActionMode();
    }
  }

  /** 删除选中的文件 */
  export async function deleteSelected() {
    const paths = getSelectedPaths();
    if (paths.size === 0) return;
    const count = paths.size;

    const confirmed = await showConfirm(
      tr("dialog.deleteConfirmMany", { values: { count } }),
      tr("dialog.confirmTitle"),
      tr("dialog.confirmOk"),
      tr("dialog.confirmCancel"),
    );
    if (confirmed) {
      try {
        for (const path of paths) {
          await api.operations.deleteItem(path);
        }
        showToast(tr("toolbar.deleted"), "success");
        await refresh();
      } catch (e) {
        showToast(tr("toolbar.deleteFailed", { values: { error: String(e) } }), "error");
      }
    }
  }

  /** 下载选中的文件 */
  export async function downloadSelected() {
    const paths = getSelectedPaths();
    if (paths.size === 0) return;

    try {
      const { save } = await import("@tauri-apps/plugin-dialog");
      for (const path of paths) {
        const fileName = path.split("/").pop() ?? "download";
        const destPath = await save({ defaultPath: fileName });
        if (destPath) {
          await api.download.downloadFileTo(path, destPath);
        }
      }
      showToast($t("toolbar.downloadSuccess"), "success");
    } catch (e) {
      showToast($t("toolbar.downloadFailed") + " " + e, "error");
    }
  }

  function joinPath(base: string, name: string): string {
    const trimmedBase = base.trim();
    // Handle root case
    if (trimmedBase === "/" || trimmedBase === "") {
      return "/" + name;
    }
    // Remove trailing slash from base
    const normalizedBase = trimmedBase.replace(/\/$/, "");
    return normalizedBase + "/" + name;
  }

  async function handleUpload() {
    try {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const result = await open({ multiple: true });
      if (!result) return;
      const files = Array.isArray(result) ? result : [result];
      for (const file of files) {
        const fileStr = String(file);
        const fileName = fileStr.split("/").pop()?.split("\\").pop() ?? "file";
        const remotePath = joinPath(getCurrentPath(), fileName);
        await api.upload.uploadLocalFile(remotePath, fileStr);
      }
      showToast($t("toolbar.uploadSuccess"), "success");
      await refresh();
    } catch (e) {
      showToast($t("toolbar.uploadFailed") + " " + e, "error");
    }
  }

  async function handleNewFolder() {
    const name = prompt($t("connection.folderName")?.toString() || "Folder name:");
    if (!name) return;
    try {
      const path = joinPath(getCurrentPath(), name);
      await api.operations.createFolder(path);
      showToast($t("toolbar.folderCreated"), "success");
      await refresh();
    } catch (e) {
      showToast($t("toolbar.folderFailed") + " " + e, "error");
    }
  }

  async function handleDelete() {
    await deleteSelected();
  }

  async function handleDownload() {
    const paths = getSelectedPaths();
    if (paths.size === 0) return;

    try {
      const { save } = await import("@tauri-apps/plugin-dialog");
      for (const path of paths) {
        const fileName = path.split("/").pop() ?? "download";
        const destPath = await save({ defaultPath: fileName });
        if (destPath) {
          await api.download.downloadFileTo(path, destPath);
        }
      }
      showToast($t("toolbar.downloadSuccess"), "success");
    } catch (e) {
      showToast($t("toolbar.downloadFailed") + " " + e, "error");
    }
  }

  function handleRefresh() {
    refresh();
  }
</script>

<div class="flex min-w-full items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-2">
    <!-- 面包屑或操作状态显示 -->
    {#if actionMode}
      <div class="flex items-center gap-2 bg-[var(--color-accent)]/10 rounded-md px-3 py-1">
        <span class="text-xs text-[var(--color-accent)]">
          {actionMode.type === "copy" ? "复制" : "移动"} {actionMode.paths.length} 个项目到:
        </span>
        <span class="text-xs font-medium text-[var(--color-text-primary)]">{getCurrentPath()}</span>
        <button
          class="rounded bg-[var(--color-accent)] px-2 py-0.5 text-xs text-white hover:bg-[var(--color-accent-hover)]"
          onclick={confirmActionMode}
        >
          确认
        </button>
        <button
          class="rounded border border-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-primary)]"
          onclick={cancelActionMode}
        >
          取消
        </button>
      </div>
    {:else}
      <BreadcrumbNav segments={getPathSegments()} {navigateTo} />
    {/if}

    <div class="ml-auto flex shrink-0 items-center gap-1">
    {#if getCurrentPath() !== "/"}
      <button
        class="rounded-md p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-accent)]"
        onclick={handleUpload}
        title={$_("toolbar.upload")}
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
      </button>
      <button
        class="rounded-md p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-accent)]"
        onclick={handleNewFolder}
        title={$_("toolbar.newFolder")}
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
      </button>
    {/if}
    {#if getSelectedPaths().size > 0 && !actionMode}
      <button
        class="rounded-md p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-accent)]"
        onclick={startRename}
        title="重命名"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
      </button>
      <button
        class="rounded-md p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-accent)]"
        onclick={startCopy}
        title="复制"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
      </button>
      <button
        class="rounded-md p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-accent)]"
        onclick={startMove}
        title="移动"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
      </button>
      <button
        class="rounded-md p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-accent)]"
        onclick={handleDownload}
        title={$_("toolbar.download")}
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
      </button>
      <button
        class="rounded-md p-2 text-red-500 hover:bg-red-500/10"
        onclick={handleDelete}
        title={$_("toolbar.delete")}
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      </button>
    {/if}
    <button
      class="rounded-md p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-accent)]"
      onclick={handleRefresh}
      title={$_("toolbar.refresh")}
      disabled={getLoading()}
    >
      <svg class="h-4 w-4 {getLoading() ? 'animate-spin' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
    </button>
  </div>
</div>
