import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { FORMATS } from '@/constants/formats';
import { computeArticleZones, getStandardArticleLayout } from '@/constants/standardArticleLayouts';
import { resolveSourceLogoUrl, resolveSourceNameForCard } from '@/store/selectors';
import { useSnipperStore } from '@/store/snipperStore';
import { computeExcerptOverflowSplitIndex } from '@/utils/excerptOverflowPreview';
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

  const formatKey = useSnipperStore((s) => s.format);
  const excerpt = useSnipperStore((s) => s.excerpt);
  const excerptFitStatus = useSnipperStore((s) => s.excerptFitStatus);
  const excerptResolvedFontSize = useSnipperStore(
    (s) => s.excerptResolvedFontSize,
  );
  const subhead = useSnipperStore((s) => s.subhead);
  const sourceName = useSnipperStore(resolveSourceNameForCard);
  const imageMode = useSnipperStore((s) => s.imageMode);
  const logoUrl = useSnipperStore(resolveSourceLogoUrl);
  const setExcerpt = useSnipperStore((s) => s.setExcerpt);

  const format = FORMATS[formatKey];
  const layout = useMemo(
    () => getStandardArticleLayout(formatKey),
    [formatKey],
  );
  const showImage = imageMode !== 'none';
  const zones = useMemo(
    () =>
      computeArticleZones({
        layout,
        format,
        showImage,
        hasSubhead: Boolean(subhead.trim()),
        hasLogo: Boolean(logoUrl),
        hasFooter: Boolean(sourceName),
      }),
    [layout, format, showImage, subhead, logoUrl, sourceName],
  );

  const [splitIndex, setSplitIndex] = useState<number | null>(null);
  const showOverflowHighlight = excerptFitStatus === 'too-long' && splitIndex !== null;

  useLayoutEffect(() => {
    if (excerptFitStatus !== 'too-long' || !excerpt.trim()) {
      setSplitIndex(null);
      return;
    }

    let cancelled = false;

    document.fonts.ready.then(() => {
      if (cancelled) return;

      const index = computeExcerptOverflowSplitIndex(
        excerpt,
        excerptResolvedFontSize,
        zones.excerptZone.width,
        zones.excerptZone.height,
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
    zones.excerptZone.width,
    zones.excerptZone.height,
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
        aria-label="Article Snippet"
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
