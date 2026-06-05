import { useCallback, useEffect, useRef, useState } from 'react';
import { FORMATS } from '@/constants/formats';
import { exportCardPng } from '@/utils/exportCard';
import { flattenImage } from '@/utils/flattenImage';
import { resolveSourceLogoUrl } from '@/store/selectors';
import { useSnipperStore } from '@/store/snipperStore';
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

  const headlineFontSize = useSnipperStore((s) => s.headlineFontSize);
  const excerptFontSize = useSnipperStore((s) => s.excerptFontSize);
  const logoUrl = useSnipperStore(resolveSourceLogoUrl);
  const backgroundObjectUrl = useSnipperStore((s) => s.backgroundObjectUrl);
  const articleImageObjectUrl = useSnipperStore((s) => s.articleImageObjectUrl);
  const flattenedCropUrl = useSnipperStore((s) => s.flattenedCropUrl);
  const imageMode = useSnipperStore((s) => s.imageMode);
  const exportStatus = useSnipperStore((s) => s.exportStatus);
  const exportError = useSnipperStore((s) => s.exportError);
  const lastExportSize = useSnipperStore((s) => s.lastExportSize);
  const sourceName = useSnipperStore((s) => s.sourceName);
  const headline = useSnipperStore((s) => s.headline);
  const subhead = useSnipperStore((s) => s.subhead);
  const excerpt = useSnipperStore((s) => s.excerpt);
  const setFlattenedCropUrl = useSnipperStore((s) => s.setFlattenedCropUrl);
  const setExportStatus = useSnipperStore((s) => s.setExportStatus);

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

  const cardProps = {
    format: STORY,
    sourceName,
    headline,
    subhead,
    excerpt,
    logoUrl,
    backgroundUrl: backgroundObjectUrl,
    imageUrl: cardImageUrl,
    headlineFontSize,
    excerptFontSize,
    showImage: imageMode !== 'none',
  };

  return (
    <div className={styles.app}>
      <header className={styles.topBar}>
        <h1 className={styles.appTitle}>SNIPPER</h1>
        <span className={styles.phaseBadge}>Phase 3 — Source Logo Picker</span>
      </header>

      <div className={styles.columns}>
        <ControlsPanel
          onExport={handleExport}
          exportStatus={exportStatus}
          exportError={exportError}
          lastExportSize={lastExportSize}
        />

        <ContentWorkspace />

        <PreviewPanel
          scale={previewScale}
          onScaleChange={setPreviewScale}
          format={STORY}
        >
          <StandardArticleCard {...cardProps} />
        </PreviewPanel>
      </div>

      <div className={styles.exportHost} aria-hidden="true">
        <div ref={exportRef}>
          <StandardArticleCard id="export-artboard" {...cardProps} />
        </div>
      </div>
    </div>
  );
}
