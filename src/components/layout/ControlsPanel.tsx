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

      <section className={styles.section}>
        <h3 className={styles.label}>Image Mode</h3>
        <p className={styles.value}>Crop (pre-flattened)</p>
      </section>

      <section className={styles.section}>
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

      <section className={styles.section}>
        <h3 className={styles.label}>Phase 1 checks</h3>
        <ul className={styles.checklist}>
          <li>Google Fonts headline + body</li>
          <li>SVG logo (viewBox paths)</li>
          <li>JPEG background</li>
          <li>Transparent PNG → canvas crop</li>
          <li>Long headline + URL token</li>
          <li>cacheBust: false</li>
        </ul>
      </section>
    </aside>
  );
}
