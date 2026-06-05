const ALLOWED_LOGO_MIME_TYPES = new Set([
  'image/svg+xml',
  'image/png',
  'image/jpeg',
  'image/webp',
]);

const ALLOWED_LOGO_EXTENSION = /\.(svg|png|jpe?g|webp)$/i;

export function isAllowedLogoFile(file: File): boolean {
  if (file.type && ALLOWED_LOGO_MIME_TYPES.has(file.type)) {
    return true;
  }

  return ALLOWED_LOGO_EXTENSION.test(file.name);
}

export function createLogoObjectUrl(file: File): string {
  if (!isAllowedLogoFile(file)) {
    throw new Error('Unsupported logo file type. Use SVG, PNG, JPG, JPEG, or WEBP.');
  }

  return URL.createObjectURL(file);
}
