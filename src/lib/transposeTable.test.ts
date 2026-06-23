import { describe, expect, it } from "vitest";

import type { TableData } from "../types";
import { transposeTable } from "./transposeTable";

describe("transposeTable", () => {
  it("uses the first source column values as transposed columns", () => {
    const table: TableData = {
      sourceName: "quarterly",
      columns: [
        { key: "metric", label: "Metric", inferredType: "category", missingCount: 0, uniqueCount: 2 },
        { key: "q1", label: "Q1", inferredType: "number", missingCount: 0, uniqueCount: 2 },
        { key: "q2", label: "Q2", inferredType: "number", missingCount: 0, uniqueCount: 2 },
      ],
      rows: [
        { metric: "Sales", q1: 10, q2: 20 },
        { metric: "Profit", q1: 1, q2: 2 },
      ],
    };

    expect(transposeTable(table)).toEqual({
      sourceName: "quarterly (transposed)",
      columns: [
        { key: "metric", label: "Metric", inferredType: "category", missingCount: 0, uniqueCount: 2 },
        { key: "sales", label: "Sales", inferredType: "number", missingCount: 0, uniqueCount: 2 },
        { key: "profit", label: "Profit", inferredType: "number", missingCount: 0, uniqueCount: 2 },
      ],
      rows: [
        { metric: "Q1", sales: 10, profit: 1 },
        { metric: "Q2", sales: 20, profit: 2 },
      ],
    });
  });

  it("deduplicates blank and repeated transposed column labels", () => {
    const table: TableData = {
      sourceName: "duplicate labels",
      columns: [
        { key: "name", label: "Name", inferredType: "category", missingCount: 0, uniqueCount: 2 },
        { key: "jan", label: "Jan", inferredType: "number", missingCount: 0, uniqueCount: 2 },
      ],
      rows: [
        { name: "Sales", jan: 10 },
        { name: "Sales", jan: 20 },
        { name: null, jan: 30 },
      ],
    };

    const transposed = transposeTable(table);

    expect(transposed.columns.map((column) => [column.key, column.label])).toEqual([
      ["name", "Name"],
      ["sales", "Sales"],
      ["sales_2", "Sales"],
      ["row_4", "Row 4"],
    ]);
    expect(transposed.rows).toEqual([
      { name: "Jan", sales: 10, sales_2: 20, row_4: 30 },
    ]);
  });
});
