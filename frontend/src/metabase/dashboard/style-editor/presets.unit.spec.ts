import {
  DEFAULT_DARK_STYLE_TOKENS,
  DEFAULT_LIGHT_STYLE_TOKENS,
} from "./defaults";
import {
  FONT_FAMILY_PRESETS,
  KPI_FONT_SIZE_PRESETS,
  findMatchingPreset,
} from "./presets";

describe("style editor presets", () => {
  it("loads dark series colors default from :root template", () => {
    expect(
      DEFAULT_DARK_STYLE_TOKENS["mb-dashboard-chart-colors-dark"],
    ).toContain("#3b82f6");
    expect(
      DEFAULT_LIGHT_STYLE_TOKENS["mb-dashboard-chart-colors-dark"],
    ).toBeUndefined();
  });

  it("matches template default font and kpi presets", () => {
    expect(
      findMatchingPreset(
        DEFAULT_LIGHT_STYLE_TOKENS["mbdb-font"],
        FONT_FAMILY_PRESETS,
      ),
    ).toBeDefined();

    expect(
      findMatchingPreset(
        DEFAULT_LIGHT_STYLE_TOKENS["mbdb-font-size-kpi"],
        KPI_FONT_SIZE_PRESETS,
      ),
    ).toEqual(
      KPI_FONT_SIZE_PRESETS.find(
        (preset) => preset.value === "clamp(48px, 5vw, 76px)",
      ),
    );
  });
});
