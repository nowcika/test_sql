import { describe, expect, it } from "vitest";

import { parseCsvText } from "./parseCsv";

describe("parseCsvText", () => {
  it("parses CSV text and converts empty cells to null", () => {
    expect(parseCsvText('Name,Notes,Sales\nA,"hello, world",10\nB,,20')).toEqual([
      ["Name", "Notes", "Sales"],
      ["A", "hello, world", "10"],
      ["B", null, "20"],
    ]);
  });
});
