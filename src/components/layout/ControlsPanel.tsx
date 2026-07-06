import { useState } from 'react';
import { BackgroundPicker } from '@/components/layout/BackgroundPicker';
import { FormatPicker } from '@/components/layout/FormatPicker';
import { BrandSourcePicker } from '@/components/layout/BrandSourcePicker';
import { SourceLogoPicker } from '@/components/layout/SourceLogoPicker';
import { SNIPIT_APP_LOGO_URL } from '@/constants/brandAssets';
import { useSnipitStore } from '@/store/snipitStore';
import type { ExportProgress } from '@/store/snipitStore';
import styles from './ControlsPanel.module.css';

interface ControlsPanelProps {
  onExport: () => void;
  exportStatus: 'idle' | 'exporting' | 'done' | 'error';
  exportError: string | null;
  exportProgress: ExportProgress | null;
  lastExportSize: { width: number; height: number } | null;
  backgroundFallbackNote: string | null;
  exportDisabled?: boolean;
  pageCount: number;
}

export function ControlsPanel({
  onExport,
  exportStatus,
  exportError,
  exportProgress,
  lastExportSize,
  backgroundFallbackNote,
  exportDisabled = false,
  pageCount,
}: ControlsPanelProps) {
  const isExporting = exportStatus === 'exporting';
  const [searchQuery, setSearchQuery] = useState('');
  const sourceName = useSnipitStore((s) => s.sourceName);
  const setSourceName = useSnipitStore((s) => s.setSourceName);

  return (
    <aside className={styles.panel}>
      <header className={styles.brandHeader}>
        <img
          className={styles.appLogo}
          src={SNIPIT_APP_LOGO_URL}
          alt="SNIPit"
          draggable={false}
        />
        <p className={styles.byline}>BY MARK BRINN FOR OBB</p>
        <span className={styles.phaseBadge}>Phase 8 — Multi-page Carousel</span>
      </header>

      <div className={styles.panelBody}>
        <FormatPicker />

        <BackgroundPicker />

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

        <section className={styles.brandSourceSection}>
          <h3 className={styles.sectionLabel}>Brand Source</h3>
          <BrandSourcePicker />
        </section>
      </div>

      <footer className={styles.exportFooter}>
        <button
          type="button"
          className={styles.exportButton}
          onClick={onExport}
          disabled={isExporting || exportDisabled}
        >
          {isExporting ? 'Exporting…' : 'Export All PNGs'}
        </button>

        {exportStatus === 'exporting' && exportProgress ? (
          <p className={styles.progress} role="status">
            {exportProgress.completed} / {exportProgress.total} — {exportProgress.detail}
          </p>
        ) : null}

        {exportStatus === 'done' && lastExportSize ? (
          <p className={styles.success}>
            Exported {pageCount} page{pageCount === 1 ? '' : 's'} × all formats (
            {lastExportSize.width} × {lastExportSize.height} last PNG)
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
