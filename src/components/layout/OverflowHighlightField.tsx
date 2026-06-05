import { useRef } from 'react';
import styles from './OverflowHighlightField.module.css';

interface OverflowHighlightFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showOverflowHighlight: boolean;
  splitIndex: number | null;
  variant: 'input' | 'textarea';
  rows?: number;
  className?: string;
  minHeight?: number;
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
  ariaLabel,
}: OverflowHighlightFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const syncScroll = () => {
    const field = textareaRef.current;
    const highlight = highlightRef.current;
    if (!field || !highlight) return;
    highlight.scrollTop = field.scrollTop;
    highlight.scrollLeft = field.scrollLeft;
  };

  const fittingText =
    showOverflowHighlight && splitIndex !== null ? value.slice(0, splitIndex) : value;
  const overflowText =
    showOverflowHighlight && splitIndex !== null ? value.slice(splitIndex) : '';

  const highlightClass =
    variant === 'input' ? styles.highlightLayerInput : styles.highlightLayerTextarea;
  const overlayClass =
    variant === 'input'
      ? [styles.inputOverlay, className].filter(Boolean).join(' ')
      : [styles.textareaOverlay, className].filter(Boolean).join(' ');
  const plainClass =
    variant === 'input'
      ? [styles.inputPlain, className].filter(Boolean).join(' ')
      : [styles.textareaPlain, className].filter(Boolean).join(' ');

  const fieldClass = showOverflowHighlight ? overlayClass : plainClass;
  const style = minHeight ? { minHeight: `${minHeight}px` } : undefined;

  return (
    <div className={styles.fieldWrap}>
      {showOverflowHighlight ? (
        <div ref={highlightRef} className={highlightClass} aria-hidden="true">
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
          style={style}
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
          style={style}
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
