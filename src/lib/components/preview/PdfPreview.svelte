<script lang="ts">
  let { data } = $props<{ data: ArrayBuffer }>();

  let canvasEl: HTMLCanvasElement | undefined = $state();
  let pageCount = $state(0);
  let currentPage = $state(1);
  let pdfDoc: any = null;

  async function renderPage(pageNum: number) {
    if (!pdfDoc || !canvasEl) return;
    const page = await pdfDoc.getPage(pageNum);
    const scale = 1.5;
    const viewport = page.getViewport({ scale });
    canvasEl.width = viewport.width;
    canvasEl.height = viewport.height;
    const ctx = canvasEl.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport }).promise;
  }

  $effect(() => {
    (async () => {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();

      const loadingTask = pdfjsLib.getDocument({ data });
      pdfDoc = await loadingTask.promise;
      pageCount = pdfDoc.numPages;
      currentPage = 1;
      await renderPage(1);
    })();
  });

  async function goToPage(n: number) {
    if (n < 1 || n > pageCount) return;
    currentPage = n;
    await renderPage(n);
  }
</script>

<div class="flex h-full flex-col items-center">
  {#if pageCount > 0}
    <div class="flex items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-1.5 w-full">
      <button
        class="rounded px-2 py-0.5 text-xs hover:bg-[var(--color-accent)]/10"
        onclick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
      >Prev</button>
      <span class="text-xs text-[var(--color-text-secondary)]">
        {currentPage} / {pageCount}
      </span>
      <button
        class="rounded px-2 py-0.5 text-xs hover:bg-[var(--color-accent)]/10"
        onclick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= pageCount}
      >Next</button>
    </div>
  {/if}
  <div class="flex-1 overflow-auto p-4">
    <canvas bind:this={canvasEl}></canvas>
  </div>
</div>
