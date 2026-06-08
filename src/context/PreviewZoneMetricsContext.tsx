import { createContext, useContext, type ReactNode } from 'react';

export interface PreviewZoneMetrics {
  excerptWidth: number;
  excerptHeight: number;
}

const DEFAULT_METRICS: PreviewZoneMetrics = {
  excerptWidth: 0,
  excerptHeight: 0,
};

const PreviewZoneMetricsContext =
  createContext<PreviewZoneMetrics>(DEFAULT_METRICS);

export function PreviewZoneMetricsProvider({
  value,
  children,
}: {
  value: PreviewZoneMetrics;
  children: ReactNode;
}) {
  return (
    <PreviewZoneMetricsContext.Provider value={value}>
      {children}
    </PreviewZoneMetricsContext.Provider>
  );
}

export function usePreviewZoneMetrics(): PreviewZoneMetrics {
  return useContext(PreviewZoneMetricsContext);
}
