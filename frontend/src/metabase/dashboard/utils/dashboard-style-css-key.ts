export function getDashboardStyleCssKey(
  caveats: string | null | undefined,
  revision = 0,
) {
  const normalized = caveats ?? "";

  return `${revision}:${normalized.length}:${normalized.slice(0, 64)}`;
}
