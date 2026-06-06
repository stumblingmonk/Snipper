import { useRef } from 'react';
import { BUILTIN_SOURCE_LOGOS } from '@/constants/builtinSourceLogos';
import { useSnipperStore } from '@/store/snipperStore';
import styles from './SourceLogoPicker.module.css';

const LOGO_ACCEPT =
  '.svg,.png,.jpg,.jpeg,.webp,.avif,.gif,image/svg+xml,image/png,image/jpeg,image/webp,image/avif,image/gif';

export function SourceLogoPicker() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedBuiltinLogoId = useSnipperStore((s) => s.selectedBuiltinLogoId);
  const sourceLogoObjectUrl = useSnipperStore((s) => s.sourceLogoObjectUrl);
  const sourceLogoHidden = useSnipperStore((s) => s.sourceLogoHidden);
  const logoUploadError = useSnipperStore((s) => s.logoUploadError);

  const selectBuiltinSourceLogo = useSnipperStore((s) => s.selectBuiltinSourceLogo);
  const chooseOtherSourceLogo = useSnipperStore((s) => s.chooseOtherSourceLogo);
  const clearSourceLogo = useSnipperStore((s) => s.clearSourceLogo);

  const hasCustomLogo = Boolean(sourceLogoObjectUrl);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      chooseOtherSourceLogo(file);
    }
    event.target.value = '';
  };

  return (
    <section className={styles.section}>
      <div className={styles.gallery} role="radiogroup" aria-label="Built-in source logos">
        {BUILTIN_SOURCE_LOGOS.map((logo) => {
          const isSelected =
            !sourceLogoHidden &&
            !hasCustomLogo &&
            selectedBuiltinLogoId === logo.id;

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
              aria-label={logo.label}
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

      <div className={styles.buttonRow}>
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
            hasCustomLogo && !sourceLogoHidden ? styles.secondaryButtonSelected : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => fileInputRef.current?.click()}
        >
          Choose Other Logo
        </button>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={clearSourceLogo}
          disabled={sourceLogoHidden}
        >
          Clear Logo
        </button>
      </div>

      {hasCustomLogo && !sourceLogoHidden ? (
        <p className={styles.statusText}>Custom logo selected.</p>
      ) : null}

      <p className={styles.helpText}>Choose SVG, PNG, JPG, WEBP, AVIF, or GIF.</p>

      {logoUploadError ? (
        <p className={styles.error} role="alert">
          {logoUploadError}
        </p>
      ) : null}
    </section>
  );
}
