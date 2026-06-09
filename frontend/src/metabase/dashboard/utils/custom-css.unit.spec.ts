import {
  getDashboardCustomCss,
  getScopedDashboardCustomCss,
  setDashboardCustomCssInCaveats,
} from "./custom-css";

describe("dashboard custom css utils", () => {
  it("stores dashboard custom css in caveats", () => {
    const caveats = setDashboardCustomCssInCaveats(
      null,
      "[data-mb-dashboard-card] { border-radius: 12px; }",
    );

    expect(getDashboardCustomCss({ caveats })).toBe(
      "[data-mb-dashboard-card] { border-radius: 12px; }",
    );
  });

  it("restores plain caveats when custom css is cleared", () => {
    const caveats = setDashboardCustomCssInCaveats(
      "plain caveats",
      "[data-mb-dashboard-card] { border-radius: 12px; }",
    );

    expect(setDashboardCustomCssInCaveats(caveats, "")).toBe("plain caveats");
  });

  it("clears custom css with an empty string when there are no plain caveats", () => {
    const caveats = setDashboardCustomCssInCaveats(
      null,
      "[data-mb-dashboard-card] { border-radius: 12px; }",
    );

    expect(setDashboardCustomCssInCaveats(caveats, "")).toBe("");
  });

  it("scopes selectors to the dashboard", () => {
    expect(
      getScopedDashboardCustomCss(
        "[data-mb-dashboard-card], body { background: white; }",
        "dashboard-1",
      ),
    ).toBe(
      '[data-mb-dashboard-css-scope="dashboard-1"] [data-mb-dashboard-card], [data-mb-dashboard-css-scope="dashboard-1"] { background: white; }',
    );
  });

  it("keeps at-rules unscoped while scoping nested selectors", () => {
    expect(
      getScopedDashboardCustomCss(
        "@media (min-width: 40em) { [data-mb-dashboard-card] { padding: 8px; } }",
        "dashboard-1",
      ),
    ).toBe(
      '@media (min-width: 40em) { [data-mb-dashboard-css-scope="dashboard-1"] [data-mb-dashboard-card] { padding: 8px; } }',
    );
  });

  it("keeps mantine color-scheme selectors as ancestors of the dashboard scope", () => {
    expect(
      getScopedDashboardCustomCss(
        '[data-mantine-color-scheme="dark"] { --mbdb-surface: #1a1d27; }',
        "dashboard-7",
      ),
    ).toBe(
      '[data-mantine-color-scheme="dark"] [data-mb-dashboard-css-scope="dashboard-7"] { --mbdb-surface: #1a1d27; }',
    );

    expect(
      getScopedDashboardCustomCss(
        '[data-mantine-color-scheme="dark"] [data-mb-visualization] svg text { fill: #94a3b8; }',
        "dashboard-7",
      ),
    ).toBe(
      '[data-mantine-color-scheme="dark"] [data-mb-dashboard-css-scope="dashboard-7"] [data-mb-visualization] svg text { fill: #94a3b8; }',
    );
  });

  it("scopes selectors that are preceded by comments", () => {
    expect(
      getScopedDashboardCustomCss(
        `/* dark mode */
[data-mantine-color-scheme="dark"] {
  --mbdb-surface: #1a1d27;
}`,
        "dashboard-7",
      ),
    ).toBe(
      `/* dark mode */
[data-mantine-color-scheme="dark"] [data-mb-dashboard-css-scope="dashboard-7"] {
  --mbdb-surface: #1a1d27;
}`,
    );
  });

  it("maps the dashboard root selector to the scope element", () => {
    expect(
      getScopedDashboardCustomCss(
        '[data-testid="dashboard"] { background: #f4f6ff; }',
        "dashboard-7",
      ),
    ).toBe(
      '[data-mb-dashboard-css-scope="dashboard-7"] { background: #f4f6ff; }',
    );
  });

  it("scopes direct-child selectors from the dashboard root", () => {
    expect(
      getScopedDashboardCustomCss(
        "> header ~ div { background: #f4f6ff; }",
        "dashboard-7",
      ),
    ).toBe(
      '[data-mb-dashboard-css-scope="dashboard-7"] > header ~ div { background: #f4f6ff; }',
    );
  });

  it("rewrites dashboard descendant selectors to scope-relative selectors", () => {
    expect(
      getScopedDashboardCustomCss(
        '[data-testid="dashboard"] > header ~ div { background: #f4f6ff; }',
        "dashboard-7",
      ),
    ).toBe(
      '[data-mb-dashboard-css-scope="dashboard-7"] > header ~ div { background: #f4f6ff; }',
    );
  });
});
