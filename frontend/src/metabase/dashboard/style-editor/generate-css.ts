import { applyTokenOverridesToCss } from "./apply-token-overrides";
import { MOMCOZY_PROFESSIONAL_TEMPLATE } from "./momcozy-template";
import type { DashboardStyleEditorConfig, StyleTokenValues } from "./types";

/** 写在 :root 作用域，但由暗色主题面板编辑的变量 */
const ROOT_SCOPED_DARK_TOKEN_NAMES = ["mb-dashboard-chart-colors-dark"];

function mergeCssTokenOverrides(
  light: StyleTokenValues,
  dark: StyleTokenValues,
): { light: StyleTokenValues; dark: StyleTokenValues } {
  const lightOverrides = { ...light };
  const darkOverrides = { ...dark };

  for (const name of ROOT_SCOPED_DARK_TOKEN_NAMES) {
    const value = darkOverrides[name];

    if (value != null) {
      lightOverrides[name] = value;
      delete darkOverrides[name];
    }
  }

  return { light: lightOverrides, dark: darkOverrides };
}

export function generateDashboardStyleCss(
  config: Pick<
    DashboardStyleEditorConfig,
    "tokens" | "advancedCss" | "template"
  >,
): string {
  const template =
    config.template === "momcozy-professional"
      ? MOMCOZY_PROFESSIONAL_TEMPLATE
      : MOMCOZY_PROFESSIONAL_TEMPLATE;

  const { light, dark } = mergeCssTokenOverrides(
    config.tokens.light,
    config.tokens.dark,
  );

  let css = applyTokenOverridesToCss(template, light, dark);

  const advancedCss = config.advancedCss?.trim();

  if (advancedCss) {
    css = `${css}\n\n/* Advanced CSS */\n${advancedCss}`;
  }

  return css;
}
