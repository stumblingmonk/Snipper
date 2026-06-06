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

function filenameFromPath(path: string): string {
  const segment = path.split('/').pop() ?? path;
  return segment.replace(/\.[^.]+$/, '');
}

function filenameToLabel(id: string): string {
  return id
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export const BUILTIN_SOURCE_LOGOS: BuiltinSourceLogo[] = Object.entries(logoModules)
  .map(([path, url]) => {
    const id = filenameFromPath(path);
    return {
      id,
      label: filenameToLabel(id),
      url,
    };
  })
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
