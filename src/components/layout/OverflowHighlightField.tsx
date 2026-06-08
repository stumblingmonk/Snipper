import { useRef } from 'react';
import styles from './OverflowHighlightField.module.css';

/**
 * Headline overflow uses status/border only. Card headline typography and editor
 * typography intentionally differ, so inline character highlighting is unreliable
 * and can break editing.
 */
function inlineHighlightEnabled(
  variant: OverflowHighlightFieldProps['variant'],
  showOverflowHighlight: boolean,
): boolean {
  return showOverflowHighlight && variant !== 'headline';
}

interface OverflowHighlightFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showOverflowHighlight: boolean;
  splitIndex: number | null;
  variant: 'input' | 'textarea' | 'headline';
  rows?: number;
  className?: string;
  minHeight?: number;
  maxHeight?: number;
  tooLong?: boolean;
  ariaLabel?: string;
}

export function OverflowHighlightField({
  id,
  value,
  onChange,
  placeholder,
  showOverflowHighlight,
  splitIndex,
  variant,
  rows = 1,
  className,
  minHeight,
  maxHeight,
  tooLong = false,
  ariaLabel,
}: OverflowHighlightFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const useInlineHighlight = inlineHighlightEnabled(variant, showOverflowHighlight);

  const syncScroll = () => {
    const field = textareaRef.current;
    const highlight = highlightRef.current;
    if (!field || !highlight) return;
    highlight.scrollTop = field.scrollTop;
    highlight.scrollLeft = field.scrollLeft;
  };

  const fittingText =
    useInlineHighlight && splitIndex !== null ? value.slice(0, splitIndex) : value;
  const overflowText =
    useInlineHighlight && splitIndex !== null ? value.slice(splitIndex) : '';

  const highlightClass =
    variant === 'input'
      ? styles.highlightLayerInput
      : styles.highlightLayerTextarea;
  const overlayClass =
    variant === 'input'
      ? [styles.inputOverlay, className].filter(Boolean).join(' ')
      : [styles.textareaOverlay, className].filter(Boolean).join(' ');
  const plainClass =
    variant === 'headline'
      ? [styles.textareaHeadlinePlain, className].filter(Boolean).join(' ')
      : variant === 'input'
        ? [styles.inputPlain, className].filter(Boolean).join(' ')
        : [styles.textareaPlain, className].filter(Boolean).join(' ');

  const fieldClass = useInlineHighlight ? overlayClass : plainClass;
  const resolvedMinHeight =
    minHeight ?? (variant === 'headline' ? 72 : undefined);
  const resolvedMaxHeight =
    maxHeight ?? (variant === 'headline' ? 120 : undefined);
  const style = {
    ...(resolvedMinHeight ? { minHeight: `${resolvedMinHeight}px` } : {}),
    ...(resolvedMaxHeight
      ? { maxHeight: `${resolvedMaxHeight}px`, overflowY: 'auto' as const }
      : {}),
  };
  const hasStyle = resolvedMinHeight || resolvedMaxHeight;

  return (
    <div
      className={[styles.fieldWrap, tooLong ? styles.fieldWrapTooLong : '']
        .filter(Boolean)
        .join(' ')}
    >
      {useInlineHighlight ? (
        <div
          ref={highlightRef}
          className={highlightClass}
          style={hasStyle ? style : undefined}
          aria-hidden="true"
        >
          {fittingText}
          <span className={styles.overflow}>{overflowText}</span>
        </div>
      ) : null}

      {variant === 'input' ? (
        <input
          ref={inputRef}
          id={id}
          type="text"
          className={fieldClass}
          style={hasStyle ? style : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel}
        />
      ) : (
        <textarea
          ref={textareaRef}
          id={id}
          className={fieldClass}
          style={hasStyle ? style : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncScroll}
          rows={rows}
          placeholder={placeholder}
          aria-label={ariaLabel}
          spellCheck
        />
      )}
    </div>
  );
}
