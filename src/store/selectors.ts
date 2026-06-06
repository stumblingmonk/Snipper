import {
  DEFAULT_FORMAT_BACKGROUND,
  getStandardArticleLayout,
} from '@/constants/standardArticleLayouts';
import {
  DEFAULT_BACKGROUND_PACK_ID,
  getBackgroundPack,
} from '@/constants/backgroundPacks';
import { getBuiltinSourceLogoUrl } from '@/constants/builtinSourceLogos';
import { FORMATS, type FormatKey } from '@/constants/formats';
import type { SnipperState } from '@/store/snipperStore';

function resolveFormatKey(format: string): FormatKey {
  return format in FORMATS ? (format as FormatKey) : 'story';
}

export function resolveSourceNameForCard(state: SnipperState): string {
  if (!state.showSource) {
    return '';
  }

  return state.sourceName;
}

export function resolveSourceLogoUrl(state: SnipperState): string | null {
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
  state: SnipperState,
): ResolvedFormatBackground {
  const formatKey = resolveFormatKey(state.format);
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
