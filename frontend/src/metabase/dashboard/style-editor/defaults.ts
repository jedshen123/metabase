import { MOMCOZY_PROFESSIONAL_TEMPLATE } from "./momcozy-template";
import { parseTokenValuesFromCss } from "./parse-css-vars";
import { DASHBOARD_STYLE_TOKENS } from "./tokens";
import type { DashboardStyleEditorConfig, StyleTokenValues } from "./types";

const PARSED_TEMPLATE = parseTokenValuesFromCss(MOMCOZY_PROFESSIONAL_TEMPLATE);

/** 定义在 :root 中，但仅在暗色编辑面板展示的令牌 */
const ROOT_SCOPED_DARK_TOKENS = new Set(["mb-dashboard-chart-colors-dark"]);

function pickTokenDefaults(
  source: StyleTokenValues,
  theme: "light" | "dark",
): StyleTokenValues {
  const values: StyleTokenValues = {};

  for (const token of DASHBOARD_STYLE_TOKENS) {
    if (token.theme !== theme) {
      continue;
    }

    let value = source[token.name];

    if (value == null && ROOT_SCOPED_DARK_TOKENS.has(token.name)) {
      value = PARSED_TEMPLATE.light[token.name];
    }

    if (value != null) {
      values[token.name] = value;
    }
  }

  return values;
}

export const DEFAULT_LIGHT_STYLE_TOKENS = pickTokenDefaults(
  PARSED_TEMPLATE.light,
  "light",
);

export const DEFAULT_DARK_STYLE_TOKENS = pickTokenDefaults(
  PARSED_TEMPLATE.dark,
  "dark",
);

export function createDefaultStyleEditorConfig(): DashboardStyleEditorConfig {
  return {
    enabled: false,
    template: "momcozy-professional",
    tokens: {
      light: { ...DEFAULT_LIGHT_STYLE_TOKENS },
      dark: { ...DEFAULT_DARK_STYLE_TOKENS },
    },
    advancedCss: "",
  };
}

/** 将编辑器配置恢复为 momcozy-dashboard-professional.css 模板默认值 */
export function applyDefaultTemplateConfig(
  config: DashboardStyleEditorConfig,
): DashboardStyleEditorConfig {
  const defaults = createDefaultStyleEditorConfig();

  return {
    ...config,
    template: defaults.template,
    tokens: defaults.tokens,
    advancedCss: defaults.advancedCss,
  };
}

function migrateLegacyStyleTokens(
  tokens: StyleTokenValues | undefined,
): StyleTokenValues | undefined {
  if (tokens == null) {
    return tokens;
  }

  const legacy = tokens["mb-dashboard-chart-data-label-font-size"];

  if (legacy == null) {
    return tokens;
  }

  const migrated = { ...tokens };
  delete migrated["mb-dashboard-chart-data-label-font-size"];

  if (migrated["mb-dashboard-bar-data-label-font-size"] == null) {
    migrated["mb-dashboard-bar-data-label-font-size"] = legacy;
  }

  if (migrated["mb-dashboard-pie-data-label-font-size"] == null) {
    migrated["mb-dashboard-pie-data-label-font-size"] = legacy;
  }

  return migrated;
}

export function mergeStyleTokensWithDefaults(
  partial: Partial<{
    light: StyleTokenValues;
    dark: StyleTokenValues;
  }>,
): DashboardStyleEditorConfig["tokens"] {
  return {
    light: {
      ...DEFAULT_LIGHT_STYLE_TOKENS,
      ...migrateLegacyStyleTokens(partial.light),
    },
    dark: {
      ...DEFAULT_DARK_STYLE_TOKENS,
      ...partial.dark,
    },
  };
}
