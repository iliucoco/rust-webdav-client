<!-- 主内容区域组件 - 显示文件浏览器或空状态 -->
<script lang="ts">
  import Toolbar from "./Toolbar.svelte";
  import FileList from "../browser/FileList.svelte";
  import PreviewPanel from "../preview/PreviewPanel.svelte";
  import EmptyState from "../browser/EmptyState.svelte";
  import { getIsOpen } from "../../stores/preview.svelte";
  import { resetToRoot } from "../../stores/browser.svelte";

  /** 连接状态属性 */
  let { connected } = $props();
  /** 上一次的连接状态 - 用于检测状态变化 */
  let prevConnected = $state(false);

  /** 连接建立时重置浏览到根目录 */
  $effect(() => {
    if (connected && !prevConnected) {
      resetToRoot();
    }
    prevConnected = connected;
  });
</script>

<div class="flex flex-1 flex-col overflow-hidden">
  {#if connected}
    <!-- 已连接：显示工具栏 + 文件列表 + 预览面板 -->
    <Toolbar />
    <div class="relative flex-1 overflow-hidden">
      <FileList />
      {#if getIsOpen()}
        <PreviewPanel />
      {/if}
    </div>
  {:else}
    <!-- 未连接：显示欢迎空状态 -->
    <EmptyState />
  {/if}
</div>
