import {
  DEFAULT_FORMAT_BACKGROUND,
  getStandardArticleLayout,
} from '@/constants/standardArticleLayouts';
import { getBuiltinSourceLogoUrl } from '@/constants/builtinSourceLogos';
import type { FormatKey } from '@/constants/formats';
import type { SnipperState } from '@/store/snipperStore';

export function resolveSourceLogoUrl(state: SnipperState): string | null {
  if (state.sourceLogoHidden) {
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

export function resolveFormatBackground(
  formatKey: FormatKey,
): ResolvedFormatBackground {
  const layout = getStandardArticleLayout(formatKey);

  return {
    url: layout.backgroundAsset ?? DEFAULT_FORMAT_BACKGROUND,
    fallbackColor: layout.fallbackBackgroundColor,
    usingFallback: false,
    fallbackNote: null,
  };
}
