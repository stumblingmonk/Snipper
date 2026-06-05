import {
  DEFAULT_FORMAT_BACKGROUND,
  getStandardArticleLayout,
} from '@/constants/standardArticleLayouts';
import { BUILTIN_SOURCE_LOGOS } from '@/constants/sourceLogos';
import type { FormatKey } from '@/constants/formats';
import type { SnipperState } from '@/store/snipperStore';

export function resolveSourceLogoUrl(state: SnipperState): string | null {
  if (state.selectedSourceLogoId === 'none') {
    return null;
  }

  if (state.selectedSourceLogoId === 'custom') {
    return state.customLogoObjectUrl;
  }

  const builtin = BUILTIN_SOURCE_LOGOS.find(
    (logo) => logo.id === state.selectedSourceLogoId,
  );
  return builtin?.url ?? null;
}

export interface ResolvedFormatBackground {
  url: string | null;
  fallbackColor: string;
  usingFallback: boolean;
  fallbackNote: string | null;
}

export function resolveFormatBackground(
  formatKey: FormatKey,
): ResolvedFormatBackground {
  const layout = getStandardArticleLayout(formatKey);
  const preferred = layout.backgroundAsset;

  if (!preferred || preferred === DEFAULT_FORMAT_BACKGROUND) {
    return {
      url: DEFAULT_FORMAT_BACKGROUND,
      fallbackColor: layout.fallbackBackgroundColor,
      usingFallback: false,
      fallbackNote: null,
    };
  }

  return {
    url: DEFAULT_FORMAT_BACKGROUND,
    fallbackColor: layout.fallbackBackgroundColor,
    usingFallback: true,
    fallbackNote: `Format-specific background not available for ${layout.formatKey}; using default branded background.`,
  };
}
