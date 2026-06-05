import type { FormatSpec } from '@/constants/formats';
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
  min: 42,
  default: 58,
  max: 72,
  autoFitMin: 42,
  stepPx: 6,
};

const STORY_EXCERPT_TYPO: TypographyBounds = {
  min: 28,
  default: 32,
  max: 40,
  autoFitMin: 28,
  stepPx: 2,
};

function footerBlockHeight(layout: StandardArticleLayout, hasFooter: boolean): number {
  if (!hasFooter) return 0;
  return (
    layout.footer.paddingTop +
    layout.footer.paddingBottom +
    Math.ceil(layout.footer.fontSize * 1.25)
  );
}

function computeStackedZones(input: ComputeArticleZonesInput): ComputedArticleZones {
  const { layout, format, showImage, hasSubhead, hasLogo, hasFooter } = input;
  const innerH = format.height - layout.cardPadding * 2;
  const innerW = format.width - layout.cardPadding * 2;
  const zoneMarginX = layout.zoneMarginX;
  const contentW = innerW - zoneMarginX * 2;

  const headerH =
    hasLogo && layout.logoPlacement === 'centered'
      ? layout.header.paddingTop +
        layout.header.logoMaxHeight +
        layout.header.paddingBottom
      : 0;

  const headlineH =
    !showImage && layout.noImageHeadlineHeight
      ? layout.noImageHeadlineHeight
      : layout.headlineZone.height;

  const subheadMarginTop = hasSubhead ? layout.spacing.subheadMarginTop : 0;
  const subheadH = hasSubhead ? layout.subheadZoneHeight : 0;
  const imageH = showImage
    ? layout.spacing.imageMarginTop + layout.imageFrame.height
    : 0;
  const excerptMargin = showImage
    ? layout.spacing.excerptMarginTop
    : layout.spacing.excerptMarginTopNoImage;

  const footerH = footerBlockHeight(layout, hasFooter);
  const used =
    headerH + headlineH + subheadMarginTop + subheadH + imageH + excerptMargin + footerH;
  const excerptH = Math.max(layout.excerptMinHeight, innerH - used);

  return {
    zoneMarginX,
    headlineZone: { width: contentW, height: headlineH },
    excerptZone: { width: contentW, height: excerptH },
    imageFrame: { width: contentW, height: layout.imageFrame.height },
    subheadZoneHeight: subheadH,
    subheadMarginTop,
    split: false,
  };
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
    ? 14 + layout.header.logoMaxHeight + layout.header.paddingBottom
    : 0;
  const headlineH = layout.headlineZone.height;
  const subheadMarginTop = hasSubhead ? layout.spacing.subheadMarginTop : 0;
  const subheadH = hasSubhead ? layout.subheadZoneHeight : 0;
  const excerptMargin = layout.spacing.excerptMarginTop;
  const footerH = footerBlockHeight(layout, hasFooter);

  const used =
    logoRowH + headlineH + subheadMarginTop + subheadH + excerptMargin + footerH;
  const excerptH = Math.max(layout.excerptMinHeight, innerH - used);

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

/** Story — compact header; excerpt fills remaining card height. */
const STORY_LAYOUT: StandardArticleLayout = {
  formatKey: 'story',
  layoutVariant: 'stacked',
  cardPadding: 54,
  zoneMarginX: 42,
  containerRadius: 10,
  logoPlacement: 'centered',
  header: {
    paddingTop: 28,
    paddingBottom: 12,
    logoMaxWidth: 248,
    logoMaxHeight: 40,
  },
  headlineZone: { width: 888, height: 300 },
  subheadZoneHeight: 64,
  subheadFontSize: 26,
  imageFrame: { width: 888, height: 440 },
  excerptMinHeight: 80,
  footer: { paddingTop: 16, paddingBottom: 28, fontSize: 18 },
  spacing: {
    subheadMarginTop: 6,
    imageMarginTop: 20,
    excerptMarginTop: 16,
    excerptMarginTopNoImage: 12,
  },
  noImageHeadlineHeight: 360,
  headlineTypo: STORY_HEADLINE_TYPO,
  excerptTypo: STORY_EXCERPT_TYPO,
  backgroundAsset: PROVIDED_BACKGROUNDS.story,
  fallbackBackgroundColor: '#111318',
};

/** Square — balanced zones; excerpt consumes leftover height. */
const SQUARE_LAYOUT: StandardArticleLayout = {
  formatKey: 'square',
  layoutVariant: 'stacked',
  cardPadding: 42,
  zoneMarginX: 30,
  containerRadius: 10,
  logoPlacement: 'centered',
  header: {
    paddingTop: 24,
    paddingBottom: 10,
    logoMaxWidth: 200,
    logoMaxHeight: 36,
  },
  headlineZone: { width: 936, height: 132 },
  subheadZoneHeight: 48,
  subheadFontSize: 20,
  imageFrame: { width: 936, height: 272 },
  excerptMinHeight: 72,
  footer: { paddingTop: 12, paddingBottom: 20, fontSize: 15 },
  spacing: {
    subheadMarginTop: 6,
    imageMarginTop: 14,
    excerptMarginTop: 12,
    excerptMarginTopNoImage: 10,
  },
  noImageHeadlineHeight: 168,
  headlineTypo: {
    min: 36,
    default: 50,
    max: 58,
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
  backgroundAsset: PROVIDED_BACKGROUNDS.square,
  fallbackBackgroundColor: '#151820',
};

/** Portrait — tall canvas; excerpt expands vertically. */
const PORTRAIT_LAYOUT: StandardArticleLayout = {
  formatKey: 'portrait',
  layoutVariant: 'stacked',
  cardPadding: 46,
  zoneMarginX: 34,
  containerRadius: 10,
  logoPlacement: 'centered',
  header: {
    paddingTop: 26,
    paddingBottom: 10,
    logoMaxWidth: 220,
    logoMaxHeight: 38,
  },
  headlineZone: { width: 920, height: 192 },
  subheadZoneHeight: 56,
  subheadFontSize: 22,
  imageFrame: { width: 920, height: 352 },
  excerptMinHeight: 80,
  footer: { paddingTop: 14, paddingBottom: 24, fontSize: 16 },
  spacing: {
    subheadMarginTop: 6,
    imageMarginTop: 16,
    excerptMarginTop: 14,
    excerptMarginTopNoImage: 12,
  },
  noImageHeadlineHeight: 240,
  headlineTypo: {
    min: 38,
    default: 54,
    max: 66,
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
  backgroundAsset: PROVIDED_BACKGROUNDS.portrait,
  fallbackBackgroundColor: '#12151c',
};

/** LinkedIn — split column; excerpt fills left column below headline. */
const LINKEDIN_LAYOUT: StandardArticleLayout = {
  formatKey: 'linkedin',
  layoutVariant: 'split',
  splitImageSide: 'right',
  cardPadding: 22,
  zoneMarginX: 24,
  containerRadius: 8,
  logoPlacement: 'inlineAboveHeadline',
  header: {
    paddingTop: 0,
    paddingBottom: 6,
    logoMaxWidth: 168,
    logoMaxHeight: 32,
  },
  headlineZone: { width: 672, height: 68 },
  subheadZoneHeight: 36,
  subheadFontSize: 15,
  imageFrame: { width: 392, height: 583 },
  excerptMinHeight: 64,
  footer: { paddingTop: 8, paddingBottom: 12, fontSize: 11 },
  spacing: {
    subheadMarginTop: 4,
    imageMarginTop: 0,
    excerptMarginTop: 8,
    excerptMarginTopNoImage: 8,
  },
  noImageHeadlineHeight: 88,
  headlineTypo: {
    min: 26,
    default: 34,
    max: 40,
    autoFitMin: 26,
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
  fallbackBackgroundColor: '#0f1218',
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
