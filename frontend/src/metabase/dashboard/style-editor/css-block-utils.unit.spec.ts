import { applyTokenOverridesToCss } from "./apply-token-overrides";
import {
  findCssRuleOpenBrace,
  findMatchingBrace,
  isInsideCssComment,
} from "./css-block-utils";
import { MOMCOZY_PROFESSIONAL_TEMPLATE } from "./momcozy-template";
import { parseTokenValuesFromCss } from "./parse-css-vars";

describe("css-block-utils", () => {
  it("detects selector mentions inside comments", () => {
    const css = `:root {
  /* [data-mantine-color-scheme="dark"] 块中 */
  --mbdb-text-muted: #526274;
}
[data-mantine-color-scheme="dark"] {
  --mbdb-text-muted: #a8b5c7;
}`;

    const commentIndex = css.indexOf('[data-mantine-color-scheme="dark"]');

    expect(isInsideCssComment(css, commentIndex)).toBe(true);
    expect(
      findCssRuleOpenBrace(css, '[data-mantine-color-scheme="dark"]'),
    ).toBe(
      css.indexOf("{", css.lastIndexOf('[data-mantine-color-scheme="dark"]')),
    );
  });

  it("parses momcozy template dark variables from the real dark block", () => {
    const parsed = parseTokenValuesFromCss(MOMCOZY_PROFESSIONAL_TEMPLATE);

    expect(parsed.light["mbdb-text-muted"]).toBe("#526274");
    expect(parsed.dark["mbdb-text-muted"]).toBe("#a8b5c7");
    expect(parsed.dark["mbdb-text"]).toBe("#e2e8f0");
    expect(Object.keys(parsed.dark).length).toBeGreaterThan(10);
  });

  it("applies dark overrides to the dark block, not global selectors", () => {
    const css = applyTokenOverridesToCss(
      MOMCOZY_PROFESSIONAL_TEMPLATE,
      { "mbdb-text-muted": "#111111" },
      { "mbdb-text-muted": "#eeeeee" },
    );

    const parsed = parseTokenValuesFromCss(css);

    expect(parsed.light["mbdb-text-muted"]).toBe("#111111");
    expect(parsed.dark["mbdb-text-muted"]).toBe("#eeeeee");

    const universalSelectorIndex = css.indexOf("*,\n*::before,\n*::after");
    const universalOpenBrace = css.indexOf("{", universalSelectorIndex);
    const universalCloseBrace = findMatchingBrace(css, universalOpenBrace);
    const universalBlock = css.slice(
      universalOpenBrace + 1,
      universalCloseBrace,
    );

    expect(universalBlock).not.toContain("--mbdb-text-muted");
  });
});
