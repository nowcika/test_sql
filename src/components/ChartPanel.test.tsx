import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChartPanel } from "./ChartPanel";
import type { CategoryStats } from "../types";

vi.mock("recharts", () => {
  const Component = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  return {
    Bar: Component,
    BarChart: Component,
    CartesianGrid: Component,
    Cell: Component,
    Line: Component,
    LineChart: Component,
    Pie: Component,
    PieChart: Component,
    ResponsiveContainer: Component,
    Scatter: Component,
    ScatterChart: Component,
    Tooltip: Component,
    XAxis: Component,
    YAxis: Component,
  };
});

describe("ChartPanel", () => {
  it("labels horizontal bar charts", () => {
    const stats: CategoryStats = {
      kind: "category",
      count: 3,
      missingCount: 0,
      uniqueCount: 2,
      topValues: [
        { value: "East", count: 2 },
        { value: "West", count: 1 },
      ],
    };

    render(<ChartPanel stats={stats} chartType="bar" chartOrientation="horizontal" />);

    expect(screen.getByLabelText("가로 막대 차트")).toBeInTheDocument();
  });
});
