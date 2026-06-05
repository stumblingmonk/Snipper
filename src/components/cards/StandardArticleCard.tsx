import type { RefObject } from 'react';
import type { FormatSpec } from '@/constants/formats';
import styles from './StandardArticleCard.module.css';

export interface StandardArticleCardProps {
  format: FormatSpec;
  sourceName: string;
  headline: string;
  subhead: string;
  excerpt: string;
  logoUrl: string | null;
  backgroundUrl: string | null;
  imageUrl: string | null;
  headlineFontSize: number;
  excerptFontSize: number;
  showImage: boolean;
  className?: string;
  id?: string;
  headlineZoneRef?: RefObject<HTMLDivElement | null>;
  excerptZoneRef?: RefObject<HTMLDivElement | null>;
}

export function StandardArticleCard({
  format,
  sourceName,
  headline,
  subhead,
  excerpt,
  logoUrl,
  backgroundUrl,
  imageUrl,
  headlineFontSize,
  excerptFontSize,
  showImage,
  className,
  id,
  headlineZoneRef,
  excerptZoneRef,
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
      <div className={styles.articleContainer}>
        <header className={styles.header}>
          {logoUrl ? (
            <img
              className={styles.logo}
              src={logoUrl}
              alt=""
              draggable={false}
            />
          ) : null}
          {sourceName ? (
            <span className={styles.sourceName}>{sourceName}</span>
          ) : null}
        </header>

        <div
          ref={headlineZoneRef}
          className={styles.headlineZone}
          data-fit-zone="headline"
          style={{ fontSize: headlineFontSize }}
        >
          <h1 className={styles.headline}>{headline}</h1>
        </div>

        {subhead ? (
          <div className={styles.subheadZone}>
            <p className={styles.subhead}>{subhead}</p>
          </div>
        ) : null}

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
          ref={excerptZoneRef}
          className={styles.excerptZone}
          data-fit-zone="excerpt"
          style={{ fontSize: excerptFontSize }}
        >
          <p className={styles.excerpt}>{excerpt}</p>
        </div>

        {sourceName ? (
          <footer className={styles.footer}>
            <span className={styles.footerSource}>{sourceName}</span>
          </footer>
        ) : null}
      </div>
    </article>
  );
}
