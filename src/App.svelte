<!-- 应用根组件 - 整体布局容器 -->
<script lang="ts">
  import { onMount } from "svelte";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { invoke } from "@tauri-apps/api/core";
  import { _ } from "svelte-i18n";
  import { showConfirm } from "./lib/stores/dialog.svelte";
  import Sidebar from "./lib/components/layout/Sidebar.svelte";
  import MainContent from "./lib/components/layout/MainContent.svelte";
  import ConfirmDialog from "./lib/components/common/ConfirmDialog.svelte";
  import ToastContainer from "./lib/components/common/ToastContainer.svelte";

  /** 是否已连接到 WebDAV 服务器 */
  let connected = $state(false);

  onMount(() => {
    const unlisten = getCurrentWindow().listen("close-requested", async () => {
      const confirmed = await showConfirm(
        $_("app.quitConfirm"),
        $_("dialog.confirmTitle"),
        $_("app.quit"),
        $_("app.quitCancel"),
      );
      if (confirmed) {
        await invoke("confirm_exit");
      }
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  });
</script>

<!-- 全屏应用容器 - 侧边栏 + 主内容区布局 -->
<div class="flex h-screen w-screen overflow-hidden bg-[var(--color-bg-primary)]">
  <Sidebar bind:connected />
  <MainContent {connected} />
</div>

<!-- 全局确认对话框 -->
<ConfirmDialog />

<!-- 全局 Toast 通知 -->
<ToastContainer />
