import {
  buildBoxShadow,
  buildCardAccentGradient,
  parseBoxShadow,
  parseCardAccentGradient,
} from "./shape-presets";

describe("shape presets", () => {
  it("round-trips card accent gradients", () => {
    const value = "linear-gradient(90deg, #2f6f7e, #5bc8e8, #4b6bff)";

    expect(parseCardAccentGradient(value)).toEqual([
      "#2f6f7e",
      "#5bc8e8",
      "#4b6bff",
    ]);
    expect(buildCardAccentGradient(["#111111", "#222222", "#333333"])).toBe(
      "linear-gradient(90deg, #111111, #222222, #333333)",
    );
  });

  it("round-trips box shadows", () => {
    const value = "0 4px 12px rgba(15, 23, 42, 0.06)";

    expect(parseBoxShadow(value)).toEqual({ y: 4, blur: 12, opacity: 0.06 });
    expect(buildBoxShadow({ y: 0, blur: 0, opacity: 0 }, "light")).toBe("none");
    expect(buildBoxShadow({ y: 2, blur: 8, opacity: 0.08 }, "dark")).toBe(
      "0 2px 8px rgba(0, 0, 0, 0.08)",
    );
  });
});
