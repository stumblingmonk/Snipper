import { InlineFitStatus } from '@/components/layout/FitStatusIndicator';
import { InlineTextFitControls } from '@/components/layout/InlineTextFitControls';
import styles from './TextFitFieldHeader.module.css';

type TextFitField = 'headline' | 'excerpt';

interface TextFitFieldHeaderProps {
  field: TextFitField;
  label: string;
  htmlFor: string;
}

export function TextFitFieldHeader({
  field,
  label,
  htmlFor,
}: TextFitFieldHeaderProps) {
  return (
    <div className={styles.header}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
      </label>
      <div className={styles.actions}>
        <InlineFitStatus field={field} />
        <InlineTextFitControls field={field} />
      </div>
    </div>
  );
}
