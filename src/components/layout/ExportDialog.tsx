import { useEffect, useMemo, useState } from 'react';
import { FORMATS } from '@/constants/formats';
import type { FormatKey } from '@/constants/formats';
import {
  buildExportFilenameList,
  formatExportDate,
  slugifyHeadline,
  type ExportScope,
} from '@/utils/exportFilename';
import {
  loadPersistedDirectoryHandle,
  pickExportDirectory,
  supportsDirectoryPicker,
  type ExportWriteMode,
} from '@/utils/exportDestination';
import styles from './ExportDialog.module.css';

export interface ExportDialogResult {
  baseName: string;
  date: string;
  namingMode: ExportWriteMode;
  directoryHandle: FileSystemDirectoryHandle | null;
  entries: ReturnType<typeof buildExportFilenameList>;
}

interface ExportDialogProps {
  isOpen: boolean;
  scope: ExportScope;
  currentFormatKey: FormatKey;
  pageCount: number;
  headline: string;
  isExporting: boolean;
  onClose: () => void;
  onConfirm: (result: ExportDialogResult) => void;
}

function scopeSummary(scope: ExportScope, currentFormatKey: FormatKey, pageCount: number): string {
  const formatCount = scope === 'current-format' ? 1 : 4;
  const fileCount = formatCount * pageCount;
  const formatLabel = FORMATS[currentFormatKey].label;

  if (scope === 'current-format') {
    return `${fileCount} PNG${fileCount === 1 ? '' : 's'} — ${formatLabel} × ${pageCount} page${pageCount === 1 ? '' : 's'}`;
  }

  return `${fileCount} PNGs — all formats × ${pageCount} page${pageCount === 1 ? '' : 's'}`;
}

export function ExportDialog({
  isOpen,
  scope,
  currentFormatKey,
  pageCount,
  headline,
  isExporting,
  onClose,
  onConfirm,
}: ExportDialogProps) {
  const [baseName, setBaseName] = useState(() => slugifyHeadline(headline));
  const [date, setDate] = useState(() => formatExportDate());
  const [namingMode, setNamingMode] = useState<ExportWriteMode>('batch');
  const [directoryHandle, setDirectoryHandle] =
    useState<FileSystemDirectoryHandle | null>(null);
  const [directoryLabel, setDirectoryLabel] = useState('No folder selected');
  const [isPickingFolder, setIsPickingFolder] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setBaseName(slugifyHeadline(headline));
    setDate(formatExportDate());
    setNamingMode('batch');

    let cancelled = false;

    void loadPersistedDirectoryHandle().then((handle) => {
      if (cancelled) {
        return;
      }

      setDirectoryHandle(handle);
      setDirectoryLabel(handle?.name ?? 'No folder selected');
    });

    return () => {
      cancelled = true;
    };
  }, [headline, isOpen]);

  const entries = useMemo(
    () =>
      buildExportFilenameList({
        scope,
        currentFormatKey,
        baseName: baseName.trim() || 'untitled',
        date,
        totalPages: pageCount,
      }),
    [baseName, currentFormatKey, date, pageCount, scope],
  );

  const canUseDirectoryPicker = supportsDirectoryPicker();
  const showFolderPicker = namingMode === 'batch' && canUseDirectoryPicker;
  const confirmDisabled =
    isExporting ||
    !baseName.trim() ||
    !date ||
    entries.length === 0 ||
    (namingMode === 'batch' && canUseDirectoryPicker && !directoryHandle);

  const handlePickFolder = async () => {
    setIsPickingFolder(true);
    try {
      const handle = await pickExportDirectory();
      setDirectoryHandle(handle);
      setDirectoryLabel(handle?.name ?? 'No folder selected');
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        console.error('Folder picker failed:', err);
      }
    } finally {
      setIsPickingFolder(false);
    }
  };

  const handleConfirm = () => {
    onConfirm({
      baseName: baseName.trim() || 'untitled',
      date,
      namingMode,
      directoryHandle,
      entries,
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={styles.exportDialogOverlay}
      role="presentation"
      onClick={isExporting ? undefined : onClose}
    >
      <div
        className={styles.exportDialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.exportDialogHeader}>
          <h2 id="export-dialog-title" className={styles.exportDialogTitle}>
            Export PNGs
          </h2>
          <p className={styles.exportDialogSubtitle}>
            {scopeSummary(scope, currentFormatKey, pageCount)}
          </p>
        </header>

        <div className={styles.exportDialogBody}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="export-base-name">
              Base name
            </label>
            <input
              id="export-base-name"
              type="text"
              className={styles.textInput}
              value={baseName}
              onChange={(event) => setBaseName(event.target.value)}
              spellCheck={false}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel} htmlFor="export-date">
              Date
            </label>
            <input
              id="export-date"
              type="date"
              className={styles.dateInput}
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>

          <div className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>Save mode</span>
            <div className={styles.namingModes}>
              <label
                className={[
                  styles.namingModeOption,
                  namingMode === 'batch' ? styles.namingModeOptionActive : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <input
                  type="radio"
                  className={styles.namingModeInput}
                  name="export-naming-mode"
                  value="batch"
                  checked={namingMode === 'batch'}
                  onChange={() => setNamingMode('batch')}
                />
                <span className={styles.namingModeCopy}>
                  <span className={styles.namingModeTitle}>Batch folder</span>
                  <span className={styles.namingModeHint}>
                    Save all files into one folder
                  </span>
                </span>
              </label>

              <label
                className={[
                  styles.namingModeOption,
                  namingMode === 'individual' ? styles.namingModeOptionActive : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <input
                  type="radio"
                  className={styles.namingModeInput}
                  name="export-naming-mode"
                  value="individual"
                  checked={namingMode === 'individual'}
                  onChange={() => setNamingMode('individual')}
                />
                <span className={styles.namingModeCopy}>
                  <span className={styles.namingModeTitle}>Individual files</span>
                  <span className={styles.namingModeHint}>
                    Choose a save location per file
                  </span>
                </span>
              </label>
            </div>
          </div>

          {showFolderPicker ? (
            <div className={styles.fieldGroup}>
              <span className={styles.fieldLabel}>Folder</span>
              <div className={styles.folderRow}>
                <div className={styles.folderName} title={directoryLabel}>
                  {directoryLabel}
                </div>
                <button
                  type="button"
                  className={styles.folderButton}
                  onClick={() => void handlePickFolder()}
                  disabled={isExporting || isPickingFolder}
                >
                  {isPickingFolder ? 'Choosing…' : 'Choose folder'}
                </button>
              </div>
            </div>
          ) : (
            <p className={styles.fallbackNote}>
              {namingMode === 'batch'
                ? 'Folder picker is unavailable in this browser. Files will download with the new names.'
                : 'Save picker is unavailable in this browser. Files will download with the new names.'}
            </p>
          )}

          <div className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>Filename preview</span>
            <ul className={styles.previewList}>
              {entries.map((entry) => (
                <li key={`${entry.formatKey}-${entry.pageIndex}`} className={styles.previewItem}>
                  {entry.filename}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <footer className={styles.exportDialogFooter}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onClose}
            disabled={isExporting}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleConfirm}
            disabled={confirmDisabled}
          >
            {isExporting ? 'Exporting…' : `Export ${entries.length} PNG${entries.length === 1 ? '' : 's'}`}
          </button>
        </footer>
      </div>
    </div>
  );
}
