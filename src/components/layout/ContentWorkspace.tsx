import { selectCardContent } from '@/store/snipperStore';
import styles from './ContentWorkspace.module.css';

interface ContentWorkspaceProps {
  content: ReturnType<typeof selectCardContent>;
}

export function ContentWorkspace({ content }: ContentWorkspaceProps) {
  return (
    <main className={styles.panel}>
      <h2 className={styles.heading}>Content Workspace</h2>
      <p className={styles.note}>
        Phase 1 uses baked-in stress-test copy. Manual editing arrives in Phase 2.
      </p>

      <div className={styles.field}>
        <span className={styles.fieldLabel}>Source</span>
        <p className={styles.fieldValue}>{content.sourceName}</p>
      </div>

      <div className={styles.field}>
        <span className={styles.fieldLabel}>Headline</span>
        <p className={styles.fieldValue}>{content.headline}</p>
      </div>

      <div className={styles.field}>
        <span className={styles.fieldLabel}>Excerpt</span>
        <p className={styles.fieldValue}>{content.excerpt}</p>
      </div>
    </main>
  );
}
