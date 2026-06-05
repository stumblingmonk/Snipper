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
    fontWeight: 400,
    lineHeight: 1.36,
    width,
    height,
  };
}

/**
 * UI-only: index in the original string where excerpt zone overflow begins.
 * Returns null when text fits or is empty.
 */
export function computeExcerptOverflowSplitIndex(
  text: string,
  fontSize: number,
  width: number,
  height: number,
): number | null {
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
