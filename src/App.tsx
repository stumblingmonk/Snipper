import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FORMATS, getFormatExportFilename, type FormatKey } from '@/constants/formats';
import { FLATTEN_DEBOUNCE_MS } from '@/constants/imageSettings';
import { computeArticleZones, getStandardArticleLayout } from '@/constants/standardArticleLayouts';
import { exportCardPng } from '@/utils/exportCard';
import { flattenImage } from '@/utils/flattenImage';
import { resolveFormatBackground, resolveSourceLogoUrl, resolveSourceNameForCard } from '@/store/selectors';
import { useSnipperStore } from '@/store/snipperStore';
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

export default function App() {
  const exportRef = useRef<HTMLDivElement>(null);
  const flattenGenerationRef = useRef(0);
  const flattenTimeoutRef = useRef<number | null>(null);
  const [flattenPending, setFlattenPending] = useState(false);

  const storeFormatKey = useSnipperStore((s) => s.format);
  const format = isFormatKey(storeFormatKey) ? FORMATS[storeFormatKey] : FORMATS.story;
  const layout = useMemo(
    () => getStandardArticleLayout(format.key),
    [format.key],
  );
  const backgroundUrl = useSnipperStore((s) => resolveFormatBackground(s).url);
  const backgroundFallbackColor = useSnipperStore(
    (s) => resolveFormatBackground(s).fallbackColor,
  );
  const backgroundFallbackNote = useSnipperStore(
    (s) => resolveFormatBackground(s).fallbackNote,
  );

  const logoUrl = useSnipperStore(resolveSourceLogoUrl);
  const articleImageObjectUrl = useSnipperStore((s) => s.articleImageObjectUrl);
  const flattenedCropUrl = useSnipperStore((s) => s.flattenedCropUrl);
  const imageMode = useSnipperStore((s) => s.imageMode);
  const cropZoom = useSnipperStore((s) => s.cropZoom);
  const cropOffsetX = useSnipperStore((s) => s.cropOffsetX);
  const cropOffsetY = useSnipperStore((s) => s.cropOffsetY);
  const exportStatus = useSnipperStore((s) => s.exportStatus);
  const exportError = useSnipperStore((s) => s.exportError);
  const lastExportSize = useSnipperStore((s) => s.lastExportSize);
  const sourceName = useSnipperStore(resolveSourceNameForCard);
  const headline = useSnipperStore((s) => s.headline);
  const subhead = useSnipperStore((s) => s.subhead);
  const excerpt = useSnipperStore((s) => s.excerpt);
  const headlineResolvedFontSize = useSnipperStore(
    (s) => s.headlineResolvedFontSize,
  );
  const excerptResolvedFontSize = useSnipperStore(
    (s) => s.excerptResolvedFontSize,
  );
  const excerptLineClamp = useSnipperStore((s) => s.excerptLineClamp);
  const [previewZoneMetrics, setPreviewZoneMetrics] = useState<PreviewZoneMetrics>({
    excerptWidth: 0,
    excerptHeight: 0,
  });
  const setFlattenedCropUrl = useSnipperStore((s) => s.setFlattenedCropUrl);
  const setExportStatus = useSnipperStore((s) => s.setExportStatus);

  const showImage = imageMode !== 'none';
  const computedImageFrame = useMemo(
    () =>
      computeArticleZones({
        layout,
        format,
        showImage,
        hasSubhead: Boolean(subhead.trim()),
        hasLogo: Boolean(logoUrl),
        hasFooter: true,
      }).imageFrame,
    [layout, format, showImage, subhead, logoUrl],
  );

  const clearFlattenTimeout = useCallback(() => {
    if (flattenTimeoutRef.current !== null) {
      window.clearTimeout(flattenTimeoutRef.current);
      flattenTimeoutRef.current = null;
    }
  }, []);

  const runFlatten = useCallback(
    async (generation: number): Promise<boolean> => {
      const state = useSnipperStore.getState();
      const sourceUrl = state.articleImageObjectUrl;
      const mode = state.imageMode;

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
            zoom: state.cropZoom,
            offsetX: state.cropOffsetX,
            offsetY: state.cropOffsetY,
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

  const flushFlatten = useCallback(async (): Promise<boolean> => {
    clearFlattenTimeout();
    flattenGenerationRef.current += 1;
    const generation = flattenGenerationRef.current;
    setFlattenPending(true);
    return runFlatten(generation);
  }, [clearFlattenTimeout, runFlatten]);

  useEffect(() => {
    if (!articleImageObjectUrl || imageMode === 'none') {
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
    articleImageObjectUrl,
    imageMode,
    cropZoom,
    cropOffsetX,
    cropOffsetY,
    computedImageFrame,
    clearFlattenTimeout,
    runFlatten,
    setFlattenedCropUrl,
  ]);

  const cardImageUrl = imageMode === 'none' ? null : flattenedCropUrl;
  const exportBlocked =
    flattenPending || (showImage && Boolean(articleImageObjectUrl) && !flattenedCropUrl);

  const handleExport = useCallback(async () => {
    const node = exportRef.current;
    if (!node) return;

    if (imageMode !== 'none' && articleImageObjectUrl) {
      const flushed = await flushFlatten();
      const latestFlattened = useSnipperStore.getState().flattenedCropUrl;
      if (!flushed || !latestFlattened) {
        setExportStatus('error', 'Article image is still processing. Try again.');
        return;
      }
    }

    setExportStatus('exporting');
    try {
      const size = await exportCardPng({
        node,
        width: format.width,
        height: format.height,
        filename: getFormatExportFilename(format.key),
      });
      setExportStatus('done', null, size);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Export failed';
      setExportStatus('error', message);
    }
  }, [
    articleImageObjectUrl,
    flushFlatten,
    format.width,
    format.height,
    format.key,
    imageMode,
    setExportStatus,
  ]);

  const sharedCardProps = {
    format,
    layout,
    sourceName,
    headline,
    subhead,
    excerpt,
    logoUrl,
    backgroundUrl,
    backgroundFallbackColor,
    imageUrl: cardImageUrl,
    showImage: showImage && Boolean(cardImageUrl),
  };

  const handlePreviewZoneMetrics = useCallback((metrics: PreviewZoneMetrics) => {
    setPreviewZoneMetrics((prev) =>
      prev.excerptWidth === metrics.excerptWidth &&
      prev.excerptHeight === metrics.excerptHeight
        ? prev
        : metrics,
    );
  }, []);

  return (
    <PreviewZoneMetricsProvider value={previewZoneMetrics}>
    <div className={styles.app}>
      <div className={styles.columns}>
        <div className={styles.columnShell}>
          <ControlsPanel
            onExport={handleExport}
            exportStatus={exportStatus}
            exportError={exportError}
            lastExportSize={lastExportSize}
            backgroundFallbackNote={backgroundFallbackNote}
            exportDisabled={exportBlocked}
          />
        </div>

        <div className={styles.columnShell}>
          <ContentWorkspace />
        </div>

        <div className={styles.columnShell}>
          <PreviewPanel format={format}>
            <PreviewCardWithTextFit
              {...sharedCardProps}
              onPreviewZoneMetrics={handlePreviewZoneMetrics}
            />
          </PreviewPanel>
        </div>
      </div>

      <div
        className={styles.exportHost}
        style={{ width: format.width, height: format.height }}
        aria-hidden="true"
      >
        <div ref={exportRef}>
          <StandardArticleCard
            id="export-artboard"
            {...sharedCardProps}
            headlineFontSize={headlineResolvedFontSize}
            excerptFontSize={excerptResolvedFontSize}
            excerptLineClamp={excerptLineClamp}
          />
        </div>
      </div>
    </div>
    </PreviewZoneMetricsProvider>
  );
}
