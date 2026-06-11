/** 样式编辑器下拉预设（固定中文标签） */

export const CUSTOM_PRESET_VALUE = "__custom__";

export type StylePresetOption = {
  label: string;
  value: string;
};

/** 对应 CSS 变量 --mbdb-font，作用于看板全局 font-family */
export const FONT_FAMILY_PRESETS: StylePresetOption[] = [
  {
    label: "系统默认（苹方 / 雅黑）",
    value: `-apple-system, "SF Pro Display", "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif`,
  },
  {
    label: "苹方 / SF Pro",
    value: `-apple-system, "SF Pro Display", "PingFang SC", sans-serif`,
  },
  {
    label: "微软雅黑",
    value: `"Microsoft YaHei", "PingFang SC", sans-serif`,
  },
  {
    label: "思源黑体",
    value: `"Source Han Sans SC", "Noto Sans SC", "PingFang SC", sans-serif`,
  },
  {
    label: "Inter（西文）",
    value: `Inter, -apple-system, "Helvetica Neue", sans-serif`,
  },
  {
    label: "Roboto",
    value: `Roboto, "Helvetica Neue", Arial, sans-serif`,
  },
  {
    label: "Georgia（衬线）",
    value: `Georgia, "Times New Roman", serif`,
  },
];

/**
 * 对应 CSS 变量 --mbdb-font-size-kpi，作用于 [data-testid="scalar-value"]。
 * clamp(最小, 视口比例, 最大) 会随卡片宽度缩放；固定 px 则大小不变。
 */
export const KPI_FONT_SIZE_PRESETS: StylePresetOption[] = [
  { label: "紧凑（36–56px，随卡片缩放）", value: "clamp(36px, 4vw, 56px)" },
  { label: "默认（48–76px，随卡片缩放）", value: "clamp(48px, 5vw, 76px)" },
  { label: "大号（56–88px，随卡片缩放）", value: "clamp(56px, 6vw, 88px)" },
  { label: "超大（64–96px，随卡片缩放）", value: "clamp(64px, 7vw, 96px)" },
  { label: "固定 48px", value: "48px" },
  { label: "固定 56px", value: "56px" },
  { label: "固定 64px", value: "64px" },
  { label: "固定 72px", value: "72px" },
];

export function findMatchingPreset(
  value: string,
  presets: StylePresetOption[],
): StylePresetOption | undefined {
  const normalized = value.trim();

  return presets.find((preset) => preset.value === normalized);
}
