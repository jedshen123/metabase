import {
  formatJsonValue,
  formatRawJsonCellValue,
  parseCellJsonValue,
} from "./json";

describe("parseCellJsonValue", () => {
  it("returns null for empty values", () => {
    expect(parseCellJsonValue(null)).toBeNull();
    expect(parseCellJsonValue(undefined)).toBeNull();
    expect(parseCellJsonValue("")).toBeNull();
  });

  it("returns objects and arrays as-is", () => {
    const objectValue = { path: "/api/v1/dashboard" };
    const arrayValue = [1, 2, 3];

    expect(parseCellJsonValue(objectValue)).toBe(objectValue);
    expect(parseCellJsonValue(arrayValue)).toBe(arrayValue);
  });

  it("parses JSON strings into objects and arrays", () => {
    expect(parseCellJsonValue('{"path":"/api/v1/dashboard"}')).toEqual({
      path: "/api/v1/dashboard",
    });
    expect(parseCellJsonValue("[1,2,3]")).toEqual([1, 2, 3]);
  });

  it("returns null for non-JSON strings", () => {
    expect(parseCellJsonValue("hello")).toBeNull();
    expect(parseCellJsonValue("123")).toBeNull();
    expect(parseCellJsonValue('"hello"')).toBeNull();
    expect(parseCellJsonValue("{invalid json}")).toBeNull();
  });

  it("returns null for numbers and booleans", () => {
    expect(parseCellJsonValue(123)).toBeNull();
    expect(parseCellJsonValue(true)).toBeNull();
  });
});

describe("formatJsonValue", () => {
  it("pretty-prints JSON values", () => {
    expect(formatJsonValue({ a: 1 })).toBe('{\n  "a": 1\n}');
  });
});

describe("formatRawJsonCellValue", () => {
  it("returns strings as-is", () => {
    expect(formatRawJsonCellValue('{"a":1}')).toBe('{"a":1}');
  });

  it("stringifies objects without formatting", () => {
    expect(formatRawJsonCellValue({ a: 1 })).toBe('{"a":1}');
  });

  it("returns empty string for nullish values", () => {
    expect(formatRawJsonCellValue(null)).toBe("");
    expect(formatRawJsonCellValue(undefined)).toBe("");
  });
});
