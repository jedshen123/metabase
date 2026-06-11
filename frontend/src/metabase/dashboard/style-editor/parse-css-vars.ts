import { extractCssBlock } from "./css-block-utils";
import type { StyleTokenValues } from "./types";

const CSS_VAR_PATTERN = /^\s*--([a-zA-Z0-9-_]+)\s*:\s*([^;]+);/;

export function parseCssVariablesFromBlock(
  blockContent: string,
): StyleTokenValues {
  const values: StyleTokenValues = {};

  for (const line of blockContent.split("\n")) {
    const match = line.match(CSS_VAR_PATTERN);

    if (match) {
      values[match[1]] = match[2].trim();
    }
  }

  return values;
}

export function parseTokenValuesFromCss(css: string): {
  light: StyleTokenValues;
  dark: StyleTokenValues;
} {
  const lightBlock = extractCssBlock(css, ":root");
  const darkBlock = extractCssBlock(css, '[data-mantine-color-scheme="dark"]');

  return {
    light: lightBlock ? parseCssVariablesFromBlock(lightBlock) : {},
    dark: darkBlock ? parseCssVariablesFromBlock(darkBlock) : {},
  };
}
