import { describe, expect, it } from "vitest";

import type { TableData } from "../types";
import { calculateMatrixStats, matrixToLongTable } from "./matrixTable";

const matrixTable: TableData = {
  sourceName: "matrix",
  columns: [
    { key: "metric", label: "Metric", inferredType: "category", missingCount: 0, uniqueCount: 2 },
    { key: "jan", label: "Jan", inferredType: "number", missingCount: 0, uniqueCount: 2 },
    { key: "feb", label: "Feb", inferredType: "number", missingCount: 0, uniqueCount: 2 },
  ],
  rows: [
    { metric: "Sales", jan: 100, feb: 120 },
    { metric: "Profit", jan: 20, feb: 30 },
  ],
};

describe("matrixToLongTable", () => {
  it("converts a matrix table into X, Series, Value rows", () => {
    expect(matrixToLongTable(matrixTable)).toEqual({
      sourceName: "matrix (matrix)",
      columns: [
        { key: "x", label: "X", inferredType: "category", missingCount: 0, uniqueCount: 2 },
        { key: "series", label: "Series", inferredType: "category", missingCount: 0, uniqueCount: 2 },
        { key: "value", label: "Value", inferredType: "number", missingCount: 0, uniqueCount: 4 },
      ],
      rows: [
        { x: "Jan", series: "Sales", value: 100 },
        { x: "Feb", series: "Sales", value: 120 },
        { x: "Jan", series: "Profit", value: 20 },
        { x: "Feb", series: "Profit", value: 30 },
      ],
    });
  });
});

describe("calculateMatrixStats", () => {
  it("keeps x labels and series values for matrix charts", () => {
    expect(calculateMatrixStats(matrixTable)).toEqual({
      kind: "matrix",
      xLabels: ["Jan", "Feb"],
      valueCount: 4,
      missingCount: 0,
      series: [
        {
          label: "Sales",
          values: [
            { x: "Jan", value: 100 },
            { x: "Feb", value: 120 },
          ],
        },
        {
          label: "Profit",
          values: [
            { x: "Jan", value: 20 },
            { x: "Feb", value: 30 },
          ],
        },
      ],
    });
  });
});
