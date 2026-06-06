export interface BuiltinSourceLogo {
  id: string;
  label: string;
  url: string;
}

export const DEFAULT_BUILTIN_SOURCE_LOGO_ID = 'the-hollywood-reporter';

const logoModules = import.meta.glob<string>(
  '../assets/source-logos/*.{svg,png,jpg,jpeg,webp,avif,gif}',
  {
    eager: true,
    query: '?url',
    import: 'default',
  },
);

const ACRONYM_WORDS: Record<string, string> = {
  abc: 'ABC',
  ap: 'AP',
  bbc: 'BBC',
  cbs: 'CBS',
  cnbc: 'CNBC',
  cnn: 'CNN',
  espn: 'ESPN',
  nbc: 'NBC',
  npr: 'NPR',
  usa: 'USA',
};

function filenameFromPath(path: string): string {
  const segment = path.split('/').pop() ?? path;
  return segment.replace(/\.[^.]+$/, '');
}

function formatLogoWord(word: string): string {
  const lower = word.toLowerCase();
  if (ACRONYM_WORDS[lower]) {
    return ACRONYM_WORDS[lower];
  }

  return word.charAt(0).toUpperCase() + word.slice(1);
}

function filenameToLabel(id: string): string {
  return id
    .split('-')
    .filter(Boolean)
    .map(formatLogoWord)
    .join(' ');
}

/** Built-in news source logos only — brand assets like OBB are excluded. */
const EXCLUDED_SOURCE_LOGO_IDS = new Set(['obb']);

export const BUILTIN_SOURCE_LOGOS: BuiltinSourceLogo[] = Object.entries(logoModules)
  .map(([path, url]) => {
    const id = filenameFromPath(path);
    return {
      id,
      label: filenameToLabel(id),
      url,
    };
  })
  .filter((logo) => !EXCLUDED_SOURCE_LOGO_IDS.has(logo.id.toLowerCase()))
  .sort((a, b) => a.label.localeCompare(b.label));

export function getDefaultBuiltinSourceLogoId(): string | null {
  if (
    BUILTIN_SOURCE_LOGOS.some((logo) => logo.id === DEFAULT_BUILTIN_SOURCE_LOGO_ID)
  ) {
    return DEFAULT_BUILTIN_SOURCE_LOGO_ID;
  }

  return BUILTIN_SOURCE_LOGOS[0]?.id ?? null;
}

export function getBuiltinSourceLogoUrl(id: string): string | null {
  return BUILTIN_SOURCE_LOGOS.find((logo) => logo.id === id)?.url ?? null;
}

export function getBuiltinSourceLogoLabel(id: string): string | null {
  return BUILTIN_SOURCE_LOGOS.find((logo) => logo.id === id)?.label ?? null;
}

export function filterBuiltinSourceLogos(
  logos: BuiltinSourceLogo[],
  query: string,
): BuiltinSourceLogo[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return logos;
  }

  return logos.filter(
    (logo) =>
      logo.label.toLowerCase().includes(normalized) ||
      logo.id.toLowerCase().includes(normalized),
  );
}
