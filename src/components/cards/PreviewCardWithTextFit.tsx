import { useRef } from 'react';
import type { StandardArticleCardProps } from '@/components/cards/StandardArticleCard';
import { StandardArticleCard } from '@/components/cards/StandardArticleCard';
import type { PreviewZoneMetrics } from '@/context/PreviewZoneMetricsContext';
import { useTextFitMeasurement } from '@/hooks/useTextFitMeasurement';
import { useSnipperStore } from '@/store/snipperStore';

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

  const formatKey = useSnipperStore((s) => s.format);
  const headline = useSnipperStore((s) => s.headline);
  const subhead = useSnipperStore((s) => s.subhead);
  const excerpt = useSnipperStore((s) => s.excerpt);
  const headlineSizeStep = useSnipperStore((s) => s.headlineSizeStep);
  const excerptSizeStep = useSnipperStore((s) => s.excerptSizeStep);
  const headlineAutoFit = useSnipperStore((s) => s.headlineAutoFit);
  const excerptAutoFit = useSnipperStore((s) => s.excerptAutoFit);
  const imageMode = useSnipperStore((s) => s.imageMode);
  const headlineResolvedFontSize = useSnipperStore(
    (s) => s.headlineResolvedFontSize,
  );
  const excerptResolvedFontSize = useSnipperStore(
    (s) => s.excerptResolvedFontSize,
  );
  const excerptLineClamp = useSnipperStore((s) => s.excerptLineClamp);

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
