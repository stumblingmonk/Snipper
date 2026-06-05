import { useCallback, useRef } from 'react';
import {
  selectHasScratchpadSelection,
  useSnipperStore,
} from '@/store/snipperStore';
import { isValidHttpUrl, normalizeHttpUrl } from '@/utils/urlValidation';
import styles from './ContentWorkspace.module.css';

export function ContentWorkspace() {
  const scratchpadRef = useRef<HTMLTextAreaElement>(null);

  const sourceUrl = useSnipperStore((s) => s.sourceUrl);
  const sourceName = useSnipperStore((s) => s.sourceName);
  const headline = useSnipperStore((s) => s.headline);
  const subhead = useSnipperStore((s) => s.subhead);
  const excerpt = useSnipperStore((s) => s.excerpt);
  const scratchpad = useSnipperStore((s) => s.scratchpad);
  const caption = useSnipperStore((s) => s.caption);
  const hasSelection = useSnipperStore(selectHasScratchpadSelection);

  const setSourceUrl = useSnipperStore((s) => s.setSourceUrl);
  const setSourceName = useSnipperStore((s) => s.setSourceName);
  const setHeadline = useSnipperStore((s) => s.setHeadline);
  const setSubhead = useSnipperStore((s) => s.setSubhead);
  const setExcerpt = useSnipperStore((s) => s.setExcerpt);
  const setScratchpad = useSnipperStore((s) => s.setScratchpad);
  const setScratchpadSelection = useSnipperStore((s) => s.setScratchpadSelection);
  const setCaption = useSnipperStore((s) => s.setCaption);
  const useSelectedAsExcerpt = useSnipperStore((s) => s.useSelectedAsExcerpt);
  const appendSelectedToExcerpt = useSnipperStore((s) => s.appendSelectedToExcerpt);
  const clearScratchpad = useSnipperStore((s) => s.clearScratchpad);

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
      <h2 className={styles.heading}>Content Workspace</h2>
      <p className={styles.note}>
        Edit content manually. Preview and export update live from these fields.
      </p>

      <section className={styles.section}>
        <label className={styles.fieldLabel} htmlFor="source-url">
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
      </section>

      <section className={styles.section}>
        <label className={styles.fieldLabel} htmlFor="source-name">
          Source / Publication Name
        </label>
        <input
          id="source-name"
          type="text"
          className={styles.input}
          value={sourceName}
          onChange={(e) => setSourceName(e.target.value)}
          placeholder="Publication name"
        />
      </section>

      <section className={styles.section}>
        <label className={styles.fieldLabel} htmlFor="headline">
          Final Headline
        </label>
        <textarea
          id="headline"
          className={styles.textarea}
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          rows={4}
          placeholder="Headline for the card"
        />
      </section>

      <section className={styles.section}>
        <label className={styles.fieldLabel} htmlFor="subhead">
          Subhead / Dek
        </label>
        <textarea
          id="subhead"
          className={styles.textarea}
          value={subhead}
          onChange={(e) => setSubhead(e.target.value)}
          rows={2}
          placeholder="Optional subhead or dek"
        />
      </section>

      <section className={styles.section}>
        <label className={styles.fieldLabel} htmlFor="excerpt">
          Final Excerpt
        </label>
        <textarea
          id="excerpt"
          className={styles.textarea}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={4}
          placeholder="Excerpt shown on the card"
        />
      </section>

      <section className={styles.section}>
        <label className={styles.fieldLabel} htmlFor="scratchpad">
          Scratchpad
        </label>
        <textarea
          ref={scratchpadRef}
          id="scratchpad"
          className={styles.textarea}
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
          rows={6}
          placeholder="Paste raw article text here, then select passages to use as excerpt"
        />
        <div className={styles.buttonRow}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={useSelectedAsExcerpt}
            disabled={!hasSelection}
          >
            Use selected text as excerpt
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={appendSelectedToExcerpt}
            disabled={!hasSelection}
          >
            Append selected text to excerpt
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={clearScratchpad}
            disabled={!scratchpad}
          >
            Clear scratchpad
          </button>
        </div>
      </section>

      <section className={styles.section}>
        <label className={styles.fieldLabel} htmlFor="caption">
          Caption (optional)
        </label>
        <textarea
          id="caption"
          className={styles.textarea}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={3}
          placeholder="Social caption — not shown on card export"
        />
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={handleCopyCaption}
          disabled={!caption.trim()}
        >
          Copy caption
        </button>
      </section>
    </main>
  );
}
