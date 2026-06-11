import {
  DEFAULT_DARK_STYLE_TOKENS,
  DEFAULT_LIGHT_STYLE_TOKENS,
  mergeStyleTokensWithDefaults,
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

  it("migrates legacy combined data label font size token", () => {
    const tokens = mergeStyleTokensWithDefaults({
      light: {
        "mb-dashboard-chart-data-label-font-size": "18",
      },
    });

    expect(
      tokens.light["mb-dashboard-chart-data-label-font-size"],
    ).toBeUndefined();
    expect(tokens.light["mb-dashboard-bar-data-label-font-size"]).toBe("18");
    expect(tokens.light["mb-dashboard-pie-data-label-font-size"]).toBe("18");
  });

  it("loads bar and pie data label font size defaults from template", () => {
    expect(
      DEFAULT_LIGHT_STYLE_TOKENS["mb-dashboard-bar-data-label-font-size"],
    ).toBe("13");
    expect(
      DEFAULT_LIGHT_STYLE_TOKENS["mb-dashboard-pie-data-label-font-size"],
    ).toBe("14");
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
