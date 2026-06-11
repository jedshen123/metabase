import type { DashboardChartTextColorKind } from "metabase/visualizations/shared/utils/dashboard-chart-colors";
import type { RenderingContext } from "metabase/visualizations/types";

export function getCartesianChartTextColor(
  renderingContext: RenderingContext,
  kind: DashboardChartTextColorKind,
): string {
  return (
    renderingContext.getChartTextColor?.(kind) ??
    renderingContext.getColor("text-primary")
  );
}
