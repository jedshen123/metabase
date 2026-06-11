import { createDefaultStyleEditorConfig } from "./defaults";
import { generateDashboardStyleCss } from "./generate-css";
import { parseTokenValuesFromCss } from "./parse-css-vars";

describe("generateDashboardStyleCss", () => {
  it("generates css with overridden light and dark tokens", () => {
    const config = createDefaultStyleEditorConfig();

    const css = generateDashboardStyleCss({
      ...config,
      tokens: {
        ...config.tokens,
        light: {
          ...config.tokens.light,
          "mbdb-primary": "#ff0000",
        },
        dark: {
          ...config.tokens.dark,
          "mbdb-primary": "#00ff00",
        },
      },
    });

    const parsed = parseTokenValuesFromCss(css);

    expect(parsed.light["mbdb-primary"]).toBe("#ff0000");
    expect(parsed.dark["mbdb-primary"]).toBe("#00ff00");
    expect(css).toContain("[data-mb-dashboard-card]");
  });

  it("generates separate chart axis and data label color variables", () => {
    const config = createDefaultStyleEditorConfig();

    const css = generateDashboardStyleCss({
      ...config,
      tokens: {
        ...config.tokens,
        light: {
          ...config.tokens.light,
          "mbdb-chart-text": "#112233",
          "mbdb-chart-data-label": "#445566",
        },
        dark: {
          ...config.tokens.dark,
          "mbdb-chart-text": "#aabbcc",
          "mbdb-chart-data-label": "#ddeeff",
        },
      },
    });

    const parsed = parseTokenValuesFromCss(css);

    expect(parsed.light["mbdb-chart-text"]).toBe("#112233");
    expect(parsed.light["mbdb-chart-data-label"]).toBe("#445566");
    expect(parsed.dark["mbdb-chart-text"]).toBe("#aabbcc");
    expect(parsed.dark["mbdb-chart-data-label"]).toBe("#ddeeff");
    expect(css).not.toMatch(/fill:\s*var\(--mbdb-chart-text\)/);
  });

  it("keeps light and dark typography tokens in separate blocks", () => {
    const config = createDefaultStyleEditorConfig();

    const css = generateDashboardStyleCss({
      ...config,
      tokens: {
        ...config.tokens,
        light: {
          ...config.tokens.light,
          "mbdb-text-muted": "#aaaaaa",
        },
        dark: {
          ...config.tokens.dark,
          "mbdb-text-muted": "#bbbbbb",
        },
      },
    });

    const parsed = parseTokenValuesFromCss(css);

    expect(parsed.light["mbdb-text-muted"]).toBe("#aaaaaa");
    expect(parsed.dark["mbdb-text-muted"]).toBe("#bbbbbb");
  });

  it("writes dark series colors to :root scope", () => {
    const config = createDefaultStyleEditorConfig();

    const css = generateDashboardStyleCss({
      ...config,
      tokens: {
        ...config.tokens,
        dark: {
          ...config.tokens.dark,
          "mb-dashboard-chart-colors-dark": "#111111, #222222",
        },
      },
    });

    const parsed = parseTokenValuesFromCss(css);

    expect(parsed.light["mb-dashboard-chart-colors-dark"]).toBe(
      "#111111, #222222",
    );
    expect(parsed.dark["mb-dashboard-chart-colors-dark"]).toBeUndefined();
  });
});
