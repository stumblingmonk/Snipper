import {
  EXCERPT_TYPO,
  HEADLINE_TYPO,
  preferredFontSize,
} from '@/constants/textFit';
import { useSnipperStore } from '@/store/snipperStore';
import styles from './TextFitControls.module.css';

export function TextFitControls() {
  const headlineSizeStep = useSnipperStore((s) => s.headlineSizeStep);
  const excerptSizeStep = useSnipperStore((s) => s.excerptSizeStep);
  const headlineAutoFit = useSnipperStore((s) => s.headlineAutoFit);
  const excerptAutoFit = useSnipperStore((s) => s.excerptAutoFit);

  const adjustHeadlineSizeStep = useSnipperStore((s) => s.adjustHeadlineSizeStep);
  const adjustExcerptSizeStep = useSnipperStore((s) => s.adjustExcerptSizeStep);
  const setHeadlineAutoFit = useSnipperStore((s) => s.setHeadlineAutoFit);
  const setExcerptAutoFit = useSnipperStore((s) => s.setExcerptAutoFit);
  const resetTextControls = useSnipperStore((s) => s.resetTextControls);

  const headlinePreferred = preferredFontSize(headlineSizeStep, HEADLINE_TYPO);
  const excerptPreferred = preferredFontSize(excerptSizeStep, EXCERPT_TYPO);

  return (
    <section className={styles.section}>
      <h3 className={styles.label}>Text Fit</h3>

      <div className={styles.block}>
        <span className={styles.blockLabel}>Headline</span>
        <div className={styles.row}>
          <button
            type="button"
            className={styles.stepButton}
            onClick={() => adjustHeadlineSizeStep(-1)}
            disabled={headlineSizeStep <= -2}
            aria-label="Decrease headline size step"
          >
            −
          </button>
          <span className={styles.stepValue}>
            Step {headlineSizeStep > 0 ? '+' : ''}
            {headlineSizeStep}
          </span>
          <button
            type="button"
            className={styles.stepButton}
            onClick={() => adjustHeadlineSizeStep(1)}
            disabled={headlineSizeStep >= 2}
            aria-label="Increase headline size step"
          >
            +
          </button>
        </div>
        <p className={styles.hint}>Preferred {headlinePreferred}px</p>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={headlineAutoFit}
            onChange={(e) => setHeadlineAutoFit(e.target.checked)}
          />
          Auto-Fit headline
        </label>
      </div>

      <div className={styles.block}>
        <span className={styles.blockLabel}>Excerpt</span>
        <div className={styles.row}>
          <button
            type="button"
            className={styles.stepButton}
            onClick={() => adjustExcerptSizeStep(-1)}
            disabled={excerptSizeStep <= -2}
            aria-label="Decrease excerpt size step"
          >
            −
          </button>
          <span className={styles.stepValue}>
            Step {excerptSizeStep > 0 ? '+' : ''}
            {excerptSizeStep}
          </span>
          <button
            type="button"
            className={styles.stepButton}
            onClick={() => adjustExcerptSizeStep(1)}
            disabled={excerptSizeStep >= 2}
            aria-label="Increase excerpt size step"
          >
            +
          </button>
        </div>
        <p className={styles.hint}>Preferred {excerptPreferred}px</p>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={excerptAutoFit}
            onChange={(e) => setExcerptAutoFit(e.target.checked)}
          />
          Auto-Fit excerpt
        </label>
      </div>

      <button
        type="button"
        className={styles.resetButton}
        onClick={resetTextControls}
      >
        Reset text controls
      </button>
    </section>
  );
}
