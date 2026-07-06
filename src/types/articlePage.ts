import type { ImageMode } from '@/constants/formats';
import {
  DEFAULT_CROP_SETTINGS,
} from '@/constants/imageSettings';
import {
  DEFAULT_ARTICLE_IMAGE,
  PROVIDED_DEFAULT_COPY,
} from '@/constants/providedAssets';
import {
  EXCERPT_TYPO,
  type FitStatus,
  type TextSizeStep,
} from '@/constants/textFit';

export const MAX_ARTICLE_PAGES = 10;

export interface ArticlePage {
  id: string;
  excerpt: string;
  excerptSizeStep: TextSizeStep;
  excerptAutoFit: boolean;
  excerptResolvedFontSize: number;
  excerptFitStatus: FitStatus;
  excerptLineClamp: number;
  articleImageObjectUrl: string | null;
  uploadedArticleImageObjectUrl: string | null;
  flattenedCropUrl: string | null;
  imageMode: ImageMode;
  articleImageBw: boolean;
  cropZoom: number;
  cropOffsetX: number;
  cropOffsetY: number;
  articleImageUploadError: string | null;
}

let pageIdCounter = 0;

export function createArticlePageId(): string {
  pageIdCounter += 1;
  return `page-${pageIdCounter}-${Date.now()}`;
}

export function createDefaultArticlePage(
  overrides: Partial<ArticlePage> = {},
): ArticlePage {
  return {
    id: createArticlePageId(),
    excerpt: PROVIDED_DEFAULT_COPY.excerpt,
    excerptSizeStep: 0,
    excerptAutoFit: false,
    excerptResolvedFontSize: EXCERPT_TYPO.default,
    excerptFitStatus: 'fits',
    excerptLineClamp: 0,
    articleImageObjectUrl: DEFAULT_ARTICLE_IMAGE,
    uploadedArticleImageObjectUrl: null,
    flattenedCropUrl: null,
    imageMode: 'crop',
    articleImageBw: false,
    cropZoom: DEFAULT_CROP_SETTINGS.zoom,
    cropOffsetX: DEFAULT_CROP_SETTINGS.offsetX,
    cropOffsetY: DEFAULT_CROP_SETTINGS.offsetY,
    articleImageUploadError: null,
    ...overrides,
  };
}

export function cloneArticlePage(page: ArticlePage): ArticlePage {
  return {
    ...page,
    id: createArticlePageId(),
    flattenedCropUrl: null,
  };
}
