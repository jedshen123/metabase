import { findCssRuleOpenBrace, findMatchingBrace } from "./css-block-utils";
import type { StyleTokenValues } from "./types";

const CSS_VAR_LINE_PATTERN = /^(\s*--[a-zA-Z0-9-_]+\s*:\s*)([^;]+)(;.*)$/;

function replaceVariablesInBlock(
  blockContent: string,
  overrides: StyleTokenValues,
): string {
  const lines = blockContent.split("\n");
  const seen = new Set<string>();

  const updatedLines = lines.map((line) => {
    const match = line.match(/^\s*--([a-zA-Z0-9-_]+)\s*:/);

    if (!match) {
      return line;
    }

    const name = match[1];
    const override = overrides[name];

    if (override == null) {
      return line;
    }

    seen.add(name);

    const lineMatch = line.match(CSS_VAR_LINE_PATTERN);

    if (!lineMatch) {
      return line;
    }

    return `${lineMatch[1]}${override}${lineMatch[3]}`;
  });

  const indent = "  ";
  const appended = Object.entries(overrides)
    .filter(([name]) => !seen.has(name))
    .map(([name, value]) => `${indent}--${name}: ${value};`);

  if (appended.length === 0) {
    return updatedLines.join("\n");
  }

  let closingIndex = -1;

  for (let index = updatedLines.length - 1; index >= 0; index -= 1) {
    if (updatedLines[index].trim() !== "") {
      closingIndex = index;
      break;
    }
  }

  if (closingIndex === -1) {
    return appended.join("\n");
  }

  return [
    ...updatedLines.slice(0, closingIndex + 1),
    ...appended,
    ...updatedLines.slice(closingIndex + 1),
  ].join("\n");
}

function applyOverridesToSelectorBlock(
  css: string,
  selector: string,
  overrides: StyleTokenValues,
): string {
  const openBrace = findCssRuleOpenBrace(css, selector);

  if (openBrace === -1) {
    return css;
  }

  const closeBrace = findMatchingBrace(css, openBrace);

  if (closeBrace === -1) {
    return css;
  }

  const block = css.slice(openBrace + 1, closeBrace);
  const updated = replaceVariablesInBlock(block, overrides);

  return css.slice(0, openBrace + 1) + updated + css.slice(closeBrace);
}

export function applyTokenOverridesToCss(
  templateCss: string,
  lightOverrides: StyleTokenValues,
  darkOverrides: StyleTokenValues,
): string {
  let css = applyOverridesToSelectorBlock(templateCss, ":root", lightOverrides);

  css = applyOverridesToSelectorBlock(
    css,
    '[data-mantine-color-scheme="dark"]',
    darkOverrides,
  );

  return css;
}
