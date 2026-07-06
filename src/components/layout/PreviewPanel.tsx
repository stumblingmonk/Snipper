import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { FormatSpec } from '@/constants/formats';
import { useSnipitStore } from '@/store/snipitStore';
import styles from './PreviewPanel.module.css';

type PreviewZoomMode = 'fit' | 0.5 | 0.75 | 1;

interface PreviewPanelProps {
  children: ReactNode;
  format: FormatSpec;
}

const ZOOM_OPTIONS: { mode: PreviewZoomMode; label: string }[] = [
  { mode: 'fit', label: 'Fit' },
  { mode: 0.5, label: '50%' },
  { mode: 0.75, label: '75%' },
  { mode: 1, label: '100%' },
];

const VIEWPORT_PADDING_X = 48;
const VIEWPORT_PADDING_Y = 48;

export function PreviewPanel({ children, format }: PreviewPanelProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(0.35);
  const [zoomMode, setZoomMode] = useState<PreviewZoomMode>('fit');
  const pages = useSnipitStore((s) => s.pages);
  const activePageIndex = useSnipitStore((s) => s.activePageIndex);
  const goToPrevPage = useSnipitStore((s) => s.goToPrevPage);
  const goToNextPage = useSnipitStore((s) => s.goToNextPage);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const updateScale = () => {
      const availableW = Math.max(0, el.clientWidth - VIEWPORT_PADDING_X);
      const availableH = Math.max(0, el.clientHeight - VIEWPORT_PADDING_Y);
      const nextFitScale = Math.min(
        availableW / format.width,
        availableH / format.height,
        1,
      );
      setFitScale(Math.max(0.1, nextFitScale));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, [format.width, format.height]);

  useEffect(() => {
    setZoomMode('fit');
  }, [format.key]);

  const scale = zoomMode === 'fit' ? fitScale : zoomMode;
  const scaleLabel =
    zoomMode === 'fit' ? `Fit ${Math.round(scale * 100)}%` : `${Math.round(scale * 100)}%`;

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.heading}>Live Preview</h2>
          <div className={styles.zoomControls} role="group" aria-label="Preview zoom">
            {ZOOM_OPTIONS.map(({ mode, label }) => (
              <button
                key={label}
                type="button"
                className={[
                  styles.zoomButton,
                  zoomMode === mode ? styles.zoomButtonActive : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setZoomMode(mode)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <span className={styles.meta}>
          {format.label} — {format.width} × {format.height} — {scaleLabel}
        </span>
      </div>

      <div className={styles.pagePager}>
        <button
          type="button"
          className={styles.pageNavButton}
          onClick={goToPrevPage}
          disabled={activePageIndex <= 0}
          aria-label="Previous preview page"
        >
          ‹
        </button>
        <span className={styles.pagePagerLabel}>
          Page {activePageIndex + 1} of {pages.length}
        </span>
        <button
          type="button"
          className={styles.pageNavButton}
          onClick={goToNextPage}
          disabled={activePageIndex >= pages.length - 1}
          aria-label="Next preview page"
        >
          ›
        </button>
      </div>

      <div ref={viewportRef} className={styles.viewport}>
        <div
          className={styles.scaledFrame}
          style={{
            width: format.width * scale,
            height: format.height * scale,
          }}
        >
          <div
            className={styles.scaleInner}
            style={{
              width: format.width,
              height: format.height,
              transform: `scale(${scale})`,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </aside>
  );
}
