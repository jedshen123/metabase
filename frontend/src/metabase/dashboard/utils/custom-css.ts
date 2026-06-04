import type { Dashboard, DashboardId } from "metabase-types/api";

const CUSTOM_CSS_CAVEATS_PREFIX = "metabase-dashboard-custom-css:";

type DashboardCaveatsSettings = {
  version: 1;
  custom_css?: string;
  caveats?: string | null;
};

type ParsedDashboardCaveats = {
  customCss: string;
  plainCaveats: string | null;
};

export function getDashboardCssScope(dashboardId: DashboardId) {
  const normalizedId = String(dashboardId).replace(/[^a-zA-Z0-9_-]/g, "-");
  return `dashboard-${normalizedId}`;
}

export function getDashboardCustomCss(dashboard: Pick<Dashboard, "caveats">) {
  return parseDashboardCaveats(dashboard.caveats).customCss;
}

export function setDashboardCustomCssInCaveats(
  caveats: string | null | undefined,
  customCss: string,
) {
  const { plainCaveats } = parseDashboardCaveats(caveats);
  const trimmedCss = customCss.trim();

  if (!trimmedCss) {
    return plainCaveats ?? "";
  }

  const settings: DashboardCaveatsSettings = {
    version: 1,
    custom_css: customCss,
    caveats: plainCaveats,
  };

  return `${CUSTOM_CSS_CAVEATS_PREFIX}${JSON.stringify(settings)}`;
}

export function getScopedDashboardCustomCss(
  customCss: string,
  dashboardCssScope: string,
) {
  const scopeSelector = `[data-mb-dashboard-css-scope="${escapeCssAttributeValue(
    dashboardCssScope,
  )}"]`;

  return customCss.replace(/([^{}]+)\{/g, (match, selector) => {
    const trimmedSelector = selector.trim();

    if (
      !trimmedSelector ||
      trimmedSelector.startsWith("@") ||
      isKeyframeSelector(trimmedSelector)
    ) {
      return match;
    }

    return `${scopeSelectorList(trimmedSelector, scopeSelector)} {`;
  });
}

function parseDashboardCaveats(
  caveats: string | null | undefined,
): ParsedDashboardCaveats {
  if (!caveats) {
    return { customCss: "", plainCaveats: null };
  }

  if (!caveats.startsWith(CUSTOM_CSS_CAVEATS_PREFIX)) {
    return { customCss: "", plainCaveats: caveats };
  }

  try {
    const settings = JSON.parse(
      caveats.slice(CUSTOM_CSS_CAVEATS_PREFIX.length),
    ) as Partial<DashboardCaveatsSettings>;

    return {
      customCss:
        typeof settings.custom_css === "string" ? settings.custom_css : "",
      plainCaveats:
        typeof settings.caveats === "string" ? settings.caveats : null,
    };
  } catch {
    return { customCss: "", plainCaveats: null };
  }
}

function scopeSelectorList(selectorList: string, scopeSelector: string) {
  return selectorList
    .split(",")
    .map((selector) => scopeSingleSelector(selector.trim(), scopeSelector))
    .join(", ");
}

function scopeSingleSelector(selector: string, scopeSelector: string) {
  if (selector.startsWith(scopeSelector)) {
    return selector;
  }

  if (selector === ":root" || selector === "html" || selector === "body") {
    return scopeSelector;
  }

  return `${scopeSelector} ${selector}`;
}

function isKeyframeSelector(selector: string) {
  return selector === "from" || selector === "to" || /^\d+%$/.test(selector);
}

function escapeCssAttributeValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
