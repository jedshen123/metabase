/* eslint-disable metabase/no-color-literals -- theme token preset values */
import type { StyleTokenTheme } from "./types";

export const DEFAULT_GRADIENT_COLORS: Record<
  StyleTokenTheme,
  [string, string, string]
> = {
  light: ["#2f6f7e", "#5bc8e8", "#4b6bff"],
  dark: ["#7ecde6", "#8ca1ff", "#ff75a7"],
};

export type StylePresetOption = {
  label: string;
  value: string;
};

export function buildCardAccentGradient(colors: [string, string, string]) {
  return `linear-gradient(90deg, ${colors.join(", ")})`;
}

export function parseCardAccentGradient(
  value: string,
): [string, string, string] {
  const match = value
    .trim()
    .match(/linear-gradient\s*\(\s*90deg\s*,\s*(.+)\)/i);

  if (!match) {
    return DEFAULT_GRADIENT_COLORS.light;
  }

  const colors = match[1]
    .split(",")
    .map((color) => color.trim())
    .filter(Boolean)
    .slice(0, 3);

  while (colors.length < 3) {
    colors.push(colors[colors.length - 1] ?? "#888888");
  }

  return colors as [string, string, string];
}

export function getCardAccentGradientPresets(
  theme: StyleTokenTheme,
): StylePresetOption[] {
  if (theme === "dark") {
    return [
      {
        label: "Momcozy 默认（青蓝粉）",
        value: buildCardAccentGradient(DEFAULT_GRADIENT_COLORS.dark),
      },
      {
        label: "冷色蓝紫",
        value: "linear-gradient(90deg, #3b82f6, #6366f1, #a855f7)",
      },
      {
        label: "霓虹渐变",
        value: "linear-gradient(90deg, #22d3ee, #818cf8, #f472b6)",
      },
      {
        label: "单色青",
        value: "linear-gradient(90deg, #7ecde6, #7ecde6, #7ecde6)",
      },
    ];
  }

  return [
    {
      label: "Momcozy 默认（青蓝）",
      value: buildCardAccentGradient(DEFAULT_GRADIENT_COLORS.light),
    },
    {
      label: "品牌蓝紫",
      value: "linear-gradient(90deg, #2f6f7e, #4b6bff, #8ca1ff)",
    },
    {
      label: "暖色日落",
      value: "linear-gradient(90deg, #ff9d5c, #e96f9a, #8f62b2)",
    },
    {
      label: "清新绿蓝",
      value: "linear-gradient(90deg, #10b981, #6fcfe8, #4b6bff)",
    },
    {
      label: "单色品牌",
      value: "linear-gradient(90deg, #2f6f7e, #2f6f7e, #2f6f7e)",
    },
  ];
}

export type ParsedBoxShadow = {
  y: number;
  blur: number;
  opacity: number;
};

export function buildBoxShadow(
  { y, blur, opacity }: ParsedBoxShadow,
  theme: StyleTokenTheme,
) {
  if (y === 0 && blur === 0 && opacity === 0) {
    return "none";
  }

  const rgb = theme === "dark" ? "0, 0, 0" : "15, 23, 42";
  return `0 ${y}px ${blur}px rgba(${rgb}, ${opacity})`;
}

export function parseBoxShadow(value: string): ParsedBoxShadow | null {
  const normalized = value.trim();

  if (normalized === "none") {
    return { y: 0, blur: 0, opacity: 0 };
  }

  const match = normalized.match(
    /^0\s+(\d+)px\s+(\d+)px\s+rgba\(\s*[\d,\s.]+\s*,\s*([\d.]+)\s*\)$/,
  );

  if (!match) {
    return null;
  }

  return {
    y: Number(match[1]),
    blur: Number(match[2]),
    opacity: Number(match[3]),
  };
}

export function getCardShadowPresets(
  theme: StyleTokenTheme,
): StylePresetOption[] {
  const none = { label: "无阴影", value: "none" };

  if (theme === "dark") {
    return [
      none,
      { label: "默认", value: "0 1px 4px rgba(0, 0, 0, 0.4)" },
      { label: "轻微", value: "0 2px 6px rgba(0, 0, 0, 0.35)" },
      { label: "明显", value: "0 4px 12px rgba(0, 0, 0, 0.5)" },
    ];
  }

  return [
    none,
    { label: "极淡", value: "0 1px 2px rgba(15, 23, 42, 0.04)" },
    { label: "默认", value: "0 1px 2px rgba(15, 23, 42, 0.05)" },
    { label: "柔和", value: "0 2px 8px rgba(15, 23, 42, 0.08)" },
    { label: "明显", value: "0 4px 16px rgba(15, 23, 42, 0.12)" },
  ];
}

export function findMatchingPreset(
  value: string,
  presets: StylePresetOption[],
): StylePresetOption | undefined {
  return presets.find((preset) => preset.value === value.trim());
}
