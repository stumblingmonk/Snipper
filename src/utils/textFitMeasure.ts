import {
  OVERFLOW_TOLERANCE_PX,
  TIGHT_THRESHOLD_PX,
  type FitStatus,
  type TypographyBounds,
} from '@/constants/textFit';
import {
  CARD_EXCERPT_LETTER_SPACING,
  CARD_EXCERPT_LINE_HEIGHT,
  CARD_HEADLINE_FONT_FAMILY,
  CARD_HEADLINE_LETTER_SPACING,
  CARD_HEADLINE_LINE_HEIGHT,
} from '@/constants/cardTypography';

export function elementOverflows(element: HTMLElement): boolean {
  return (
    element.scrollHeight > element.clientHeight + OVERFLOW_TOLERANCE_PX ||
    element.scrollWidth > element.clientWidth + OVERFLOW_TOLERANCE_PX
  );
}

/** Primary fit test for wrapped headline/excerpt zones — ignores subpixel width drift. */
export function elementOverflowsVertical(element: HTMLElement): boolean {
  return element.scrollHeight > element.clientHeight + OVERFLOW_TOLERANCE_PX;
}

export interface MeasureTextFitInput {
  text: string;
  preferredSize: number;
  autoFit: boolean;
  bounds: TypographyBounds;
  zoneElement: HTMLElement;
}

export interface MeasureTextFitResult {
  resolvedSize: number;
  status: FitStatus;
}

export interface OffscreenTextFitStyle {
  fontFamily: string;
  fontWeight: number | string;
  lineHeight: number;
  letterSpacing?: string;
  whiteSpace?: string;
  textTransform?: string;
  wordBreak?: string;
  overflowWrap?: string;
  hyphens?: string;
  width: number;
  height: number;
}

export interface MeasureTextFitOffscreenInput {
  text: string;
  preferredSize: number;
  autoFit: boolean;
  bounds: TypographyBounds;
  style: OffscreenTextFitStyle;
}

let offscreenHost: HTMLDivElement | null = null;

function getOffscreenHost(): HTMLDivElement {
  if (!offscreenHost) {
    offscreenHost = document.createElement('div');
    offscreenHost.setAttribute('aria-hidden', 'true');
    offscreenHost.style.position = 'fixed';
    offscreenHost.style.left = '-9999px';
    offscreenHost.style.top = '0';
    offscreenHost.style.visibility = 'hidden';
    offscreenHost.style.pointerEvents = 'none';
    offscreenHost.style.overflow = 'hidden';
    offscreenHost.style.margin = '0';
    offscreenHost.style.padding = '0';
    offscreenHost.style.border = '0';
    offscreenHost.style.overflowWrap = 'break-word';
    offscreenHost.style.wordBreak = 'break-word';
    document.body.appendChild(offscreenHost);
  }
  return offscreenHost;
}

function applyOffscreenTypography(
  host: HTMLDivElement,
  style: OffscreenTextFitStyle,
  fontSize: number,
  text: string,
): void {
  host.style.width = `${style.width}px`;
  host.style.height = `${style.height}px`;
  host.style.fontSize = `${fontSize}px`;
  host.style.fontFamily = style.fontFamily;
  host.style.fontWeight = String(style.fontWeight);
  host.style.lineHeight = String(style.lineHeight);
  host.style.letterSpacing = style.letterSpacing ?? 'normal';
  host.style.whiteSpace = style.whiteSpace ?? 'normal';
  host.style.textTransform = style.textTransform ?? 'none';
  host.style.wordBreak = style.wordBreak ?? 'break-word';
  host.style.overflowWrap = style.overflowWrap ?? 'break-word';
  host.style.hyphens = style.hyphens ?? 'manual';
  host.textContent = text;
}

function offscreenOverflowsVertical(
  host: HTMLDivElement,
  style: OffscreenTextFitStyle,
  fontSize: number,
  text: string,
): boolean {
  applyOffscreenTypography(host, style, fontSize, text);
  return elementOverflowsVertical(host);
}

export function measureTextFit({
  text,
  preferredSize,
  autoFit,
  bounds,
  zoneElement,
}: MeasureTextFitInput): MeasureTextFitResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { resolvedSize: preferredSize, status: 'empty' };
  }

  const searchMax = Math.min(preferredSize, bounds.max);
  const searchMin = bounds.autoFitMin;
  const overflows = elementOverflowsVertical;

  if (!autoFit) {
    applyZoneFontSize(zoneElement, preferredSize);
    return {
      resolvedSize: preferredSize,
      status: overflows(zoneElement) ? 'too-long' : 'fits',
    };
  }

  applyZoneFontSize(zoneElement, searchMin);
  if (overflows(zoneElement)) {
    return { resolvedSize: searchMin, status: 'too-long' };
  }

  let low = searchMin;
  let high = searchMax;
  let best = searchMin;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    applyZoneFontSize(zoneElement, mid);

    if (overflows(zoneElement)) {
      high = mid - 1;
    } else {
      best = mid;
      low = mid + 1;
    }
  }

  const status: FitStatus =
    best <= searchMin + TIGHT_THRESHOLD_PX ? 'tight' : 'fits';

  return { resolvedSize: best, status };
}

export function measureTextFitOffscreen({
  text,
  preferredSize,
  autoFit,
  bounds,
  style,
}: MeasureTextFitOffscreenInput): MeasureTextFitResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { resolvedSize: preferredSize, status: 'empty' };
  }

  if (style.width <= 0 || style.height <= 0) {
    return { resolvedSize: preferredSize, status: 'empty' };
  }

  const host = getOffscreenHost();
  const searchMax = Math.min(preferredSize, bounds.max);
  const searchMin = bounds.autoFitMin;

  if (!autoFit) {
    const overflows = offscreenOverflowsVertical(
      host,
      style,
      preferredSize,
      trimmed,
    );
    return {
      resolvedSize: preferredSize,
      status: overflows ? 'too-long' : 'fits',
    };
  }

  if (offscreenOverflowsVertical(host, style, searchMin, trimmed)) {
    return { resolvedSize: searchMin, status: 'too-long' };
  }

  let low = searchMin;
  let high = searchMax;
  let best = searchMin;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (offscreenOverflowsVertical(host, style, mid, trimmed)) {
      high = mid - 1;
    } else {
      best = mid;
      low = mid + 1;
    }
  }

  const status: FitStatus =
    best <= searchMin + TIGHT_THRESHOLD_PX ? 'tight' : 'fits';

  return { resolvedSize: best, status };
}

export function computeLineClamp(
  zoneHeight: number,
  fontSize: number,
  lineHeight: number,
): number {
  if (zoneHeight <= 0 || fontSize <= 0) return 0;
  const lineHeightPx = fontSize * lineHeight;
  return Math.max(1, Math.floor(zoneHeight / lineHeightPx));
}

/** @deprecated Use computeLineClamp — kept for excerpt call sites. */
export function computeExcerptLineClamp(
  zoneHeight: number,
  fontSize: number,
  lineHeight: number = CARD_EXCERPT_LINE_HEIGHT,
): number {
  return computeLineClamp(zoneHeight, fontSize, lineHeight);
}

export function visibleHeightFromLineClamp(
  lineClamp: number,
  fontSize: number,
  lineHeight: number,
): number {
  if (lineClamp <= 0 || fontSize <= 0) return 0;
  return Math.floor(lineClamp * fontSize * lineHeight);
}

export const DEFAULT_HEADLINE_OFFSCREEN_STYLE: Omit<
  OffscreenTextFitStyle,
  'width' | 'height'
> = {
  fontFamily: CARD_HEADLINE_FONT_FAMILY,
  fontWeight: 400,
  lineHeight: CARD_HEADLINE_LINE_HEIGHT,
  letterSpacing: CARD_HEADLINE_LETTER_SPACING,
  whiteSpace: 'normal',
  textTransform: 'uppercase',
  wordBreak: 'normal',
  overflowWrap: 'break-word',
  hyphens: 'auto',
};

export const DEFAULT_EXCERPT_OFFSCREEN_STYLE: Omit<
  OffscreenTextFitStyle,
  'width' | 'height'
> = {
  fontFamily: '"IBM Plex Sans", sans-serif',
  fontWeight: 500,
  lineHeight: CARD_EXCERPT_LINE_HEIGHT,
  letterSpacing: CARD_EXCERPT_LETTER_SPACING,
  whiteSpace: 'pre-line',
};

function applyZoneFontSize(zoneElement: HTMLElement, fontSize: number): void {
  zoneElement.style.fontSize = `${fontSize}px`;
}
