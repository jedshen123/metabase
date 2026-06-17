import { color } from "metabase/lib/colors";
import type { RenderingContext } from "metabase/visualizations/types";

import {
  getDashboardFunnelStepFill,
  getDashboardGaugeSegmentColor,
} from "./gauge-funnel-dashboard-styles";

function createRenderingContext(
  overrides: Partial<RenderingContext> = {},
): RenderingContext {
  return {
    getColor: (name) => color(name),
    getChartColor: () => undefined,
    shouldForceChartColors: () => false,
    measureText: () => 0,
    measureTextHeight: () => 0,
    fontFamily: "Arial",
    theme: {} as RenderingContext["theme"],
    ...overrides,
  };
}

describe("getDashboardGaugeSegmentColor", () => {
  it("returns the default color when dashboard colors are not forced", () => {
    expect(
      getDashboardGaugeSegmentColor(
        createRenderingContext({
          getChartColor: () => "#6f87ff",
          shouldForceChartColors: () => false,
        }),
        1,
        "#ff0000",
      ),
    ).toBe("#ff0000");
  });

  it("returns dashboard chart colors when forced", () => {
    expect(
      getDashboardGaugeSegmentColor(
        createRenderingContext({
          getChartColor: (index) => ["#6f87ff", "#e96f9a"][index],
          shouldForceChartColors: () => true,
        }),
        1,
        "#ff0000",
      ),
    ).toBe("#e96f9a");
  });
});

describe("getDashboardFunnelStepFill", () => {
  it("uses the brand color when dashboard colors are not forced", () => {
    expect(
      getDashboardFunnelStepFill(createRenderingContext(), 0, 4).toLowerCase(),
    ).toBe(color("brand").toLowerCase());
  });

  it("uses dashboard chart colors with step opacity when forced", () => {
    expect(
      getDashboardFunnelStepFill(
        createRenderingContext({
          getChartColor: (index) => ["#6f87ff", "#e96f9a", "#6fcfe8"][index],
          shouldForceChartColors: () => true,
        }),
        0,
        4,
      ).toLowerCase(),
    ).toBe("#6f87ff");
    expect(
      getDashboardFunnelStepFill(
        createRenderingContext({
          getChartColor: (index) => ["#6f87ff", "#e96f9a", "#6fcfe8"][index],
          shouldForceChartColors: () => true,
        }),
        1,
        4,
      ).toLowerCase(),
    ).toBe("#e96f9a");
    expect(
      getDashboardFunnelStepFill(
        createRenderingContext({
          getChartColor: (index) => ["#6f87ff", "#e96f9a", "#6fcfe8"][index],
          shouldForceChartColors: () => true,
        }),
        2,
        4,
      ),
    ).not.toBe(getDashboardFunnelStepFill(createRenderingContext(), 2, 4));
  });
});
