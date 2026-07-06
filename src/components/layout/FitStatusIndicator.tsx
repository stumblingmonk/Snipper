import type { FitStatus } from '@/constants/textFit';
import { useSnipitStore, selectActivePage } from '@/store/snipitStore';
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
  const activePage = useSnipitStore(selectActivePage);
  const headlineResolvedFontSize = useSnipitStore(
    (s) => s.headlineResolvedFontSize,
  );
  const headlineFitStatus = useSnipitStore((s) => s.headlineFitStatus);
  const headlineAutoFit = useSnipitStore((s) => s.headlineAutoFit);

  const status = field === 'headline' ? headlineFitStatus : activePage.excerptFitStatus;
  const resolvedSize =
    field === 'headline'
      ? headlineResolvedFontSize
      : activePage.excerptResolvedFontSize;
  const autoFit = field === 'headline' ? headlineAutoFit : activePage.excerptAutoFit;

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
