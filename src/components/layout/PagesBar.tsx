import { MAX_ARTICLE_PAGES } from '@/types/articlePage';
import { useSnipitStore } from '@/store/snipitStore';
import styles from './PagesBar.module.css';

export function PagesBar() {
  const pages = useSnipitStore((s) => s.pages);
  const activePageIndex = useSnipitStore((s) => s.activePageIndex);
  const setActivePageIndex = useSnipitStore((s) => s.setActivePageIndex);
  const addPage = useSnipitStore((s) => s.addPage);
  const duplicatePage = useSnipitStore((s) => s.duplicatePage);
  const deletePage = useSnipitStore((s) => s.deletePage);
  const goToPrevPage = useSnipitStore((s) => s.goToPrevPage);
  const goToNextPage = useSnipitStore((s) => s.goToNextPage);

  const atMaxPages = pages.length >= MAX_ARTICLE_PAGES;
  const canDelete = pages.length > 1;

  return (
    <section className={styles.bar} aria-label="Article pages">
      <div className={styles.headerRow}>
        <h3 className={styles.label}>Pages</h3>
        <span className={styles.count}>
          {activePageIndex + 1} / {pages.length}
        </span>
      </div>

      <div className={styles.controlsRow}>
        <button
          type="button"
          className={styles.navButton}
          onClick={goToPrevPage}
          disabled={activePageIndex <= 0}
          aria-label="Previous page"
        >
          ‹
        </button>

        <div className={styles.tabs} role="tablist" aria-label="Page tabs">
          {pages.map((page, index) => (
            <button
              key={page.id}
              type="button"
              role="tab"
              aria-selected={index === activePageIndex}
              className={[
                styles.tab,
                index === activePageIndex ? styles.tabActive : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setActivePageIndex(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <button
          type="button"
          className={styles.navButton}
          onClick={goToNextPage}
          disabled={activePageIndex >= pages.length - 1}
          aria-label="Next page"
        >
          ›
        </button>
      </div>

      <div className={styles.actionRow}>
        <button
          type="button"
          className={styles.actionButton}
          onClick={addPage}
          disabled={atMaxPages}
        >
          Add page
        </button>
        <button
          type="button"
          className={styles.actionButton}
          onClick={duplicatePage}
          disabled={atMaxPages}
        >
          Duplicate
        </button>
        <button
          type="button"
          className={styles.actionButton}
          onClick={deletePage}
          disabled={!canDelete}
        >
          Delete
        </button>
      </div>
    </section>
  );
}
