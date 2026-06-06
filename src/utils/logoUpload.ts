const ALLOWED_LOGO_MIME_TYPES = new Set([
  'image/svg+xml',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/avif',
  'image/gif',
]);

const ALLOWED_LOGO_EXTENSION = /\.(svg|png|jpe?g|webp|avif|gif)$/i;

export function isAllowedLogoFile(file: File): boolean {
  if (file.type && ALLOWED_LOGO_MIME_TYPES.has(file.type)) {
    return true;
  }

  return ALLOWED_LOGO_EXTENSION.test(file.name);
}

export function createLogoObjectUrl(file: File): string {
  if (!isAllowedLogoFile(file)) {
    throw new Error(
      'Unsupported logo file type. Choose SVG, PNG, JPG, WEBP, AVIF, or GIF.',
    );
  }

  return URL.createObjectURL(file);
}
