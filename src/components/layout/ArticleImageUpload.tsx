import { useRef } from 'react';
import { ARTICLE_IMAGE_MAX_BYTES } from '@/constants/imageSettings';
import {
  selectHasUploadedArticleImage,
  useSnipperStore,
} from '@/store/snipperStore';
import styles from './ArticleImageUpload.module.css';

const MAX_MB = ARTICLE_IMAGE_MAX_BYTES / (1024 * 1024);

export function ArticleImageUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageMode = useSnipperStore((s) => s.imageMode);
  const articleImageUploadError = useSnipperStore((s) => s.articleImageUploadError);
  const hasUploadedImage = useSnipperStore(selectHasUploadedArticleImage);

  const uploadArticleImage = useSnipperStore((s) => s.uploadArticleImage);
  const clearUploadedArticleImage = useSnipperStore(
    (s) => s.clearUploadedArticleImage,
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadArticleImage(file);
    }
    event.target.value = '';
  };

  return (
    <section className={styles.section}>
      <span className={styles.fieldLabel}>Article Image</span>

      <div className={styles.uploadRow}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
          className={styles.fileInput}
          onChange={handleFileChange}
        />
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={() => fileInputRef.current?.click()}
        >
          Upload article image
        </button>
        {hasUploadedImage ? (
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={clearUploadedArticleImage}
          >
            Clear uploaded image
          </button>
        ) : null}
      </div>

      <p className={styles.helpText}>
        PNG, JPG, JPEG, or WEBP up to {MAX_MB} MB. Uploads are session-only.
      </p>

      {imageMode === 'none' ? (
        <p className={styles.note}>
          Image mode is None — uploaded image is stored but hidden on the card.
        </p>
      ) : null}

      {articleImageUploadError ? (
        <p className={styles.error} role="alert">
          {articleImageUploadError}
        </p>
      ) : null}
    </section>
  );
}
