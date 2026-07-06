import { useRef } from 'react';
import type { StandardArticleCardProps } from '@/components/cards/StandardArticleCard';
import { StandardArticleCard } from '@/components/cards/StandardArticleCard';
import type { PreviewZoneMetrics } from '@/context/PreviewZoneMetricsContext';
import { useTextFitMeasurement } from '@/hooks/useTextFitMeasurement';
import { useSnipitStore, selectActivePage } from '@/store/snipitStore';

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
  const headlineSizeStep = useSnipitStore((s) => s.headlineSizeStep);
  const headlineAutoFit = useSnipitStore((s) => s.headlineAutoFit);
  const headlineResolvedFontSize = useSnipitStore(
    (s) => s.headlineResolvedFontSize,
  );
  const activePage = useSnipitStore(selectActivePage);
  const excerpt = activePage.excerpt;
  const excerptSizeStep = activePage.excerptSizeStep;
  const excerptAutoFit = activePage.excerptAutoFit;
  const imageMode = activePage.imageMode;
  const excerptResolvedFontSize = activePage.excerptResolvedFontSize;
  const excerptLineClamp = activePage.excerptLineClamp;

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
