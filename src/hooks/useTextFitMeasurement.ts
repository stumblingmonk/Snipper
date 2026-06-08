import { useLayoutEffect, useState } from 'react';
import type { FormatKey, ImageMode } from '@/constants/formats';
import type { TextSizeStep } from '@/constants/textFit';
import { preferredFontSize } from '@/constants/textFit';
import type { PreviewZoneMetrics } from '@/context/PreviewZoneMetricsContext';
import { getStandardArticleLayout } from '@/constants/standardArticleLayouts';
import {
  computeExcerptLineClamp,
  DEFAULT_EXCERPT_OFFSCREEN_STYLE,
  measureTextFit,
  measureTextFitOffscreen,
} from '@/utils/textFitMeasure';
import { resolveSourceLogoUrl, resolveSourceNameForCard } from '@/store/selectors';
import { useSnipperStore } from '@/store/snipperStore';

interface UseTextFitMeasurementOptions {
  headlineZoneRef: React.RefObject<HTMLDivElement | null>;
  excerptZoneRef: React.RefObject<HTMLDivElement | null>;
  formatKey: FormatKey;
  headline: string;
  subhead: string;
  excerpt: string;
  headlineSizeStep: TextSizeStep;
  excerptSizeStep: TextSizeStep;
  headlineAutoFit: boolean;
  excerptAutoFit: boolean;
  imageMode: ImageMode;
  onPreviewZoneMetrics?: (metrics: PreviewZoneMetrics) => void;
}

export function useTextFitMeasurement({
  headlineZoneRef,
  excerptZoneRef,
  formatKey,
  headline,
  subhead,
  excerpt,
  headlineSizeStep,
  excerptSizeStep,
  headlineAutoFit,
  excerptAutoFit,
  imageMode,
  onPreviewZoneMetrics,
}: UseTextFitMeasurementOptions): boolean {
  const setTextFitResult = useSnipperStore((s) => s.setTextFitResult);
  const logoUrl = useSnipperStore(resolveSourceLogoUrl);
  const sourceName = useSnipperStore(resolveSourceNameForCard);
  const hasLogo = Boolean(logoUrl);
  const [fontsReady, setFontsReady] = useState(
    () => typeof document !== 'undefined' && document.fonts.status === 'loaded',
  );

  useLayoutEffect(() => {
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) setFontsReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useLayoutEffect(() => {
    if (!fontsReady) return;

    let cancelled = false;
    let retryFrame = 0;

    const runMeasurement = () => {
      if (cancelled) return;

      const headlineZone = headlineZoneRef.current;
      const excerptZone = excerptZoneRef.current;
      if (!headlineZone || !excerptZone) return;

      const excerptWidth = excerptZone.clientWidth;
      const excerptHeight = excerptZone.clientHeight;
      if (excerptHeight <= 0) {
        retryFrame = window.requestAnimationFrame(runMeasurement);
        return;
      }

      onPreviewZoneMetrics?.({ excerptWidth, excerptHeight });

      const layout = getStandardArticleLayout(formatKey);

      const headlinePreferred = preferredFontSize(
        headlineSizeStep,
        layout.headlineTypo,
      );
      const excerptPreferred = preferredFontSize(
        excerptSizeStep,
        layout.excerptTypo,
      );

      const headlineResult = measureTextFit({
        text: headline,
        preferredSize: headlinePreferred,
        autoFit: headlineAutoFit,
        bounds: layout.headlineTypo,
        zoneElement: headlineZone,
      });

      const excerptResult = measureTextFitOffscreen({
        text: excerpt,
        preferredSize: excerptPreferred,
        autoFit: excerptAutoFit,
        bounds: layout.excerptTypo,
        style: {
          ...DEFAULT_EXCERPT_OFFSCREEN_STYLE,
          width: excerptWidth,
          height: excerptHeight,
        },
      });

      const excerptLineClamp = computeExcerptLineClamp(
        excerptHeight,
        excerptResult.resolvedSize,
      );

      setTextFitResult({
        headlineResolvedFontSize: headlineResult.resolvedSize,
        headlineFitStatus: headlineResult.status,
        excerptResolvedFontSize: excerptResult.resolvedSize,
        excerptFitStatus: excerptResult.status,
        excerptLineClamp,
      });
    };

    retryFrame = window.requestAnimationFrame(runMeasurement);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(retryFrame);
    };
  }, [
    fontsReady,
    formatKey,
    headline,
    subhead,
    excerpt,
    headlineSizeStep,
    excerptSizeStep,
    headlineAutoFit,
    excerptAutoFit,
    imageMode,
    hasLogo,
    sourceName,
    headlineZoneRef,
    excerptZoneRef,
    setTextFitResult,
    onPreviewZoneMetrics,
  ]);

  return fontsReady;
}
