import { FORMAT_LIST } from '@/constants/formats';
import { useSnipperStore } from '@/store/snipperStore';
import styles from './FormatPicker.module.css';

export function FormatPicker() {
  const formatKey = useSnipperStore((s) => s.format);
  const setFormat = useSnipperStore((s) => s.setFormat);

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
            <span className={styles.optionLabel}>{format.label}</span>
            <span className={styles.optionMeta}>
              {format.width} × {format.height}
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}
