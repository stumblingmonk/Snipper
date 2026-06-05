import type { CSSProperties, RefObject } from 'react';
import type { FormatSpec } from '@/constants/formats';
import type { StandardArticleLayout } from '@/constants/standardArticleLayouts';
import styles from './StandardArticleCard.module.css';

export interface StandardArticleCardProps {
  format: FormatSpec;
  layout: StandardArticleLayout;
  sourceName: string;
  headline: string;
  subhead: string;
  excerpt: string;
  logoUrl: string | null;
  backgroundUrl: string | null;
  backgroundFallbackColor: string;
  imageUrl: string | null;
  headlineFontSize: number;
  excerptFontSize: number;
  showImage: boolean;
  className?: string;
  id?: string;
  headlineZoneRef?: RefObject<HTMLDivElement | null>;
  excerptZoneRef?: RefObject<HTMLDivElement | null>;
}

function layoutCssVariables(layout: StandardArticleLayout): CSSProperties {
  return {
    '--sa-card-padding': `${layout.cardPadding}px`,
    '--sa-zone-margin-x': `${layout.zoneMarginX}px`,
    '--sa-header-padding-top': `${layout.header.paddingTop}px`,
    '--sa-header-padding-bottom': `${layout.header.paddingBottom}px`,
    '--sa-logo-max-width': `${layout.header.logoMaxWidth}px`,
    '--sa-source-name-size': `${layout.header.sourceNameFontSize}px`,
    '--sa-headline-zone-width': `${layout.headlineZone.width}px`,
    '--sa-headline-zone-height': `${layout.headlineZone.height}px`,
    '--sa-subhead-zone-height': `${layout.subheadZoneHeight}px`,
    '--sa-subhead-font-size': `${layout.subheadFontSize}px`,
    '--sa-subhead-margin-top': layout.formatKey === 'linkedin' ? '4px' : '8px',
    '--sa-image-frame-width': `${layout.imageFrame.width}px`,
    '--sa-image-frame-height': `${layout.imageFrame.height}px`,
    '--sa-image-margin-top': layout.formatKey === 'linkedin' ? '8px' : '24px',
    '--sa-excerpt-zone-width': `${layout.excerptZone.width}px`,
    '--sa-excerpt-zone-height': `${layout.excerptZone.height}px`,
    '--sa-excerpt-margin-top': layout.formatKey === 'linkedin' ? '8px' : '24px',
    '--sa-footer-padding-top': `${layout.footer.paddingTop}px`,
    '--sa-footer-padding-bottom': `${layout.footer.paddingBottom}px`,
    '--sa-footer-font-size': `${layout.footer.fontSize}px`,
    '--sa-fallback-bg': layout.fallbackBackgroundColor,
  } as CSSProperties;
}

export function StandardArticleCard({
  format,
  layout,
  sourceName,
  headline,
  subhead,
  excerpt,
  logoUrl,
  backgroundUrl,
  backgroundFallbackColor,
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
        backgroundColor: backgroundFallbackColor,
        ...layoutCssVariables(layout),
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
