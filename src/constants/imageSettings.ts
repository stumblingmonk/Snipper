export const ARTICLE_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

export const DEFAULT_CROP_SETTINGS = {
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
};

export interface CropSettings {
  zoom: number;
  offsetX: number;
  offsetY: number;
}
