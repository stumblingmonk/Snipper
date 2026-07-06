import { OBB_BRAND_LOGO_URL } from '@/constants/brandAssets';

export interface BuiltinBrandLogo {
  id: string;
  label: string;
  url: string;
}

export const DEFAULT_BRAND_LOGO_ID = 'obb';

/** Footer brand marks served from /public/brand — not news source logos. */
export const BUILTIN_BRAND_LOGOS: BuiltinBrandLogo[] = [
  { id: 'obb', label: 'OBB', url: OBB_BRAND_LOGO_URL },
  {
    id: 'fanatics-studios',
    label: 'Fanatics Studios',
    url: '/brand/FanaticsStudios.svg',
  },
  { id: 'bolded', label: 'Bolded', url: '/brand/Bolded.svg' },
];

export function getBuiltinBrandLogoUrl(id: string): string | null {
  return BUILTIN_BRAND_LOGOS.find((logo) => logo.id === id)?.url ?? null;
}

export function getDefaultBrandLogoId(): string {
  return DEFAULT_BRAND_LOGO_ID;
}
