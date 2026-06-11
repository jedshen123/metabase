import { STYLE_CATEGORY_LABELS, STYLE_TOKEN_LABELS } from "./labels.zh";
import type { StyleTokenCategoryId, StyleTokenDefinition } from "./types";

export const STYLE_TOKEN_CATEGORIES: {
  id: StyleTokenCategoryId;
  label: string;
}[] = [
  { id: "brand", label: STYLE_CATEGORY_LABELS.brand },
  { id: "layout", label: STYLE_CATEGORY_LABELS.layout },
  { id: "typography", label: STYLE_CATEGORY_LABELS.typography },
  { id: "borders", label: STYLE_CATEGORY_LABELS.borders },
  { id: "table", label: STYLE_CATEGORY_LABELS.table },
  { id: "charts", label: STYLE_CATEGORY_LABELS.charts },
  { id: "typographyScale", label: STYLE_CATEGORY_LABELS.typographyScale },
  { id: "shape", label: STYLE_CATEGORY_LABELS.shape },
];

type TokenSpec = Omit<StyleTokenDefinition, "label">;

const TOKEN_SPECS: TokenSpec[] = [
  { name: "mbdb-primary", type: "color", theme: "light", category: "brand" },
  { name: "mbdb-primary", type: "color", theme: "dark", category: "brand" },
  {
    name: "dashboard-page-bg",
    type: "color",
    theme: "light",
    category: "layout",
  },
  { name: "mbdb-bg", type: "color", theme: "light", category: "layout" },
  { name: "mbdb-surface", type: "color", theme: "light", category: "layout" },
  {
    name: "mbdb-surface-soft",
    type: "color",
    theme: "light",
    category: "layout",
  },
  {
    name: "dashboard-page-bg",
    type: "color",
    theme: "dark",
    category: "layout",
  },
  { name: "mbdb-bg", type: "color", theme: "dark", category: "layout" },
  { name: "mbdb-surface", type: "color", theme: "dark", category: "layout" },
  {
    name: "mbdb-surface-soft",
    type: "color",
    theme: "dark",
    category: "layout",
  },
  {
    name: "mbdb-surface-tint",
    type: "color",
    theme: "dark",
    category: "layout",
  },
  { name: "mbdb-text", type: "color", theme: "light", category: "typography" },
  {
    name: "mbdb-text-muted",
    type: "color",
    theme: "light",
    category: "typography",
  },
  {
    name: "mbdb-text-subtle",
    type: "color",
    theme: "light",
    category: "typography",
  },
  { name: "mbdb-text", type: "color", theme: "dark", category: "typography" },
  {
    name: "mbdb-text-muted",
    type: "color",
    theme: "dark",
    category: "typography",
  },
  {
    name: "mbdb-text-subtle",
    type: "color",
    theme: "dark",
    category: "typography",
  },
  { name: "mbdb-border", type: "color", theme: "light", category: "borders" },
  {
    name: "mbdb-border-hover",
    type: "color",
    theme: "light",
    category: "borders",
  },
  { name: "mbdb-border", type: "color", theme: "dark", category: "borders" },
  {
    name: "mbdb-border-hover",
    type: "color",
    theme: "dark",
    category: "borders",
  },
  {
    name: "mbdb-table-header-bg",
    type: "color",
    theme: "light",
    category: "table",
  },
  {
    name: "mbdb-table-header-text",
    type: "color",
    theme: "light",
    category: "table",
  },
  {
    name: "mbdb-table-header-border",
    type: "color",
    theme: "light",
    category: "table",
  },
  {
    name: "mbdb-table-text",
    type: "color",
    theme: "light",
    category: "table",
  },
  {
    name: "mbdb-table-border",
    type: "color",
    theme: "light",
    category: "table",
  },
  {
    name: "mbdb-table-row-hover",
    type: "color",
    theme: "light",
    category: "table",
  },
  {
    name: "mbdb-table-header-bg",
    type: "color",
    theme: "dark",
    category: "table",
  },
  {
    name: "mbdb-table-header-text",
    type: "color",
    theme: "dark",
    category: "table",
  },
  {
    name: "mbdb-table-header-border",
    type: "color",
    theme: "dark",
    category: "table",
  },
  {
    name: "mbdb-table-text",
    type: "color",
    theme: "dark",
    category: "table",
  },
  {
    name: "mbdb-table-border",
    type: "color",
    theme: "dark",
    category: "table",
  },
  {
    name: "mbdb-table-row-hover",
    type: "color",
    theme: "dark",
    category: "table",
  },
  {
    name: "mb-dashboard-chart-colors",
    type: "chartColors",
    theme: "light",
    category: "charts",
  },
  {
    name: "mb-dashboard-chart-colors-dark",
    type: "chartColors",
    theme: "dark",
    category: "charts",
  },
  { name: "mbdb-grid", type: "color", theme: "light", category: "charts" },
  {
    name: "mbdb-chart-text",
    type: "color",
    theme: "light",
    category: "charts",
  },
  {
    name: "mbdb-chart-data-label",
    type: "color",
    theme: "light",
    category: "charts",
  },
  {
    name: "mb-dashboard-line-width",
    type: "number",
    theme: "light",
    category: "charts",
    min: 0.5,
    max: 5,
    step: 0.1,
  },
  {
    name: "mb-dashboard-line-symbol-size",
    type: "number",
    theme: "light",
    category: "charts",
    min: 1,
    max: 12,
    step: 0.5,
  },
  {
    name: "mb-dashboard-pie-total-value-font-size",
    type: "number",
    theme: "light",
    category: "charts",
    min: 12,
    max: 48,
    step: 1,
  },
  {
    name: "mb-dashboard-pie-total-label-font-size",
    type: "number",
    theme: "light",
    category: "charts",
    min: 10,
    max: 28,
    step: 1,
  },
  { name: "mbdb-grid", type: "color", theme: "dark", category: "charts" },
  {
    name: "mbdb-chart-text",
    type: "color",
    theme: "dark",
    category: "charts",
  },
  {
    name: "mbdb-chart-data-label",
    type: "color",
    theme: "dark",
    category: "charts",
  },
  {
    name: "mbdb-font",
    type: "fontFamily",
    theme: "light",
    category: "typographyScale",
  },
  {
    name: "mbdb-font-size-title",
    type: "fontSize",
    theme: "light",
    category: "typographyScale",
  },
  {
    name: "mbdb-font-size-card-title",
    type: "fontSize",
    theme: "light",
    category: "typographyScale",
  },
  {
    name: "mbdb-font-size-chart-label",
    type: "fontSize",
    theme: "light",
    category: "typographyScale",
  },
  {
    name: "mbdb-font-size-table",
    type: "fontSize",
    theme: "light",
    category: "typographyScale",
  },
  {
    name: "mbdb-font-size-legend",
    type: "fontSize",
    theme: "light",
    category: "typographyScale",
  },
  {
    name: "mbdb-font-size-kpi",
    type: "kpiFontSize",
    theme: "light",
    category: "typographyScale",
  },
  {
    name: "mbdb-radius-card",
    type: "fontSize",
    theme: "light",
    category: "shape",
  },
  {
    name: "mbdb-radius-widget",
    type: "fontSize",
    theme: "light",
    category: "shape",
  },
  {
    name: "mbdb-card-accent-height",
    type: "fontSize",
    theme: "light",
    category: "shape",
  },
  {
    name: "mbdb-tooltip-bg",
    type: "color",
    theme: "light",
    category: "shape",
  },
  {
    name: "mbdb-tooltip-border",
    type: "color",
    theme: "light",
    category: "shape",
  },
  {
    name: "mbdb-shadow-tooltip",
    type: "text",
    theme: "dark",
    category: "shape",
  },
  {
    name: "mbdb-tooltip-bg",
    type: "color",
    theme: "dark",
    category: "shape",
  },
  {
    name: "mbdb-tooltip-border",
    type: "color",
    theme: "dark",
    category: "shape",
  },
];

function getTokenLabel(name: string) {
  return STYLE_TOKEN_LABELS[name as keyof typeof STYLE_TOKEN_LABELS] ?? name;
}

export const DASHBOARD_STYLE_TOKENS: StyleTokenDefinition[] = TOKEN_SPECS.map(
  (token) => ({
    ...token,
    label: getTokenLabel(token.name),
  }),
);

export function getTokensForThemeAndCategory(
  theme: "light" | "dark",
  category: StyleTokenCategoryId,
) {
  return DASHBOARD_STYLE_TOKENS.filter(
    (token) => token.theme === theme && token.category === category,
  );
}
