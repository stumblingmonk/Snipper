import { ImageModeControls } from '@/components/layout/ImageModeControls';
import styles from './ControlsPanel.module.css';

interface ControlsPanelProps {
  onExport: () => void;
  exportStatus: 'idle' | 'exporting' | 'done' | 'error';
  exportError: string | null;
  lastExportSize: { width: number; height: number } | null;
}

export function ControlsPanel({
  onExport,
  exportStatus,
  exportError,
  lastExportSize,
}: ControlsPanelProps) {
  const isExporting = exportStatus === 'exporting';

  return (
    <aside className={styles.panel}>
      <h2 className={styles.heading}>Design & Export</h2>

      <section className={styles.section}>
        <h3 className={styles.label}>Template</h3>
        <p className={styles.value}>Standard Article</p>
      </section>

      <section className={styles.section}>
        <h3 className={styles.label}>Format</h3>
        <p className={styles.value}>Story — 1080 × 1920</p>
      </section>

      <ImageModeControls />

      <section className={styles.section}>
        <h3 className={styles.label}>Export</h3>
        <button
          type="button"
          className={styles.exportButton}
          onClick={onExport}
          disabled={isExporting}
        >
          {isExporting ? 'Exporting…' : 'Export PNG'}
        </button>

        {exportStatus === 'done' && lastExportSize ? (
          <p className={styles.success}>
            Exported {lastExportSize.width} × {lastExportSize.height} PNG
          </p>
        ) : null}

        {exportStatus === 'error' && exportError ? (
          <p className={styles.error} role="alert">
            {exportError}
          </p>
        ) : null}
      </section>
    </aside>
  );
}
