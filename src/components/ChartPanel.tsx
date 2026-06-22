import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  buildSingleColumnChartData,
  buildTwoColumnChartData,
} from "../lib/chartData";
import type { SingleColumnStats, TwoColumnStats } from "../types";

type ChartPanelProps = {
  stats: SingleColumnStats | TwoColumnStats | null;
};

export function ChartPanel({ stats }: ChartPanelProps) {
  if (!stats) {
    return (
      <section className="panel chart-panel">
        차트를 표시할 분석 결과가 없습니다.
      </section>
    );
  }

  if (stats.kind === "numeric-relationship") {
    return (
      <section className="panel chart-panel" aria-label="숫자 관계 차트">
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart data={stats.points}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" type="number" />
            <YAxis dataKey="y" type="number" />
            <Tooltip />
            <Scatter fill="#2d6f65" />
          </ScatterChart>
        </ResponsiveContainer>
      </section>
    );
  }

  if (stats.kind === "grouped-numeric") {
    const chartData = buildTwoColumnChartData(stats) as {
      label: string;
      mean: number;
      sum: number;
      count: number;
    }[];

    return (
      <section className="panel chart-panel" aria-label="그룹별 평균 차트">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="mean" fill="#2d6f65" />
          </BarChart>
        </ResponsiveContainer>
      </section>
    );
  }

  return (
    <section className="panel chart-panel" aria-label="단일 컬럼 차트">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={buildSingleColumnChartData(stats)}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#2d6f65" />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
