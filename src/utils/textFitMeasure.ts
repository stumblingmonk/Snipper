import {
  OVERFLOW_TOLERANCE_PX,
  TIGHT_THRESHOLD_PX,
  type FitStatus,
  type TypographyBounds,
} from '@/constants/textFit';

export function elementOverflows(element: HTMLElement): boolean {
  return (
    element.scrollHeight > element.clientHeight + OVERFLOW_TOLERANCE_PX ||
    element.scrollWidth > element.clientWidth + OVERFLOW_TOLERANCE_PX
  );
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

  if (!autoFit) {
    applyZoneFontSize(zoneElement, preferredSize);
    return {
      resolvedSize: preferredSize,
      status: elementOverflows(zoneElement) ? 'too-long' : 'fits',
    };
  }

  applyZoneFontSize(zoneElement, searchMin);
  if (elementOverflows(zoneElement)) {
    return { resolvedSize: searchMin, status: 'too-long' };
  }

  let low = searchMin;
  let high = searchMax;
  let best = searchMin;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    applyZoneFontSize(zoneElement, mid);

    if (elementOverflows(zoneElement)) {
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

function applyZoneFontSize(zoneElement: HTMLElement, fontSize: number): void {
  zoneElement.style.fontSize = `${fontSize}px`;
}
