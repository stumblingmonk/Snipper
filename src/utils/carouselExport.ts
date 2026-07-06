import type { FormatKey } from '@/constants/formats';
import { FORMATS } from '@/constants/formats';
import {
  computeArticleZones,
  getStandardArticleLayout,
} from '@/constants/standardArticleLayouts';
import {
  resolveBrandLogoUrl,
  resolveFormatBackground,
  resolveMetadataLine,
  resolveSourceLogoUrl,
  resolveSourceNameForCard,
  resolveAttributionForPage,
} from '@/store/selectors';
import { selectPageAt, type SnipitState } from '@/store/snipitStore';
import type { ArticlePage } from '@/types/articlePage';
import { resolveExportTextFit } from '@/utils/exportTextFit';
import { flattenImage } from '@/utils/flattenImage';

export async function flattenPageImage(
  state: SnipitState,
  page: ArticlePage,
  formatKey: FormatKey,
): Promise<string | null> {
  if (page.imageMode === 'none' || !page.articleImageObjectUrl) {
    return null;
  }

  const format = FORMATS[formatKey];
  const layout = getStandardArticleLayout(formatKey);
  const logoUrl = resolveSourceLogoUrl(state);
  const zones = computeArticleZones({
    layout,
    format,
    showImage: true,
    hasSubhead: Boolean(state.subhead.trim()),
    hasLogo: Boolean(logoUrl),
    hasFooter: true,
  });

  return flattenImage({
    sourceUrl: page.articleImageObjectUrl,
    outputWidth: zones.imageFrame.width,
    outputHeight: zones.imageFrame.height,
    mode: page.imageMode,
    crop: {
      zoom: page.cropZoom,
      offsetX: page.cropOffsetX,
      offsetY: page.cropOffsetY,
    },
  });
}

export function buildCardPropsForPage(
  state: SnipitState,
  pageIndex: number,
  formatKey: FormatKey,
  flattenedUrl: string | null,
) {
  const page = selectPageAt(state, pageIndex);
  const format = FORMATS[formatKey];
  const layout = getStandardArticleLayout(formatKey);
  const background = resolveFormatBackground(state, formatKey);
  const showImage = page.imageMode !== 'none' && Boolean(flattenedUrl);
  const textFit = resolveExportTextFit(state, formatKey, pageIndex);

  return {
    format,
    layout,
    sourceName: resolveSourceNameForCard(state),
    headline: state.headline,
    subhead: state.subhead,
    excerpt: page.excerpt,
    metadataLine: resolveMetadataLine(state),
    attribution: resolveAttributionForPage(state, page),
    logoUrl: resolveSourceLogoUrl(state),
    brandLogoUrl: resolveBrandLogoUrl(state),
    backgroundUrl: background.url,
    backgroundFallbackColor: background.fallbackColor,
    imageUrl: showImage ? flattenedUrl : null,
    articleImageBw: page.articleImageBw,
    showImage,
    pageNumber: pageIndex + 1,
    pageTotal: state.pages.length,
    headlineFontSize: textFit.headlineFontSize,
    excerptFontSize: textFit.excerptFontSize,
    excerptLineClamp: textFit.excerptLineClamp,
  };
}
