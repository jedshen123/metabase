import { createDefaultStyleEditorConfig } from "./defaults";
import { generateDashboardStyleCss } from "./generate-css";
import { parseTokenValuesFromCss } from "./parse-css-vars";
import {
  createStyleEditorConfigOnEnable,
  parseDashboardCaveatsPayload,
  setDashboardStyleEditorInCaveats,
  shouldApplyDashboardCustomCss,
} from "./style-config";

describe("dashboard style editor config", () => {
  it("preserves legacy css when style editor is disabled", () => {
    const caveats = setDashboardStyleEditorInCaveats(null, {
      ...createDefaultStyleEditorConfig(),
      enabled: true,
    });

    const disabled = setDashboardStyleEditorInCaveats(caveats, {
      ...createDefaultStyleEditorConfig(),
      enabled: false,
    });

    const parsed = parseDashboardCaveatsPayload(disabled);

    expect(parsed.styleEditor?.enabled).toBe(false);
    expect(parsed.customCss).toContain(":root");
    expect(shouldApplyDashboardCustomCss({ caveats: disabled })).toBe(false);
  });

  it("migrates existing momcozy css into token values on enable", () => {
    const css = generateDashboardStyleCss({
      ...createDefaultStyleEditorConfig(),
      enabled: true,
    });

    const config = createStyleEditorConfigOnEnable(
      setDashboardStyleEditorInCaveats(null, {
        ...createDefaultStyleEditorConfig(),
        enabled: true,
        tokens: parseTokenValuesFromCss(css),
      }),
    );

    expect(config.enabled).toBe(true);
    expect(config.tokens.light["--mbdb-primary"]).toBeUndefined();
    expect(config.tokens.light["mbdb-primary"]).toBeDefined();
  });

  it("keeps legacy snippet as advanced css when enabling", () => {
    const legacy = "[data-mb-dashboard-card] { border-radius: 12px; }";
    const config = createStyleEditorConfigOnEnable(
      `metabase-dashboard-custom-css:${JSON.stringify({
        version: 1,
        custom_css: legacy,
      })}`,
    );

    expect(config.advancedCss).toBe(legacy);
    expect(config.enabled).toBe(true);
  });
});
