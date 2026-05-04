<!-- WebDAV 连接表单组件 - 新建/编辑连接配置 -->
<script lang="ts">
  import { untrack } from "svelte";
  import { _, t } from "svelte-i18n";
  import { saveProfile, testConnection, getProfiles, deleteProfile } from "../../stores/connections.svelte";
  import { showToast } from "../../stores/toast.svelte";
  import type { ConnectionProfile } from "../../types";

  /** 组件属性：编辑的连接 ID 和关闭回调 */
  let { editId = null, onClose } = $props<{
    editId: string | null;
    onClose: () => void;
  }>();

  /** 连接名称 */
  let name = $state("");
  /** WebDAV 服务器 URL */
  let url = $state("");
  /** 用户名 */
  let username = $state("");
  /** 密码 */
  let password = $state("");
  /** 是否正在测试连接 */
  let testing = $state(false);
  /** 密码是否可见 */
  let showPwd = $state(false);

  /** 编辑模式下加载现有配置 */
  $effect(() => {
    const id = editId;
    untrack(() => {
      const existing = id ? getProfiles().find((p) => p.id === id) : null;
      name = existing?.name ?? "";
      url = existing?.url ?? "";
      username = existing?.username ?? "";
      password = existing?.password ?? "";
    });
  });

  /** 保存连接配置 */
  async function handleSave() {
    if (!name || !url || !username) {
      showToast($t("connection.allRequired"), "error");
      return;
    }
    const existing = editId ? getProfiles().find((p) => p.id === editId) : null;
    const profile: ConnectionProfile = {
      id: existing?.id ?? crypto.randomUUID(),
      name,
      url: url.endsWith("/") ? url : url + "/", // 确保 URL 以 / 结尾
      username,
      password,
    };
    try {
      await saveProfile(profile);
      showToast($t("connection.saveSuccess"), "success");
      onClose();
    } catch (e) {
      showToast($t("connection.saveFailed") + " " + e, "error");
    }
  }

  /** 测试连接配置是否有效 */
  async function handleTest() {
    if (!url || !username) {
      showToast($t("connection.requiredFields"), "error");
      return;
    }
    testing = true;
    try {
      const ok = await testConnection({
        id: "test",
        name,
        url: url.endsWith("/") ? url : url + "/",
        username,
        password,
      });
      if (ok) {
        showToast($t("connection.testSuccess"), "success");
      } else {
        showToast($t("connection.testFailed"), "error");
      }
    } catch (e) {
      showToast($t("connection.testError") + " " + e, "error");
    } finally {
      testing = false;
    }
  }

  /** 删除连接配置 */
  async function handleDelete() {
    if (!editId) return;
    const profileName = getProfiles().find((p) => p.id === editId)?.name;
    if (!confirm($t("dialog.deleteConfirm", { values: { name: profileName || "" } }))) {
      return;
    }
    try {
      await deleteProfile(editId);
      showToast($t("toolbar.deleted"), "success");
      onClose();
    } catch (e) {
      showToast($t("toolbar.deleteFailed", { values: { error: String(e) } }), "error");
    }
  }
</script>

<!-- 遮罩层 -->
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onclick={onClose}>
  <!-- 弹窗主体 -->
  <div
    class="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] shadow-xl"
    onclick={(e) => e.stopPropagation()}
  >
    <!-- 标题栏 -->
    <div class="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3">
      <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">{editId ? $_("connection.edit") : $_("connection.new")}</h3>
      <button
        class="rounded-md p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
        onclick={onClose}
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    <!-- 表单内容 -->
    <div class="space-y-3 p-5">
      <input
        type="text"
        placeholder={$_("connection.namePlaceholder")}
        bind:value={name}
        class="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
      />
      <input
        type="url"
        placeholder={$_("connection.urlPlaceholder")}
        bind:value={url}
        class="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
      />
      <input
        type="text"
        placeholder={$_("connection.usernamePlaceholder")}
        bind:value={username}
        class="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
      />
      <div class="relative">
        <input
          type={showPwd ? "text" : "password"}
          placeholder={$_("connection.passwordPlaceholder")}
          bind:value={password}
          class="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] pr-9 px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
        />
        <button
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          onclick={() => showPwd = !showPwd}
        >
          {#if showPwd}
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" />
            </svg>
          {:else}
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          {/if}
        </button>
      </div>
      <!-- 操作按钮 -->
      <div class="flex items-center gap-2 pt-2">
        <button
          class="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm text-white hover:bg-[var(--color-accent-hover)]"
          onclick={handleSave}
        >
          {$_("connection.save")}
        </button>
        <button
          class="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm hover:bg-[var(--color-bg-secondary)]"
          onclick={handleTest}
          disabled={testing}
        >
          {testing ? $_("connection.testing") : $_("connection.test")}
        </button>
        <div class="flex-1"></div>
        {#if editId}
          <button
            class="rounded-md border border-[var(--color-danger)] px-4 py-2 text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10"
            onclick={handleDelete}
          >
            {$_("connection.delete")}
          </button>
        {/if}
        <button
          class="rounded-md px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          onclick={onClose}
        >
          {$_("connection.cancel")}
        </button>
      </div>
    </div>
  </div>
</div>
