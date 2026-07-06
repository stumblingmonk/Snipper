import { useRef } from 'react';
import type { StandardArticleCardProps } from '@/components/cards/StandardArticleCard';
import { StandardArticleCard } from '@/components/cards/StandardArticleCard';
import type { PreviewZoneMetrics } from '@/context/PreviewZoneMetricsContext';
import { useTextFitMeasurement } from '@/hooks/useTextFitMeasurement';
import { useSnipitStore } from '@/store/snipitStore';

type PreviewCardWithTextFitProps = Omit<
  StandardArticleCardProps,
  'headlineFontSize' | 'excerptFontSize' | 'excerptLineClamp'
> & {
  onPreviewZoneMetrics?: (metrics: PreviewZoneMetrics) => void;
};

export function PreviewCardWithTextFit({
  onPreviewZoneMetrics,
  ...props
}: PreviewCardWithTextFitProps) {
  const headlineZoneRef = useRef<HTMLDivElement>(null);
  const excerptZoneRef = useRef<HTMLDivElement>(null);

  const formatKey = useSnipitStore((s) => s.format);
  const headline = useSnipitStore((s) => s.headline);
  const subhead = useSnipitStore((s) => s.subhead);
  const excerpt = useSnipitStore((s) => s.excerpt);
  const headlineSizeStep = useSnipitStore((s) => s.headlineSizeStep);
  const excerptSizeStep = useSnipitStore((s) => s.excerptSizeStep);
  const headlineAutoFit = useSnipitStore((s) => s.headlineAutoFit);
  const excerptAutoFit = useSnipitStore((s) => s.excerptAutoFit);
  const imageMode = useSnipitStore((s) => s.imageMode);
  const headlineResolvedFontSize = useSnipitStore(
    (s) => s.headlineResolvedFontSize,
  );
  const excerptResolvedFontSize = useSnipitStore(
    (s) => s.excerptResolvedFontSize,
  );
  const excerptLineClamp = useSnipitStore((s) => s.excerptLineClamp);

  useTextFitMeasurement({
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
  });

  return (
    <StandardArticleCard
      {...props}
      id="preview-artboard"
      headlineZoneRef={headlineZoneRef}
      excerptZoneRef={excerptZoneRef}
      headlineFontSize={headlineResolvedFontSize}
      excerptFontSize={excerptResolvedFontSize}
      excerptLineClamp={excerptLineClamp}
    />
  );
}
