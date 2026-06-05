import type { ImageMode } from '@/constants/formats';

export interface FlattenCropOptions {
  sourceUrl: string;
  outputWidth: number;
  outputHeight: number;
  mode: ImageMode;
}

/**
 * Pre-flattens crop/fit into a bitmap via canvas for reliable export.
 * Returns an object URL; caller must revoke when replacing.
 */
export async function flattenImage({
  sourceUrl,
  outputWidth,
  outputHeight,
  mode,
}: FlattenCropOptions): Promise<string> {
  const img = await loadImage(sourceUrl);

  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }

  if (mode === 'none') {
    return sourceUrl;
  }

  const srcAspect = img.naturalWidth / img.naturalHeight;
  const dstAspect = outputWidth / outputHeight;

  let sx = 0;
  let sy = 0;
  let sw = img.naturalWidth;
  let sh = img.naturalHeight;

  if (mode === 'crop') {
    if (srcAspect > dstAspect) {
      sw = img.naturalHeight * dstAspect;
      sx = (img.naturalWidth - sw) / 2;
    } else {
      sh = img.naturalWidth / dstAspect;
      sy = (img.naturalHeight - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outputWidth, outputHeight);
  } else {
    // fit — letterbox on solid dark background
    ctx.fillStyle = '#111318';
    ctx.fillRect(0, 0, outputWidth, outputHeight);
    let dw = outputWidth;
    let dh = outputHeight;
    if (srcAspect > dstAspect) {
      dh = outputWidth / srcAspect;
    } else {
      dw = outputHeight * srcAspect;
    }
    const dx = (outputWidth - dw) / 2;
    const dy = (outputHeight - dh) / 2;
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, dx, dy, dw, dh);
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Failed to encode canvas'))),
      'image/png',
    );
  });

  return URL.createObjectURL(blob);
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
