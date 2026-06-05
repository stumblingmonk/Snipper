import { useEffect, useRef, type ReactNode } from 'react';
import type { FormatSpec } from '@/constants/formats';
import styles from './PreviewPanel.module.css';

interface PreviewPanelProps {
  children: ReactNode;
  scale: number;
  onScaleChange: (scale: number) => void;
  format: FormatSpec;
}

export function PreviewPanel({
  children,
  scale,
  onScaleChange,
  format,
}: PreviewPanelProps) {
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const updateScale = () => {
      const padding = 48;
      const availableW = el.clientWidth - padding;
      const availableH = el.clientHeight - padding;
      const fitScale = Math.min(
        availableW / format.width,
        availableH / format.height,
        1,
      );
      onScaleChange(Math.max(0.2, fitScale));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, [format.width, format.height, onScaleChange]);

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.heading}>Live Preview</h2>
        <span className={styles.meta}>
          {format.width} × {format.height} · scale {Math.round(scale * 100)}%
        </span>
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
