import Color from "color";

import { color } from "metabase/lib/colors";
import { calculateStepOpacity } from "metabase/visualizations/lib/funnel/utils";
import type { RenderingContext } from "metabase/visualizations/types";

export function getDashboardGaugeSegmentColor(
  renderingContext: RenderingContext | undefined,
  segmentIndex: number,
  defaultColor: string,
): string {
  if (!renderingContext?.shouldForceChartColors?.()) {
    return defaultColor;
  }

  return renderingContext.getChartColor?.(segmentIndex) ?? defaultColor;
}

export function getDashboardFunnelStepFill(
  renderingContext: RenderingContext | undefined,
  stepIndex: number,
  numSteps: number,
): string {
  if (renderingContext?.shouldForceChartColors?.()) {
    const chartColor = renderingContext.getChartColor?.(stepIndex);

    if (chartColor) {
      return chartColor;
    }
  }

  const opacity = calculateStepOpacity(stepIndex, numSteps);

  return Color(color("brand")).alpha(opacity).hex();
}
