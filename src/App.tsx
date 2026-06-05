import { useCallback, useEffect, useRef, useState } from 'react';
import { FORMATS } from '@/constants/formats';
import { exportCardPng } from '@/utils/exportCard';
import { flattenImage } from '@/utils/flattenImage';
import {
  selectCardContent,
  useSnipperStore,
} from '@/store/snipperStore';
import { StandardArticleCard } from '@/components/cards/StandardArticleCard';
import { ControlsPanel } from '@/components/layout/ControlsPanel';
import { ContentWorkspace } from '@/components/layout/ContentWorkspace';
import { PreviewPanel } from '@/components/layout/PreviewPanel';
import styles from './App.module.css';

const STORY = FORMATS.story;
const IMAGE_SLOT = { width: 1080, height: 640 };

export default function App() {
  const exportRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0.35);

  const {
    headlineFontSize,
    excerptFontSize,
    logoObjectUrl,
    backgroundObjectUrl,
    articleImageObjectUrl,
    flattenedCropUrl,
    imageMode,
    exportStatus,
    exportError,
    lastExportSize,
    setFlattenedCropUrl,
    setExportStatus,
  } = useSnipperStore();

  const content = selectCardContent();

  useEffect(() => {
    if (!articleImageObjectUrl || imageMode === 'none') {
      setFlattenedCropUrl(null);
      return;
    }

    let cancelled = false;
    let createdUrl: string | null = null;

    flattenImage({
      sourceUrl: articleImageObjectUrl,
      outputWidth: IMAGE_SLOT.width,
      outputHeight: IMAGE_SLOT.height,
      mode: imageMode,
    })
      .then((url) => {
        if (cancelled) {
          if (url !== articleImageObjectUrl) URL.revokeObjectURL(url);
          return;
        }
        createdUrl = url;
        setFlattenedCropUrl(url);
      })
      .catch((err: unknown) => {
        console.error('Flatten failed:', err);
      });

    return () => {
      cancelled = true;
      if (createdUrl && createdUrl !== articleImageObjectUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [articleImageObjectUrl, imageMode, setFlattenedCropUrl]);

  const cardImageUrl =
    imageMode === 'none' ? null : flattenedCropUrl ?? articleImageObjectUrl;

  const handleExport = useCallback(async () => {
    const node = exportRef.current;
    if (!node) return;

    setExportStatus('exporting');
    try {
      const size = await exportCardPng({
        node,
        width: STORY.width,
        height: STORY.height,
        filename: 'snipper-story-export.png',
      });
      setExportStatus('done', null, size);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Export failed';
      setExportStatus('error', message);
    }
  }, [setExportStatus]);

  return (
    <div className={styles.app}>
      <header className={styles.topBar}>
        <h1 className={styles.appTitle}>SNIPPER</h1>
        <span className={styles.phaseBadge}>Phase 1 — Export Prototype</span>
      </header>

      <div className={styles.columns}>
        <ControlsPanel
          onExport={handleExport}
          exportStatus={exportStatus}
          exportError={exportError}
          lastExportSize={lastExportSize}
        />

        <ContentWorkspace content={content} />

        <PreviewPanel
          scale={previewScale}
          onScaleChange={setPreviewScale}
          format={STORY}
        >
          <StandardArticleCard
            format={STORY}
            sourceName={content.sourceName}
            headline={content.headline}
            excerpt={content.excerpt}
            logoUrl={logoObjectUrl}
            backgroundUrl={backgroundObjectUrl}
            imageUrl={cardImageUrl}
            headlineFontSize={headlineFontSize}
            excerptFontSize={excerptFontSize}
            showImage={imageMode !== 'none'}
          />
        </PreviewPanel>
      </div>

      {/* Full-size export artboard — off-screen, not the scaled preview */}
      <div className={styles.exportHost} aria-hidden="true">
        <div ref={exportRef}>
          <StandardArticleCard
            id="export-artboard"
            format={STORY}
            sourceName={content.sourceName}
            headline={content.headline}
            excerpt={content.excerpt}
            logoUrl={logoObjectUrl}
            backgroundUrl={backgroundObjectUrl}
            imageUrl={cardImageUrl}
            headlineFontSize={headlineFontSize}
            excerptFontSize={excerptFontSize}
            showImage={imageMode !== 'none'}
          />
        </div>
      </div>
    </div>
  );
}
