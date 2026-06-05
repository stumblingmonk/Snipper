import { useRef } from 'react';
import {
  BUILTIN_SOURCE_LOGOS,
  type SourceLogoSelectionId,
} from '@/constants/sourceLogos';
import { useSnipperStore } from '@/store/snipperStore';
import styles from './SourceLogoPicker.module.css';

export function SourceLogoPicker() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedSourceLogoId = useSnipperStore((s) => s.selectedSourceLogoId);
  const customLogoObjectUrl = useSnipperStore((s) => s.customLogoObjectUrl);
  const logoUploadError = useSnipperStore((s) => s.logoUploadError);

  const setSelectedSourceLogoId = useSnipperStore((s) => s.setSelectedSourceLogoId);
  const uploadCustomLogo = useSnipperStore((s) => s.uploadCustomLogo);
  const clearCustomLogo = useSnipperStore((s) => s.clearCustomLogo);

  const handleBuiltInSelect = (id: SourceLogoSelectionId) => {
    setSelectedSourceLogoId(id);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadCustomLogo(file);
    }
    event.target.value = '';
  };

  return (
    <section className={styles.section}>
      <div className={styles.optionGrid} role="radiogroup" aria-label="Source logo">
        {BUILTIN_SOURCE_LOGOS.map((logo) => (
          <label
            key={logo.id}
            className={[
              styles.logoOption,
              selectedSourceLogoId === logo.id ? styles.logoOptionSelected : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <input
              type="radio"
              name="source-logo"
              value={logo.id}
              checked={selectedSourceLogoId === logo.id}
              onChange={() => handleBuiltInSelect(logo.id)}
              className={styles.srOnly}
            />
            <img
              className={styles.logoPreview}
              src={logo.url}
              alt=""
              draggable={false}
            />
            <span className={styles.logoLabel}>{logo.label}</span>
          </label>
        ))}

        <label
          className={[
            styles.logoOption,
            selectedSourceLogoId === 'none' ? styles.logoOptionSelected : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <input
            type="radio"
            name="source-logo"
            value="none"
            checked={selectedSourceLogoId === 'none'}
            onChange={() => handleBuiltInSelect('none')}
            className={styles.srOnly}
          />
          <span className={styles.noLogoPreview}>No logo</span>
          <span className={styles.logoLabel}>No logo</span>
        </label>

        {customLogoObjectUrl ? (
          <label
            className={[
              styles.logoOption,
              selectedSourceLogoId === 'custom' ? styles.logoOptionSelected : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <input
              type="radio"
              name="source-logo"
              value="custom"
              checked={selectedSourceLogoId === 'custom'}
              onChange={() => handleBuiltInSelect('custom')}
              className={styles.srOnly}
            />
            <img
              className={styles.logoPreview}
              src={customLogoObjectUrl}
              alt=""
              draggable={false}
            />
            <span className={styles.logoLabel}>Custom upload</span>
          </label>
        ) : null}
      </div>

      <div className={styles.uploadRow}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".svg,.png,.jpg,.jpeg,.webp,image/svg+xml,image/png,image/jpeg,image/webp"
          className={styles.fileInput}
          onChange={handleFileChange}
        />
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => fileInputRef.current?.click()}
        >
          Upload custom logo
        </button>
        {customLogoObjectUrl ? (
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={clearCustomLogo}
          >
            Clear custom logo
          </button>
        ) : null}
      </div>

      <p className={styles.helpText}>
        SVG, PNG, JPG, JPEG, or WEBP. Custom logos are session-only.
      </p>

      {logoUploadError ? (
        <p className={styles.error} role="alert">
          {logoUploadError}
        </p>
      ) : null}
    </section>
  );
}
