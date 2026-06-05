import { create } from 'zustand';
import type { FormatKey, ImageMode } from '@/constants/formats';

/** Phase 1 stress-test content baked in for adversarial export. */
export const PHASE1_STRESS = {
  sourceName: 'The Hollywood Reporter',
  headline:
    '‘Saturday Night Live’ Star Marcello Hernández Will Host the 2026 ESPYs as the Awards Return to New York City https://www.hollywoodreporter.com/tv/tv-news/2026-espys-host-marcello-hernandez-1236612262/',
  excerpt:
    'Marcello Hernández will host the 2026 ESPYs as the awards return to New York City. The ceremony will air July 15 on ABC.',
  logoUrl: '/assets/logos/the-hollywood-reporter.svg',
  backgroundUrl: '/assets/stress/background.jpg',
  articleImageUrl: '/assets/stress/article-subject.png',
} as const;

interface SnipperState {
  format: FormatKey;
  headlineFontSize: number;
  excerptFontSize: number;
  logoObjectUrl: string | null;
  backgroundObjectUrl: string | null;
  articleImageObjectUrl: string | null;
  flattenedCropUrl: string | null;
  imageMode: ImageMode;
  exportStatus: 'idle' | 'exporting' | 'done' | 'error';
  exportError: string | null;
  lastExportSize: { width: number; height: number } | null;
  setHeadlineFontSize: (size: number) => void;
  setExcerptFontSize: (size: number) => void;
  setFlattenedCropUrl: (url: string | null) => void;
  setExportStatus: (
    status: SnipperState['exportStatus'],
    error?: string | null,
    size?: { width: number; height: number } | null,
  ) => void;
}

export const useSnipperStore = create<SnipperState>((set) => ({
  format: 'story',
  headlineFontSize: 72,
  excerptFontSize: 36,
  logoObjectUrl: PHASE1_STRESS.logoUrl,
  backgroundObjectUrl: PHASE1_STRESS.backgroundUrl,
  articleImageObjectUrl: PHASE1_STRESS.articleImageUrl,
  flattenedCropUrl: null,
  imageMode: 'crop',
  exportStatus: 'idle',
  exportError: null,
  lastExportSize: null,
  setHeadlineFontSize: (headlineFontSize) => set({ headlineFontSize }),
  setExcerptFontSize: (excerptFontSize) => set({ excerptFontSize }),
  setFlattenedCropUrl: (flattenedCropUrl) => set({ flattenedCropUrl }),
  setExportStatus: (exportStatus, exportError = null, lastExportSize = null) =>
    set({ exportStatus, exportError, lastExportSize }),
}));

export const selectCardContent = () => ({
  sourceName: PHASE1_STRESS.sourceName,
  headline: PHASE1_STRESS.headline,
  excerpt: PHASE1_STRESS.excerpt,
});
