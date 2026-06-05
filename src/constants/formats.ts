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
  portrait: { key: 'portrait', label: 'Portrait', width: 1080, height: 1350 },
  story: { key: 'story', label: 'Story', width: 1080, height: 1920 },
  linkedin: { key: 'linkedin', label: 'LinkedIn', width: 1200, height: 627 },
};

export const STORY_FORMAT = FORMATS.story;
