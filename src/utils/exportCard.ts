import { toPng } from 'html-to-image';
import { downloadBlob } from '@/utils/exportDestination';
import { waitForFonts } from '@/utils/flattenImage';

export interface CapturePngOptions {
  node: HTMLElement;
  width: number;
  height: number;
}

export interface CapturePngResult {
  blob: Blob;
  width: number;
  height: number;
}

export interface ExportPngOptions extends CapturePngOptions {
  filename: string;
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return response.blob();
}

export async function captureCardPng({
  node,
  width,
  height,
}: CapturePngOptions): Promise<CapturePngResult> {
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

  const blob = await dataUrlToBlob(dataUrl);
  return {
    blob,
    width: img.naturalWidth,
    height: img.naturalHeight,
  };
}

export async function exportCardPng({
  node,
  width,
  height,
  filename,
}: ExportPngOptions): Promise<{ width: number; height: number }> {
  const { blob, width: naturalWidth, height: naturalHeight } = await captureCardPng({
    node,
    width,
    height,
  });

  downloadBlob(blob, filename);
  return { width: naturalWidth, height: naturalHeight };
}
