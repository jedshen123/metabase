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

  return scopeCustomCss(customCss, scopeSelector);
}

function scopeCustomCss(customCss: string, scopeSelector: string): string {
  let result = "";
  let index = 0;

  while (index < customCss.length) {
    index = appendWhitespaceAndComments(customCss, index, (chunk) => {
      result += chunk;
    });

    if (index >= customCss.length) {
      break;
    }

    if (customCss[index] === "}") {
      result += "}";
      index += 1;
      continue;
    }

    if (customCss[index] === "@") {
      const atRuleStart = index;
      const openBrace = findNextCharacter(customCss, index, "{");

      if (openBrace === -1) {
        result += customCss.slice(index);
        break;
      }

      result += customCss.slice(atRuleStart, openBrace + 1);
      const closeBrace = findMatchingBrace(customCss, openBrace);

      if (closeBrace === -1) {
        result += customCss.slice(openBrace + 1);
        break;
      }

      result += scopeCustomCss(
        customCss.slice(openBrace + 1, closeBrace),
        scopeSelector,
      );
      result += "}";
      index = closeBrace + 1;
      continue;
    }

    const selectorStart = index;
    const openBrace = findNextCharacter(customCss, index, "{");

    if (openBrace === -1) {
      result += customCss.slice(index);
      break;
    }

    const selector = stripCssComments(customCss.slice(selectorStart, openBrace))
      .replace(/\s+/g, " ")
      .trim();

    if (!selector || isKeyframeSelector(selector)) {
      result += customCss.slice(selectorStart, openBrace + 1);
      const closeBrace = findMatchingBrace(customCss, openBrace);

      if (closeBrace === -1) {
        result += customCss.slice(openBrace + 1);
        break;
      }

      result += customCss.slice(openBrace + 1, closeBrace + 1);
      index = closeBrace + 1;
      continue;
    }

    result += `${scopeSelectorList(selector, scopeSelector)} {`;
    const closeBrace = findMatchingBrace(customCss, openBrace);

    if (closeBrace === -1) {
      result += customCss.slice(openBrace + 1);
      break;
    }

    result += customCss.slice(openBrace + 1, closeBrace + 1);
    index = closeBrace + 1;
  }

  return result;
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

  if (
    selector === ":root" ||
    selector === "html" ||
    selector === "body" ||
    selector === '[data-testid="dashboard"]'
  ) {
    return scopeSelector;
  }

  const dashboardDescendantMatch = selector.match(
    /^\[data-testid="dashboard"\]\s*(.+)/,
  );
  if (dashboardDescendantMatch) {
    return scopeSingleSelector(dashboardDescendantMatch[1], scopeSelector);
  }

  const ancestorMatch = selector.match(
    /^(\[data-mantine-color-scheme=[^\]]+\])\s*(.*)/,
  );
  if (ancestorMatch) {
    const [, ancestorPart, rest] = ancestorMatch;
    return rest
      ? `${ancestorPart} ${scopeSelector} ${rest}`
      : `${ancestorPart} ${scopeSelector}`;
  }

  return `${scopeSelector} ${selector}`;
}

function isKeyframeSelector(selector: string) {
  return selector === "from" || selector === "to" || /^\d+%$/.test(selector);
}

function escapeCssAttributeValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function stripCssComments(css: string) {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function appendWhitespaceAndComments(
  css: string,
  start: number,
  append: (chunk: string) => void,
) {
  let index = start;

  while (index < css.length) {
    const character = css[index];

    if (/\s/.test(character)) {
      append(character);
      index += 1;
      continue;
    }

    if (css.startsWith("/*", index)) {
      const commentEnd = css.indexOf("*/", index + 2);

      if (commentEnd === -1) {
        append(css.slice(index));
        return css.length;
      }

      append(css.slice(index, commentEnd + 2));
      index = commentEnd + 2;
      continue;
    }

    break;
  }

  return index;
}

function findNextCharacter(css: string, start: number, target: string) {
  let index = start;

  while (index < css.length) {
    if (css.startsWith("/*", index)) {
      const commentEnd = css.indexOf("*/", index + 2);

      if (commentEnd === -1) {
        return -1;
      }

      index = commentEnd + 2;
      continue;
    }

    if (css[index] === target) {
      return index;
    }

    index += 1;
  }

  return -1;
}

function findMatchingBrace(css: string, openBraceIndex: number) {
  let depth = 0;

  for (let index = openBraceIndex; index < css.length; index += 1) {
    if (css.startsWith("/*", index)) {
      const commentEnd = css.indexOf("*/", index + 2);

      if (commentEnd === -1) {
        return -1;
      }

      index = commentEnd + 1;
      continue;
    }

    const character = css[index];

    if (character === "{") {
      depth += 1;
    } else if (character === "}") {
      depth -= 1;

      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
}
