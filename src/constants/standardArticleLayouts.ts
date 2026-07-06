import type { FormatSpec } from '@/constants/formats';
import { OBB_FOOTER_LOGO_WIDTH } from '@/constants/brandAssets';
import { PROVIDED_BACKGROUNDS } from '@/constants/providedAssets';
import type { TypographyBounds } from '@/constants/textFit';

export interface ZoneSize {
  width: number;
  height: number;
}

export type LayoutVariant = 'stacked' | 'split';
export type LogoPlacement = 'centered' | 'inlineAboveHeadline';

export interface StandardArticleLayout {
  formatKey: FormatSpec['key'];
  layoutVariant: LayoutVariant;
  splitImageSide?: 'left' | 'right';
  /** Outer artboard padding — Phase 6 baseline + ~6px for slightly more background. */
  cardPadding: number;
  zoneMarginX: number;
  containerRadius: number;
  logoPlacement: LogoPlacement;
  header: {
    paddingTop: number;
    paddingBottom: number;
    logoMaxWidth: number;
    logoMaxHeight: number;
  };
  headlineZone: ZoneSize;
  subheadZoneHeight: number;
  subheadFontSize: number;
  imageFrame: ZoneSize;
  excerptMinHeight: number;
  footer: {
    paddingTop: number;
    paddingBottom: number;
    fontSize: number;
  };
  spacing: {
    subheadMarginTop: number;
    imageMarginTop: number;
    excerptMarginTop: number;
    excerptMarginTopNoImage: number;
  };
  noImageHeadlineHeight?: number;
  /** Stacked layouts: image height as fraction of content width. Default 0.75 (4:3). */
  stackedImageHeightRatio?: number;
  headlineTypo: TypographyBounds;
  excerptTypo: TypographyBounds;
  backgroundAsset: string;
  fallbackBackgroundColor: string;
}

export interface ComputeArticleZonesInput {
  layout: StandardArticleLayout;
  format: FormatSpec;
  showImage: boolean;
  hasSubhead: boolean;
  hasLogo: boolean;
  hasFooter: boolean;
}

export interface ComputedArticleZones {
  zoneMarginX: number;
  headlineZone: ZoneSize;
  excerptZone: ZoneSize;
  imageFrame: ZoneSize;
  subheadZoneHeight: number;
  subheadMarginTop: number;
  split: boolean;
}

const STORY_HEADLINE_TYPO: TypographyBounds = {
  min: 38,
  default: 50,
  max: 62,
  autoFitMin: 38,
  stepPx: 6,
};

const STORY_EXCERPT_TYPO: TypographyBounds = {
  min: 28,
  default: 32,
  max: 40,
  autoFitMin: 28,
  stepPx: 2,
};

/** Unified side margin on 1080-wide stacked formats (~72px each side). */
const STACKED_ZONE_MARGIN_X = 72;

/** LinkedIn text column margin scaled from 1080-wide 72px padding. */
const LINKEDIN_TEXT_COL_WIDTH = 1200 - 475;
const LINKEDIN_ZONE_MARGIN_X = Math.round(
  (STACKED_ZONE_MARGIN_X * LINKEDIN_TEXT_COL_WIDTH) / 1080,
);

function footerBlockHeight(layout: StandardArticleLayout, hasFooter: boolean): number {
  if (!hasFooter) return 0;
  const obbWidth = OBB_FOOTER_LOGO_WIDTH[layout.formatKey] ?? 96;
  const obbHeight = Math.ceil(obbWidth * 0.58);
  return layout.footer.paddingTop + layout.footer.paddingBottom + obbHeight;
}

/** Stacked layouts: image height from content width × ratio (default 4:3). */
function stackedImageFrameHeight(
  contentWidth: number,
  ratio: number = 0.75,
): number {
  return Math.round(contentWidth * ratio);
}

/** Stacked layouts: headlineZone.height and subheadZoneHeight are max-height caps, not reserved brick heights. */
function computeStackedZones(input: ComputeArticleZonesInput): ComputedArticleZones {
  const { layout, format, showImage, hasSubhead } = input;
  const innerW = format.width - layout.cardPadding * 2;
  const zoneMarginX = layout.zoneMarginX;
  const contentW = innerW - zoneMarginX * 2;
  const ratio = layout.stackedImageHeightRatio ?? 0.75;
  const imageFrameHeight = stackedImageFrameHeight(contentW, ratio);

  const headlineMaxHeight =
    !showImage && layout.noImageHeadlineHeight
      ? layout.noImageHeadlineHeight
      : layout.headlineZone.height;

  const subheadMarginTop = hasSubhead ? layout.spacing.subheadMarginTop : 0;
  const subheadMaxHeight = hasSubhead ? layout.subheadZoneHeight : 0;

  const excerptHeight = computeStackedExcerptHeight(input);

  return {
    zoneMarginX,
    headlineZone: { width: contentW, height: headlineMaxHeight },
    excerptZone: {
      width: contentW,
      height: excerptHeight,
    },
    imageFrame: showImage
      ? { width: contentW, height: imageFrameHeight }
      : { width: contentW, height: 0 },
    subheadZoneHeight: subheadMaxHeight,
    subheadMarginTop,
    split: false,
  };
}

export function computeStackedExcerptHeight(
  input: ComputeArticleZonesInput,
): number {
  const { layout, format, showImage, hasSubhead, hasLogo, hasFooter } = input;
  const innerH = format.height - layout.cardPadding * 2;
  const innerW = format.width - layout.cardPadding * 2;
  const contentW = innerW - layout.zoneMarginX * 2;
  const ratio = layout.stackedImageHeightRatio ?? 0.75;
  const imageFrameHeight = stackedImageFrameHeight(contentW, ratio);

  const logoHeaderH = hasLogo
    ? layout.header.paddingTop +
      layout.header.logoMaxHeight +
      layout.header.paddingBottom
    : layout.header.paddingTop;

  const headlineH =
    !showImage && layout.noImageHeadlineHeight
      ? layout.noImageHeadlineHeight
      : layout.headlineZone.height;

  const subheadMarginTop = hasSubhead ? layout.spacing.subheadMarginTop : 0;
  const subheadH = hasSubhead ? layout.subheadZoneHeight : 0;
  const imageBlockH = showImage
    ? layout.spacing.imageMarginTop + imageFrameHeight
    : 0;
  const excerptMargin = showImage
    ? layout.spacing.excerptMarginTop
    : layout.spacing.excerptMarginTopNoImage;
  const footerH = footerBlockHeight(layout, hasFooter);

  const available =
    innerH - logoHeaderH - headlineH - subheadMarginTop - subheadH - imageBlockH - excerptMargin - footerH;

  return Math.max(layout.excerptMinHeight, available);
}

function computeLinkedInSplitZones(input: ComputeArticleZonesInput): ComputedArticleZones {
  const { layout, format, hasSubhead, hasLogo, hasFooter } = input;
  const innerH = format.height - layout.cardPadding * 2;
  const innerW = format.width - layout.cardPadding * 2;
  const imageW = layout.imageFrame.width;
  const textColW = innerW - imageW;
  const zoneMarginX = layout.zoneMarginX;
  const contentW = textColW - zoneMarginX * 2;

  const logoRowH = hasLogo
    ? 20 + layout.header.logoMaxHeight + layout.header.paddingBottom
    : 0;
  const headlineH = layout.headlineZone.height;
  const subheadMarginTop = hasSubhead ? layout.spacing.subheadMarginTop : 0;
  const subheadH = hasSubhead ? layout.subheadZoneHeight : 0;
  const excerptMargin = layout.spacing.excerptMarginTop;
  const footerH = footerBlockHeight(layout, hasFooter);

  const bodyH = innerH - footerH;
  const used = logoRowH + headlineH + subheadMarginTop + subheadH + excerptMargin;
  const excerptH = Math.max(layout.excerptMinHeight, bodyH - used);

  return {
    zoneMarginX,
    headlineZone: { width: contentW, height: headlineH },
    excerptZone: { width: contentW, height: excerptH },
    imageFrame: { width: imageW, height: innerH },
    subheadZoneHeight: subheadH,
    subheadMarginTop,
    split: true,
  };
}

/** Story — unified 72px side margins; taller headline/subhead caps for calibration copy. */
const STORY_LAYOUT: StandardArticleLayout = {
  formatKey: 'story',
  layoutVariant: 'stacked',
  cardPadding: 0,
  zoneMarginX: STACKED_ZONE_MARGIN_X,
  containerRadius: 0,
  logoPlacement: 'centered',
  header: {
    paddingTop: 75,
    paddingBottom: 45,
    logoMaxWidth: 490,
    logoMaxHeight: 125,
  },
  headlineZone: { width: 936, height: 480 },
  subheadZoneHeight: 128,
  subheadFontSize: 34,
  imageFrame: { width: 936, height: 645 },
  excerptMinHeight: 80,
  footer: { paddingTop: 32, paddingBottom: 65, fontSize: 18 },
  spacing: {
    subheadMarginTop: 28,
    imageMarginTop: 35,
    excerptMarginTop: 35,
    excerptMarginTopNoImage: 24,
  },
  noImageHeadlineHeight: 480,
  headlineTypo: STORY_HEADLINE_TYPO,
  excerptTypo: STORY_EXCERPT_TYPO,
  backgroundAsset: PROVIDED_BACKGROUNDS.story,
  fallbackBackgroundColor: '#e8e4dc',
};

/** Square — unified 72px side margins; taller text caps for long headline/subhead. */
const SQUARE_LAYOUT: StandardArticleLayout = {
  formatKey: 'square',
  layoutVariant: 'stacked',
  cardPadding: 0,
  zoneMarginX: STACKED_ZONE_MARGIN_X,
  containerRadius: 0,
  logoPlacement: 'centered',
  stackedImageHeightRatio: 0.3,
  header: {
    paddingTop: 36,
    paddingBottom: 14,
    logoMaxWidth: 300,
    logoMaxHeight: 72,
  },
  headlineZone: { width: 936, height: 520 },
  subheadZoneHeight: 96,
  subheadFontSize: 24,
  imageFrame: { width: 936, height: 300 },
  excerptMinHeight: 56,
  footer: { paddingTop: 18, paddingBottom: 36, fontSize: 15 },
  spacing: {
    subheadMarginTop: 14,
    imageMarginTop: 16,
    excerptMarginTop: 16,
    excerptMarginTopNoImage: 12,
  },
  noImageHeadlineHeight: 240,
  headlineTypo: {
    min: 26,
    default: 40,
    max: 46,
    autoFitMin: 26,
    stepPx: 5,
  },
  excerptTypo: {
    min: 24,
    default: 30,
    max: 34,
    autoFitMin: 24,
    stepPx: 2,
  },
  backgroundAsset: PROVIDED_BACKGROUNDS.square,
  fallbackBackgroundColor: '#e8e4dc',
};

/** Portrait — Story-like editorial stack with reduced image dominance. */
const PORTRAIT_LAYOUT: StandardArticleLayout = {
  formatKey: 'portrait',
  layoutVariant: 'stacked',
  cardPadding: 0,
  zoneMarginX: 72,
  containerRadius: 0,
  logoPlacement: 'centered',
  stackedImageHeightRatio: 0.4,
  header: {
    paddingTop: 56,
    paddingBottom: 22,
    logoMaxWidth: 360,
    logoMaxHeight: 84,
  },
  headlineZone: { width: 936, height: 420 },
  subheadZoneHeight: 112,
  subheadFontSize: 28,
  imageFrame: { width: 936, height: 374 },
  excerptMinHeight: 72,
  footer: { paddingTop: 22, paddingBottom: 44, fontSize: 16 },
  spacing: {
    subheadMarginTop: 18,
    imageMarginTop: 24,
    excerptMarginTop: 22,
    excerptMarginTopNoImage: 14,
  },
  noImageHeadlineHeight: 380,
  headlineTypo: {
    min: 34,
    default: 44,
    max: 52,
    autoFitMin: 34,
    stepPx: 6,
  },
  excerptTypo: {
    min: 26,
    default: 32,
    max: 38,
    autoFitMin: 26,
    stepPx: 2,
  },
  backgroundAsset: PROVIDED_BACKGROUNDS.portrait,
  fallbackBackgroundColor: '#e8e4dc',
};

/** LinkedIn — split column; image right ~3:4 at full canvas height. */
const LINKEDIN_LAYOUT: StandardArticleLayout = {
  formatKey: 'linkedin',
  layoutVariant: 'split',
  splitImageSide: 'right',
  cardPadding: 0,
  zoneMarginX: LINKEDIN_ZONE_MARGIN_X,
  containerRadius: 0,
  logoPlacement: 'inlineAboveHeadline',
  header: {
    paddingTop: 28,
    paddingBottom: 18,
    logoMaxWidth: 240,
    logoMaxHeight: 60,
  },
  headlineZone: { width: 584, height: 300 },
  subheadZoneHeight: 72,
  subheadFontSize: 18,
  imageFrame: { width: 475, height: 627 },
  excerptMinHeight: 64,
  footer: { paddingTop: 10, paddingBottom: 16, fontSize: 11 },
  spacing: {
    subheadMarginTop: 6,
    imageMarginTop: 0,
    excerptMarginTop: 8,
    excerptMarginTopNoImage: 8,
  },
  noImageHeadlineHeight: 200,
  headlineTypo: {
    min: 20,
    default: 28,
    max: 32,
    autoFitMin: 20,
    stepPx: 4,
  },
  excerptTypo: {
    min: 18,
    default: 22,
    max: 26,
    autoFitMin: 18,
    stepPx: 2,
  },
  backgroundAsset: PROVIDED_BACKGROUNDS.linkedin,
  fallbackBackgroundColor: '#e8e4dc',
};

export const STANDARD_ARTICLE_LAYOUTS: Record<
  FormatSpec['key'],
  StandardArticleLayout
> = {
  story: STORY_LAYOUT,
  square: SQUARE_LAYOUT,
  portrait: PORTRAIT_LAYOUT,
  linkedin: LINKEDIN_LAYOUT,
};

export const DEFAULT_FORMAT_KEY: FormatSpec['key'] = 'story';

export const DEFAULT_FORMAT_BACKGROUND = PROVIDED_BACKGROUNDS.story;

export function getStandardArticleLayout(
  formatKey: FormatSpec['key'],
): StandardArticleLayout {
  return STANDARD_ARTICLE_LAYOUTS[formatKey];
}

export function computeArticleZones(
  input: ComputeArticleZonesInput,
): ComputedArticleZones {
  const split =
    input.layout.layoutVariant === 'split' && input.showImage;

  if (split) {
    return computeLinkedInSplitZones(input);
  }

  return computeStackedZones(input);
}

export function usesSplitLayout(
  layout: StandardArticleLayout,
  showImage: boolean,
): boolean {
  return layout.layoutVariant === 'split' && showImage;
}

/** @deprecated Use computeArticleZones for dynamic excerpt sizing. */
export function resolveActiveTextZones(
  layout: StandardArticleLayout,
  format: FormatSpec,
  showImage: boolean,
  hasSubhead: boolean,
  hasLogo: boolean,
  hasFooter: boolean,
): {
  zoneMarginX: number;
  headlineZone: ZoneSize;
  excerptZone: ZoneSize;
} {
  const computed = computeArticleZones({
    layout,
    format,
    showImage,
    hasSubhead,
    hasLogo,
    hasFooter,
  });
  return {
    zoneMarginX: computed.zoneMarginX,
    headlineZone: computed.headlineZone,
    excerptZone: computed.excerptZone,
  };
}

export function getImageFrameForFormat(
  formatKey: FormatSpec['key'],
  format: FormatSpec,
  showImage: boolean,
): ZoneSize {
  if (!showImage) {
    return { width: 0, height: 0 };
  }

  const layout = getStandardArticleLayout(formatKey);
  const computed = computeArticleZones({
    layout,
    format,
    showImage: true,
    hasSubhead: false,
    hasLogo: true,
    hasFooter: true,
  });
  return computed.imageFrame;
}
