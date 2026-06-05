export type TextSizeStep = -2 | -1 | 0 | 1 | 2;

export type FitStatus = 'empty' | 'fits' | 'tight' | 'too-long';

export interface TypographyBounds {
  min: number;
  default: number;
  max: number;
  autoFitMin: number;
  stepPx: number;
}

export const HEADLINE_TYPO: TypographyBounds = {
  min: 42,
  default: 60,
  max: 72,
  autoFitMin: 42,
  stepPx: 6,
};

export const EXCERPT_TYPO: TypographyBounds = {
  min: 28,
  default: 34,
  max: 40,
  autoFitMin: 28,
  stepPx: 2,
};

/** Story Standard Article fixed headline zone at full artboard scale. Excerpt height is computed. */
export const STORY_TEXT_ZONES = {
  headline: { width: 888, height: 300 },
  excerpt: { width: 888, height: 0 },
} as const;

export const TEXT_SIZE_STEPS: TextSizeStep[] = [-2, -1, 0, 1, 2];

export const OVERFLOW_TOLERANCE_PX = 1;

/** Sizes at or below min + this many px count as Tight in Auto-Fit mode. */
export const TIGHT_THRESHOLD_PX = 4;

export function clampTextSizeStep(step: number): TextSizeStep {
  return Math.max(-2, Math.min(2, Math.round(step))) as TextSizeStep;
}

export function preferredFontSize(
  step: TextSizeStep,
  bounds: TypographyBounds,
): number {
  const size = bounds.default + step * bounds.stepPx;
  return Math.min(bounds.max, Math.max(bounds.min, size));
}

export function fitStatusLabel(status: FitStatus): string {
  switch (status) {
    case 'empty':
      return 'Empty';
    case 'fits':
      return 'Fits';
    case 'tight':
      return 'Tight — using lower approved size';
    case 'too-long':
      return 'Too long for this layout';
  }
}
