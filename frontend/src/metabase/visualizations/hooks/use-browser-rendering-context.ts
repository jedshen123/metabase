import { useMemo } from "react";

import { usePalette } from "metabase/common/hooks/use-palette";
import {
  useDashboardDomReadyStyleRevision,
  useDomReadyColorSchemeRevision,
} from "metabase/dashboard/hooks/use-dashboard-style-revision";
import { color } from "metabase/lib/colors";
import { measureTextHeight, measureTextWidth } from "metabase/lib/measure-text";
import { useMantineTheme } from "metabase/ui";
import {
  getDashboardChartColor,
  getDashboardChartStyleNumber,
  getDashboardChartTextColor,
  shouldForceDashboardChartColors,
} from "metabase/visualizations/shared/utils/dashboard-chart-colors";
import { getVisualizationTheme } from "metabase/visualizations/shared/utils/theme";
import type { RenderingContext } from "metabase/visualizations/types";

interface RenderingOptions {
  fontFamily: string;
  isDashboard?: boolean;
  isFullscreen?: boolean;
  dashboardId?: number | string | null;
}

export const useBrowserRenderingContext = (
  options: RenderingOptions,
): RenderingContext => {
  const { fontFamily, isDashboard, dashboardId } = options;

  const palette = usePalette();
  const theme = useMantineTheme();
  const domReadyColorScheme = useDomReadyColorSchemeRevision();
  const dashboardStyleRevision = useDashboardDomReadyStyleRevision(
    isDashboard ? dashboardId : null,
  );

  return useMemo(() => {
    const style = getVisualizationTheme({
      theme: theme.other,
      isDashboard,
    });

    return {
      getColor: (name) => color(name, palette),
      getChartColor: (index) =>
        getDashboardChartColor(index, domReadyColorScheme),
      getChartTextColor: isDashboard
        ? (kind) => getDashboardChartTextColor(kind)
        : undefined,
      getChartStyleNumber: getDashboardChartStyleNumber,
      shouldForceChartColors: shouldForceDashboardChartColors,
      measureText: measureTextWidth,
      measureTextHeight,
      fontFamily: `${fontFamily}, Arial, sans-serif`,
      theme: style,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dashboardStyleRevision busts cache when scoped CSS updates
  }, [
    fontFamily,
    palette,
    theme,
    domReadyColorScheme,
    isDashboard,
    dashboardStyleRevision,
  ]);
};
