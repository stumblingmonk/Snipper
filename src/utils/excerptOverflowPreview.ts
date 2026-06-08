import {
  CARD_EXCERPT_LETTER_SPACING,
  CARD_EXCERPT_LINE_HEIGHT,
} from '@/constants/cardTypography';
import { visibleHeightFromLineClamp } from '@/utils/textFitMeasure';
import {
  computeTextOverflowSplitIndex,
  type TextOverflowMeasureStyle,
} from '@/utils/textOverflowPreview';

export type { TextOverflowMeasureStyle };

export interface ExcerptOverflowSplit {
  fitting: string;
  overflow: string;
}

function excerptMeasureStyle(
  fontSize: number,
  width: number,
  height: number,
): TextOverflowMeasureStyle {
  return {
    fontFamily: '"IBM Plex Sans", sans-serif',
    fontSize,
    fontWeight: 500,
    lineHeight: CARD_EXCERPT_LINE_HEIGHT,
    letterSpacing: CARD_EXCERPT_LETTER_SPACING,
    whiteSpace: 'pre-line',
    width,
    height,
  };
}

/**
 * UI-only: index in the original string where excerpt zone overflow begins.
 * Returns null when text fits, is empty, or zone dimensions are invalid.
 */
export function computeExcerptOverflowSplitIndex(
  text: string,
  fontSize: number,
  width: number,
  height: number,
): number | null {
  if (width <= 0 || height <= 0) return null;
  return computeTextOverflowSplitIndex(
    text,
    excerptMeasureStyle(fontSize, width, height),
  );
}

/** UI-only helper: longest prefix that fits the excerpt zone at the given font size. */
export function splitExcerptAtZoneOverflow(
  text: string,
  fontSize: number,
  width: number,
  height: number,
): ExcerptOverflowSplit | null {
  const splitIndex = computeExcerptOverflowSplitIndex(
    text,
    fontSize,
    width,
    height,
  );
  if (splitIndex === null) return null;

  const overflow = text.slice(splitIndex);
  if (!overflow) return null;

  return {
    fitting: text.slice(0, splitIndex),
    overflow,
  };
}

/** Capacity height derived from preview line clamp + resolved font size. */
export function excerptCapacityHeightFromLineClamp(
  lineClamp: number,
  fontSize: number,
  lineHeight: number = CARD_EXCERPT_LINE_HEIGHT,
): number {
  return visibleHeightFromLineClamp(lineClamp, fontSize, lineHeight);
}
