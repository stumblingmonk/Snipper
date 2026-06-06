import type { FormatKey } from '@/constants/formats';

/** OBB brand mark served from /public — not a selectable news source logo. */
export const OBB_BRAND_LOGO_URL = '/brand/obb.svg';

/** Footer OBB mark width per format (px). */
export const OBB_FOOTER_LOGO_WIDTH: Record<FormatKey, number> = {
  story: 56,
  square: 52,
  portrait: 54,
  linkedin: 42,
};
