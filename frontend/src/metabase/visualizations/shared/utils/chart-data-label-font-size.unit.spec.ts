import { CHART_STYLE } from "metabase/visualizations/echarts/cartesian/constants/style";
import { DIMENSIONS } from "metabase/visualizations/echarts/pie/constants";
import type { RenderingContext } from "metabase/visualizations/types";

import {
  getBarChartDataLabelFontSize,
  getPieSliceDataLabelFontSize,
} from "./chart-data-label-font-size";

function mockRenderingContext(
  chartStyleNumbers: Record<string, number> = {},
): RenderingContext {
  return {
    getColor: () => "#000",
    measureText: () => 0,
    measureTextHeight: () => 0,
    fontFamily: "Arial",
    theme: {
      cartesian: {
        label: { fontSize: 12 },
        goalLine: { label: { fontSize: 12 } },
        splitLine: { lineStyle: { color: "#eee" } },
      },
      pie: { borderColor: "#fff" },
    },
    getChartStyleNumber: (name) => chartStyleNumbers[name],
  };
}

describe("chart-data-label-font-size", () => {
  it("returns bar chart override from dashboard CSS", () => {
    expect(
      getBarChartDataLabelFontSize(
        mockRenderingContext({ "bar-data-label-font-size": 16 }),
      ),
    ).toBe(16);
  });

  it("falls back to legacy chart data label size for bar charts", () => {
    expect(
      getBarChartDataLabelFontSize(
        mockRenderingContext({ "chart-data-label-font-size": 15 }),
      ),
    ).toBe(15);
  });

  it("falls back to the default bar chart label size", () => {
    expect(getBarChartDataLabelFontSize(mockRenderingContext())).toBe(
      CHART_STYLE.seriesLabels.size,
    );
  });

  it("returns pie chart override from dashboard CSS", () => {
    expect(
      getPieSliceDataLabelFontSize(
        mockRenderingContext({ "pie-data-label-font-size": 11 }),
        DIMENSIONS.maxSideLength,
        1,
      ),
    ).toBe(11);
  });

  it("computes pie slice label size from chart dimensions when unset", () => {
    expect(
      getPieSliceDataLabelFontSize(
        mockRenderingContext(),
        DIMENSIONS.maxSideLength,
        1,
      ),
    ).toBe(DIMENSIONS.slice.maxFontSize);
  });
});
