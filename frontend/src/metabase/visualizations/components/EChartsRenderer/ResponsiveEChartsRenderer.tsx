import { forwardRef, useLayoutEffect } from "react";

import { ExplicitSize } from "metabase/common/components/ExplicitSize";
import {
  useDashboardDomReadyStyleRevision,
  useDomReadyColorSchemeRevision,
} from "metabase/dashboard/hooks/use-dashboard-style-revision";
import { isNumber } from "metabase/lib/types";
import type { EChartsRendererProps } from "metabase/visualizations/components/EChartsRenderer/EChartsRenderer";
import { EChartsRenderer } from "metabase/visualizations/components/EChartsRenderer/EChartsRenderer";
import { ResponsiveEChartsRendererStyled } from "metabase/visualizations/components/EChartsRenderer/ResponsiveEChartsRenderer.styled";

export interface ResponsiveEChartsRendererProps
  extends React.PropsWithChildren<EChartsRendererProps> {
  onResize?: (width: number, height: number) => void;
  dashboardId?: number | string | null;
}

const ResponsiveEChartsRendererInner = forwardRef<
  HTMLDivElement,
  ResponsiveEChartsRendererProps
>(function ResponsiveEChartsRendererBase(
  {
    onResize,
    width,
    height,
    children,
    dashboardId,
    ...echartsRenderedProps
  }: ResponsiveEChartsRendererProps,
  ref,
) {
  const domReadyColorScheme = useDomReadyColorSchemeRevision();
  const dashboardStyleRevision = useDashboardDomReadyStyleRevision(dashboardId);

  useLayoutEffect(() => {
    if (isNumber(width) && isNumber(height)) {
      onResize?.(width, height);
    }
  }, [width, height, onResize]);

  if (!width || !height) {
    return null;
  }

  return (
    <ResponsiveEChartsRendererStyled>
      <EChartsRenderer
        key={`${domReadyColorScheme}-${dashboardStyleRevision}`}
        ref={ref}
        {...echartsRenderedProps}
        width={width}
        height={height}
      />
      {children}
    </ResponsiveEChartsRendererStyled>
  );
});

export const ResponsiveEChartsRendererExplicitSize =
  ExplicitSize<ResponsiveEChartsRendererProps>({
    wrapped: true,
    refreshMode: "debounceLeading",
  })(ResponsiveEChartsRendererInner);
