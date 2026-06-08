import { useMemo } from 'react';
import type { CSSProperties, RefObject } from 'react';
import type { FormatSpec } from '@/constants/formats';
import { OBB_BRAND_LOGO_URL, OBB_FOOTER_LOGO_WIDTH } from '@/constants/brandAssets';
import {
  CARD_EXCERPT_LINE_HEIGHT,
  CARD_HEADLINE_LINE_HEIGHT,
} from '@/constants/cardTypography';
import type { StandardArticleLayout } from '@/constants/standardArticleLayouts';
import {
  computeArticleZones,
  usesSplitLayout,
} from '@/constants/standardArticleLayouts';
import {
  computeLineClamp,
  visibleHeightFromLineClamp,
} from '@/utils/textFitMeasure';
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
  excerptLineClamp?: number;
  showImage: boolean;
  className?: string;
  id?: string;
  headlineZoneRef?: RefObject<HTMLDivElement | null>;
  excerptZoneRef?: RefObject<HTMLDivElement | null>;
}

function layoutCssVariables(
  layout: StandardArticleLayout,
  format: FormatSpec,
  showImage: boolean,
  hasLogo: boolean,
  zones: ReturnType<typeof computeArticleZones>,
): CSSProperties {
  const split = usesSplitLayout(layout, showImage);
  const headlineMarginTop =
    !split && !hasLogo ? `${layout.header.paddingTop}px` : '0px';

  return {
    '--sa-card-padding': `${layout.cardPadding}px`,
    '--sa-zone-margin-x': `${zones.zoneMarginX}px`,
    '--sa-container-radius': `${layout.containerRadius}px`,
    '--sa-header-padding-top': `${layout.header.paddingTop}px`,
    '--sa-header-padding-bottom': `${layout.header.paddingBottom}px`,
    '--sa-logo-max-width': `${layout.header.logoMaxWidth}px`,
    '--sa-logo-max-height': `${layout.header.logoMaxHeight}px`,
    '--sa-headline-zone-width': `${zones.headlineZone.width}px`,
    '--sa-headline-zone-height': `${zones.headlineZone.height}px`,
    '--sa-headline-zone-max-height': `${zones.headlineZone.height}px`,
    '--sa-headline-zone-margin-top': headlineMarginTop,
    '--sa-subhead-zone-height': `${zones.subheadZoneHeight}px`,
    '--sa-subhead-zone-max-height': `${zones.subheadZoneHeight}px`,
    '--sa-subhead-font-size': `${layout.subheadFontSize}px`,
    '--sa-subhead-margin-top': `${zones.subheadMarginTop}px`,
    '--sa-image-frame-width': `${zones.imageFrame.width}px`,
    '--sa-image-frame-height': `${zones.imageFrame.height}px`,
    '--sa-image-margin-top': showImage
      ? `${layout.spacing.imageMarginTop}px`
      : '0px',
    '--sa-excerpt-zone-width': `${zones.excerptZone.width}px`,
    '--sa-excerpt-zone-height': `${zones.excerptZone.height}px`,
    '--sa-excerpt-margin-top': showImage
      ? `${layout.spacing.excerptMarginTop}px`
      : `${layout.spacing.excerptMarginTopNoImage}px`,
    '--sa-footer-padding-top': `${layout.footer.paddingTop}px`,
    '--sa-footer-padding-bottom': `${layout.footer.paddingBottom}px`,
    '--sa-footer-font-size': `${layout.footer.fontSize}px`,
    '--sa-obb-logo-width': `${OBB_FOOTER_LOGO_WIDTH[format.key] ?? 48}px`,
    '--sa-fallback-bg': layout.fallbackBackgroundColor,
    '--sa-split-image-width': split ? `${zones.imageFrame.width}px` : '0px',
  } as CSSProperties;
}

function LogoBlock({ logoUrl, centered }: { logoUrl: string; centered: boolean }) {
  return (
    <img
      className={[styles.logo, centered ? styles.logoCentered : styles.logoInline]
        .filter(Boolean)
        .join(' ')}
      src={logoUrl}
      alt=""
      draggable={false}
    />
  );
}

function HeaderBlock({
  logoUrl,
  layout,
}: {
  logoUrl: string | null;
  layout: StandardArticleLayout;
}) {
  if (!logoUrl || layout.logoPlacement === 'inlineAboveHeadline') return null;

  return (
    <header className={styles.header}>
      <LogoBlock logoUrl={logoUrl} centered />
    </header>
  );
}

function LinkedInBrandRow({ logoUrl }: { logoUrl: string | null }) {
  if (!logoUrl) return null;

  return (
    <div className={styles.linkedinBrandRow}>
      <LogoBlock logoUrl={logoUrl} centered={false} />
    </div>
  );
}

function HeadlineBlock({
  headline,
  headlineFontSize,
  headlineMaxCapHeight,
  headlineZoneRef,
}: {
  headline: string;
  headlineFontSize: number;
  headlineMaxCapHeight: number;
  headlineZoneRef?: RefObject<HTMLDivElement | null>;
}) {
  const headlineLineClamp = computeLineClamp(
    headlineMaxCapHeight,
    headlineFontSize,
    CARD_HEADLINE_LINE_HEIGHT,
  );
  const headlineVisibleHeight = visibleHeightFromLineClamp(
    headlineLineClamp,
    headlineFontSize,
    CARD_HEADLINE_LINE_HEIGHT,
  );
  const headlineStyle =
    headlineVisibleHeight > 0
      ? ({
          '--sa-headline-visible-height': `${headlineVisibleHeight}px`,
        } as CSSProperties)
      : undefined;

  return (
    <div
      ref={headlineZoneRef}
      className={styles.headlineZone}
      data-fit-zone="headline"
      style={{ fontSize: headlineFontSize }}
    >
      <h1 className={styles.headline} style={headlineStyle}>
        {headline}
      </h1>
    </div>
  );
}

function SubheadBlock({ subhead }: { subhead: string }) {
  if (!subhead.trim()) return null;

  return (
    <div className={styles.subheadZone}>
      <p className={styles.subhead}>
        <span className={styles.subheadHighlight}>{subhead}</span>
      </p>
    </div>
  );
}

function ExcerptBlock({
  excerpt,
  excerptFontSize,
  excerptLineClamp,
  excerptZoneRef,
}: {
  excerpt: string;
  excerptFontSize: number;
  excerptLineClamp?: number;
  excerptZoneRef?: RefObject<HTMLDivElement | null>;
}) {
  const excerptVisibleHeight = visibleHeightFromLineClamp(
    excerptLineClamp ?? 0,
    excerptFontSize,
    CARD_EXCERPT_LINE_HEIGHT,
  );
  const excerptStyle =
    excerptVisibleHeight > 0
      ? ({
          '--sa-excerpt-visible-height': `${excerptVisibleHeight}px`,
        } as CSSProperties)
      : undefined;

  return (
    <div
      ref={excerptZoneRef}
      className={styles.excerptZone}
      data-fit-zone="excerpt"
      style={{ fontSize: excerptFontSize }}
    >
      <p className={styles.excerpt} style={excerptStyle}>
        {excerpt}
      </p>
    </div>
  );
}

function FooterBlock() {
  return (
    <footer className={styles.footer}>
      <img
        className={styles.footerObbLogo}
        src={OBB_BRAND_LOGO_URL}
        alt=""
        draggable={false}
      />
    </footer>
  );
}

function ImageBlock({ imageUrl }: { imageUrl: string }) {
  return (
    <div className={styles.imageZone}>
      <img
        className={styles.articleImage}
        src={imageUrl}
        alt=""
        draggable={false}
      />
    </div>
  );
}

export function StandardArticleCard({
  format,
  layout,
  headline,
  subhead,
  excerpt,
  logoUrl,
  backgroundUrl,
  backgroundFallbackColor,
  imageUrl,
  headlineFontSize,
  excerptFontSize,
  excerptLineClamp = 0,
  showImage,
  className,
  id,
  headlineZoneRef,
  excerptZoneRef,
}: StandardArticleCardProps) {
  const hasSubhead = Boolean(subhead.trim());
  const hasLogo = Boolean(logoUrl);
  const hasFooter = true;

  const zones = useMemo(
    () =>
      computeArticleZones({
        layout,
        format,
        showImage,
        hasSubhead,
        hasLogo,
        hasFooter,
      }),
    [layout, format, showImage, hasSubhead, hasLogo, hasFooter],
  );

  const split = zones.split;
  const imageOnLeft = split && layout.splitImageSide === 'left';
  const inlineLogo = layout.logoPlacement === 'inlineAboveHeadline';
  const containerClass = [
    styles.articleContainer,
    split ? styles.splitLayout : styles.stackedAdaptive,
    imageOnLeft ? styles.splitImageLeft : '',
    !showImage ? styles.noImage : '',
  ]
    .filter(Boolean)
    .join(' ');

  const headlineBlock = (
    <HeadlineBlock
      headline={headline}
      headlineFontSize={headlineFontSize}
      headlineMaxCapHeight={zones.headlineZone.height}
      headlineZoneRef={headlineZoneRef}
    />
  );

  const excerptBlock = (
    <ExcerptBlock
      excerpt={excerpt}
      excerptFontSize={excerptFontSize}
      excerptLineClamp={excerptLineClamp}
      excerptZoneRef={excerptZoneRef}
    />
  );

  const footerBlock = <FooterBlock />;

  const stackedBlocks = (
    <>
      {inlineLogo ? <LinkedInBrandRow logoUrl={logoUrl} /> : null}
      {!inlineLogo ? <HeaderBlock logoUrl={logoUrl} layout={layout} /> : null}
      {headlineBlock}
      <SubheadBlock subhead={subhead} />
      {showImage && imageUrl ? <ImageBlock imageUrl={imageUrl} /> : null}
      {excerptBlock}
      {footerBlock}
    </>
  );

  const textColumn = (
    <div className={styles.textColumn}>
      {inlineLogo ? <LinkedInBrandRow logoUrl={logoUrl} /> : null}
      {headlineBlock}
      <SubheadBlock subhead={subhead} />
      {excerptBlock}
      {footerBlock}
    </div>
  );

  const imageColumn =
    showImage && imageUrl ? (
      <div className={styles.imageColumn}>
        <ImageBlock imageUrl={imageUrl} />
      </div>
    ) : null;

  return (
    <article
      id={id}
      className={[styles.card, className].filter(Boolean).join(' ')}
      style={{
        width: format.width,
        height: format.height,
        backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
        backgroundColor: backgroundFallbackColor,
        ...layoutCssVariables(layout, format, showImage, hasLogo, zones),
      }}
      aria-label="Social card preview"
    >
      <div className={containerClass}>
        {split ? (
          <>
            {imageOnLeft ? imageColumn : null}
            {textColumn}
            {!imageOnLeft ? imageColumn : null}
          </>
        ) : (
          stackedBlocks
        )}
      </div>
    </article>
  );
}
