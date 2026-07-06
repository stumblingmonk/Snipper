import { getBackgroundPackList } from '@/constants/backgroundPacks';
import { useSnipitStore } from '@/store/snipitStore';
import styles from './BackgroundPicker.module.css';

export function BackgroundPicker() {
  const selectedPackId = useSnipitStore((s) => s.selectedBackgroundPackId);
  const setSelectedBackgroundPackId = useSnipitStore(
    (s) => s.setSelectedBackgroundPackId,
  );
  const packs = getBackgroundPackList();

  return (
    <section className={styles.section}>
      <h3 className={styles.label}>Background</h3>
      <div className={styles.optionList} role="radiogroup" aria-label="Background pack">
        {packs.map((pack) => (
          <label
            key={pack.id}
            className={[
              styles.option,
              selectedPackId === pack.id ? styles.optionSelected : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <input
              type="radio"
              name="background-pack"
              value={pack.id}
              checked={selectedPackId === pack.id}
              onChange={() => setSelectedBackgroundPackId(pack.id)}
              className={styles.srOnly}
            />
            <span className={styles.optionLabel}>{pack.name}</span>
          </label>
        ))}
      </div>
    </section>
  );
}
