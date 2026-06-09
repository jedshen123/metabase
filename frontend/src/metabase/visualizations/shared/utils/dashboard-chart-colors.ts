import type { ResolvedColorScheme } from "metabase/lib/color-scheme";

const DASHBOARD_CSS_SCOPE_SELECTOR = "[data-mb-dashboard-css-scope]";
const CHART_COLORS_VAR = "--mb-dashboard-chart-colors";
const CHART_COLORS_DARK_VAR = "--mb-dashboard-chart-colors-dark";
const CHART_COLORS_FORCE_VAR = "--mb-dashboard-chart-colors-force";
const CHART_COLOR_VAR_PREFIX = "--mb-dashboard-chart-color-";
const CHART_STYLE_NUMBER_VAR_PREFIX = "--mb-dashboard-";

function parseColorList(value: string) {
  const colors: string[] = [];
  let color = "";
  let depth = 0;

  for (const character of value) {
    if (character === "(") {
      depth += 1;
    } else if (character === ")") {
      depth = Math.max(0, depth - 1);
    }

    if (character === "," && depth === 0) {
      const trimmedColor = color.trim();

      if (trimmedColor) {
        colors.push(trimmedColor);
      }

      color = "";
    } else {
      color += character;
    }
  }

  const trimmedColor = color.trim();

  if (trimmedColor) {
    colors.push(trimmedColor);
  }

  return colors;
}

export function getDashboardChartColor(
  index: number,
  colorScheme?: ResolvedColorScheme,
) {
  if (typeof document === "undefined") {
    return undefined;
  }

  const dashboardRoots = document.querySelectorAll<HTMLElement>(
    DASHBOARD_CSS_SCOPE_SELECTOR,
  );

  for (const dashboardRoot of dashboardRoots) {
    const style = getComputedStyle(dashboardRoot);
    const colors = readDashboardChartColors(style, colorScheme);

    if (colors.length > 0) {
      return colors[index % colors.length];
    }

    const color = style
      .getPropertyValue(`${CHART_COLOR_VAR_PREFIX}${index + 1}`)
      .trim();

    if (color) {
      return color;
    }
  }
}

export function shouldForceDashboardChartColors() {
  if (typeof document === "undefined") {
    return false;
  }

  const dashboardRoots = document.querySelectorAll<HTMLElement>(
    DASHBOARD_CSS_SCOPE_SELECTOR,
  );

  for (const dashboardRoot of dashboardRoots) {
    const value = getComputedStyle(dashboardRoot)
      .getPropertyValue(CHART_COLORS_FORCE_VAR)
      .trim()
      .toLowerCase();

    if (value === "1" || value === "true" || value === "yes") {
      return true;
    }
  }

  return false;
}

function isDashboardDarkMode(colorScheme?: ResolvedColorScheme) {
  if (colorScheme != null) {
    return colorScheme === "dark";
  }

  if (typeof document === "undefined") {
    return false;
  }

  return (
    document.documentElement.getAttribute("data-mantine-color-scheme") ===
    "dark"
  );
}

function readDashboardChartColors(
  style: CSSStyleDeclaration,
  colorScheme?: ResolvedColorScheme,
) {
  if (isDashboardDarkMode(colorScheme)) {
    const darkColors = parseColorList(
      style.getPropertyValue(CHART_COLORS_DARK_VAR),
    );

    if (darkColors.length > 0) {
      return darkColors;
    }
  }

  return parseColorList(style.getPropertyValue(CHART_COLORS_VAR));
}

export function getDashboardChartStyleNumber(name: string) {
  if (typeof document === "undefined") {
    return undefined;
  }

  const dashboardRoots = document.querySelectorAll<HTMLElement>(
    DASHBOARD_CSS_SCOPE_SELECTOR,
  );

  for (const dashboardRoot of dashboardRoots) {
    const value = getComputedStyle(dashboardRoot)
      .getPropertyValue(`${CHART_STYLE_NUMBER_VAR_PREFIX}${name}`)
      .trim();
    const numberValue = Number(value);

    if (Number.isFinite(numberValue)) {
      return numberValue;
    }
  }
}
