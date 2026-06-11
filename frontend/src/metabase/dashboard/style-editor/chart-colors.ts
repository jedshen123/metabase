/** 解析 / 序列化 --mb-dashboard-chart-colors 逗号分隔色值 */

export function parseChartColorList(value: string): string[] {
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

export function serializeChartColorList(colors: string[]): string {
  return colors
    .map((color) => color.trim())
    .filter(Boolean)
    .join(", ");
}

export const MAX_CHART_SERIES_COLORS = 12;

// eslint-disable-next-line metabase/no-color-literals -- default swatch for new chart series
export const DEFAULT_NEW_CHART_COLOR = "#94a3b8";
