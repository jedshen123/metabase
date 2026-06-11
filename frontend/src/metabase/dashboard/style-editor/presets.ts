/** 样式编辑器下拉预设（固定中文标签） */

export const CUSTOM_PRESET_VALUE = "__custom__";

export type StylePresetOption = {
  /** Stable Select value — must not contain commas (Mantine parses them as delimiters). */
  id: string;
  label: string;
  value: string;
};

/** 对应 CSS 变量 --mbdb-font，作用于看板全局 font-family */
export const FONT_FAMILY_PRESETS: StylePresetOption[] = [
  {
    id: "system-zh",
    label: "系统默认（苹方 / 雅黑）",
    value: `-apple-system, "SF Pro Display", "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif`,
  },
  {
    id: "pingfang-sf",
    label: "苹方 / SF Pro",
    value: `-apple-system, "SF Pro Display", "PingFang SC", sans-serif`,
  },
  {
    id: "microsoft-yahei",
    label: "微软雅黑",
    value: `"Microsoft YaHei", "PingFang SC", sans-serif`,
  },
  {
    id: "source-han-sans",
    label: "思源黑体",
    value: `"Source Han Sans SC", "Noto Sans SC", "PingFang SC", sans-serif`,
  },
  {
    id: "inter",
    label: "Inter（西文）",
    value: `Inter, -apple-system, "Helvetica Neue", sans-serif`,
  },
  {
    id: "roboto",
    label: "Roboto",
    value: `Roboto, "Helvetica Neue", Arial, sans-serif`,
  },
  {
    id: "georgia",
    label: "Georgia（衬线）",
    value: `Georgia, "Times New Roman", serif`,
  },
];

/**
 * 对应 CSS 变量 --mbdb-font-size-kpi，作用于 [data-testid="scalar-value"]。
 * clamp(最小, 视口比例, 最大) 会随卡片宽度缩放；固定 px 则大小不变。
 */
export const KPI_FONT_SIZE_PRESETS: StylePresetOption[] = [
  {
    id: "kpi-compact",
    label: "紧凑（36–56px，随卡片缩放）",
    value: "clamp(36px, 4vw, 56px)",
  },
  {
    id: "kpi-default",
    label: "默认（48–76px，随卡片缩放）",
    value: "clamp(48px, 5vw, 76px)",
  },
  {
    id: "kpi-large",
    label: "大号（56–88px，随卡片缩放）",
    value: "clamp(56px, 6vw, 88px)",
  },
  {
    id: "kpi-xlarge",
    label: "超大（64–96px，随卡片缩放）",
    value: "clamp(64px, 7vw, 96px)",
  },
  { id: "kpi-48px", label: "固定 48px", value: "48px" },
  { id: "kpi-56px", label: "固定 56px", value: "56px" },
  { id: "kpi-64px", label: "固定 64px", value: "64px" },
  { id: "kpi-72px", label: "固定 72px", value: "72px" },
];

export function findMatchingPreset(
  value: string,
  presets: StylePresetOption[],
): StylePresetOption | undefined {
  const normalized = value.trim();

  return presets.find((preset) => preset.value === normalized);
}
