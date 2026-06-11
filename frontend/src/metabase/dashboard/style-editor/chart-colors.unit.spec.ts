import { parseChartColorList, serializeChartColorList } from "./chart-colors";

describe("chart color list utils", () => {
  it("parses and serializes comma-separated colors", () => {
    const value = "#6f87ff, #e96f9a, #6fcfe8";

    expect(parseChartColorList(value)).toEqual([
      "#6f87ff",
      "#e96f9a",
      "#6fcfe8",
    ]);
    expect(serializeChartColorList(parseChartColorList(value))).toBe(value);
  });

  it("supports colors with parentheses", () => {
    const value =
      "rgba(75, 107, 255, 0.72), color-mix(in srgb, #e8477a 70%, white)";

    expect(parseChartColorList(value)).toEqual([
      "rgba(75, 107, 255, 0.72)",
      "color-mix(in srgb, #e8477a 70%, white)",
    ]);
  });
});
