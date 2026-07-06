import { useCallback, useMemo, useRef } from 'react';
import { ArticleImagePreview } from '@/components/layout/ArticleImagePreview';
import { ArticleImageUpload } from '@/components/layout/ArticleImageUpload';
import { ArticleMetadataFields } from '@/components/layout/ArticleMetadataFields';
import { ImageModeControls } from '@/components/layout/ImageModeControls';
import { OverflowHighlightField } from '@/components/layout/OverflowHighlightField';
import { SnippetEditor } from '@/components/layout/SnippetEditor';
import { TextFitFieldHeader } from '@/components/layout/TextFitFieldHeader';
import {
  CARD_SUBHEAD_LETTER_SPACING,
  CARD_SUBHEAD_LINE_HEIGHT,
} from '@/constants/cardTypography';
import { FORMATS } from '@/constants/formats';
import {
  computeArticleZones,
  getStandardArticleLayout,
} from '@/constants/standardArticleLayouts';
import { useTextOverflowSplitIndex } from '@/hooks/useTextOverflowSplitIndex';
import { resolveSourceLogoUrl } from '@/store/selectors';
import {
  selectHasScratchpadSelection,
  useSnipitStore,
} from '@/store/snipitStore';
import { isValidHttpUrl, normalizeHttpUrl } from '@/utils/urlValidation';
import styles from './ContentWorkspace.module.css';

export function ContentWorkspace() {
  const scratchpadRef = useRef<HTMLTextAreaElement>(null);

  const formatKey = useSnipitStore((s) => s.format);
  const sourceUrl = useSnipitStore((s) => s.sourceUrl);
  const headline = useSnipitStore((s) => s.headline);
  const subhead = useSnipitStore((s) => s.subhead);
  const scratchpad = useSnipitStore((s) => s.scratchpad);
  const caption = useSnipitStore((s) => s.caption);
  const imageMode = useSnipitStore((s) => s.imageMode);
  const headlineFitStatus = useSnipitStore((s) => s.headlineFitStatus);
  const logoUrl = useSnipitStore(resolveSourceLogoUrl);
  const hasSelection = useSnipitStore(selectHasScratchpadSelection);

  const setSourceUrl = useSnipitStore((s) => s.setSourceUrl);
  const setHeadline = useSnipitStore((s) => s.setHeadline);
  const setSubhead = useSnipitStore((s) => s.setSubhead);
  const setScratchpad = useSnipitStore((s) => s.setScratchpad);
  const setScratchpadSelection = useSnipitStore((s) => s.setScratchpadSelection);
  const setCaption = useSnipitStore((s) => s.setCaption);
  const useSelectedAsExcerpt = useSnipitStore((s) => s.useSelectedAsExcerpt);
  const appendSelectedToExcerpt = useSnipitStore((s) => s.appendSelectedToExcerpt);
  const clearScratchpad = useSnipitStore((s) => s.clearScratchpad);

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
        hasFooter: true,
      }),
    [layout, format, showImage, subhead, logoUrl],
  );

  const subheadMeasureStyle = useMemo(
    () =>
      subhead.trim()
        ? {
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: layout.subheadFontSize,
            fontWeight: 700,
            lineHeight: CARD_SUBHEAD_LINE_HEIGHT,
            letterSpacing: CARD_SUBHEAD_LETTER_SPACING,
            textTransform: 'uppercase',
            width: zones.headlineZone.width,
            height: zones.subheadZoneHeight,
          }
        : null,
    [
      subhead,
      layout.subheadFontSize,
      zones.headlineZone.width,
      zones.subheadZoneHeight,
    ],
  );

  const subheadSplitIndex = useTextOverflowSplitIndex(
    subhead,
    Boolean(subhead.trim()),
    subheadMeasureStyle,
  );

  const urlIsValid = isValidHttpUrl(sourceUrl);

  const syncScratchpadSelection = useCallback(() => {
    const el = scratchpadRef.current;
    if (!el) return;

    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const text = el.value.slice(start, end);

    setScratchpadSelection({ start, end, text });
  }, [setScratchpadSelection]);

  const handleOpenOriginal = () => {
    if (!urlIsValid) return;
    window.open(normalizeHttpUrl(sourceUrl), '_blank', 'noopener,noreferrer');
  };

  const handleCopyCaption = async () => {
    if (!caption.trim()) return;
    try {
      await navigator.clipboard.writeText(caption);
    } catch (err) {
      console.error('Copy caption failed:', err);
    }
  };

  return (
    <main className={styles.panel}>
      <section className={styles.group}>
        <div className={styles.fieldCompact}>
          <TextFitFieldHeader field="headline" label="Headline" htmlFor="headline" />
          {/* Headline overflow: status label + tooLong border only — no inline highlight. */}
          <OverflowHighlightField
            id="headline"
            variant="headline"
            rows={3}
            minHeight={72}
            maxHeight={120}
            value={headline}
            onChange={setHeadline}
            placeholder="Headline for the card"
            showOverflowHighlight={false}
            splitIndex={null}
            tooLong={headlineFitStatus === 'too-long'}
          />
        </div>

        <div className={styles.fieldCompact}>
          <label className={styles.sectionLabel} htmlFor="subhead">
            Subhead
          </label>
          <OverflowHighlightField
            id="subhead"
            variant="textarea"
            rows={1}
            minHeight={38}
            value={subhead}
            onChange={setSubhead}
            placeholder="Optional subhead"
            showOverflowHighlight={subheadSplitIndex !== null}
            splitIndex={subheadSplitIndex}
          />
        </div>
      </section>

      <section className={styles.groupCompact}>
        <ArticleMetadataFields />
      </section>

      <section className={styles.groupCompactArticleImage}>
        <div
          className={[
            styles.imageSectionBand,
            imageMode === 'crop' ? styles.imageSectionBandWithControls : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div className={styles.imageSectionLeft}>
            <h3 className={styles.imageSectionLabel}>Article Image</h3>
            <ImageModeControls embedded part="left">
              <ArticleImageUpload compact />
            </ImageModeControls>
          </div>
          <ArticleImagePreview />
          {imageMode === 'crop' ? (
            <div className={styles.imageSectionSpacer} aria-hidden="true" />
          ) : null}
          <ImageModeControls embedded part="crop" />
        </div>
      </section>

      <section className={styles.groupPrimary}>
        <div className={styles.field}>
          <TextFitFieldHeader
            field="excerpt"
            label="Article Snippet"
            htmlFor="excerpt"
          />
          <SnippetEditor id="excerpt" rows={8} minHeight={168} />
        </div>
      </section>

      <section className={styles.groupPrimary}>
        <h3 className={styles.sectionLabel}>Article Source / Scratchpad</h3>
        <textarea
          ref={scratchpadRef}
          id="scratchpad"
          className={styles.textareaScratchpad}
          value={scratchpad}
          onChange={(e) => {
            setScratchpad(e.target.value);
            const start = e.target.selectionStart ?? 0;
            const end = e.target.selectionEnd ?? 0;
            setScratchpadSelection({
              start,
              end,
              text: e.target.value.slice(start, end),
            });
          }}
          onSelect={syncScratchpadSelection}
          onMouseUp={syncScratchpadSelection}
          onKeyUp={syncScratchpadSelection}
          rows={8}
          placeholder="Paste article text here, select a passage, then send it to the snippet"
        />
        <div className={styles.buttonRow}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={useSelectedAsExcerpt}
            disabled={!hasSelection}
          >
            Use selected as snippet
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={appendSelectedToExcerpt}
            disabled={!hasSelection}
          >
            Append selected to snippet
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={clearScratchpad}
            disabled={!scratchpad}
          >
            Clear
          </button>
        </div>
      </section>

      <section className={styles.groupHelper}>
        <h3 className={styles.sectionLabel}>Reference</h3>

        <div className={styles.fieldCompact}>
          <label className={styles.sectionLabel} htmlFor="source-url">
            Source URL
          </label>
          <input
            id="source-url"
            type="url"
            className={styles.input}
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://example.com/article"
            spellCheck={false}
          />
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleOpenOriginal}
            disabled={!urlIsValid}
          >
            Open Original Article
          </button>
        </div>
      </section>

      <details className={styles.captionDetails}>
        <summary className={styles.captionSummary}>
          Post Caption (optional, not exported)
        </summary>
        <div className={styles.captionBody}>
          <textarea
            id="caption"
            className={styles.textareaSecondary}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            placeholder="Social caption for posting — not shown on card export"
          />
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleCopyCaption}
            disabled={!caption.trim()}
          >
            Copy caption
          </button>
        </div>
      </details>
    </main>
  );
}
