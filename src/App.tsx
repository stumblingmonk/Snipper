import { useCallback, useEffect, useMemo, useRef } from 'react';
import { FORMATS, getFormatExportFilename, type FormatKey } from '@/constants/formats';
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
import styles from './App.module.css';

function isFormatKey(value: string): value is FormatKey {
  return value in FORMATS;
}

export default function App() {
  const exportRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!articleImageObjectUrl || imageMode === 'none') {
      setFlattenedCropUrl(null);
      return;
    }

    let cancelled = false;
    const { width, height } = computedImageFrame;

    flattenImage({
      sourceUrl: articleImageObjectUrl,
      outputWidth: width,
      outputHeight: height,
      mode: imageMode,
      crop: { zoom: cropZoom, offsetX: cropOffsetX, offsetY: cropOffsetY },
    })
      .then((url) => {
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        setFlattenedCropUrl(url);
      })
      .catch((err: unknown) => {
        console.error('Flatten failed:', err);
      });

    return () => {
      cancelled = true;
    };
  }, [
    articleImageObjectUrl,
    imageMode,
    cropZoom,
    cropOffsetX,
    cropOffsetY,
    computedImageFrame,
    setFlattenedCropUrl,
  ]);

  const cardImageUrl =
    imageMode === 'none' ? null : flattenedCropUrl ?? articleImageObjectUrl;

  const handleExport = useCallback(async () => {
    const node = exportRef.current;
    if (!node) return;

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
  }, [format.width, format.height, format.key, setExportStatus]);

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
    showImage: imageMode !== 'none' && Boolean(cardImageUrl),
  };

  return (
    <div className={styles.app}>
      <div className={styles.columns}>
        <div className={styles.columnShell}>
          <ControlsPanel
            onExport={handleExport}
            exportStatus={exportStatus}
            exportError={exportError}
            lastExportSize={lastExportSize}
            backgroundFallbackNote={backgroundFallbackNote}
          />
        </div>

        <div className={styles.columnShell}>
          <ContentWorkspace />
        </div>

        <div className={styles.columnShell}>
          <PreviewPanel format={format}>
            <PreviewCardWithTextFit {...sharedCardProps} />
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
          />
        </div>
      </div>
    </div>
  );
}
