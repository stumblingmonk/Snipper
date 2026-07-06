import type { FormatKey } from '@/constants/formats';

/** App wordmark served from /public. */
export const SNIPIT_APP_LOGO_URL = '/brand/SNIPit-Logo.svg';

/** OBB brand mark served from /public — not a selectable news source logo. */
export const OBB_BRAND_LOGO_URL = '/brand/obb.svg';

/** Footer OBB mark width per format (px). */
export const OBB_FOOTER_LOGO_WIDTH: Record<FormatKey, number> = {
  story: 220,
  portrait: 195,
  square: 180,
  linkedin: 160,
};
