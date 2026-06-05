import { elementOverflows } from '@/utils/textFitMeasure';

let measureHost: HTMLDivElement | null = null;

export interface TextOverflowMeasureStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number | string;
  lineHeight: number | string;
  width: number;
  height: number;
}

function getMeasureHost(): HTMLDivElement {
  if (!measureHost) {
    measureHost = document.createElement('div');
    measureHost.setAttribute('aria-hidden', 'true');
    measureHost.style.position = 'fixed';
    measureHost.style.left = '-9999px';
    measureHost.style.top = '0';
    measureHost.style.visibility = 'hidden';
    measureHost.style.pointerEvents = 'none';
    measureHost.style.overflow = 'hidden';
    document.body.appendChild(measureHost);
  }
  return measureHost;
}

function applyMeasureStyles(
  host: HTMLDivElement,
  style: TextOverflowMeasureStyle,
): void {
  host.style.width = `${style.width}px`;
  host.style.height = `${style.height}px`;
  host.style.fontSize = `${style.fontSize}px`;
  host.style.fontFamily = style.fontFamily;
  host.style.fontWeight = String(style.fontWeight);
  host.style.lineHeight = String(style.lineHeight);
  host.style.overflowWrap = 'anywhere';
  host.style.wordBreak = 'break-word';
}

function textFitsInZone(text: string, style: TextOverflowMeasureStyle): boolean {
  const host = getMeasureHost();
  applyMeasureStyles(host, style);
  host.textContent = text;
  return !elementOverflows(host);
}

/**
 * UI-only: index in the original string where zone overflow begins.
 * Returns null when text fits or is empty.
 */
export function computeTextOverflowSplitIndex(
  text: string,
  style: TextOverflowMeasureStyle,
): number | null {
  if (!text.trim()) return null;
  if (textFitsInZone(text, style)) return null;

  let low = 1;
  let high = text.length;
  let best = 0;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const candidate = text.slice(0, mid);

    if (textFitsInZone(candidate, style)) {
      best = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  if (best <= 0) {
    return 0;
  }

  let splitIndex = best;
  if (splitIndex < text.length) {
    const lastSpace = text.lastIndexOf(' ', splitIndex);
    if (lastSpace > 0) {
      splitIndex = lastSpace;
    }
  }

  if (splitIndex >= text.length) return null;

  return splitIndex;
}
