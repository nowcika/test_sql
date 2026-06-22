import { describe, expect, it } from "vitest";
import type { CategoryStats, NumericRelationshipStats } from "../types";
import { buildSingleColumnChartData, buildTwoColumnChartData } from "./chartData";

describe("buildSingleColumnChartData", () => {
  it("maps category top values to labels and values", () => {
    const stats: CategoryStats = {
      kind: "category",
      count: 3,
      missingCount: 1,
      uniqueCount: 2,
      topValues: [
        { value: "East", count: 2 },
        { value: "West", count: 1 },
      ],
    };

    expect(buildSingleColumnChartData(stats)).toEqual([
      { label: "East", value: 2 },
      { label: "West", value: 1 },
    ]);
  });
});

describe("buildTwoColumnChartData", () => {
  it("returns numeric relationship points", () => {
    const stats: NumericRelationshipStats = {
      kind: "numeric-relationship",
      pairedCount: 3,
      missingPairCount: 1,
      points: [
        { x: 10, y: 1 },
        { x: 20, y: 2 },
        { x: 30, y: 5 },
      ],
    };

    expect(buildTwoColumnChartData(stats)).toEqual([
      { x: 10, y: 1 },
      { x: 20, y: 2 },
      { x: 30, y: 5 },
    ]);
  });
});
