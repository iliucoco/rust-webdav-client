<script lang="ts">
  let { data, type, fileName } = $props<{
    data: ArrayBuffer;
    type: "audio" | "video";
    fileName: string;
  }>();

  let blobUrl = $state("");

  const mimeMap: Record<string, string> = {
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    flac: "audio/flac",
    aac: "audio/aac",
    m4a: "audio/mp4",
    mp4: "video/mp4",
    webm: "video/webm",
    mkv: "video/x-matroska",
    avi: "video/x-msvideo",
    mov: "video/quicktime",
  };

  function getMime(): string {
    const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
    return mimeMap[ext] ?? (type === "audio" ? "audio/mpeg" : "video/mp4");
  }

  $effect(() => {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    const blob = new Blob([data], { type: getMime() });
    blobUrl = URL.createObjectURL(blob);
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  });
</script>

<div class="flex h-full items-center justify-center p-4">
  {#if blobUrl}
    {#if type === "audio"}
      <audio controls src={blobUrl} class="w-full max-w-lg"></audio>
    {:else}
      <video controls src={blobUrl} class="max-h-full max-w-full">
        <track kind="captions" />
      </video>
    {/if}
  {/if}
</div>
