import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FORMATS,
  FORMAT_LIST,
  getCarouselExportFilename,
  type FormatKey,
} from '@/constants/formats';
import { FLATTEN_DEBOUNCE_MS } from '@/constants/imageSettings';
import { computeArticleZones, getStandardArticleLayout } from '@/constants/standardArticleLayouts';
import { exportCardPng } from '@/utils/exportCard';
import { flattenImage } from '@/utils/flattenImage';
import {
  buildCardPropsForPage,
  flattenPageImage,
} from '@/utils/carouselExport';
import {
  resolveFormatBackground,
  resolveSourceLogoUrl,
} from '@/store/selectors';
import {
  selectActivePage,
  useSnipitStore,
} from '@/store/snipitStore';
import { useShallow } from 'zustand/react/shallow';
import { PreviewCardWithTextFit } from '@/components/cards/PreviewCardWithTextFit';
import { StandardArticleCard } from '@/components/cards/StandardArticleCard';
import { ControlsPanel } from '@/components/layout/ControlsPanel';
import { ContentWorkspace } from '@/components/layout/ContentWorkspace';
import { PreviewPanel } from '@/components/layout/PreviewPanel';
import type { PreviewZoneMetrics } from '@/context/PreviewZoneMetricsContext';
import { PreviewZoneMetricsProvider } from '@/context/PreviewZoneMetricsContext';
import styles from './App.module.css';

function isFormatKey(value: string): value is FormatKey {
  return value in FORMATS;
}

interface ExportRenderTarget {
  formatKey: FormatKey;
  pageIndex: number;
  flattenedUrl: string | null;
}

function waitForPaint(): Promise<void> {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve());
    });
  });
}

export default function App() {
  const exportRef = useRef<HTMLDivElement>(null);
  const flattenGenerationRef = useRef(0);
  const flattenTimeoutRef = useRef<number | null>(null);
  const [flattenPending, setFlattenPending] = useState(false);
  const [exportRenderTarget, setExportRenderTarget] =
    useState<ExportRenderTarget | null>(null);

  const storeFormatKey = useSnipitStore((s) => s.format);
  const format = isFormatKey(storeFormatKey) ? FORMATS[storeFormatKey] : FORMATS.story;
  const pages = useSnipitStore((s) => s.pages);
  const activePageIndex = useSnipitStore((s) => s.activePageIndex);
  const activePage = useSnipitStore(selectActivePage);
  const backgroundFallbackNote = useSnipitStore(
    (s) => resolveFormatBackground(s).fallbackNote,
  );
  const exportStatus = useSnipitStore((s) => s.exportStatus);
  const exportError = useSnipitStore((s) => s.exportError);
  const exportProgress = useSnipitStore((s) => s.exportProgress);
  const lastExportSize = useSnipitStore((s) => s.lastExportSize);
  const setFlattenedCropUrl = useSnipitStore((s) => s.setFlattenedCropUrl);
  const setExportStatus = useSnipitStore((s) => s.setExportStatus);
  const setExportProgress = useSnipitStore((s) => s.setExportProgress);

  const previewLayout = useMemo(
    () => getStandardArticleLayout(format.key),
    [format.key],
  );

  const logoUrl = useSnipitStore(resolveSourceLogoUrl);
  const subhead = useSnipitStore((s) => s.subhead);

  const computedImageFrame = useMemo(
    () =>
      computeArticleZones({
        layout: previewLayout,
        format,
        showImage: activePage.imageMode !== 'none',
        hasSubhead: Boolean(subhead.trim()),
        hasLogo: Boolean(logoUrl),
        hasFooter: true,
      }).imageFrame,
    [previewLayout, format, activePage.imageMode, subhead, logoUrl],
  );

  const clearFlattenTimeout = useCallback(() => {
    if (flattenTimeoutRef.current !== null) {
      window.clearTimeout(flattenTimeoutRef.current);
      flattenTimeoutRef.current = null;
    }
  }, []);

  const runFlatten = useCallback(
    async (generation: number): Promise<boolean> => {
      const state = useSnipitStore.getState();
      const page = selectActivePage(state);
      const sourceUrl = page.articleImageObjectUrl;
      const mode = page.imageMode;

      if (!sourceUrl || mode === 'none') {
        if (generation === flattenGenerationRef.current) {
          setFlattenedCropUrl(null);
          setFlattenPending(false);
        }
        return true;
      }

      const { width, height } = computedImageFrame;

      try {
        const url = await flattenImage({
          sourceUrl,
          outputWidth: width,
          outputHeight: height,
          mode,
          crop: {
            zoom: page.cropZoom,
            offsetX: page.cropOffsetX,
            offsetY: page.cropOffsetY,
          },
        });

        if (generation !== flattenGenerationRef.current) {
          URL.revokeObjectURL(url);
          return false;
        }

        setFlattenedCropUrl(url);
        return true;
      } catch (err: unknown) {
        console.error('Flatten failed:', err);
        return false;
      } finally {
        if (generation === flattenGenerationRef.current) {
          setFlattenPending(false);
        }
      }
    },
    [computedImageFrame, setFlattenedCropUrl],
  );

  useEffect(() => {
    if (!activePage.articleImageObjectUrl || activePage.imageMode === 'none') {
      flattenGenerationRef.current += 1;
      clearFlattenTimeout();
      setFlattenedCropUrl(null);
      setFlattenPending(false);
      return;
    }

    flattenGenerationRef.current += 1;
    const generation = flattenGenerationRef.current;
    setFlattenPending(true);
    clearFlattenTimeout();

    flattenTimeoutRef.current = window.setTimeout(() => {
      flattenTimeoutRef.current = null;
      void runFlatten(generation);
    }, FLATTEN_DEBOUNCE_MS);

    return clearFlattenTimeout;
  }, [
    activePage.articleImageObjectUrl,
    activePage.imageMode,
    activePage.cropZoom,
    activePage.cropOffsetX,
    activePage.cropOffsetY,
    activePageIndex,
    computedImageFrame,
    clearFlattenTimeout,
    runFlatten,
    setFlattenedCropUrl,
  ]);

  const previewFlattenedUrl =
    activePage.imageMode === 'none' ? null : activePage.flattenedCropUrl;

  const previewCardProps = useSnipitStore(
    useShallow((state) => {
      const page = selectActivePage(state);
      const flattenedUrl =
        page.imageMode === 'none' ? null : page.flattenedCropUrl;
      return buildCardPropsForPage(
        state,
        state.activePageIndex,
        state.format,
        flattenedUrl,
      );
    }),
  );

  const exportBlocked =
    flattenPending ||
    (activePage.imageMode !== 'none' &&
      Boolean(activePage.articleImageObjectUrl) &&
      !previewFlattenedUrl);

  const exportCardProps = useMemo(() => {
    if (!exportRenderTarget) {
      return previewCardProps;
    }
    const state = useSnipitStore.getState();
    return buildCardPropsForPage(
      state,
      exportRenderTarget.pageIndex,
      exportRenderTarget.formatKey,
      exportRenderTarget.flattenedUrl,
    );
  }, [exportRenderTarget, previewCardProps]);

  const exportFormat = exportRenderTarget
    ? FORMATS[exportRenderTarget.formatKey]
    : format;

  const handleExport = useCallback(async () => {
    const node = exportRef.current;
    if (!node) return;

    const state = useSnipitStore.getState();
    const totalExports = state.pages.length * FORMAT_LIST.length;

    setExportStatus('exporting');
    setExportProgress({ completed: 0, total: totalExports, detail: 'Preparing…' });

    let completed = 0;
    let lastSize: { width: number; height: number } | null = null;
    const flattenedCache = new Map<string, string | null>();

    try {
      for (const formatSpec of FORMAT_LIST) {
        for (let pageIndex = 0; pageIndex < state.pages.length; pageIndex++) {
          const page = state.pages[pageIndex];
          const cacheKey = `${formatSpec.key}:${page.id}`;

          let flattenedUrl: string | null = null;
          if (page.imageMode !== 'none' && page.articleImageObjectUrl) {
            if (flattenedCache.has(cacheKey)) {
              flattenedUrl = flattenedCache.get(cacheKey) ?? null;
            } else {
              flattenedUrl = await flattenPageImage(state, page, formatSpec.key);
              flattenedCache.set(cacheKey, flattenedUrl);
            }
          }

          setExportRenderTarget({
            formatKey: formatSpec.key,
            pageIndex,
            flattenedUrl,
          });
          setExportProgress({
            completed,
            total: totalExports,
            detail: `${formatSpec.label} — page ${pageIndex + 1} of ${state.pages.length}`,
          });

          await waitForPaint();

          const size = await exportCardPng({
            node,
            width: formatSpec.width,
            height: formatSpec.height,
            filename: getCarouselExportFilename(
              formatSpec.key,
              pageIndex + 1,
              state.pages.length,
            ),
          });

          lastSize = size;
          completed += 1;
          setExportProgress({
            completed,
            total: totalExports,
            detail: `${formatSpec.label} — page ${pageIndex + 1} of ${state.pages.length}`,
          });
        }
      }

      setExportStatus('done', null, lastSize);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Export failed';
      setExportStatus('error', message);
    } finally {
      setExportRenderTarget(null);
      setExportProgress(null);
      for (const url of flattenedCache.values()) {
        if (url) {
          URL.revokeObjectURL(url);
        }
      }
    }
  }, [setExportProgress, setExportStatus]);

  const [previewZoneMetrics, setPreviewZoneMetrics] = useState<PreviewZoneMetrics>({
    excerptWidth: 0,
    excerptHeight: 0,
  });

  const handlePreviewZoneMetrics = useCallback((metrics: PreviewZoneMetrics) => {
    setPreviewZoneMetrics((prev) =>
      prev.excerptWidth === metrics.excerptWidth &&
      prev.excerptHeight === metrics.excerptHeight
        ? prev
        : metrics,
    );
  }, []);

  const previewSharedProps = {
    format: previewCardProps.format,
    layout: previewCardProps.layout,
    sourceName: previewCardProps.sourceName,
    headline: previewCardProps.headline,
    subhead: previewCardProps.subhead,
    excerpt: previewCardProps.excerpt,
    metadataLine: previewCardProps.metadataLine,
    attribution: previewCardProps.attribution,
    logoUrl: previewCardProps.logoUrl,
    brandLogoUrl: previewCardProps.brandLogoUrl,
    backgroundUrl: previewCardProps.backgroundUrl,
    backgroundFallbackColor: previewCardProps.backgroundFallbackColor,
    imageUrl: previewCardProps.imageUrl,
    articleImageBw: previewCardProps.articleImageBw,
    showImage: previewCardProps.showImage,
    pageNumber: previewCardProps.pageNumber,
    pageTotal: previewCardProps.pageTotal,
  };

  return (
    <PreviewZoneMetricsProvider value={previewZoneMetrics}>
      <div className={styles.app}>
        <div className={styles.columns}>
          <div className={styles.columnShell}>
            <ControlsPanel
              onExport={handleExport}
              exportStatus={exportStatus}
              exportError={exportError}
              exportProgress={exportProgress}
              lastExportSize={lastExportSize}
              backgroundFallbackNote={backgroundFallbackNote}
              exportDisabled={exportBlocked}
              pageCount={pages.length}
            />
          </div>

          <div className={styles.columnShell}>
            <ContentWorkspace />
          </div>

          <div className={styles.columnShell}>
            <PreviewPanel format={format}>
              <PreviewCardWithTextFit
                {...previewSharedProps}
                onPreviewZoneMetrics={handlePreviewZoneMetrics}
              />
            </PreviewPanel>
          </div>
        </div>

        <div
          className={styles.exportHost}
          style={{ width: exportFormat.width, height: exportFormat.height }}
          aria-hidden="true"
        >
          <div ref={exportRef}>
            <StandardArticleCard
              id="export-artboard"
              format={exportCardProps.format}
              layout={exportCardProps.layout}
              sourceName={exportCardProps.sourceName}
              headline={exportCardProps.headline}
              subhead={exportCardProps.subhead}
              excerpt={exportCardProps.excerpt}
              metadataLine={exportCardProps.metadataLine}
              attribution={exportCardProps.attribution}
              logoUrl={exportCardProps.logoUrl}
              brandLogoUrl={exportCardProps.brandLogoUrl}
              backgroundUrl={exportCardProps.backgroundUrl}
              backgroundFallbackColor={exportCardProps.backgroundFallbackColor}
              imageUrl={exportCardProps.imageUrl}
              articleImageBw={exportCardProps.articleImageBw}
              showImage={exportCardProps.showImage}
              pageNumber={exportCardProps.pageNumber}
              pageTotal={exportCardProps.pageTotal}
              headlineFontSize={exportCardProps.headlineFontSize}
              excerptFontSize={exportCardProps.excerptFontSize}
              excerptLineClamp={exportCardProps.excerptLineClamp}
            />
          </div>
        </div>
      </div>
    </PreviewZoneMetricsProvider>
  );
}
