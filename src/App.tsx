import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FORMATS,
  type FormatKey,
} from '@/constants/formats';
import { FLATTEN_DEBOUNCE_MS } from '@/constants/imageSettings';
import { computeArticleZones, getStandardArticleLayout } from '@/constants/standardArticleLayouts';
import { flattenImage } from '@/utils/flattenImage';
import {
  buildCardPropsForPage,
} from '@/utils/carouselExport';
import {
  runCardExportLoop,
  type ExportRenderTarget,
} from '@/utils/cardExportLoop';
import { createExportWriter } from '@/utils/exportDestination';
import type { ExportScope } from '@/utils/exportFilename';
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
import { ExportDialog, type ExportDialogResult } from '@/components/layout/ExportDialog';
import { PreviewPanel } from '@/components/layout/PreviewPanel';
import type { PreviewZoneMetrics } from '@/context/PreviewZoneMetricsContext';
import { PreviewZoneMetricsProvider } from '@/context/PreviewZoneMetricsContext';
import { registerTestHarness } from '@/dev/registerTestHarness';
import styles from './App.module.css';

function isFormatKey(value: string): value is FormatKey {
  return value in FORMATS;
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
  const [exportDialogScope, setExportDialogScope] = useState<ExportScope | null>(null);
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

  useEffect(() => {
    registerTestHarness({
      setExportRenderTarget,
      getExportNode: () => exportRef.current,
    });
  }, []);

  const previewLayout = useMemo(
    () => getStandardArticleLayout(format.key),
    [format.key],
  );

  const headline = useSnipitStore((s) => s.headline);
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

  const handleExportConfirm = useCallback(
    async (result: ExportDialogResult) => {
      const node = exportRef.current;
      if (!node) {
        return;
      }

      setExportStatus('exporting');
      setExportProgress({
        completed: 0,
        total: result.entries.length,
        detail: 'Preparing…',
      });

      const writer = await createExportWriter(
        result.namingMode,
        result.directoryHandle,
      );

      try {
        const lastSize = await runCardExportLoop({
          node,
          entries: result.entries,
          setRenderTarget: setExportRenderTarget,
          onProgress: setExportProgress,
          writeFile: (blob, filename, index) =>
            writer.write(blob, filename, index),
          waitForPaint,
        });

        setExportStatus('done', null, lastSize);
        setExportDialogScope(null);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          setExportStatus('idle');
        } else {
          const message = err instanceof Error ? err.message : 'Export failed';
          setExportStatus('error', message);
        }
      } finally {
        writer.dispose();
        setExportProgress(null);
      }
    },
    [setExportProgress, setExportStatus],
  );

  const openExportDialog = useCallback((scope: ExportScope) => {
    setExportDialogScope(scope);
  }, []);

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
              onExportCurrentFormat={() => openExportDialog('current-format')}
              onExportAllFormats={() => openExportDialog('all-formats')}
              exportStatus={exportStatus}
              exportError={exportError}
              exportProgress={exportProgress}
              lastExportSize={lastExportSize}
              backgroundFallbackNote={backgroundFallbackNote}
              exportDisabled={exportBlocked}
              pageCount={pages.length}
              currentFormatLabel={format.label}
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

        <ExportDialog
          isOpen={exportDialogScope !== null}
          scope={exportDialogScope ?? 'current-format'}
          currentFormatKey={format.key}
          pageCount={pages.length}
          headline={headline}
          isExporting={exportStatus === 'exporting'}
          onClose={() => {
            if (exportStatus !== 'exporting') {
              setExportDialogScope(null);
            }
          }}
          onConfirm={handleExportConfirm}
        />
      </div>
    </PreviewZoneMetricsProvider>
  );
}
