import type { FormatKey } from '@/constants/formats';

/** OBB brand mark served from /public — not a selectable news source logo. Source: SNIPPER_HANDOFF/07_brand/OBB.svg */
export const OBB_BRAND_LOGO_URL = '/brand/obb.svg';

/** Footer OBB mark width per format (px). */
export const OBB_FOOTER_LOGO_WIDTH: Record<FormatKey, number> = {
  story: 96,
  square: 84,
  portrait: 90,
  linkedin: 72,
};
