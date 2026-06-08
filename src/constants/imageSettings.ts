export const ARTICLE_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

export const DEFAULT_CROP_SETTINGS = {
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
};

export const CROP_ZOOM_MIN = 1;
export const CROP_ZOOM_MAX = 4;
export const CROP_ZOOM_STEP = 0.05;

export const CROP_OFFSET_MIN = -1;
export const CROP_OFFSET_MAX = 1;
export const CROP_OFFSET_STEP = 0.02;

/** Pan controls only apply when zoom is above this threshold. */
export const CROP_PAN_ZOOM_THRESHOLD = 1.01;

export const FLATTEN_DEBOUNCE_MS = 75;

export interface CropSettings {
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export function clampCropZoom(zoom: number): number {
  return Math.min(CROP_ZOOM_MAX, Math.max(CROP_ZOOM_MIN, zoom));
}

export function clampCropOffset(offset: number): number {
  return Math.min(CROP_OFFSET_MAX, Math.max(CROP_OFFSET_MIN, offset));
}

export function cropHasPanRoom(zoom: number): boolean {
  return zoom > CROP_PAN_ZOOM_THRESHOLD;
}
