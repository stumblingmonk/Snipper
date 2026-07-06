import { useSnipitStore } from '@/store/snipitStore';
import styles from './ArticleMetadataFields.module.css';

function MetadataFieldRow({
  id,
  label,
  value,
  onChange,
  show,
  onShowChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onShowChange: (show: boolean) => void;
  placeholder: string;
}) {
  return (
    <div className={styles.fieldRow}>
      <div className={styles.fieldHeader}>
        <label className={styles.fieldLabel} htmlFor={id}>
          {label}
        </label>
        <label className={styles.visibilityToggle}>
          <input
            type="checkbox"
            className={styles.visibilityCheckbox}
            checked={show}
            onChange={(event) => onShowChange(event.target.checked)}
          />
          <span className={styles.visibilityLabel}>Show</span>
        </label>
      </div>
      <input
        id={id}
        type="text"
        className={styles.input}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        spellCheck={false}
      />
    </div>
  );
}

export function ArticleMetadataFields() {
  const byline = useSnipitStore((s) => s.byline);
  const articleDate = useSnipitStore((s) => s.articleDate);
  const attribution = useSnipitStore((s) => s.attribution);
  const showByline = useSnipitStore((s) => s.showByline);
  const showArticleDate = useSnipitStore((s) => s.showArticleDate);
  const showAttribution = useSnipitStore((s) => s.showAttribution);

  const setByline = useSnipitStore((s) => s.setByline);
  const setArticleDate = useSnipitStore((s) => s.setArticleDate);
  const setAttribution = useSnipitStore((s) => s.setAttribution);
  const setShowByline = useSnipitStore((s) => s.setShowByline);
  const setShowArticleDate = useSnipitStore((s) => s.setShowArticleDate);
  const setShowAttribution = useSnipitStore((s) => s.setShowAttribution);

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionLabel}>Article Metadata</h3>
      <MetadataFieldRow
        id="article-byline"
        label="Byline"
        value={byline}
        onChange={setByline}
        show={showByline}
        onShowChange={setShowByline}
        placeholder="Author name"
      />
      <MetadataFieldRow
        id="article-date"
        label="Date"
        value={articleDate}
        onChange={setArticleDate}
        show={showArticleDate}
        onShowChange={setShowArticleDate}
        placeholder="Mar 15, 2026"
      />
      <MetadataFieldRow
        id="article-attribution"
        label="Attribution"
        value={attribution}
        onChange={setAttribution}
        show={showAttribution}
        onShowChange={setShowAttribution}
        placeholder="Photo: Getty Images"
      />
    </section>
  );
}
