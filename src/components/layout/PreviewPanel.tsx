import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { FormatSpec } from '@/constants/formats';
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

export function PreviewPanel({ children, format }: PreviewPanelProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(0.35);
  const [zoomMode, setZoomMode] = useState<PreviewZoomMode>('fit');

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const updateScale = () => {
      const padding = 48;
      const availableW = el.clientWidth - padding;
      const availableH = el.clientHeight - padding;
      const nextFitScale = Math.min(
        availableW / format.width,
        availableH / format.height,
        1,
      );
      setFitScale(Math.max(0.2, nextFitScale));
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

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerMain}>
          <h2 className={styles.heading}>Live Preview</h2>
          <span className={styles.meta}>
            {format.width} × {format.height} · scale {Math.round(scale * 100)}%
          </span>
        </div>
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
