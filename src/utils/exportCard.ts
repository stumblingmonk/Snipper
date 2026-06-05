import { toPng } from 'html-to-image';
import { waitForFonts } from '@/utils/flattenImage';

export interface ExportPngOptions {
  node: HTMLElement;
  width: number;
  height: number;
  filename: string;
}

export async function exportCardPng({
  node,
  width,
  height,
  filename,
}: ExportPngOptions): Promise<{ width: number; height: number }> {
  await waitForFonts();

  const dataUrl = await toPng(node, {
    cacheBust: false,
    width,
    height,
    pixelRatio: 1,
    style: {
      transform: 'none',
      transformOrigin: 'top left',
    },
  });

  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Export verification failed'));
    img.src = dataUrl;
  });

  if (img.naturalWidth !== width || img.naturalHeight !== height) {
    throw new Error(
      `Export size mismatch: expected ${width}×${height}, got ${img.naturalWidth}×${img.naturalHeight}`,
    );
  }

  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();

  return { width: img.naturalWidth, height: img.naturalHeight };
}
