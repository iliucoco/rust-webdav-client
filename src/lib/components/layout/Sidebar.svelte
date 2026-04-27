<script lang="ts">
  import { _ } from "svelte-i18n";
  import { setLocale } from "../../i18n";
  import {
    getProfiles,
    getActiveId,
    getLoading,
    loadProfiles,
    connect,
    disconnect,
  } from "../../stores/connections.svelte";
  import { getTheme, toggleTheme } from "../../stores/theme.svelte";
  import ConnectionForm from "../connection/ConnectionForm.svelte";

  let { connected = $bindable(false) } = $props();
  let showForm = $state(false);
  let editingId = $state<string | null>(null);

  let currentLocale = $state(
    typeof localStorage !== "undefined" ? localStorage.getItem("locale") || "zh-CN" : "zh-CN"
  );

  $effect(() => {
    loadProfiles();
  });

  async function handleConnect(id: string) {
    try {
      await connect(id);
      connected = true;
    } catch {
      // error handled in store
    }
  }

  async function handleDisconnect() {
    await disconnect();
    connected = false;
  }

  function handleEdit(id: string) {
    editingId = id;
    showForm = true;
  }

  function toggleLocale() {
    const next = currentLocale === "zh-CN" ? "en" : "zh-CN";
    currentLocale = next;
    setLocale(next);
  }
</script>

<aside class="flex h-full w-64 flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-sidebar)]">
  <div class="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
    <h2 class="text-sm font-semibold text-[var(--color-text-primary)]">{$_("connection.title")}</h2>
    <button
      class="rounded-md px-2 py-1 text-xs text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10"
      onclick={() => { editingId = null; showForm = true; }}
    >
      {$_("connection.add")}
    </button>
  </div>

  <div class="flex-1 overflow-y-auto p-2">
    {#if getLoading()}
      <div class="px-2 py-4 text-center text-sm text-[var(--color-text-secondary)]">{$_("connection.loading")}</div>
    {:else if getProfiles().length === 0}
      <div class="px-2 py-4 text-center text-sm text-[var(--color-text-secondary)]">
        {$_("connection.noConnections")}<br />{$_("connection.noConnectionsHint")}
      </div>
    {:else}
      {#each getProfiles() as profile (profile.id)}
        <button
          class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors {getActiveId() === profile.id
            ? 'bg-[var(--color-accent)] text-white'
            : 'text-[var(--color-text-primary)] hover:bg-[var(--color-accent)]/10'}"
          onclick={() => {
            if (getActiveId() === profile.id) {
              handleDisconnect();
            } else {
              handleConnect(profile.id);
            }
          }}
          oncontextmenu={() => handleEdit(profile.id)}
        >
          <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          <span class="truncate">{profile.name}</span>
        </button>
      {/each}
    {/if}
  </div>

  {#if showForm}
    <ConnectionForm
      editId={editingId}
      onClose={() => { showForm = false; editingId = null; }}
    />
  {/if}

  <div class="border-t border-[var(--color-border)] px-4 py-2 flex gap-2">
    <button
      class="flex-1 rounded-md px-3 py-1.5 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-accent)]"
      onclick={toggleLocale}
    >
      {currentLocale === "zh-CN" ? "English" : "中文"}
    </button>
    <button
      class="shrink-0 rounded-md px-3 py-1.5 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-accent)]"
      onclick={toggleTheme}
      title="切换主题（当前：{getTheme()}）"
    >
      {#if getTheme() === "light"}
        ☀️
      {:else if getTheme() === "dark"}
        🌙
      {:else}
        🖥️
      {/if}
    </button>
  </div>
</aside>
