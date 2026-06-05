import type { ImageMode } from '@/constants/formats';
import type { CropSettings } from '@/constants/imageSettings';

export interface FlattenImageOptions {
  sourceUrl: string;
  outputWidth: number;
  outputHeight: number;
  mode: ImageMode;
  crop?: CropSettings;
}

/**
 * Pre-flattens crop/fit into a bitmap via canvas for reliable export.
 * Returns an object URL for flattened output; caller must revoke when replacing.
 */
export async function flattenImage({
  sourceUrl,
  outputWidth,
  outputHeight,
  mode,
  crop = { zoom: 1, offsetX: 0, offsetY: 0 },
}: FlattenImageOptions): Promise<string> {
  const img = await loadImage(sourceUrl);

  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }

  if (mode === 'none') {
    throw new Error('flattenImage should not be called for none mode');
  }

  const srcAspect = img.naturalWidth / img.naturalHeight;
  const dstAspect = outputWidth / outputHeight;

  if (mode === 'crop') {
    drawCropMode(ctx, img, outputWidth, outputHeight, srcAspect, dstAspect, crop);
  } else {
    drawFitMode(ctx, img, outputWidth, outputHeight, srcAspect, dstAspect);
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Failed to encode canvas'))),
      'image/png',
    );
  });

  return URL.createObjectURL(blob);
}

function drawCropMode(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  outputWidth: number,
  outputHeight: number,
  srcAspect: number,
  dstAspect: number,
  crop: CropSettings,
): void {
  let sw = img.naturalWidth;
  let sh = img.naturalHeight;
  let sx = 0;
  let sy = 0;

  if (srcAspect > dstAspect) {
    sw = img.naturalHeight * dstAspect;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    sh = img.naturalWidth / dstAspect;
    sy = (img.naturalHeight - sh) / 2;
  }

  const zoom = Math.max(1, crop.zoom);
  const zoomedWidth = sw / zoom;
  const zoomedHeight = sh / zoom;
  const maxPanX = (sw - zoomedWidth) / 2;
  const maxPanY = (sh - zoomedHeight) / 2;
  const centerX = sx + sw / 2 + crop.offsetX * maxPanX;
  const centerY = sy + sh / 2 + crop.offsetY * maxPanY;

  sx = clamp(centerX - zoomedWidth / 2, 0, img.naturalWidth - zoomedWidth);
  sy = clamp(centerY - zoomedHeight / 2, 0, img.naturalHeight - zoomedHeight);
  sw = zoomedWidth;
  sh = zoomedHeight;

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outputWidth, outputHeight);
}

function drawFitMode(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  outputWidth: number,
  outputHeight: number,
  srcAspect: number,
  dstAspect: number,
): void {
  ctx.fillStyle = '#eef0f3';
  ctx.fillRect(0, 0, outputWidth, outputHeight);

  let drawWidth = outputWidth;
  let drawHeight = outputHeight;

  if (srcAspect > dstAspect) {
    drawHeight = outputWidth / srcAspect;
  } else {
    drawWidth = outputHeight * srcAspect;
  }

  const dx = (outputWidth - drawWidth) / 2;
  const dy = (outputHeight - drawHeight) / 2;
  ctx.drawImage(
    img,
    0,
    0,
    img.naturalWidth,
    img.naturalHeight,
    dx,
    dy,
    drawWidth,
    drawHeight,
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

export async function waitForFonts(): Promise<void> {
  await document.fonts.ready;
}
