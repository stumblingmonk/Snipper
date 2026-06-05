import type { FitStatus } from '@/constants/textFit';
import { useSnipperStore } from '@/store/snipperStore';
import styles from './FitStatusIndicator.module.css';

interface InlineFitStatusProps {
  field: 'headline' | 'excerpt';
}

function compactStatusLabel(status: FitStatus): string {
  switch (status) {
    case 'empty':
      return 'Empty';
    case 'fits':
      return 'Fits';
    case 'tight':
      return 'Tight';
    case 'too-long':
      return 'Too long';
  }
}

function statusClassName(status: FitStatus): string {
  switch (status) {
    case 'empty':
      return styles.empty;
    case 'tight':
      return styles.tight;
    case 'too-long':
      return styles.tooLong;
    default:
      return styles.fits;
  }
}

export function InlineFitStatus({ field }: InlineFitStatusProps) {
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

  const modeLabel = autoFit ? 'Auto-fit' : 'Manual';

  return (
    <span
      className={[styles.inlineStatus, statusClassName(status)].join(' ')}
      aria-live="polite"
    >
      {status === 'empty'
        ? compactStatusLabel(status)
        : `${compactStatusLabel(status)} · ${modeLabel} · ${resolvedSize}px`}
    </span>
  );
}
