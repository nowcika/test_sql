import { describe, expect, it } from "vitest";

import { parsePastedTable } from "./parsePaste";

describe("parsePastedTable", () => {
  it("splits pasted tabular text into rows and cells", () => {
    expect(parsePastedTable("Name\tSales\nA\t10\nB\t20")).toEqual([
      ["Name", "Sales"],
      ["A", "10"],
      ["B", "20"],
    ]);
  });

  it("preserves leading blank cells from pasted tabs", () => {
    expect(parsePastedTable("\tSales\nA\t10")).toEqual([
      ["", "Sales"],
      ["A", "10"],
    ]);
  });

  it("throws when pasted input is empty", () => {
    expect(() => parsePastedTable(" \n\t ")) .toThrow("Pasted data is empty.");
  });
});
