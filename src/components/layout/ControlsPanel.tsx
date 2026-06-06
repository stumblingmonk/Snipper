import { useState } from 'react';
import { FormatPicker } from '@/components/layout/FormatPicker';
import { SourceLogoPicker } from '@/components/layout/SourceLogoPicker';
import { useSnipperStore } from '@/store/snipperStore';
import styles from './ControlsPanel.module.css';

interface ControlsPanelProps {
  onExport: () => void;
  exportStatus: 'idle' | 'exporting' | 'done' | 'error';
  exportError: string | null;
  lastExportSize: { width: number; height: number } | null;
  backgroundFallbackNote: string | null;
}

export function ControlsPanel({
  onExport,
  exportStatus,
  exportError,
  lastExportSize,
  backgroundFallbackNote,
}: ControlsPanelProps) {
  const isExporting = exportStatus === 'exporting';
  const [searchQuery, setSearchQuery] = useState('');
  const sourceName = useSnipperStore((s) => s.sourceName);
  const setSourceName = useSnipperStore((s) => s.setSourceName);

  return (
    <aside className={styles.panel}>
      <header className={styles.brandHeader}>
        <p className={styles.appTitle}>SNIPPER</p>
        <p className={styles.byline}>BY MARK BRINN FOR OBB</p>
        <span className={styles.phaseBadge}>Phase 7B — Operator UI Cleanup</span>
      </header>

      <div className={styles.panelBody}>
        <FormatPicker />

        {backgroundFallbackNote ? (
          <p className={styles.note} role="status">
            {backgroundFallbackNote}
          </p>
        ) : null}

        <section className={styles.newsSourceSection}>
          <div className={styles.newsSourceHeader}>
            <h3 className={styles.sectionLabel}>News Source</h3>
            <label className={styles.visuallyHidden} htmlFor="source-logo-search">
              Search
            </label>
            <input
              id="source-logo-search"
              type="search"
              className={styles.headerSearch}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search"
              spellCheck={false}
            />
          </div>

          <input
            id="source-name"
            type="text"
            className={styles.nameInput}
            value={sourceName}
            onChange={(e) => setSourceName(e.target.value)}
            placeholder="Publication name"
            aria-label="Publication name"
          />

          <SourceLogoPicker searchQuery={searchQuery} />
        </section>
      </div>

      <footer className={styles.exportFooter}>
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
      </footer>
    </aside>
  );
}
