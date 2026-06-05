import { useLayoutEffect, useState } from 'react';
import {
  computeTextOverflowSplitIndex,
  type TextOverflowMeasureStyle,
} from '@/utils/textOverflowPreview';

export function useTextOverflowSplitIndex(
  text: string,
  enabled: boolean,
  style: TextOverflowMeasureStyle | null,
): number | null {
  const [splitIndex, setSplitIndex] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (!enabled || !style || !text.trim()) {
      setSplitIndex(null);
      return;
    }

    let cancelled = false;

    document.fonts.ready.then(() => {
      if (cancelled) return;
      setSplitIndex(computeTextOverflowSplitIndex(text, style));
    });

    return () => {
      cancelled = true;
    };
  }, [text, enabled, style]);

  return splitIndex;
}
