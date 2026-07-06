import { FORMATS } from '@/constants/formats';
import type { FormatKey } from '@/constants/formats';
import { flattenPageImage } from '@/utils/carouselExport';
import { captureCardPng } from '@/utils/exportCard';
import { useSnipitStore } from '@/store/snipitStore';

export interface ExportRenderTarget {
  formatKey: FormatKey;
  pageIndex: number;
  flattenedUrl: string | null;
}

export interface CardExportEntry {
  formatKey: FormatKey;
  pageIndex: number;
  filename: string;
}

export interface ExportLoopProgress {
  completed: number;
  total: number;
  detail: string;
}

export interface RunCardExportLoopOptions {
  node: HTMLElement;
  entries: CardExportEntry[];
  setRenderTarget: (target: ExportRenderTarget | null) => void;
  onProgress: (progress: ExportLoopProgress) => void;
  writeFile: (blob: Blob, filename: string, index: number) => Promise<void>;
  waitForPaint?: () => Promise<void>;
}

function defaultWaitForPaint(): Promise<void> {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve());
    });
  });
}

export async function runCardExportLoop({
  node,
  entries,
  setRenderTarget,
  onProgress,
  writeFile,
  waitForPaint = defaultWaitForPaint,
}: RunCardExportLoopOptions): Promise<{ width: number; height: number } | null> {
  const state = useSnipitStore.getState();
  const flattenedCache = new Map<string, string | null>();
  let completed = 0;
  const total = entries.length;
  let lastSize: { width: number; height: number } | null = null;

  onProgress({ completed: 0, total, detail: 'Preparing…' });

  try {
    for (let index = 0; index < entries.length; index += 1) {
      const entry = entries[index];
      const page = state.pages[entry.pageIndex];
      const formatSpec = FORMATS[entry.formatKey];
      const cacheKey = `${entry.formatKey}:${page.id}`;

      let flattenedUrl: string | null = null;
      if (page.imageMode !== 'none' && page.articleImageObjectUrl) {
        if (flattenedCache.has(cacheKey)) {
          flattenedUrl = flattenedCache.get(cacheKey) ?? null;
        } else {
          flattenedUrl = await flattenPageImage(state, page, entry.formatKey);
          flattenedCache.set(cacheKey, flattenedUrl);
        }
      }

      setRenderTarget({
        formatKey: entry.formatKey,
        pageIndex: entry.pageIndex,
        flattenedUrl,
      });

      onProgress({
        completed,
        total,
        detail: `${formatSpec.label} — page ${entry.pageIndex + 1} of ${state.pages.length}`,
      });

      await waitForPaint();

      const { blob, width, height } = await captureCardPng({
        node,
        width: formatSpec.width,
        height: formatSpec.height,
      });

      await writeFile(blob, entry.filename, index);
      lastSize = { width, height };
      completed += 1;

      onProgress({
        completed,
        total,
        detail: `${formatSpec.label} — page ${entry.pageIndex + 1} of ${state.pages.length}`,
      });
    }

    return lastSize;
  } finally {
    setRenderTarget(null);
    for (const url of flattenedCache.values()) {
      if (url) {
        URL.revokeObjectURL(url);
      }
    }
  }
}
