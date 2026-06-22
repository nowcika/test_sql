import { describe, expect, it } from "vitest";
import type { TableData } from "../types";
import {
  calculateSingleColumnStats,
  calculateTwoColumnStats,
  inferColumnTypes,
} from "./statistics";

const table: TableData = {
  sourceName: "sales",
  columns: [
    { key: "region", label: "region", inferredType: "empty", missingCount: 0, uniqueCount: 0 },
    { key: "sales", label: "sales", inferredType: "empty", missingCount: 0, uniqueCount: 0 },
    { key: "profit", label: "profit", inferredType: "empty", missingCount: 0, uniqueCount: 0 },
  ],
  rows: [
    { region: "East", sales: 10, profit: 1 },
    { region: "East", sales: 20, profit: 2 },
    { region: "West", sales: 30, profit: 5 },
    { region: null, sales: null, profit: 9 },
  ],
};

describe("inferColumnTypes", () => {
  it("infers category and number columns", () => {
    const result = inferColumnTypes(table);

    expect(result.columns.map((column) => [column.key, column.inferredType])).toEqual([
      ["region", "category"],
      ["sales", "number"],
      ["profit", "number"],
    ]);
  });
});

describe("calculateSingleColumnStats", () => {
  it("calculates numeric stats for sales", () => {
    const inferred = inferColumnTypes(table);

    expect(calculateSingleColumnStats(inferred, "sales")).toEqual({
      kind: "numeric",
      count: 3,
      missingCount: 1,
      sum: 60,
      mean: 20,
      median: 20,
      min: 10,
      max: 30,
      variance: 66.66666666666667,
      standardDeviation: 8.16496580927726,
      histogramBins: [
        { label: "10-20", count: 1 },
        { label: "20-30", count: 2 },
      ],
    });
  });



  it("calculates min and max for large numeric columns without throwing", () => {
    const rows = Array.from({ length: 200_000 }, (_, index) => ({ amount: index + 1 }));
    const largeTable: TableData = {
      sourceName: "large",
      columns: [
        { key: "amount", label: "amount", inferredType: "number", missingCount: 0, uniqueCount: 0 },
      ],
      rows,
    };

    expect(() => calculateSingleColumnStats(largeTable, "amount")).not.toThrow();
    expect(calculateSingleColumnStats(largeTable, "amount")).toMatchObject({
      kind: "numeric",
      count: 200_000,
      min: 1,
      max: 200_000,
    });
  });

  it("calculates category stats for region", () => {
    const inferred = inferColumnTypes(table);

    expect(calculateSingleColumnStats(inferred, "region")).toEqual({
      kind: "category",
      count: 3,
      missingCount: 1,
      uniqueCount: 2,
      topValues: [
        { value: "East", count: 2 },
        { value: "West", count: 1 },
      ],
    });
  });
});

describe("calculateTwoColumnStats", () => {
  it("calculates numeric relationship stats for sales and profit", () => {
    const inferred = inferColumnTypes(table);

    expect(calculateTwoColumnStats(inferred, "sales", "profit")).toEqual({
      kind: "numeric-relationship",
      pairedCount: 3,
      missingPairCount: 1,
      points: [
        { x: 10, y: 1 },
        { x: 20, y: 2 },
        { x: 30, y: 5 },
      ],
    });
  });

  it("calculates grouped numeric stats for region and sales", () => {
    const inferred = inferColumnTypes(table);

    expect(calculateTwoColumnStats(inferred, "region", "sales")).toEqual({
      kind: "grouped-numeric",
      groups: [
        { label: "West", count: 1, sum: 30, mean: 30, min: 30, max: 30, variance: 0, standardDeviation: 0 },
        { label: "East", count: 2, sum: 30, mean: 15, min: 10, max: 20, variance: 25, standardDeviation: 5 },
      ],
    });
  });
});
