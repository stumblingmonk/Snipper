import { ARTICLE_IMAGE_MAX_BYTES } from '@/constants/imageSettings';

const ALLOWED_ARTICLE_IMAGE_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
]);

const ALLOWED_ARTICLE_IMAGE_EXTENSION = /\.(png|jpe?g|webp)$/i;

export function isAllowedArticleImageFile(file: File): boolean {
  if (file.type && ALLOWED_ARTICLE_IMAGE_MIME_TYPES.has(file.type)) {
    return true;
  }

  return ALLOWED_ARTICLE_IMAGE_EXTENSION.test(file.name);
}

export function validateArticleImageFile(file: File): void {
  if (!isAllowedArticleImageFile(file)) {
    throw new Error('Unsupported image type. Use PNG, JPG, JPEG, or WEBP.');
  }

  if (file.size > ARTICLE_IMAGE_MAX_BYTES) {
    throw new Error('Image is too large. Maximum file size is 10 MB.');
  }
}

export function createArticleImageObjectUrl(file: File): string {
  validateArticleImageFile(file);
  return URL.createObjectURL(file);
}

export function isRevokableObjectUrl(url: string | null): url is string {
  return typeof url === 'string' && url.startsWith('blob:');
}
