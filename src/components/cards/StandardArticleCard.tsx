import type { FormatSpec } from '@/constants/formats';
import styles from './StandardArticleCard.module.css';

export interface StandardArticleCardProps {
  format: FormatSpec;
  sourceName: string;
  headline: string;
  excerpt: string;
  logoUrl: string | null;
  backgroundUrl: string | null;
  imageUrl: string | null;
  headlineFontSize: number;
  excerptFontSize: number;
  showImage: boolean;
  className?: string;
  id?: string;
}

export function StandardArticleCard({
  format,
  sourceName,
  headline,
  excerpt,
  logoUrl,
  backgroundUrl,
  imageUrl,
  headlineFontSize,
  excerptFontSize,
  showImage,
  className,
  id,
}: StandardArticleCardProps) {
  return (
    <article
      id={id}
      className={[styles.card, className].filter(Boolean).join(' ')}
      style={{
        width: format.width,
        height: format.height,
        backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
      }}
      aria-label="Social card preview"
    >
      <div className={styles.overlay} />

      <header className={styles.header}>
        {logoUrl ? (
          <img
            className={styles.logo}
            src={logoUrl}
            alt=""
            draggable={false}
          />
        ) : null}
        <span className={styles.sourceName}>{sourceName}</span>
      </header>

      <div
        className={styles.headlineZone}
        style={{ fontSize: headlineFontSize }}
      >
        <h1 className={styles.headline}>{headline}</h1>
      </div>

      {showImage && imageUrl ? (
        <div className={styles.imageZone}>
          <img
            className={styles.articleImage}
            src={imageUrl}
            alt=""
            draggable={false}
          />
        </div>
      ) : null}

      <div
        className={styles.excerptZone}
        style={{ fontSize: excerptFontSize }}
      >
        <p className={styles.excerpt}>{excerpt}</p>
      </div>

      <footer className={styles.footer}>
        <span className={styles.footerSource}>{sourceName}</span>
      </footer>
    </article>
  );
}
