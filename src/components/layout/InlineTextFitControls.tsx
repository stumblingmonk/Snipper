import { useSnipitStore, selectActivePage } from '@/store/snipitStore';
import styles from './InlineTextFitControls.module.css';

type TextFitField = 'headline' | 'excerpt';

interface InlineTextFitControlsProps {
  field: TextFitField;
}

export function InlineTextFitControls({ field }: InlineTextFitControlsProps) {
  const isHeadline = field === 'headline';

  const activePage = useSnipitStore(selectActivePage);
  const headlineSizeStep = useSnipitStore((s) => s.headlineSizeStep);
  const headlineAutoFit = useSnipitStore((s) => s.headlineAutoFit);
  const sizeStep = isHeadline ? headlineSizeStep : activePage.excerptSizeStep;
  const autoFit = isHeadline ? headlineAutoFit : activePage.excerptAutoFit;
  const adjustSizeStep = useSnipitStore((s) =>
    isHeadline ? s.adjustHeadlineSizeStep : s.adjustExcerptSizeStep,
  );
  const setAutoFit = useSnipitStore((s) =>
    isHeadline ? s.setHeadlineAutoFit : s.setExcerptAutoFit,
  );

  const decreaseLabel = isHeadline
    ? 'Decrease headline size step'
    : 'Decrease snippet size step';
  const increaseLabel = isHeadline
    ? 'Increase headline size step'
    : 'Increase snippet size step';

  return (
    <div
      className={styles.controls}
      role="group"
      aria-label={isHeadline ? 'Headline text fit' : 'Snippet text fit'}
    >
      <button
        type="button"
        className={styles.stepButton}
        onClick={() => adjustSizeStep(-1)}
        disabled={sizeStep <= -2}
        aria-label={decreaseLabel}
      >
        −
      </button>
      <button
        type="button"
        className={styles.stepButton}
        onClick={() => adjustSizeStep(1)}
        disabled={sizeStep >= 2}
        aria-label={increaseLabel}
      >
        +
      </button>
      <label className={styles.toggle}>
        <input
          type="checkbox"
          checked={autoFit}
          onChange={(e) => setAutoFit(e.target.checked)}
        />
        Auto-fit
      </label>
    </div>
  );
}
