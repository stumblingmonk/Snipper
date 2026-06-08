import { elementOverflowsVertical } from '@/utils/textFitMeasure';

let measureHost: HTMLDivElement | null = null;

export interface TextOverflowMeasureStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number | string;
  lineHeight: number | string;
  letterSpacing?: string;
  textTransform?: string;
  whiteSpace?: string;
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
    measureHost.style.margin = '0';
    measureHost.style.padding = '0';
    measureHost.style.border = '0';
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
  host.style.letterSpacing = style.letterSpacing ?? 'normal';
  host.style.textTransform = style.textTransform ?? 'none';
  host.style.whiteSpace = style.whiteSpace ?? 'normal';
  host.style.overflowWrap = 'break-word';
  host.style.wordBreak = 'break-word';
}

function textFitsInZone(text: string, style: TextOverflowMeasureStyle): boolean {
  if (style.width <= 0 || style.height <= 0) return true;
  const host = getMeasureHost();
  applyMeasureStyles(host, style);
  host.textContent = text;
  return !elementOverflowsVertical(host);
}

/**
 * UI-only: index in the original string where zone overflow begins.
 * Returns null when text fits, is empty, or zone dimensions are invalid.
 */
export function computeTextOverflowSplitIndex(
  text: string,
  style: TextOverflowMeasureStyle,
): number | null {
  if (!text.trim()) return null;
  if (style.width <= 0 || style.height <= 0) return null;
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
    return null;
  }

  let splitIndex = best;
  if (splitIndex < text.length && style.whiteSpace !== 'pre-line') {
    const lastSpace = text.lastIndexOf(' ', splitIndex);
    if (lastSpace > 0) {
      splitIndex = lastSpace;
    }
  }

  if (splitIndex <= 0 || splitIndex >= text.length) return null;

  return splitIndex;
}
