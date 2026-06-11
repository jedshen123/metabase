import { useEffect, useLayoutEffect, useState } from "react";

import { useColorScheme } from "metabase/ui";

export const DASHBOARD_STYLE_UPDATED_EVENT = "metabase-dashboard-style-updated";

export function dispatchDashboardStyleUpdated(dashboardId: number | string) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(DASHBOARD_STYLE_UPDATED_EVENT, {
      detail: { dashboardId: String(dashboardId) },
    }),
  );
}

export function useDashboardStyleRevision(
  dashboardId?: number | string | null,
) {
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (dashboardId == null) {
      return;
    }

    const handleStyleUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ dashboardId?: string }>;
      const updatedId = customEvent.detail?.dashboardId;

      if (updatedId == null || String(updatedId) === String(dashboardId)) {
        setRevision((current) => current + 1);
      }
    };

    window.addEventListener(DASHBOARD_STYLE_UPDATED_EVENT, handleStyleUpdated);

    return () => {
      window.removeEventListener(
        DASHBOARD_STYLE_UPDATED_EVENT,
        handleStyleUpdated,
      );
    };
  }, [dashboardId]);

  return revision;
}

/**
 * Like [[useDashboardStyleRevision]], but only advances after the browser has
 * committed dashboard CSS to the DOM. Chart code reads CSS variables via
 * `getComputedStyle` during render, which would otherwise see stale values if
 * the revision bumped in the same pass as a new `<style>` tag.
 */
export function useDashboardDomReadyStyleRevision(
  dashboardId?: number | string | null,
) {
  const styleRevision = useDashboardStyleRevision(dashboardId);
  const [domReadyRevision, setDomReadyRevision] = useState(0);

  useLayoutEffect(() => {
    if (dashboardId == null) {
      return;
    }

    setDomReadyRevision(styleRevision);
  }, [dashboardId, styleRevision]);

  return dashboardId == null ? 0 : domReadyRevision;
}

/**
 * Returns the color scheme only after the browser has applied
 * `data-mantine-color-scheme` to the DOM. Dashboard chart code reads CSS
 * variables via `getComputedStyle` during render, which would otherwise see
 * stale light/dark values if evaluated in the same pass as a theme toggle.
 */
export function useDomReadyColorSchemeRevision() {
  const { resolvedColorScheme } = useColorScheme();
  const [domReadyColorScheme, setDomReadyColorScheme] =
    useState(resolvedColorScheme);

  useLayoutEffect(() => {
    setDomReadyColorScheme(resolvedColorScheme);
  }, [resolvedColorScheme]);

  return domReadyColorScheme;
}
