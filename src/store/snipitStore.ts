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
import {
  type ArticlePage,
  MAX_ARTICLE_PAGES,
  cloneArticlePage,
  createDefaultArticlePage,
} from '@/types/articlePage';

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

export interface ExportProgress {
  completed: number;
  total: number;
  detail: string;
}

export interface SnipitState {
  format: FormatKey;
  pages: ArticlePage[];
  activePageIndex: number;
  headlineSizeStep: TextSizeStep;
  headlineAutoFit: boolean;
  headlineFitStatus: FitStatus;
  headlineResolvedFontSize: number;
  selectedBuiltinLogoId: string | null;
  sourceLogoObjectUrl: string | null;
  sourceLogoHidden: boolean;
  showSource: boolean;
  selectedBrandLogoId: string;
  selectedBackgroundPackId: string;
  exportStatus: 'idle' | 'exporting' | 'done' | 'error';
  exportError: string | null;
  exportProgress: ExportProgress | null;
  lastExportSize: { width: number; height: number } | null;
  sourceUrl: string;
  sourceName: string;
  headline: string;
  subhead: string;
  scratchpad: string;
  scratchpadSelection: ScratchpadSelection;
  caption: string;
  byline: string;
  articleDate: string;
  showByline: boolean;
  showArticleDate: boolean;
  attribution: string;
  showAttribution: boolean;
  logoUploadError: string | null;
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
  setExportProgress: (progress: ExportProgress | null) => void;
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
  addSelectionAsNewPage: () => void;
  clearScratchpad: () => void;
  addPage: () => void;
  duplicatePage: () => void;
  deletePage: () => void;
  setActivePageIndex: (index: number) => void;
  goToPrevPage: () => void;
  goToNextPage: () => void;
}

function revokeIfBlob(url: string | null): void {
  if (isRevokableObjectUrl(url)) {
    URL.revokeObjectURL(url);
  }
}

function revokePageResources(page: ArticlePage): void {
  revokeIfBlob(page.uploadedArticleImageObjectUrl);
  revokeIfBlob(page.flattenedCropUrl);
}

function updateActivePage(
  pages: ArticlePage[],
  activePageIndex: number,
  patch: Partial<ArticlePage>,
): ArticlePage[] {
  return pages.map((page, index) =>
    index === activePageIndex ? { ...page, ...patch } : page,
  );
}

function getActivePage(state: SnipitState): ArticlePage {
  return state.pages[state.activePageIndex] ?? state.pages[0];
}

export const useSnipitStore = create<SnipitState>((set, get) => ({
  format: 'story',
  pages: [createDefaultArticlePage()],
  activePageIndex: 0,
  headlineSizeStep: 0,
  headlineAutoFit: true,
  headlineFitStatus: 'fits',
  headlineResolvedFontSize: HEADLINE_TYPO.default,
  selectedBuiltinLogoId: getDefaultBuiltinSourceLogoId(),
  sourceLogoObjectUrl: null,
  sourceLogoHidden: false,
  showSource: true,
  selectedBrandLogoId: getDefaultBrandLogoId(),
  selectedBackgroundPackId: DEFAULT_BACKGROUND_PACK_ID,
  exportStatus: 'idle',
  exportError: null,
  exportProgress: null,
  lastExportSize: null,
  sourceUrl: DEFAULT_CONTENT.sourceUrl,
  sourceName: DEFAULT_CONTENT.sourceName,
  headline: DEFAULT_CONTENT.headline,
  subhead: DEFAULT_CONTENT.subhead,
  scratchpad: DEFAULT_CONTENT.scratchpad,
  scratchpadSelection: EMPTY_SELECTION,
  caption: DEFAULT_CONTENT.caption,
  byline: DEFAULT_CONTENT.byline,
  articleDate: DEFAULT_CONTENT.articleDate,
  showByline: false,
  showArticleDate: false,
  attribution: DEFAULT_CONTENT.attribution,
  showAttribution: false,
  logoUploadError: null,
  setTextFitResult: (result) => {
    const state = get();
    const activePage = getActivePage(state);
    if (
      state.headlineResolvedFontSize === result.headlineResolvedFontSize &&
      state.headlineFitStatus === result.headlineFitStatus &&
      activePage.excerptResolvedFontSize === result.excerptResolvedFontSize &&
      activePage.excerptFitStatus === result.excerptFitStatus &&
      activePage.excerptLineClamp === result.excerptLineClamp
    ) {
      return;
    }
    set({
      headlineResolvedFontSize: result.headlineResolvedFontSize,
      headlineFitStatus: result.headlineFitStatus,
      pages: updateActivePage(state.pages, state.activePageIndex, {
        excerptResolvedFontSize: result.excerptResolvedFontSize,
        excerptFitStatus: result.excerptFitStatus,
        excerptLineClamp: result.excerptLineClamp,
      }),
    });
  },
  adjustHeadlineSizeStep: (delta) =>
    set((state) => ({
      headlineSizeStep: clampTextSizeStep(state.headlineSizeStep + delta),
      headlineAutoFit: false,
    })),
  adjustExcerptSizeStep: (delta) =>
    set((state) => ({
      pages: updateActivePage(state.pages, state.activePageIndex, {
        excerptSizeStep: clampTextSizeStep(
          getActivePage(state).excerptSizeStep + delta,
        ),
        excerptAutoFit: false,
      }),
    })),
  setHeadlineAutoFit: (headlineAutoFit) => set({ headlineAutoFit }),
  setExcerptAutoFit: (excerptAutoFit) =>
    set((state) => ({
      pages: updateActivePage(state.pages, state.activePageIndex, {
        excerptAutoFit,
      }),
    })),
  resetTextControls: () => {
    const layout = getStandardArticleLayout(get().format);
    set((state) => ({
      headlineSizeStep: 0,
      headlineAutoFit: true,
      headlineResolvedFontSize: preferredFontSize(0, layout.headlineTypo),
      headlineFitStatus: 'fits',
      pages: updateActivePage(state.pages, state.activePageIndex, {
        excerptSizeStep: 0,
        excerptAutoFit: false,
        excerptResolvedFontSize: preferredFontSize(0, layout.excerptTypo),
        excerptFitStatus: 'fits',
        excerptLineClamp: 0,
      }),
    }));
  },
  setFormat: (format) => set({ format }),
  setFlattenedCropUrl: (flattenedCropUrl) => {
    const state = get();
    const activePage = getActivePage(state);
    if (
      activePage.flattenedCropUrl &&
      activePage.flattenedCropUrl !== flattenedCropUrl
    ) {
      revokeIfBlob(activePage.flattenedCropUrl);
    }
    set({
      pages: updateActivePage(state.pages, state.activePageIndex, {
        flattenedCropUrl,
      }),
    });
  },
  setExportStatus: (exportStatus, exportError = null, lastExportSize = null) =>
    set({ exportStatus, exportError, lastExportSize }),
  setExportProgress: (exportProgress) => set({ exportProgress }),
  setSourceUrl: (sourceUrl) => set({ sourceUrl }),
  setSourceName: (sourceName) => set({ sourceName }),
  setShowSource: (showSource) => set({ showSource }),
  setSelectedBackgroundPackId: (selectedBackgroundPackId) =>
    set({ selectedBackgroundPackId }),
  setHeadline: (headline) => set({ headline }),
  setSubhead: (subhead) => set({ subhead }),
  setExcerpt: (excerpt) =>
    set((state) => ({
      pages: updateActivePage(state.pages, state.activePageIndex, { excerpt }),
    })),
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
  setImageMode: (imageMode) =>
    set((state) => ({
      pages: updateActivePage(state.pages, state.activePageIndex, { imageMode }),
    })),
  setArticleImageBw: (articleImageBw) =>
    set((state) => ({
      pages: updateActivePage(state.pages, state.activePageIndex, {
        articleImageBw,
      }),
    })),
  setCropZoom: (cropZoom) =>
    set((state) => ({
      pages: updateActivePage(state.pages, state.activePageIndex, {
        cropZoom: clampCropZoom(cropZoom),
      }),
    })),
  setCropOffsetX: (cropOffsetX) =>
    set((state) => ({
      pages: updateActivePage(state.pages, state.activePageIndex, {
        cropOffsetX: clampCropOffset(cropOffsetX),
      }),
    })),
  setCropOffsetY: (cropOffsetY) =>
    set((state) => ({
      pages: updateActivePage(state.pages, state.activePageIndex, {
        cropOffsetY: clampCropOffset(cropOffsetY),
      }),
    })),
  resetCrop: () =>
    set((state) => ({
      pages: updateActivePage(state.pages, state.activePageIndex, {
        cropZoom: DEFAULT_CROP_SETTINGS.zoom,
        cropOffsetX: DEFAULT_CROP_SETTINGS.offsetX,
        cropOffsetY: DEFAULT_CROP_SETTINGS.offsetY,
      }),
    })),
  uploadArticleImage: (file) => {
    try {
      const state = get();
      const activePage = getActivePage(state);
      revokeIfBlob(activePage.uploadedArticleImageObjectUrl);

      const objectUrl = createArticleImageObjectUrl(file);
      set({
        pages: updateActivePage(state.pages, state.activePageIndex, {
          uploadedArticleImageObjectUrl: objectUrl,
          articleImageObjectUrl: objectUrl,
          articleImageUploadError: null,
          cropZoom: DEFAULT_CROP_SETTINGS.zoom,
          cropOffsetX: DEFAULT_CROP_SETTINGS.offsetX,
          cropOffsetY: DEFAULT_CROP_SETTINGS.offsetY,
        }),
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Article image upload failed';
      set((state) => ({
        pages: updateActivePage(state.pages, state.activePageIndex, {
          articleImageUploadError: message,
        }),
      }));
    }
  },
  clearUploadedArticleImage: () => {
    const state = get();
    const activePage = getActivePage(state);
    revokeIfBlob(activePage.uploadedArticleImageObjectUrl);

    set({
      pages: updateActivePage(state.pages, state.activePageIndex, {
        uploadedArticleImageObjectUrl: null,
        articleImageObjectUrl: DEFAULT_CONTENT.articleImageUrl,
        articleImageUploadError: null,
        cropZoom: DEFAULT_CROP_SETTINGS.zoom,
        cropOffsetX: DEFAULT_CROP_SETTINGS.offsetX,
        cropOffsetY: DEFAULT_CROP_SETTINGS.offsetY,
      }),
    });
  },
  useSelectedAsExcerpt: () => {
    const { scratchpadSelection } = get();
    if (!scratchpadSelection.text) return;
    get().setExcerpt(scratchpadSelection.text);
  },
  appendSelectedToExcerpt: () => {
    const state = get();
    const { scratchpadSelection } = state;
    if (!scratchpadSelection.text) return;
    get().setExcerpt(
      appendWithSpacing(getActivePage(state).excerpt, scratchpadSelection.text),
    );
  },
  addSelectionAsNewPage: () => {
    const state = get();
    const { scratchpadSelection, pages } = state;
    if (!scratchpadSelection.text || pages.length >= MAX_ARTICLE_PAGES) return;

    const newPage = createDefaultArticlePage({
      excerpt: scratchpadSelection.text,
      excerptSizeStep: 0,
      excerptAutoFit: false,
      excerptResolvedFontSize: EXCERPT_TYPO.default,
      excerptFitStatus: 'fits',
      excerptLineClamp: 0,
      articleImageObjectUrl: DEFAULT_CONTENT.articleImageUrl,
      uploadedArticleImageObjectUrl: null,
      flattenedCropUrl: null,
      imageMode: 'crop',
      articleImageBw: false,
      cropZoom: DEFAULT_CROP_SETTINGS.zoom,
      cropOffsetX: DEFAULT_CROP_SETTINGS.offsetX,
      cropOffsetY: DEFAULT_CROP_SETTINGS.offsetY,
    });

    set({
      pages: [...pages, newPage],
      activePageIndex: pages.length,
    });
  },
  clearScratchpad: () =>
    set({ scratchpad: '', scratchpadSelection: EMPTY_SELECTION }),
  addPage: () => {
    const { pages } = get();
    if (pages.length >= MAX_ARTICLE_PAGES) return;
    const newPage = createDefaultArticlePage({
      excerpt: '',
      articleImageObjectUrl: DEFAULT_CONTENT.articleImageUrl,
      uploadedArticleImageObjectUrl: null,
      flattenedCropUrl: null,
    });
    set({
      pages: [...pages, newPage],
      activePageIndex: pages.length,
    });
  },
  duplicatePage: () => {
    const state = get();
    if (state.pages.length >= MAX_ARTICLE_PAGES) return;
    const sourcePage = getActivePage(state);
    const duplicate = cloneArticlePage(sourcePage);
    const pages = [...state.pages];
    pages.splice(state.activePageIndex + 1, 0, duplicate);
    set({
      pages,
      activePageIndex: state.activePageIndex + 1,
    });
  },
  deletePage: () => {
    const state = get();
    if (state.pages.length <= 1) return;
    const removed = getActivePage(state);
    revokePageResources(removed);
    const pages = state.pages.filter((_, index) => index !== state.activePageIndex);
    set({
      pages,
      activePageIndex: Math.min(state.activePageIndex, pages.length - 1),
    });
  },
  setActivePageIndex: (index) => {
    const { pages } = get();
    if (index < 0 || index >= pages.length) return;
    set({ activePageIndex: index });
  },
  goToPrevPage: () => {
    const { activePageIndex } = get();
    if (activePageIndex > 0) {
      set({ activePageIndex: activePageIndex - 1 });
    }
  },
  goToNextPage: () => {
    const { activePageIndex, pages } = get();
    if (activePageIndex < pages.length - 1) {
      set({ activePageIndex: activePageIndex + 1 });
    }
  },
}));

export const selectHasScratchpadSelection = (state: SnipitState): boolean =>
  state.scratchpadSelection.text.length > 0;

export const selectActivePage = (state: SnipitState): ArticlePage =>
  state.pages[state.activePageIndex] ?? state.pages[0];

export const selectCropSettings = (state: SnipitState): CropSettings => {
  const page = selectActivePage(state);
  return {
    zoom: page.cropZoom,
    offsetX: page.cropOffsetX,
    offsetY: page.cropOffsetY,
  };
};

export const selectHasUploadedArticleImage = (state: SnipitState): boolean =>
  selectActivePage(state).uploadedArticleImageObjectUrl !== null;

export function selectPageAt(
  state: SnipitState,
  pageIndex: number,
): ArticlePage {
  return state.pages[pageIndex] ?? state.pages[0];
}
