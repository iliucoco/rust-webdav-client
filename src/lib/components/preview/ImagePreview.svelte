<script lang="ts">
  let { data } = $props<{ data: ArrayBuffer | Uint8Array | number[] }>();

  let blobUrl = $state<string | null>(null);
  let loadError = $state<string | null>(null);

  $effect(() => {
    loadError = null;
    blobUrl = null;

    let bytes: Uint8Array;
    if (data instanceof Uint8Array) {
      bytes = data;
    } else if (data instanceof ArrayBuffer) {
      bytes = new Uint8Array(data);
    } else if (Array.isArray(data)) {
      bytes = new Uint8Array(data);
    } else if (typeof data === "object" && data !== null) {
      bytes = new Uint8Array(Object.values(data) as number[]);
    } else {
      loadError = "Invalid image data format";
      return;
    }

    if (bytes.length === 0) {
      loadError = "No image data received";
      return;
    }

    let mimeType = "image/jpeg";
    if (bytes.length >= 2 && bytes[0] === 0xFF && bytes[1] === 0xD8) mimeType = "image/jpeg";
    else if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) mimeType = "image/png";

    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: mimeType });
    const url = URL.createObjectURL(blob);
    blobUrl = url;

    return () => URL.revokeObjectURL(url);
  });
</script>

<div class="flex h-full items-center justify-center overflow-auto p-4">
  {#if loadError}
    <div class="text-center text-red-500">
      <svg class="mx-auto mb-2 h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.664 1.732-3L13.732 4c-.77-1.336-2.691-1.336-3.464 0L3.34 16c-.77 1.336.192 3 1.732 3z" />
      </svg>
      {loadError}
    </div>
  {:else if !blobUrl}
    <div class="flex flex-col items-center justify-center gap-3">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent"></div>
      <span class="text-sm text-[var(--color-text-secondary)]">Loading image...</span>
    </div>
  {:else}
    <img src={blobUrl} alt="Preview" class="max-h-full max-w-full object-contain" onerror={() => loadError = "Failed to load image"} />
  {/if}
</div>
