import { describe, expect, it } from "vitest";

import { normalizeTable } from "./normalizeTable";

describe("normalizeTable", () => {
  it("uses first row as headers and creates row objects", () => {
    const table = normalizeTable(
      [
        ["Name", "Sales"],
        ["A", "10"],
        ["B", "20"],
      ],
      "sample.csv",
    );

    expect(table.sourceName).toBe("sample.csv");
    expect(table.columns.map((column) => column.label)).toEqual(["Name", "Sales"]);
    expect(table.rows).toEqual([
      { name: "A", sales: "10" },
      { name: "B", sales: "20" },
    ]);
  });

  it("deduplicates duplicate and blank headers", () => {
    const table = normalizeTable(
      [
        ["Name", "Name", ""],
        ["A", "B", "C"],
      ],
      "duplicates",
    );

    expect(table.columns.map((column) => column.key)).toEqual(["name", "name_2", "column_3"]);
    expect(table.rows).toEqual([{ name: "A", name_2: "B", column_3: "C" }]);
  });
});
