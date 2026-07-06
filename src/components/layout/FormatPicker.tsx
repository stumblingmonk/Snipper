import type { FormatKey } from '@/constants/formats';
import { FORMAT_LIST } from '@/constants/formats';
import { useSnipitStore } from '@/store/snipitStore';
import styles from './FormatPicker.module.css';

function formatIconClass(key: FormatKey): string {
  switch (key) {
    case 'square':
      return styles.formatIconSquare;
    case 'portrait':
      return styles.formatIconPortrait;
    case 'story':
      return styles.formatIconStory;
    case 'linkedin':
      return styles.formatIconLinkedin;
  }
}

export function FormatPicker() {
  const formatKey = useSnipitStore((s) => s.format);
  const setFormat = useSnipitStore((s) => s.setFormat);

  return (
    <section className={styles.section}>
      <h3 className={styles.label}>Format</h3>
      <div className={styles.optionList} role="radiogroup" aria-label="Format">
        {FORMAT_LIST.map((format) => (
          <label
            key={format.key}
            className={[
              styles.option,
              formatKey === format.key ? styles.optionSelected : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <input
              type="radio"
              name="format"
              value={format.key}
              checked={formatKey === format.key}
              onChange={() => setFormat(format.key)}
              className={styles.srOnly}
            />
            <span
              className={[styles.formatIcon, formatIconClass(format.key)].join(
                ' ',
              )}
              aria-hidden="true"
            />
            <span className={styles.optionContent}>
              <span className={styles.optionLabel}>{format.label}</span>
              <span className={styles.optionMeta}>
                {format.width} × {format.height}
              </span>
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}
