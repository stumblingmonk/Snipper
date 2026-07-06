import { useMemo } from 'react';
import type { CSSProperties, RefObject } from 'react';
import type { FormatSpec } from '@/constants/formats';
import { OBB_FOOTER_LOGO_WIDTH } from '@/constants/brandAssets';
import {
  CARD_EXCERPT_LINE_HEIGHT,
} from '@/constants/cardTypography';
import type { StandardArticleLayout } from '@/constants/standardArticleLayouts';
import {
  computeArticleZones,
  usesSplitLayout,
} from '@/constants/standardArticleLayouts';
import {
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
  metadataLine: string | null;
  attribution: string | null;
  logoUrl: string | null;
  backgroundUrl: string | null;
  backgroundFallbackColor: string;
  imageUrl: string | null;
  articleImageBw?: boolean;
  headlineFontSize: number;
  excerptFontSize: number;
  excerptLineClamp?: number;
  showImage: boolean;
  brandLogoUrl: string;
  pageNumber?: number;
  pageTotal?: number;
  className?: string;
  id?: string;
  headlineZoneRef?: RefObject<HTMLDivElement | null>;
  excerptZoneRef?: RefObject<HTMLDivElement | null>;
}

function formatSubheadText(subhead: string): string {
  return subhead.replace(/more than 25 years/gi, (match) =>
    match.replace(/ /g, '\u00a0'),
  );
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
  headlineZoneRef,
}: {
  headline: string;
  headlineFontSize: number;
  headlineZoneRef?: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={headlineZoneRef}
      className={styles.headlineZone}
      data-fit-zone="headline"
      style={{ fontSize: headlineFontSize }}
    >
      <h1 className={styles.headline}>{headline}</h1>
    </div>
  );
}

function SubheadBlock({ subhead }: { subhead: string }) {
  if (!subhead.trim()) return null;

  return (
    <div className={styles.subheadZone}>
      <p className={styles.subhead}>
        <span className={styles.subheadHighlight}>{formatSubheadText(subhead)}</span>
      </p>
    </div>
  );
}

function MetadataLineBlock({ metadataLine }: { metadataLine: string }) {
  return (
    <p className={styles.metadataLine}>{metadataLine}</p>
  );
}

function AttributionBlock({
  attribution,
  className,
}: {
  attribution: string;
  className?: string;
}) {
  return (
    <p className={[styles.attribution, className].filter(Boolean).join(' ')}>
      {attribution}
    </p>
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

function FooterBlock({
  brandLogoUrl,
  pageNumber,
  pageTotal,
  wide,
}: {
  brandLogoUrl: string;
  pageNumber?: number;
  pageTotal?: number;
  wide?: boolean;
}) {
  const showPageNumber =
    pageTotal !== undefined && pageTotal > 1 && pageNumber !== undefined;

  return (
    <footer
      className={[styles.footer, wide ? styles.footerWide : styles.footerStacked]
        .filter(Boolean)
        .join(' ')}
    >
      <img
        className={styles.footerObbLogo}
        src={brandLogoUrl}
        alt=""
        draggable={false}
      />
      {showPageNumber ? (
        <span className={styles.pageNumber}>
          {pageNumber} / {pageTotal}
        </span>
      ) : null}
    </footer>
  );
}

function ImageBlock({
  imageUrl,
  articleImageBw = false,
}: {
  imageUrl: string;
  articleImageBw?: boolean;
}) {
  return (
    <div
      className={[
        styles.imageZone,
        articleImageBw ? styles.imageZoneBw : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <img
        className={styles.articleImage}
        src={imageUrl}
        alt=""
        draggable={false}
      />
    </div>
  );
}

function StackedImageWithAttribution({
  imageUrl,
  articleImageBw = false,
  attribution,
}: {
  imageUrl: string;
  articleImageBw?: boolean;
  attribution?: string | null;
}) {
  return (
    <div className={styles.imageBlockWrap}>
      <ImageBlock imageUrl={imageUrl} articleImageBw={articleImageBw} />
      {attribution ? <AttributionBlock attribution={attribution} /> : null}
    </div>
  );
}

function WideImageColumn({
  imageUrl,
  articleImageBw = false,
  attribution,
}: {
  imageUrl: string;
  articleImageBw?: boolean;
  attribution?: string | null;
}) {
  return (
    <div className={styles.imageColumn}>
      <div
        className={[
          styles.imageZone,
          styles.imageZoneFullBleed,
          articleImageBw ? styles.imageZoneBw : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <img
          className={styles.articleImage}
          src={imageUrl}
          alt=""
          draggable={false}
        />
        {attribution ? (
          <>
            <div className={styles.imageCreditGradient} aria-hidden="true" />
            <p className={styles.imageCreditOverlay}>{attribution}</p>
          </>
        ) : null}
      </div>
    </div>
  );
}

export function StandardArticleCard({
  format,
  layout,
  headline,
  subhead,
  excerpt,
  metadataLine,
  attribution,
  logoUrl,
  backgroundUrl,
  backgroundFallbackColor,
  imageUrl,
  articleImageBw = false,
  headlineFontSize,
  excerptFontSize,
  excerptLineClamp = 0,
  showImage,
  brandLogoUrl,
  pageNumber,
  pageTotal,
  className,
  id,
  headlineZoneRef,
  excerptZoneRef,
}: StandardArticleCardProps) {
  const hasSubhead = Boolean(subhead.trim());
  const hasLogo = Boolean(logoUrl);
  const hasFooter = true;
  const isWide = layout.formatKey === 'linkedin';

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

  const metadataBlock = metadataLine ? (
    <MetadataLineBlock metadataLine={metadataLine} />
  ) : null;

  const footerBlock = (
    <FooterBlock
      brandLogoUrl={brandLogoUrl}
      pageNumber={pageNumber}
      pageTotal={pageTotal}
      wide={isWide}
    />
  );

  const stackedImageBlock =
    showImage && imageUrl ? (
      <StackedImageWithAttribution
        imageUrl={imageUrl}
        articleImageBw={articleImageBw}
        attribution={attribution}
      />
    ) : null;

  const stackedMainContent = (
    <>
      {inlineLogo ? <LinkedInBrandRow logoUrl={logoUrl} /> : null}
      {!inlineLogo ? <HeaderBlock logoUrl={logoUrl} layout={layout} /> : null}
      {headlineBlock}
      <SubheadBlock subhead={subhead} />
      {metadataBlock}
      {stackedImageBlock}
      {excerptBlock}
    </>
  );

  const textColumnBody = (
    <>
      {inlineLogo ? <LinkedInBrandRow logoUrl={logoUrl} /> : null}
      {headlineBlock}
      <SubheadBlock subhead={subhead} />
      {metadataBlock}
      {excerptBlock}
    </>
  );

  const textColumn = (
    <div className={styles.textColumn}>
      <div className={styles.textColumnBody}>{textColumnBody}</div>
      {split ? footerBlock : null}
    </div>
  );

  const imageColumn =
    showImage && imageUrl ? (
      <WideImageColumn
        imageUrl={imageUrl}
        articleImageBw={articleImageBw}
        attribution={attribution}
      />
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
          <div className={styles.splitBody}>
            {imageOnLeft ? imageColumn : null}
            {textColumn}
            {!imageOnLeft ? imageColumn : null}
          </div>
        ) : (
          <>
            <div className={styles.mainContent}>{stackedMainContent}</div>
            {footerBlock}
          </>
        )}
      </div>
    </article>
  );
}
