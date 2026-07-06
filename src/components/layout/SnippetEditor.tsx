import { useLayoutEffect, useRef, useState } from 'react';
import { usePreviewZoneMetrics } from '@/context/PreviewZoneMetricsContext';
import { useSnipitStore, selectActivePage } from '@/store/snipitStore';
import {
  computeExcerptOverflowSplitIndex,
  excerptCapacityHeightFromLineClamp,
} from '@/utils/excerptOverflowPreview';
import styles from './SnippetEditor.module.css';

interface SnippetEditorProps {
  id?: string;
  rows?: number;
  placeholder?: string;
  className?: string;
  minHeight?: number;
}

export function SnippetEditor({
  id = 'excerpt',
  rows = 8,
  placeholder = 'Snippet shown on the card',
  className,
  minHeight = 168,
}: SnippetEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const activePage = useSnipitStore(selectActivePage);
  const excerpt = activePage.excerpt;
  const excerptFitStatus = activePage.excerptFitStatus;
  const excerptResolvedFontSize = activePage.excerptResolvedFontSize;
  const excerptLineClamp = activePage.excerptLineClamp;
  const setExcerpt = useSnipitStore((s) => s.setExcerpt);
  const { excerptWidth, excerptHeight } = usePreviewZoneMetrics();

  const [splitIndex, setSplitIndex] = useState<number | null>(null);
  const showOverflowHighlight =
    excerptFitStatus === 'too-long' &&
    splitIndex !== null &&
    splitIndex > 0 &&
    splitIndex < excerpt.length;

  useLayoutEffect(() => {
    if (excerptFitStatus !== 'too-long' || !excerpt.trim()) {
      setSplitIndex(null);
      return;
    }

    const capacityHeight =
      excerptLineClamp > 0
        ? excerptCapacityHeightFromLineClamp(
            excerptLineClamp,
            excerptResolvedFontSize,
          )
        : excerptHeight;

    if (excerptWidth <= 0 || capacityHeight <= 0) {
      setSplitIndex(null);
      return;
    }

    let cancelled = false;

    document.fonts.ready.then(() => {
      if (cancelled) return;

      const index = computeExcerptOverflowSplitIndex(
        excerpt,
        excerptResolvedFontSize,
        excerptWidth,
        capacityHeight,
      );
      setSplitIndex(index);
    });

    return () => {
      cancelled = true;
    };
  }, [
    excerpt,
    excerptFitStatus,
    excerptResolvedFontSize,
    excerptLineClamp,
    excerptWidth,
    excerptHeight,
  ]);

  const syncScroll = () => {
    const textarea = textareaRef.current;
    const highlight = highlightRef.current;
    if (!textarea || !highlight) return;
    highlight.scrollTop = textarea.scrollTop;
    highlight.scrollLeft = textarea.scrollLeft;
  };

  const fittingText =
    showOverflowHighlight && splitIndex !== null
      ? excerpt.slice(0, splitIndex)
      : excerpt;
  const overflowText =
    showOverflowHighlight && splitIndex !== null ? excerpt.slice(splitIndex) : '';

  const textareaClass = [
    showOverflowHighlight ? styles.textareaOverlay : styles.textareaPlain,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.editorWrap}>
      {showOverflowHighlight ? (
        <div
          ref={highlightRef}
          className={styles.highlightLayer}
          aria-hidden="true"
        >
          {fittingText}
          <span className={styles.overflow}>{overflowText}</span>
        </div>
      ) : null}

      <textarea
        ref={textareaRef}
        id={id}
        aria-label="Page Snippet"
        className={textareaClass}
        style={{ minHeight: `${minHeight}px` }}
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        onScroll={syncScroll}
        rows={rows}
        placeholder={placeholder}
        spellCheck
      />
    </div>
  );
}
