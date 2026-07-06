import {
  FORMAT_LIST,
  type FormatKey,
} from '@/constants/formats';

export const FORMAT_EXPORT_CODES: Record<FormatKey, string> = {
  square: 'sq',
  portrait: 'port',
  story: 'story',
  linkedin: 'wide',
};

export function slugifyHeadline(headline: string, maxLength = 40): string {
  const slug = headline
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!slug) {
    return 'untitled';
  }

  if (slug.length <= maxLength) {
    return slug;
  }

  return slug.slice(0, maxLength).replace(/-+$/, '');
}

export function formatExportDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface BuildExportFilenameOptions {
  baseName: string;
  date: string;
  formatKey: FormatKey;
  pageNumber: number;
  totalPages: number;
}

export function buildExportFilename({
  baseName,
  date,
  formatKey,
  pageNumber,
  totalPages,
}: BuildExportFilenameOptions): string {
  const fmt = FORMAT_EXPORT_CODES[formatKey];
  const pageSuffix =
    totalPages > 1 ? `_p${String(pageNumber).padStart(2, '0')}` : '';
  return `${baseName}_${date}_${fmt}${pageSuffix}.png`;
}

export type ExportScope = 'current-format' | 'all-formats';

export interface ExportFilenameEntry {
  formatKey: FormatKey;
  pageIndex: number;
  filename: string;
}

export function buildExportFilenameList({
  scope,
  currentFormatKey,
  baseName,
  date,
  totalPages,
}: {
  scope: ExportScope;
  currentFormatKey: FormatKey;
  baseName: string;
  date: string;
  totalPages: number;
}): ExportFilenameEntry[] {
  const formatKeys =
    scope === 'current-format'
      ? [currentFormatKey]
      : FORMAT_LIST.map((format) => format.key);

  const entries: ExportFilenameEntry[] = [];

  for (const formatKey of formatKeys) {
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex += 1) {
      entries.push({
        formatKey,
        pageIndex,
        filename: buildExportFilename({
          baseName,
          date,
          formatKey,
          pageNumber: pageIndex + 1,
          totalPages,
        }),
      });
    }
  }

  return entries;
}
