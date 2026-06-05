import { useLayoutEffect, useState } from 'react';
import type { ImageMode } from '@/constants/formats';
import type { TextSizeStep } from '@/constants/textFit';
import {
  EXCERPT_TYPO,
  HEADLINE_TYPO,
  preferredFontSize,
} from '@/constants/textFit';
import { measureTextFit } from '@/utils/textFitMeasure';
import { useSnipperStore } from '@/store/snipperStore';

interface UseTextFitMeasurementOptions {
  headlineZoneRef: React.RefObject<HTMLDivElement | null>;
  excerptZoneRef: React.RefObject<HTMLDivElement | null>;
  headline: string;
  excerpt: string;
  headlineSizeStep: TextSizeStep;
  excerptSizeStep: TextSizeStep;
  headlineAutoFit: boolean;
  excerptAutoFit: boolean;
  imageMode: ImageMode;
}

export function useTextFitMeasurement({
  headlineZoneRef,
  excerptZoneRef,
  headline,
  excerpt,
  headlineSizeStep,
  excerptSizeStep,
  headlineAutoFit,
  excerptAutoFit,
  imageMode,
}: UseTextFitMeasurementOptions): boolean {
  const setTextFitResult = useSnipperStore((s) => s.setTextFitResult);
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

    const headlineZone = headlineZoneRef.current;
    const excerptZone = excerptZoneRef.current;
    if (!headlineZone || !excerptZone) return;

    const headlinePreferred = preferredFontSize(headlineSizeStep, HEADLINE_TYPO);
    const excerptPreferred = preferredFontSize(excerptSizeStep, EXCERPT_TYPO);

    const headlineResult = measureTextFit({
      text: headline,
      preferredSize: headlinePreferred,
      autoFit: headlineAutoFit,
      bounds: HEADLINE_TYPO,
      zoneElement: headlineZone,
    });

    const excerptResult = measureTextFit({
      text: excerpt,
      preferredSize: excerptPreferred,
      autoFit: excerptAutoFit,
      bounds: EXCERPT_TYPO,
      zoneElement: excerptZone,
    });

    setTextFitResult({
      headlineResolvedFontSize: headlineResult.resolvedSize,
      headlineFitStatus: headlineResult.status,
      excerptResolvedFontSize: excerptResult.resolvedSize,
      excerptFitStatus: excerptResult.status,
    });
  }, [
    fontsReady,
    headline,
    excerpt,
    headlineSizeStep,
    excerptSizeStep,
    headlineAutoFit,
    excerptAutoFit,
    imageMode,
    headlineZoneRef,
    excerptZoneRef,
    setTextFitResult,
  ]);

  return fontsReady;
}
