/** Returns true when `index` is inside a CSS block comment. */
export function isInsideCssComment(css: string, index: number): boolean {
  let inComment = false;

  for (let i = 0; i < index; i += 1) {
    if (css.startsWith("/*", i)) {
      inComment = true;
      i += 1;
    } else if (css.startsWith("*/", i)) {
      inComment = false;
      i += 1;
    }
  }

  return inComment;
}

/**
 * Finds the opening `{` of a top-level CSS rule for `selector`, skipping matches
 * inside comments and non-rule text (e.g. selector names mentioned in comments).
 */
export function findCssRuleOpenBrace(css: string, selector: string): number {
  let searchIndex = 0;

  while (searchIndex < css.length) {
    const selectorIndex = css.indexOf(selector, searchIndex);

    if (selectorIndex === -1) {
      return -1;
    }

    const afterSelector = css.slice(selectorIndex + selector.length);

    if (
      !isInsideCssComment(css, selectorIndex) &&
      /^\s*\{/.test(afterSelector)
    ) {
      return selectorIndex + selector.length + afterSelector.indexOf("{");
    }

    searchIndex = selectorIndex + 1;
  }

  return -1;
}

export function findMatchingBrace(css: string, openBraceIndex: number): number {
  let depth = 0;

  for (let index = openBraceIndex; index < css.length; index += 1) {
    const character = css[index];

    if (character === "{") {
      depth += 1;
    } else if (character === "}") {
      depth -= 1;

      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
}

export function extractCssBlock(css: string, selector: string): string | null {
  const openBrace = findCssRuleOpenBrace(css, selector);

  if (openBrace === -1) {
    return null;
  }

  const closeBrace = findMatchingBrace(css, openBrace);

  if (closeBrace === -1) {
    return null;
  }

  return css.slice(openBrace + 1, closeBrace);
}
