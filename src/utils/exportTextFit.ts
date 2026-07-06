import { FORMATS, type FormatKey } from '@/constants/formats';
import { CARD_EXCERPT_LINE_HEIGHT } from '@/constants/cardTypography';
import { preferredFontSize } from '@/constants/textFit';
import {
  computeArticleZones,
  computeStackedExcerptHeight,
  getStandardArticleLayout,
} from '@/constants/standardArticleLayouts';
import { resolveSourceLogoUrl } from '@/store/selectors';
import { selectPageAt, type SnipitState } from '@/store/snipitStore';
import {
  computeExcerptLineClamp,
  DEFAULT_EXCERPT_OFFSCREEN_STYLE,
  DEFAULT_HEADLINE_OFFSCREEN_STYLE,
  measureTextFitOffscreen,
} from '@/utils/textFitMeasure';

export interface ResolvedExportTextFit {
  headlineFontSize: number;
  excerptFontSize: number;
  excerptLineClamp: number;
}

export function resolveExportTextFit(
  state: SnipitState,
  formatKey: FormatKey,
  pageIndex: number,
): ResolvedExportTextFit {
  const page = selectPageAt(state, pageIndex);
  const format = FORMATS[formatKey];
  const layout = getStandardArticleLayout(formatKey);
  const showImage = page.imageMode !== 'none';
  const hasSubhead = Boolean(state.subhead.trim());
  const logoUrl = resolveSourceLogoUrl(state);
  const hasLogo = Boolean(logoUrl);

  const zones = computeArticleZones({
    layout,
    format,
    showImage,
    hasSubhead,
    hasLogo,
    hasFooter: true,
  });

  const headlinePreferred = preferredFontSize(
    state.headlineSizeStep,
    layout.headlineTypo,
  );
  const excerptPreferred = preferredFontSize(
    page.excerptSizeStep,
    layout.excerptTypo,
  );

  const headlineResult = measureTextFitOffscreen({
    text: state.headline,
    preferredSize: headlinePreferred,
    autoFit: state.headlineAutoFit,
    bounds: layout.headlineTypo,
    style: {
      ...DEFAULT_HEADLINE_OFFSCREEN_STYLE,
      width: zones.headlineZone.width,
      height: zones.headlineZone.height,
    },
  });

  const excerptMeasureHeight =
    zones.excerptZone.height > 0
      ? zones.excerptZone.height
      : computeStackedExcerptHeight({
          layout,
          format,
          showImage,
          hasSubhead,
          hasLogo,
          hasFooter: true,
        });

  const excerptResult = measureTextFitOffscreen({
    text: page.excerpt,
    preferredSize: excerptPreferred,
    autoFit: page.excerptAutoFit,
    bounds: layout.excerptTypo,
    style: {
      ...DEFAULT_EXCERPT_OFFSCREEN_STYLE,
      width: zones.excerptZone.width,
      height: excerptMeasureHeight,
    },
  });

  const excerptLineClamp =
    excerptResult.status === 'too-long'
      ? computeExcerptLineClamp(
          excerptMeasureHeight,
          excerptResult.resolvedSize,
          CARD_EXCERPT_LINE_HEIGHT,
        )
      : 0;

  return {
    headlineFontSize: headlineResult.resolvedSize,
    excerptFontSize: excerptResult.resolvedSize,
    excerptLineClamp,
  };
}
