import { getDashboardCssFontSizePx } from "metabase/visualizations/shared/utils/dashboard-chart-colors";
import type { RenderingContext } from "metabase/visualizations/types";

const CHART_AXIS_LABEL_FONT_SIZE_VAR = "mbdb-font-size-chart-label";

export function getCartesianAxisLabelFontSize(
  renderingContext: RenderingContext,
): number {
  return (
    getDashboardCssFontSizePx(CHART_AXIS_LABEL_FONT_SIZE_VAR) ??
    renderingContext.theme.cartesian.label.fontSize
  );
}
