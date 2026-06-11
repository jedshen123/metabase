import { CHART_STYLE } from "metabase/visualizations/echarts/cartesian/constants/style";
import { DIMENSIONS } from "metabase/visualizations/echarts/pie/constants";
import type { RenderingContext } from "metabase/visualizations/types";

const BAR_DATA_LABEL_FONT_SIZE_VAR = "bar-data-label-font-size";
const PIE_DATA_LABEL_FONT_SIZE_VAR = "pie-data-label-font-size";
/** @deprecated Use bar/pie-specific vars; kept for older saved CSS templates */
const LEGACY_DATA_LABEL_FONT_SIZE_VAR = "chart-data-label-font-size";

function getPositiveChartStyleNumber(
  renderingContext: RenderingContext,
  name: string,
) {
  const value = renderingContext.getChartStyleNumber?.(name);

  return value != null && value > 0 ? value : undefined;
}

function getLegacyDataLabelFontSize(renderingContext: RenderingContext) {
  return getPositiveChartStyleNumber(
    renderingContext,
    LEGACY_DATA_LABEL_FONT_SIZE_VAR,
  );
}

export function getBarChartDataLabelFontSize(
  renderingContext: RenderingContext,
): number {
  return (
    getPositiveChartStyleNumber(
      renderingContext,
      BAR_DATA_LABEL_FONT_SIZE_VAR,
    ) ??
    getLegacyDataLabelFontSize(renderingContext) ??
    CHART_STYLE.seriesLabels.size
  );
}

export function getPieSliceDataLabelFontSize(
  renderingContext: RenderingContext,
  innerSideLength: number,
  numRings: number,
): number {
  const override =
    getPositiveChartStyleNumber(
      renderingContext,
      PIE_DATA_LABEL_FONT_SIZE_VAR,
    ) ?? getLegacyDataLabelFontSize(renderingContext);

  if (override != null) {
    return override;
  }

  if (numRings > 1) {
    return DIMENSIONS.slice.multiRingFontSize;
  }

  return Math.max(
    DIMENSIONS.slice.maxFontSize * (innerSideLength / DIMENSIONS.maxSideLength),
    DIMENSIONS.slice.minFontSize,
  );
}

export function hasDashboardPieDataLabelFontSizeOverride(
  renderingContext: RenderingContext,
): boolean {
  return (
    getPositiveChartStyleNumber(
      renderingContext,
      PIE_DATA_LABEL_FONT_SIZE_VAR,
    ) != null || getLegacyDataLabelFontSize(renderingContext) != null
  );
}

/** @deprecated Use getBarChartDataLabelFontSize */
export const getChartDataLabelFontSize = getBarChartDataLabelFontSize;
