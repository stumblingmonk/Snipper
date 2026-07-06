import { useMemo, useRef } from 'react';
import {
  BUILTIN_SOURCE_LOGOS,
  filterBuiltinSourceLogos,
} from '@/constants/builtinSourceLogos';
import { useSnipitStore } from '@/store/snipitStore';
import styles from './SourceLogoPicker.module.css';

const LOGO_ACCEPT =
  '.svg,.png,.jpg,.jpeg,.webp,.avif,.gif,image/svg+xml,image/png,image/jpeg,image/webp,image/avif,image/gif';

interface SourceLogoPickerProps {
  searchQuery: string;
}

export function SourceLogoPicker({ searchQuery }: SourceLogoPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedBuiltinLogoId = useSnipitStore((s) => s.selectedBuiltinLogoId);
  const sourceLogoObjectUrl = useSnipitStore((s) => s.sourceLogoObjectUrl);
  const showSource = useSnipitStore((s) => s.showSource);
  const logoUploadError = useSnipitStore((s) => s.logoUploadError);

  const selectBuiltinSourceLogo = useSnipitStore((s) => s.selectBuiltinSourceLogo);
  const chooseOtherSourceLogo = useSnipitStore((s) => s.chooseOtherSourceLogo);
  const setShowSource = useSnipitStore((s) => s.setShowSource);

  const hasCustomLogo = Boolean(sourceLogoObjectUrl);
  const filteredLogos = useMemo(
    () => filterBuiltinSourceLogos(BUILTIN_SOURCE_LOGOS, searchQuery),
    [searchQuery],
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      chooseOtherSourceLogo(file);
    }
    event.target.value = '';
  };

  return (
    <section className={styles.section}>
      <div className={styles.galleryPanel}>
        {filteredLogos.length === 0 ? (
          <p className={styles.emptyState}>No matching logos</p>
        ) : (
          <div className={styles.gallery} role="radiogroup" aria-label="Built-in source logos">
            {filteredLogos.map((logo) => {
              const isSelected =
                !hasCustomLogo && selectedBuiltinLogoId === logo.id;

              return (
                <button
                  key={logo.id}
                  type="button"
                  className={[
                    styles.galleryButton,
                    isSelected ? styles.galleryButtonSelected : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  title={logo.label}
                  aria-pressed={isSelected}
                  onClick={() => selectBuiltinSourceLogo(logo.id)}
                >
                  <img
                    className={styles.galleryLogo}
                    src={logo.url}
                    alt=""
                    draggable={false}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.actionRow}>
        <input
          ref={fileInputRef}
          type="file"
          accept={LOGO_ACCEPT}
          className={styles.fileInput}
          onChange={handleFileChange}
        />
        <button
          type="button"
          className={[
            styles.secondaryButton,
            hasCustomLogo ? styles.secondaryButtonSelected : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => fileInputRef.current?.click()}
        >
          Other source
        </button>

        <label className={styles.visibilityToggle}>
          <input
            type="checkbox"
            className={styles.visibilityCheckbox}
            checked={showSource}
            onChange={(event) => setShowSource(event.target.checked)}
          />
          <span className={styles.visibilityLabel}>Show source</span>
        </label>
      </div>

      {logoUploadError ? (
        <p className={styles.error} role="alert">
          {logoUploadError}
        </p>
      ) : null}
    </section>
  );
}
