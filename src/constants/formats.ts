export type ImageMode = 'crop' | 'fit' | 'none';

export type FormatKey = 'square' | 'portrait' | 'story' | 'linkedin';

export interface FormatSpec {
  key: FormatKey;
  label: string;
  width: number;
  height: number;
}

export const FORMATS: Record<FormatKey, FormatSpec> = {
  square: { key: 'square', label: 'Square', width: 1080, height: 1080 },
  portrait: {
    key: 'portrait',
    label: 'Portrait Feed',
    width: 1080,
    height: 1350,
  },
  story: {
    key: 'story',
    label: 'Story / Reel Cover',
    width: 1080,
    height: 1920,
  },
  linkedin: {
    key: 'linkedin',
    label: 'LinkedIn Landscape',
    width: 1200,
    height: 627,
  },
};

export const FORMAT_LIST: FormatSpec[] = [
  FORMATS.square,
  FORMATS.portrait,
  FORMATS.story,
  FORMATS.linkedin,
];

export const STORY_FORMAT = FORMATS.story;

export function getFormatExportFilename(formatKey: FormatKey): string {
  return `snipit-${formatKey}-export.png`;
}

export function getCarouselExportFilename(
  formatKey: FormatKey,
  pageNumber: number,
  totalPages: number,
): string {
  const pagePart = String(pageNumber).padStart(2, '0');
  const totalPart = String(totalPages).padStart(2, '0');
  return `snipit-${formatKey}-page${pagePart}-of${totalPart}.png`;
}
