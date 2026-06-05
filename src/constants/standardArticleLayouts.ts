import type { FormatKey } from '@/constants/formats';
import type { TypographyBounds } from '@/constants/textFit';

export interface ZoneSize {
  width: number;
  height: number;
}

export interface StandardArticleLayout {
  formatKey: FormatKey;
  cardPadding: number;
  zoneMarginX: number;
  header: {
    paddingTop: number;
    paddingBottom: number;
    logoMaxWidth: number;
    sourceNameFontSize: number;
  };
  headlineZone: ZoneSize;
  subheadZoneHeight: number;
  subheadFontSize: number;
  imageFrame: ZoneSize;
  excerptZone: ZoneSize;
  footer: {
    paddingTop: number;
    paddingBottom: number;
    fontSize: number;
  };
  headlineTypo: TypographyBounds;
  excerptTypo: TypographyBounds;
  /** Preferred background asset for this format; may fall back at runtime. */
  backgroundAsset: string | null;
  fallbackBackgroundColor: string;
}

const STORY_HEADLINE_TYPO: TypographyBounds = {
  min: 42,
  default: 60,
  max: 72,
  autoFitMin: 42,
  stepPx: 6,
};

const STORY_EXCERPT_TYPO: TypographyBounds = {
  min: 28,
  default: 34,
  max: 40,
  autoFitMin: 28,
  stepPx: 2,
};

/** Story layout preserved from Phase 1–5 stress-tested implementation. */
const STORY_LAYOUT: StandardArticleLayout = {
  formatKey: 'story',
  cardPadding: 48,
  zoneMarginX: 48,
  header: {
    paddingTop: 48,
    paddingBottom: 20,
    logoMaxWidth: 280,
    sourceNameFontSize: 24,
  },
  headlineZone: { width: 888, height: 360 },
  subheadZoneHeight: 80,
  subheadFontSize: 30,
  imageFrame: { width: 888, height: 520 },
  excerptZone: { width: 888, height: 200 },
  footer: { paddingTop: 24, paddingBottom: 40, fontSize: 20 },
  headlineTypo: STORY_HEADLINE_TYPO,
  excerptTypo: STORY_EXCERPT_TYPO,
  backgroundAsset: '/assets/stress/background.jpg',
  fallbackBackgroundColor: '#111318',
};

const SQUARE_LAYOUT: StandardArticleLayout = {
  formatKey: 'square',
  cardPadding: 36,
  zoneMarginX: 36,
  header: {
    paddingTop: 32,
    paddingBottom: 12,
    logoMaxWidth: 220,
    sourceNameFontSize: 20,
  },
  headlineZone: { width: 936, height: 168 },
  subheadZoneHeight: 56,
  subheadFontSize: 24,
  imageFrame: { width: 936, height: 340 },
  excerptZone: { width: 936, height: 132 },
  footer: { paddingTop: 16, paddingBottom: 28, fontSize: 16 },
  headlineTypo: {
    min: 36,
    default: 52,
    max: 60,
    autoFitMin: 36,
    stepPx: 5,
  },
  excerptTypo: {
    min: 24,
    default: 30,
    max: 34,
    autoFitMin: 24,
    stepPx: 2,
  },
  backgroundAsset: '/assets/stress/background-square.jpg',
  fallbackBackgroundColor: '#151820',
};

const PORTRAIT_LAYOUT: StandardArticleLayout = {
  formatKey: 'portrait',
  cardPadding: 40,
  zoneMarginX: 40,
  header: {
    paddingTop: 36,
    paddingBottom: 16,
    logoMaxWidth: 240,
    sourceNameFontSize: 22,
  },
  headlineZone: { width: 920, height: 240 },
  subheadZoneHeight: 64,
  subheadFontSize: 26,
  imageFrame: { width: 920, height: 440 },
  excerptZone: { width: 920, height: 176 },
  footer: { paddingTop: 20, paddingBottom: 32, fontSize: 18 },
  headlineTypo: {
    min: 38,
    default: 56,
    max: 68,
    autoFitMin: 38,
    stepPx: 6,
  },
  excerptTypo: {
    min: 26,
    default: 32,
    max: 38,
    autoFitMin: 26,
    stepPx: 2,
  },
  backgroundAsset: '/assets/stress/background-portrait.jpg',
  fallbackBackgroundColor: '#12151c',
};

const LINKEDIN_LAYOUT: StandardArticleLayout = {
  formatKey: 'linkedin',
  cardPadding: 16,
  zoneMarginX: 24,
  header: {
    paddingTop: 16,
    paddingBottom: 8,
    logoMaxWidth: 180,
    sourceNameFontSize: 14,
  },
  headlineZone: { width: 1120, height: 72 },
  subheadZoneHeight: 40,
  subheadFontSize: 18,
  imageFrame: { width: 1120, height: 180 },
  excerptZone: { width: 1120, height: 64 },
  footer: { paddingTop: 8, paddingBottom: 12, fontSize: 12 },
  headlineTypo: {
    min: 28,
    default: 36,
    max: 44,
    autoFitMin: 28,
    stepPx: 4,
  },
  excerptTypo: {
    min: 20,
    default: 24,
    max: 28,
    autoFitMin: 20,
    stepPx: 2,
  },
  backgroundAsset: '/assets/stress/background-linkedin.jpg',
  fallbackBackgroundColor: '#0f1218',
};

export const STANDARD_ARTICLE_LAYOUTS: Record<FormatKey, StandardArticleLayout> =
  {
    story: STORY_LAYOUT,
    square: SQUARE_LAYOUT,
    portrait: PORTRAIT_LAYOUT,
    linkedin: LINKEDIN_LAYOUT,
  };

export const DEFAULT_FORMAT_KEY: FormatKey = 'story';

export const DEFAULT_FORMAT_BACKGROUND = '/assets/stress/background.jpg';

export function getStandardArticleLayout(formatKey: FormatKey): StandardArticleLayout {
  return STANDARD_ARTICLE_LAYOUTS[formatKey];
}

export function getImageFrameForFormat(formatKey: FormatKey): ZoneSize {
  return getStandardArticleLayout(formatKey).imageFrame;
}
