export type DashboardStyleEditorTemplate = "momcozy-professional";

export type StyleTokenType =
  | "color"
  | "fontFamily"
  | "fontSize"
  | "kpiFontSize"
  | "number"
  | "text"
  | "chartColors";

export type StyleTokenTheme = "light" | "dark";

export type StyleTokenCategoryId =
  | "kpi"
  | "layout"
  | "typography"
  | "borders"
  | "table"
  | "charts"
  | "typographyScale"
  | "shape";

export interface StyleTokenDefinition {
  /** CSS custom property name without leading `--` */
  name: string;
  label: string;
  type: StyleTokenType;
  theme: StyleTokenTheme;
  category: StyleTokenCategoryId;
  min?: number;
  max?: number;
  step?: number;
}

export type StyleTokenValues = Record<string, string>;

export interface DashboardStyleEditorConfig {
  enabled: boolean;
  template: DashboardStyleEditorTemplate;
  tokens: {
    light: StyleTokenValues;
    dark: StyleTokenValues;
  };
  /** Optional extra CSS appended after generated template (advanced). */
  advancedCss?: string;
}
