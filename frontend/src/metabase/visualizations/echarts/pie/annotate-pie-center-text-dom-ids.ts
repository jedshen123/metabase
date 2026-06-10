import type { EChartsType } from "echarts/core";

const PIE_CENTER_TEXT_DOM_ATTR = "data-mb-pie-total";

const PIE_CENTER_TEXT_ZR_IDS = {
  "mb-pie-total-value": "value",
  "mb-pie-total-label": "label",
} as const;

/**
 * ECharts graphic `id` is a zrender vnode key only — it is not written to the SVG
 * DOM. Dashboard custom CSS targets center text via [data-mb-pie-total], so we
 * mirror zrender ids onto data attributes after each chart paint.
 */
export function annotatePieCenterTextDomIds(chart: EChartsType) {
  if (chart.isDisposed()) {
    return;
  }

  chart.getZr().storage.traverse((el) => {
    const role =
      PIE_CENTER_TEXT_ZR_IDS[el.id as keyof typeof PIE_CENTER_TEXT_ZR_IDS];

    if (role == null) {
      return;
    }

    const dom = (el as unknown as { dom?: Element }).dom;
    dom?.setAttribute?.(PIE_CENTER_TEXT_DOM_ATTR, role);
  });
}
