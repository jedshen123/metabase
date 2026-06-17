import type { RowValue } from "metabase-types/api";

export function parseCellJsonValue(value: RowValue): unknown | null {
  if (value == null || value === "") {
    return null;
  }

  if (typeof value === "object") {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed === "object" && parsed !== null) {
      return parsed;
    }
  } catch {
    return null;
  }

  return null;
}

export function formatJsonValue(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function formatRawJsonCellValue(rawValue: RowValue): string {
  if (rawValue == null) {
    return "";
  }

  if (typeof rawValue === "string") {
    return rawValue;
  }

  if (typeof rawValue === "object") {
    return JSON.stringify(rawValue);
  }

  return String(rawValue);
}
