import {
  DEFAULT_FORMAT_BACKGROUND,
  getStandardArticleLayout,
} from '@/constants/standardArticleLayouts';
import {
  DEFAULT_BACKGROUND_PACK_ID,
  getBackgroundPack,
} from '@/constants/backgroundPacks';
import { getBuiltinSourceLogoUrl } from '@/constants/builtinSourceLogos';
import {
  getBuiltinBrandLogoUrl,
} from '@/constants/builtinBrandLogos';
import { OBB_BRAND_LOGO_URL } from '@/constants/brandAssets';
import { FORMATS, type FormatKey } from '@/constants/formats';
import type { SnipitState } from '@/store/snipitStore';
import { selectActivePage } from '@/store/snipitStore';
import type { ArticlePage } from '@/types/articlePage';

function resolveFormatKey(format: string): FormatKey {
  return format in FORMATS ? (format as FormatKey) : 'story';
}

export function resolveSourceNameForCard(state: SnipitState): string {
  if (!state.showSource) {
    return '';
  }

  return state.sourceName;
}

export function resolveSourceLogoUrl(state: SnipitState): string | null {
  if (!state.showSource || state.sourceLogoHidden) {
    return null;
  }

  if (state.sourceLogoObjectUrl) {
    return state.sourceLogoObjectUrl;
  }

  if (state.selectedBuiltinLogoId) {
    return getBuiltinSourceLogoUrl(state.selectedBuiltinLogoId);
  }

  return null;
}

export function resolveBrandLogoUrl(state: SnipitState): string {
  return (
    getBuiltinBrandLogoUrl(state.selectedBrandLogoId) ?? OBB_BRAND_LOGO_URL
  );
}

export function resolveMetadataLine(state: SnipitState): string | null {
  const parts: string[] = [];

  if (state.showByline && state.byline.trim()) {
    parts.push(state.byline.trim());
  }

  if (state.showArticleDate && state.articleDate.trim()) {
    parts.push(state.articleDate.trim());
  }

  return parts.length > 0 ? parts.join(' · ') : null;
}

export function resolveAttribution(state: SnipitState): string | null {
  return resolveAttributionForPage(state, selectActivePage(state));
}

export function resolveAttributionForPage(
  state: SnipitState,
  page: ArticlePage,
): string | null {
  if (
    !state.showAttribution ||
    !state.attribution.trim() ||
    page.imageMode === 'none'
  ) {
    return null;
  }

  return state.attribution.trim();
}

export interface ResolvedFormatBackground {
  url: string;
  fallbackColor: string;
  usingFallback: boolean;
  fallbackNote: string | null;
}

function legacyBackgroundUrl(formatKey: FormatKey): string {
  const layout = getStandardArticleLayout(formatKey);
  return layout.backgroundAsset ?? DEFAULT_FORMAT_BACKGROUND;
}

export function resolveFormatBackground(
  state: SnipitState,
  formatKey: FormatKey = resolveFormatKey(state.format),
): ResolvedFormatBackground {
  const layout = getStandardArticleLayout(formatKey);
  const fallbackColor = layout.fallbackBackgroundColor;
  const legacyUrl = legacyBackgroundUrl(formatKey);

  const packId = state.selectedBackgroundPackId || DEFAULT_BACKGROUND_PACK_ID;
  const pack = getBackgroundPack(packId);
  if (!pack) {
    return {
      url: legacyUrl,
      fallbackColor,
      usingFallback: true,
      fallbackNote: `Background pack "${packId}" is unavailable. Using fallback color.`,
    };
  }

  const url = pack.formats[formatKey];
  if (!url) {
    return {
      url: legacyUrl,
      fallbackColor,
      usingFallback: true,
      fallbackNote: `No ${formatKey} background in "${pack.name}". Using fallback color.`,
    };
  }

  return {
    url,
    fallbackColor,
    usingFallback: false,
    fallbackNote: null,
  };
}

/** Passive article-image thumbnail — original/source only, never flattened output. */
export function resolveArticleImageThumbnailUrl(state: SnipitState): string | null {
  const page = selectActivePage(state);
  return page.uploadedArticleImageObjectUrl ?? page.articleImageObjectUrl;
}

export function resolveArticleImageThumbnailUrlForPage(
  page: ArticlePage,
): string | null {
  return page.uploadedArticleImageObjectUrl ?? page.articleImageObjectUrl;
}
