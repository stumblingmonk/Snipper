import { create } from 'zustand';
import type { FormatKey, ImageMode } from '@/constants/formats';
import {
  DEFAULT_BACKGROUND_PACK_ID,
} from '@/constants/backgroundPacks';
import {
  DEFAULT_CROP_SETTINGS,
  clampCropOffset,
  clampCropZoom,
  type CropSettings,
} from '@/constants/imageSettings';
import {
  getDefaultBuiltinSourceLogoId,
  getBuiltinSourceLogoLabel,
} from '@/constants/builtinSourceLogos';
import { getDefaultBrandLogoId } from '@/constants/builtinBrandLogos';
import { appendWithSpacing } from '@/utils/appendText';
import {
  createArticleImageObjectUrl,
  isRevokableObjectUrl,
} from '@/utils/articleImageUpload';
import { createLogoObjectUrl } from '@/utils/logoUpload';
import {
  DEFAULT_ARTICLE_IMAGE,
  PROVIDED_DEFAULT_COPY,
} from '@/constants/providedAssets';
import {
  DEFAULT_FORMAT_BACKGROUND,
  getStandardArticleLayout,
} from '@/constants/standardArticleLayouts';
import {
  EXCERPT_TYPO,
  HEADLINE_TYPO,
  preferredFontSize,
  clampTextSizeStep,
  type FitStatus,
  type TextSizeStep,
} from '@/constants/textFit';

/** Default content seeded from project handoff copy and assets. */
export const DEFAULT_CONTENT = {
  ...PROVIDED_DEFAULT_COPY,
  backgroundUrl: DEFAULT_FORMAT_BACKGROUND,
  articleImageUrl: DEFAULT_ARTICLE_IMAGE,
} as const;

export interface ScratchpadSelection {
  start: number;
  end: number;
  text: string;
}

const EMPTY_SELECTION: ScratchpadSelection = { start: 0, end: 0, text: '' };

export interface TextFitResult {
  headlineResolvedFontSize: number;
  headlineFitStatus: FitStatus;
  excerptResolvedFontSize: number;
  excerptFitStatus: FitStatus;
  excerptLineClamp: number;
}

export interface SnipitState {
  format: FormatKey;
  headlineSizeStep: TextSizeStep;
  excerptSizeStep: TextSizeStep;
  headlineAutoFit: boolean;
  excerptAutoFit: boolean;
  headlineFitStatus: FitStatus;
  excerptFitStatus: FitStatus;
  headlineResolvedFontSize: number;
  excerptResolvedFontSize: number;
  excerptLineClamp: number;
  selectedBuiltinLogoId: string | null;
  sourceLogoObjectUrl: string | null;
  sourceLogoHidden: boolean;
  showSource: boolean;
  selectedBrandLogoId: string;
  selectedBackgroundPackId: string;
  articleImageObjectUrl: string | null;
  uploadedArticleImageObjectUrl: string | null;
  flattenedCropUrl: string | null;
  imageMode: ImageMode;
  articleImageBw: boolean;
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
  byline: string;
  articleDate: string;
  attribution: string;
  showByline: boolean;
  showArticleDate: boolean;
  showAttribution: boolean;
  logoUploadError: string | null;
  articleImageUploadError: string | null;
  setTextFitResult: (result: TextFitResult) => void;
  adjustHeadlineSizeStep: (delta: number) => void;
  adjustExcerptSizeStep: (delta: number) => void;
  setHeadlineAutoFit: (enabled: boolean) => void;
  setExcerptAutoFit: (enabled: boolean) => void;
  resetTextControls: () => void;
  setFormat: (format: FormatKey) => void;
  setFlattenedCropUrl: (url: string | null) => void;
  setExportStatus: (
    status: SnipitState['exportStatus'],
    error?: string | null,
    size?: { width: number; height: number } | null,
  ) => void;
  setSourceUrl: (sourceUrl: string) => void;
  setSourceName: (sourceName: string) => void;
  setShowSource: (showSource: boolean) => void;
  setSelectedBackgroundPackId: (packId: string) => void;
  setHeadline: (headline: string) => void;
  setSubhead: (subhead: string) => void;
  setExcerpt: (excerpt: string) => void;
  setScratchpad: (scratchpad: string) => void;
  setScratchpadSelection: (selection: ScratchpadSelection) => void;
  setCaption: (caption: string) => void;
  setByline: (byline: string) => void;
  setArticleDate: (articleDate: string) => void;
  setAttribution: (attribution: string) => void;
  setShowByline: (showByline: boolean) => void;
  setShowArticleDate: (showArticleDate: boolean) => void;
  setShowAttribution: (showAttribution: boolean) => void;
  selectBuiltinSourceLogo: (logoId: string) => void;
  chooseOtherSourceLogo: (file: File) => void;
  clearSourceLogo: () => void;
  selectBrandLogo: (logoId: string) => void;
  setImageMode: (mode: ImageMode) => void;
  setArticleImageBw: (enabled: boolean) => void;
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

export const useSnipitStore = create<SnipitState>((set, get) => ({
  format: 'story',
  headlineSizeStep: 0,
  excerptSizeStep: 0,
  headlineAutoFit: true,
  excerptAutoFit: false,
  headlineFitStatus: 'fits',
  excerptFitStatus: 'fits',
  headlineResolvedFontSize: HEADLINE_TYPO.default,
  excerptResolvedFontSize: EXCERPT_TYPO.default,
  excerptLineClamp: 0,
  selectedBuiltinLogoId: getDefaultBuiltinSourceLogoId(),
  sourceLogoObjectUrl: null,
  sourceLogoHidden: false,
  showSource: true,
  selectedBrandLogoId: getDefaultBrandLogoId(),
  selectedBackgroundPackId: DEFAULT_BACKGROUND_PACK_ID,
  articleImageObjectUrl: DEFAULT_CONTENT.articleImageUrl,
  uploadedArticleImageObjectUrl: null,
  flattenedCropUrl: null,
  imageMode: 'crop',
  articleImageBw: false,
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
  byline: DEFAULT_CONTENT.byline,
  articleDate: DEFAULT_CONTENT.articleDate,
  attribution: DEFAULT_CONTENT.attribution,
  showByline: false,
  showArticleDate: false,
  showAttribution: false,
  logoUploadError: null,
  articleImageUploadError: null,
  setTextFitResult: (result) => {
    const state = get();
    if (
      state.headlineResolvedFontSize === result.headlineResolvedFontSize &&
      state.headlineFitStatus === result.headlineFitStatus &&
      state.excerptResolvedFontSize === result.excerptResolvedFontSize &&
      state.excerptFitStatus === result.excerptFitStatus &&
      state.excerptLineClamp === result.excerptLineClamp
    ) {
      return;
    }
    set(result);
  },
  adjustHeadlineSizeStep: (delta) =>
    set((state) => ({
      headlineSizeStep: clampTextSizeStep(state.headlineSizeStep + delta),
      headlineAutoFit: false,
    })),
  adjustExcerptSizeStep: (delta) =>
    set((state) => ({
      excerptSizeStep: clampTextSizeStep(state.excerptSizeStep + delta),
      excerptAutoFit: false,
    })),
  setHeadlineAutoFit: (headlineAutoFit) => set({ headlineAutoFit }),
  setExcerptAutoFit: (excerptAutoFit) => set({ excerptAutoFit }),
  resetTextControls: () => {
    const layout = getStandardArticleLayout(get().format);
    set({
      headlineSizeStep: 0,
      excerptSizeStep: 0,
      headlineAutoFit: true,
      excerptAutoFit: false,
      headlineResolvedFontSize: preferredFontSize(0, layout.headlineTypo),
      excerptResolvedFontSize: preferredFontSize(0, layout.excerptTypo),
      headlineFitStatus: 'fits',
      excerptFitStatus: 'fits',
      excerptLineClamp: 0,
    });
  },
  setFormat: (format) => set({ format }),
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
  setShowSource: (showSource) => set({ showSource }),
  setSelectedBackgroundPackId: (selectedBackgroundPackId) =>
    set({ selectedBackgroundPackId }),
  setHeadline: (headline) => set({ headline }),
  setSubhead: (subhead) => set({ subhead }),
  setExcerpt: (excerpt) => set({ excerpt }),
  setScratchpad: (scratchpad) => set({ scratchpad }),
  setScratchpadSelection: (scratchpadSelection) => set({ scratchpadSelection }),
  setCaption: (caption) => set({ caption }),
  setByline: (byline) => set({ byline }),
  setArticleDate: (articleDate) => set({ articleDate }),
  setAttribution: (attribution) => set({ attribution }),
  setShowByline: (showByline) => set({ showByline }),
  setShowArticleDate: (showArticleDate) => set({ showArticleDate }),
  setShowAttribution: (showAttribution) => set({ showAttribution }),
  selectBuiltinSourceLogo: (logoId) => {
    const { sourceLogoObjectUrl } = get();
    revokeIfBlob(sourceLogoObjectUrl);

    const label = getBuiltinSourceLogoLabel(logoId);

    set({
      selectedBuiltinLogoId: logoId,
      sourceLogoObjectUrl: null,
      sourceLogoHidden: false,
      logoUploadError: null,
      ...(label ? { sourceName: label } : {}),
    });
  },
  chooseOtherSourceLogo: (file) => {
    try {
      const { sourceLogoObjectUrl } = get();
      revokeIfBlob(sourceLogoObjectUrl);

      const objectUrl = createLogoObjectUrl(file);
      set({
        selectedBuiltinLogoId: null,
        sourceLogoObjectUrl: objectUrl,
        sourceLogoHidden: false,
        logoUploadError: null,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Source logo selection failed';
      set({ logoUploadError: message });
    }
  },
  clearSourceLogo: () => {
    const { sourceLogoObjectUrl } = get();
    revokeIfBlob(sourceLogoObjectUrl);

    set({
      selectedBuiltinLogoId: null,
      sourceLogoObjectUrl: null,
      sourceLogoHidden: true,
      logoUploadError: null,
    });
  },
  selectBrandLogo: (logoId) => set({ selectedBrandLogoId: logoId }),
  setImageMode: (imageMode) => set({ imageMode }),
  setArticleImageBw: (articleImageBw) => set({ articleImageBw }),
  setCropZoom: (cropZoom) => set({ cropZoom: clampCropZoom(cropZoom) }),
  setCropOffsetX: (cropOffsetX) => set({ cropOffsetX: clampCropOffset(cropOffsetX) }),
  setCropOffsetY: (cropOffsetY) => set({ cropOffsetY: clampCropOffset(cropOffsetY) }),
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

export const selectHasScratchpadSelection = (state: SnipitState): boolean =>
  state.scratchpadSelection.text.length > 0;

export const selectCropSettings = (state: SnipitState): CropSettings => ({
  zoom: state.cropZoom,
  offsetX: state.cropOffsetX,
  offsetY: state.cropOffsetY,
});

export const selectHasUploadedArticleImage = (state: SnipitState): boolean =>
  state.uploadedArticleImageObjectUrl !== null;
