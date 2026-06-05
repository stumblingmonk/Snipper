import { BUILTIN_SOURCE_LOGOS } from '@/constants/sourceLogos';
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
