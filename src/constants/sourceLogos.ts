export const DEFAULT_SOURCE_LOGO_ID = 'the-hollywood-reporter';

export type BuiltinSourceLogoId =
  | typeof DEFAULT_SOURCE_LOGO_ID
  | 'generic-news';

export type SourceLogoSelectionId = BuiltinSourceLogoId | 'custom' | 'none';

export interface SourceLogoManifestEntry {
  id: BuiltinSourceLogoId;
  label: string;
  url: string;
}

export const BUILTIN_SOURCE_LOGOS: SourceLogoManifestEntry[] = [
  {
    id: 'the-hollywood-reporter',
    label: 'The Hollywood Reporter',
    url: '/assets/logos/the-hollywood-reporter.svg',
  },
  {
    id: 'generic-news',
    label: 'Generic News',
    url: '/assets/logos/generic-news.svg',
  },
];

export const SOURCE_LOGO_MANIFEST = BUILTIN_SOURCE_LOGOS;

export function getBuiltinLogoUrl(id: BuiltinSourceLogoId): string {
  const entry = BUILTIN_SOURCE_LOGOS.find((logo) => logo.id === id);
  if (!entry) {
    throw new Error(`Unknown built-in logo id: ${id}`);
  }
  return entry.url;
}
