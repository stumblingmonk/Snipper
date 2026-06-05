import {
  EXCERPT_TYPO,
  HEADLINE_TYPO,
  fitStatusLabel,
  preferredFontSize,
  type FitStatus,
} from '@/constants/textFit';
import { useSnipperStore } from '@/store/snipperStore';
import styles from './FitStatusIndicator.module.css';

interface FitStatusIndicatorProps {
  field: 'headline' | 'excerpt';
}

function statusClassName(status: FitStatus): string {
  switch (status) {
    case 'tight':
      return styles.tight;
    case 'too-long':
      return styles.tooLong;
    default:
      return styles.normal;
  }
}

export function FitStatusIndicator({ field }: FitStatusIndicatorProps) {
  const status = useSnipperStore((s) =>
    field === 'headline' ? s.headlineFitStatus : s.excerptFitStatus,
  );
  const resolvedSize = useSnipperStore((s) =>
    field === 'headline'
      ? s.headlineResolvedFontSize
      : s.excerptResolvedFontSize,
  );
  const autoFit = useSnipperStore((s) =>
    field === 'headline' ? s.headlineAutoFit : s.excerptAutoFit,
  );
  const step = useSnipperStore((s) =>
    field === 'headline' ? s.headlineSizeStep : s.excerptSizeStep,
  );
  const bounds = field === 'headline' ? HEADLINE_TYPO : EXCERPT_TYPO;
  const preferred = preferredFontSize(step, bounds);

  return (
    <p className={[styles.indicator, statusClassName(status)].join(' ')}>
      <span>{fitStatusLabel(status)}</span>
      {status !== 'empty' ? (
        <span className={styles.meta}>
          {autoFit ? 'Auto-Fit' : 'Manual'} · resolved {resolvedSize}px
          {autoFit ? '' : ` · preferred ${preferred}px`}
        </span>
      ) : null}
    </p>
  );
}
