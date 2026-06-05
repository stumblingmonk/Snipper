import { useCallback, useEffect, useMemo, useRef } from 'react';
import { FORMATS, getFormatExportFilename } from '@/constants/formats';
import { computeArticleZones, getStandardArticleLayout } from '@/constants/standardArticleLayouts';
import { exportCardPng } from '@/utils/exportCard';
import { flattenImage } from '@/utils/flattenImage';
import { resolveFormatBackground, resolveSourceLogoUrl } from '@/store/selectors';
import { useSnipperStore } from '@/store/snipperStore';
import { PreviewCardWithTextFit } from '@/components/cards/PreviewCardWithTextFit';
import { StandardArticleCard } from '@/components/cards/StandardArticleCard';
import { ControlsPanel } from '@/components/layout/ControlsPanel';
import { ContentWorkspace } from '@/components/layout/ContentWorkspace';
import { PreviewPanel } from '@/components/layout/PreviewPanel';
import styles from './App.module.css';

export default function App() {
  const exportRef = useRef<HTMLDivElement>(null);

  const formatKey = useSnipperStore((s) => s.format);
  const format = FORMATS[formatKey];
  const layout = useMemo(
    () => getStandardArticleLayout(formatKey),
    [formatKey],
  );
  const background = useMemo(
    () => resolveFormatBackground(formatKey),
    [formatKey],
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
  const sourceName = useSnipperStore((s) => s.sourceName);
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
        hasFooter: Boolean(sourceName),
      }).imageFrame,
    [layout, format, showImage, subhead, logoUrl, sourceName],
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
        filename: getFormatExportFilename(formatKey),
      });
      setExportStatus('done', null, size);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Export failed';
      setExportStatus('error', message);
    }
  }, [format.width, format.height, formatKey, setExportStatus]);

  const sharedCardProps = {
    format,
    layout,
    sourceName,
    headline,
    subhead,
    excerpt,
    logoUrl,
    backgroundUrl: background.url,
    backgroundFallbackColor: background.fallbackColor,
    imageUrl: cardImageUrl,
    showImage: imageMode !== 'none' && Boolean(cardImageUrl),
  };

  return (
    <div className={styles.app}>
      <header className={styles.topBar}>
        <h1 className={styles.appTitle}>SNIPPER</h1>
        <span className={styles.phaseBadge}>
          Phase 7 — First Usable Build
        </span>
      </header>

      <div className={styles.columns}>
        <ControlsPanel
          onExport={handleExport}
          exportStatus={exportStatus}
          exportError={exportError}
          lastExportSize={lastExportSize}
          backgroundFallbackNote={background.fallbackNote}
        />

        <ContentWorkspace />

        <PreviewPanel format={format}>
          <PreviewCardWithTextFit {...sharedCardProps} />
        </PreviewPanel>
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
