import {
  getDashboardChartColor,
  getDashboardChartStyleNumber,
  getDashboardChartTextColor,
} from "./dashboard-chart-colors";

describe("getDashboardChartColor", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    document.documentElement.removeAttribute("data-mantine-color-scheme");
  });

  it("reads colors from the dashboard chart color list", () => {
    document.body.innerHTML = `
      <div
        data-mb-dashboard-css-scope="dashboard-1"
        style="--mb-dashboard-chart-colors: #4b6bff, #7b3fa0, #e8477a"
      ></div>
    `;

    expect(getDashboardChartColor(0)).toBe("#4b6bff");
    expect(getDashboardChartColor(1)).toBe("#7b3fa0");
    expect(getDashboardChartColor(3)).toBe("#4b6bff");
  });

  it("reads functional colors from the dashboard chart color list", () => {
    document.body.innerHTML = `
      <div
        data-mb-dashboard-css-scope="dashboard-1"
        style="--mb-dashboard-chart-colors: rgba(75, 107, 255, 0.72), color-mix(in srgb, #e8477a 70%, white)"
      ></div>
    `;

    expect(getDashboardChartColor(0)).toBe("rgba(75, 107, 255, 0.72)");
    expect(getDashboardChartColor(1)).toBe(
      "color-mix(in srgb, #e8477a 70%, white)",
    );
  });

  it("reads dark mode chart colors from the dashboard root", () => {
    document.documentElement.setAttribute("data-mantine-color-scheme", "dark");
    document.body.innerHTML = `
      <div
        data-mb-dashboard-css-scope="dashboard-1"
        style="--mb-dashboard-chart-colors: #6f87ff, #e96f9a; --mb-dashboard-chart-colors-dark: #3b82f6, #10b981"
      ></div>
    `;

    expect(getDashboardChartColor(0)).toBe("#3b82f6");
    expect(getDashboardChartColor(1)).toBe("#10b981");
  });

  it("uses the explicit color scheme before the document attribute", () => {
    document.documentElement.setAttribute("data-mantine-color-scheme", "light");
    document.body.innerHTML = `
      <div
        data-mb-dashboard-css-scope="dashboard-1"
        style="--mb-dashboard-chart-colors: #6f87ff, #e96f9a; --mb-dashboard-chart-colors-dark: #3b82f6, #10b981"
      ></div>
    `;

    expect(getDashboardChartColor(0, "dark")).toBe("#3b82f6");
    expect(getDashboardChartColor(0, "light")).toBe("#6f87ff");
  });

  it("falls back to light chart colors when dark colors are not defined", () => {
    document.documentElement.setAttribute("data-mantine-color-scheme", "dark");
    document.body.innerHTML = `
      <div
        data-mb-dashboard-css-scope="dashboard-1"
        style="--mb-dashboard-chart-colors: #6f87ff, #e96f9a"
      ></div>
    `;

    expect(getDashboardChartColor(0)).toBe("#6f87ff");
  });

  it("falls back to numbered variables", () => {
    document.body.innerHTML = `
      <div
        data-mb-dashboard-css-scope="dashboard-1"
        style="--mb-dashboard-chart-color-1: #5bc8e8"
      ></div>
    `;

    expect(getDashboardChartColor(0)).toBe("#5bc8e8");
  });

  it("reads numeric chart style variables from the dashboard root", () => {
    document.body.innerHTML = `
      <div
        data-mb-dashboard-css-scope="dashboard-1"
        style="--mb-dashboard-line-symbol-size: 3.5"
      ></div>
    `;

    expect(getDashboardChartStyleNumber("line-symbol-size")).toBe(3.5);
  });

  it("ignores invalid numeric chart style variables", () => {
    document.body.innerHTML = `
      <div
        data-mb-dashboard-css-scope="dashboard-1"
        style="--mb-dashboard-line-symbol-size: small"
      ></div>
    `;

    expect(getDashboardChartStyleNumber("line-symbol-size")).toBeUndefined();
  });
});

describe("getDashboardChartTextColor", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    document.documentElement.removeAttribute("data-mantine-color-scheme");
  });

  it("reads axis and data label colors separately", () => {
    document.body.innerHTML = `
      <div
        data-mb-dashboard-css-scope="dashboard-1"
        style="--mbdb-chart-text: #526274; --mbdb-chart-data-label: #172033"
      ></div>
    `;

    expect(getDashboardChartTextColor("axis")).toBe("#526274");
    expect(getDashboardChartTextColor("data-label")).toBe("#172033");
  });
});
