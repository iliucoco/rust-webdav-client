<!-- 应用根组件 - 整体布局容器 -->
<script lang="ts">
  import { onMount } from "svelte";
  import Sidebar from "./lib/components/layout/Sidebar.svelte";
  import MainContent from "./lib/components/layout/MainContent.svelte";
  import ConfirmDialog from "./lib/components/common/ConfirmDialog.svelte";

  /** 是否已连接到 WebDAV 服务器 */
  let connected = $state(false);

  onMount(() => {
    // 后续将由连接状态管理
  });
</script>

<!-- 全屏应用容器 - 侧边栏 + 主内容区布局 -->
<div class="flex h-screen w-screen overflow-hidden bg-[var(--color-bg-primary)]">
  <Sidebar bind:connected />
  <MainContent {connected} />
</div>

<!-- 全局确认对话框 -->
<ConfirmDialog />
