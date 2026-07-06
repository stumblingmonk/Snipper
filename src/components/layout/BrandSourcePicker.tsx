import { BUILTIN_BRAND_LOGOS } from '@/constants/builtinBrandLogos';
import { useSnipitStore } from '@/store/snipitStore';
import styles from './SourceLogoPicker.module.css';

export function BrandSourcePicker() {
  const selectedBrandLogoId = useSnipitStore((s) => s.selectedBrandLogoId);
  const selectBrandLogo = useSnipitStore((s) => s.selectBrandLogo);

  return (
    <section className={styles.section}>
      <div className={styles.galleryPanel}>
        <div className={styles.gallery} role="radiogroup" aria-label="Brand source logos">
          {BUILTIN_BRAND_LOGOS.map((logo) => {
            const isSelected = selectedBrandLogoId === logo.id;

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
                onClick={() => selectBrandLogo(logo.id)}
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
      </div>
    </section>
  );
}
