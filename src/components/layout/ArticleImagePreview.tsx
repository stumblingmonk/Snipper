import { resolveArticleImageThumbnailUrl } from '@/store/selectors';
import { useSnipitStore } from '@/store/snipitStore';
import styles from './ArticleImagePreview.module.css';

export function ArticleImagePreview() {
  const thumbnailUrl = useSnipitStore(resolveArticleImageThumbnailUrl);
  const articleImageBw = useSnipitStore((s) => s.articleImageBw);
  const imageMode = useSnipitStore((s) => s.imageMode);

  if (!thumbnailUrl) {
    return (
      <div className={styles.previewWrap} aria-hidden="true">
        <span className={styles.previewPlaceholder}>No image</span>
      </div>
    );
  }

  return (
    <div className={styles.previewWrap}>
      <div
        className={[
          styles.previewFrame,
          articleImageBw && imageMode !== 'none' ? styles.previewFrameBw : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <img
          className={styles.previewImage}
          src={thumbnailUrl}
          alt=""
          draggable={false}
        />
      </div>
    </div>
  );
}
