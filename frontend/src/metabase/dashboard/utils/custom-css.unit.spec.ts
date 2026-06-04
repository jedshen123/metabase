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
      '@media (min-width: 40em) {[data-mb-dashboard-css-scope="dashboard-1"] [data-mb-dashboard-card] { padding: 8px; } }',
    );
  });
});
