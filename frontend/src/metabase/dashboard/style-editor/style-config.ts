import type { Dashboard } from "metabase-types/api";

import {
  createDefaultStyleEditorConfig,
  mergeStyleTokensWithDefaults,
} from "./defaults";
import { generateDashboardStyleCss } from "./generate-css";
import { MOMCOZY_PROFESSIONAL_TEMPLATE } from "./momcozy-template";
import { parseTokenValuesFromCss } from "./parse-css-vars";
import type { DashboardStyleEditorConfig } from "./types";

const CUSTOM_CSS_CAVEATS_PREFIX = "metabase-dashboard-custom-css:";

export type DashboardCaveatsPayload = {
  version: 1 | 2;
  custom_css?: string;
  caveats?: string | null;
  style_editor?: DashboardStyleEditorConfig;
};

export type ParsedDashboardCaveatsPayload = {
  customCss: string;
  plainCaveats: string | null;
  styleEditor: DashboardStyleEditorConfig | null;
};

export function parseDashboardCaveatsPayload(
  caveats: string | null | undefined,
): ParsedDashboardCaveatsPayload {
  if (!caveats) {
    return { customCss: "", plainCaveats: null, styleEditor: null };
  }

  if (!caveats.startsWith(CUSTOM_CSS_CAVEATS_PREFIX)) {
    return { customCss: "", plainCaveats: caveats, styleEditor: null };
  }

  try {
    const settings = JSON.parse(
      caveats.slice(CUSTOM_CSS_CAVEATS_PREFIX.length),
    ) as Partial<DashboardCaveatsPayload>;

    const styleEditor = normalizeStyleEditor(settings.style_editor);

    return {
      customCss:
        typeof settings.custom_css === "string" ? settings.custom_css : "",
      plainCaveats:
        typeof settings.caveats === "string" ? settings.caveats : null,
      styleEditor,
    };
  } catch {
    return { customCss: "", plainCaveats: null, styleEditor: null };
  }
}

function normalizeStyleEditor(
  value: Partial<DashboardStyleEditorConfig> | undefined,
): DashboardStyleEditorConfig | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const defaults = createDefaultStyleEditorConfig();

  return {
    enabled: value.enabled === true,
    template:
      value.template === "momcozy-professional"
        ? value.template
        : "momcozy-professional",
    tokens: mergeStyleTokensWithDefaults(value.tokens ?? {}),
    advancedCss:
      typeof value.advancedCss === "string"
        ? value.advancedCss
        : defaults.advancedCss,
  };
}

export function getDashboardStyleEditorConfig(
  dashboard: Pick<Dashboard, "caveats">,
): DashboardStyleEditorConfig {
  const parsed = parseDashboardCaveatsPayload(dashboard.caveats);

  if (parsed.styleEditor) {
    return parsed.styleEditor;
  }

  return createDefaultStyleEditorConfig();
}

export function shouldApplyDashboardCustomCss(
  dashboard: Pick<Dashboard, "caveats">,
): boolean {
  const parsed = parseDashboardCaveatsPayload(dashboard.caveats);

  if (parsed.styleEditor) {
    return parsed.styleEditor.enabled && parsed.customCss.trim().length > 0;
  }

  return parsed.customCss.trim().length > 0;
}

export function getEffectiveDashboardCustomCss(
  dashboard: Pick<Dashboard, "caveats">,
): string {
  if (!shouldApplyDashboardCustomCss(dashboard)) {
    return "";
  }

  return parseDashboardCaveatsPayload(dashboard.caveats).customCss;
}

export function createStyleEditorConfigOnEnable(
  caveats: string | null | undefined,
): DashboardStyleEditorConfig {
  const parsed = parseDashboardCaveatsPayload(caveats);

  if (parsed.styleEditor) {
    return { ...parsed.styleEditor, enabled: true };
  }

  const trimmedCss = parsed.customCss.trim();

  if (!trimmedCss) {
    const config = createDefaultStyleEditorConfig();
    return { ...config, enabled: true };
  }

  const isMomcozyTemplate =
    trimmedCss.includes(":root") &&
    trimmedCss.includes("[data-mb-dashboard-card]");

  if (isMomcozyTemplate) {
    const tokens = parseTokenValuesFromCss(trimmedCss);

    return {
      enabled: true,
      template: "momcozy-professional",
      tokens: mergeStyleTokensWithDefaults(tokens),
      advancedCss: "",
    };
  }

  return {
    enabled: true,
    template: "momcozy-professional",
    tokens: mergeStyleTokensWithDefaults({}),
    advancedCss: trimmedCss,
  };
}

export function serializeDashboardCaveatsPayload(
  plainCaveats: string | null,
  customCss: string,
  styleEditor: DashboardStyleEditorConfig | null,
): string {
  const trimmedCss = customCss.trim();

  if (!trimmedCss && !styleEditor) {
    return plainCaveats ?? "";
  }

  const settings: DashboardCaveatsPayload = {
    version: styleEditor ? 2 : 1,
    custom_css: customCss,
    caveats: plainCaveats,
    style_editor: styleEditor ?? undefined,
  };

  return `${CUSTOM_CSS_CAVEATS_PREFIX}${JSON.stringify(settings)}`;
}

export function setDashboardStyleEditorInCaveats(
  caveats: string | null | undefined,
  styleEditor: DashboardStyleEditorConfig,
): string {
  const { plainCaveats } = parseDashboardCaveatsPayload(caveats);

  const customCss = styleEditor.enabled
    ? generateDashboardStyleCss(styleEditor)
    : parseDashboardCaveatsPayload(caveats).customCss;

  return serializeDashboardCaveatsPayload(plainCaveats, customCss, styleEditor);
}

export function isMomcozyTemplateCss(css: string) {
  return (
    css.includes(MOMCOZY_PROFESSIONAL_TEMPLATE.slice(0, 200)) ||
    (css.includes(":root") && css.includes("--mbdb-primary"))
  );
}
