import { resolveArticleImageThumbnailUrl } from '@/store/selectors';
import { useSnipperStore } from '@/store/snipperStore';
import styles from './ArticleImagePreview.module.css';

export function ArticleImagePreview() {
  const thumbnailUrl = useSnipperStore(resolveArticleImageThumbnailUrl);

  if (!thumbnailUrl) {
    return (
      <div className={styles.previewWrap} aria-hidden="true">
        <span className={styles.previewPlaceholder}>No image</span>
      </div>
    );
  }

  return (
    <div className={styles.previewWrap}>
      <div className={styles.previewFrame}>
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
