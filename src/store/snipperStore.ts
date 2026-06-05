import { create } from 'zustand';
import type { FormatKey, ImageMode } from '@/constants/formats';
import {
  DEFAULT_CROP_SETTINGS,
  type CropSettings,
} from '@/constants/imageSettings';
import {
  DEFAULT_SOURCE_LOGO_ID,
  type SourceLogoSelectionId,
} from '@/constants/sourceLogos';
import { appendWithSpacing } from '@/utils/appendText';
import {
  createArticleImageObjectUrl,
  isRevokableObjectUrl,
} from '@/utils/articleImageUpload';
import { createLogoObjectUrl } from '@/utils/logoUpload';

/** Default content seeded from Phase 1 stress test for continuity. */
export const DEFAULT_CONTENT = {
  sourceUrl:
    'https://www.hollywoodreporter.com/tv/tv-news/2026-espys-host-marcello-hernandez-1236612262/',
  sourceName: 'The Hollywood Reporter',
  headline:
    '‘Saturday Night Live’ Star Marcello Hernández Will Host the 2026 ESPYs as the Awards Return to New York City https://www.hollywoodreporter.com/tv/tv-news/2026-espys-host-marcello-hernandez-1236612262/',
  subhead: '',
  excerpt:
    'Marcello Hernández will host the 2026 ESPYs as the awards return to New York City. The ceremony will air July 15 on ABC.',
  scratchpad: '',
  caption: '',
  backgroundUrl: '/assets/stress/background.jpg',
  articleImageUrl: '/assets/stress/article-subject.png',
} as const;

export interface ScratchpadSelection {
  start: number;
  end: number;
  text: string;
}

const EMPTY_SELECTION: ScratchpadSelection = { start: 0, end: 0, text: '' };

export interface SnipperState {
  format: FormatKey;
  headlineFontSize: number;
  excerptFontSize: number;
  selectedSourceLogoId: SourceLogoSelectionId;
  customLogoObjectUrl: string | null;
  backgroundObjectUrl: string | null;
  articleImageObjectUrl: string | null;
  uploadedArticleImageObjectUrl: string | null;
  flattenedCropUrl: string | null;
  imageMode: ImageMode;
  cropZoom: number;
  cropOffsetX: number;
  cropOffsetY: number;
  exportStatus: 'idle' | 'exporting' | 'done' | 'error';
  exportError: string | null;
  lastExportSize: { width: number; height: number } | null;
  sourceUrl: string;
  sourceName: string;
  headline: string;
  subhead: string;
  excerpt: string;
  scratchpad: string;
  scratchpadSelection: ScratchpadSelection;
  caption: string;
  logoUploadError: string | null;
  articleImageUploadError: string | null;
  setHeadlineFontSize: (size: number) => void;
  setExcerptFontSize: (size: number) => void;
  setFlattenedCropUrl: (url: string | null) => void;
  setExportStatus: (
    status: SnipperState['exportStatus'],
    error?: string | null,
    size?: { width: number; height: number } | null,
  ) => void;
  setSourceUrl: (sourceUrl: string) => void;
  setSourceName: (sourceName: string) => void;
  setHeadline: (headline: string) => void;
  setSubhead: (subhead: string) => void;
  setExcerpt: (excerpt: string) => void;
  setScratchpad: (scratchpad: string) => void;
  setScratchpadSelection: (selection: ScratchpadSelection) => void;
  setCaption: (caption: string) => void;
  setSelectedSourceLogoId: (id: SourceLogoSelectionId) => void;
  uploadCustomLogo: (file: File) => void;
  clearCustomLogo: () => void;
  setImageMode: (mode: ImageMode) => void;
  setCropZoom: (zoom: number) => void;
  setCropOffsetX: (offsetX: number) => void;
  setCropOffsetY: (offsetY: number) => void;
  resetCrop: () => void;
  uploadArticleImage: (file: File) => void;
  clearUploadedArticleImage: () => void;
  useSelectedAsExcerpt: () => void;
  appendSelectedToExcerpt: () => void;
  clearScratchpad: () => void;
}

function revokeIfBlob(url: string | null): void {
  if (isRevokableObjectUrl(url)) {
    URL.revokeObjectURL(url);
  }
}

export const useSnipperStore = create<SnipperState>((set, get) => ({
  format: 'story',
  headlineFontSize: 72,
  excerptFontSize: 36,
  selectedSourceLogoId: DEFAULT_SOURCE_LOGO_ID,
  customLogoObjectUrl: null,
  backgroundObjectUrl: DEFAULT_CONTENT.backgroundUrl,
  articleImageObjectUrl: DEFAULT_CONTENT.articleImageUrl,
  uploadedArticleImageObjectUrl: null,
  flattenedCropUrl: null,
  imageMode: 'crop',
  cropZoom: DEFAULT_CROP_SETTINGS.zoom,
  cropOffsetX: DEFAULT_CROP_SETTINGS.offsetX,
  cropOffsetY: DEFAULT_CROP_SETTINGS.offsetY,
  exportStatus: 'idle',
  exportError: null,
  lastExportSize: null,
  sourceUrl: DEFAULT_CONTENT.sourceUrl,
  sourceName: DEFAULT_CONTENT.sourceName,
  headline: DEFAULT_CONTENT.headline,
  subhead: DEFAULT_CONTENT.subhead,
  excerpt: DEFAULT_CONTENT.excerpt,
  scratchpad: DEFAULT_CONTENT.scratchpad,
  scratchpadSelection: EMPTY_SELECTION,
  caption: DEFAULT_CONTENT.caption,
  logoUploadError: null,
  articleImageUploadError: null,
  setHeadlineFontSize: (headlineFontSize) => set({ headlineFontSize }),
  setExcerptFontSize: (excerptFontSize) => set({ excerptFontSize }),
  setFlattenedCropUrl: (flattenedCropUrl) => {
    const previous = get().flattenedCropUrl;
    if (previous && previous !== flattenedCropUrl) {
      revokeIfBlob(previous);
    }
    set({ flattenedCropUrl });
  },
  setExportStatus: (exportStatus, exportError = null, lastExportSize = null) =>
    set({ exportStatus, exportError, lastExportSize }),
  setSourceUrl: (sourceUrl) => set({ sourceUrl }),
  setSourceName: (sourceName) => set({ sourceName }),
  setHeadline: (headline) => set({ headline }),
  setSubhead: (subhead) => set({ subhead }),
  setExcerpt: (excerpt) => set({ excerpt }),
  setScratchpad: (scratchpad) => set({ scratchpad }),
  setScratchpadSelection: (scratchpadSelection) => set({ scratchpadSelection }),
  setCaption: (caption) => set({ caption }),
  setSelectedSourceLogoId: (selectedSourceLogoId) =>
    set({ selectedSourceLogoId, logoUploadError: null }),
  uploadCustomLogo: (file) => {
    try {
      const { customLogoObjectUrl } = get();
      revokeIfBlob(customLogoObjectUrl);

      const objectUrl = createLogoObjectUrl(file);
      set({
        customLogoObjectUrl: objectUrl,
        selectedSourceLogoId: 'custom',
        logoUploadError: null,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Custom logo upload failed';
      set({ logoUploadError: message });
    }
  },
  clearCustomLogo: () => {
    const { customLogoObjectUrl, selectedSourceLogoId } = get();
    revokeIfBlob(customLogoObjectUrl);

    set({
      customLogoObjectUrl: null,
      logoUploadError: null,
      selectedSourceLogoId:
        selectedSourceLogoId === 'custom'
          ? DEFAULT_SOURCE_LOGO_ID
          : selectedSourceLogoId,
    });
  },
  setImageMode: (imageMode) => set({ imageMode }),
  setCropZoom: (cropZoom) => set({ cropZoom }),
  setCropOffsetX: (cropOffsetX) => set({ cropOffsetX }),
  setCropOffsetY: (cropOffsetY) => set({ cropOffsetY }),
  resetCrop: () =>
    set({
      cropZoom: DEFAULT_CROP_SETTINGS.zoom,
      cropOffsetX: DEFAULT_CROP_SETTINGS.offsetX,
      cropOffsetY: DEFAULT_CROP_SETTINGS.offsetY,
    }),
  uploadArticleImage: (file) => {
    try {
      const { uploadedArticleImageObjectUrl } = get();
      revokeIfBlob(uploadedArticleImageObjectUrl);

      const objectUrl = createArticleImageObjectUrl(file);
      set({
        uploadedArticleImageObjectUrl: objectUrl,
        articleImageObjectUrl: objectUrl,
        articleImageUploadError: null,
        cropZoom: DEFAULT_CROP_SETTINGS.zoom,
        cropOffsetX: DEFAULT_CROP_SETTINGS.offsetX,
        cropOffsetY: DEFAULT_CROP_SETTINGS.offsetY,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Article image upload failed';
      set({ articleImageUploadError: message });
    }
  },
  clearUploadedArticleImage: () => {
    const { uploadedArticleImageObjectUrl } = get();
    revokeIfBlob(uploadedArticleImageObjectUrl);

    set({
      uploadedArticleImageObjectUrl: null,
      articleImageObjectUrl: DEFAULT_CONTENT.articleImageUrl,
      articleImageUploadError: null,
      cropZoom: DEFAULT_CROP_SETTINGS.zoom,
      cropOffsetX: DEFAULT_CROP_SETTINGS.offsetX,
      cropOffsetY: DEFAULT_CROP_SETTINGS.offsetY,
    });
  },
  useSelectedAsExcerpt: () => {
    const { scratchpadSelection } = get();
    if (!scratchpadSelection.text) return;
    set({ excerpt: scratchpadSelection.text });
  },
  appendSelectedToExcerpt: () => {
    const { excerpt, scratchpadSelection } = get();
    if (!scratchpadSelection.text) return;
    set({ excerpt: appendWithSpacing(excerpt, scratchpadSelection.text) });
  },
  clearScratchpad: () =>
    set({ scratchpad: '', scratchpadSelection: EMPTY_SELECTION }),
}));

export const selectHasScratchpadSelection = (state: SnipperState): boolean =>
  state.scratchpadSelection.text.length > 0;

export const selectCropSettings = (state: SnipperState): CropSettings => ({
  zoom: state.cropZoom,
  offsetX: state.cropOffsetX,
  offsetY: state.cropOffsetY,
});

export const selectHasUploadedArticleImage = (state: SnipperState): boolean =>
  state.uploadedArticleImageObjectUrl !== null;
