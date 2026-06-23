import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  buildHistogramData,
  buildSingleColumnChartData,
  buildTwoColumnChartData,
} from "../lib/chartData";
import type { ChartOrientation, ChartType, GroupedMetricKey, SingleColumnStats, TwoColumnStats } from "../types";

type ChartPanelProps = {
  stats: SingleColumnStats | TwoColumnStats | null;
  chartType?: ChartType;
  groupedMetric?: GroupedMetricKey;
  chartOrientation?: ChartOrientation;
};

const colors = ["#2d6f65", "#5f8f3e", "#b46b3c", "#6b6fb4", "#b45273", "#4b8da8"];

function BarLikeChart({
  data,
  type,
  label,
  orientation = "vertical",
}: {
  data: unknown[];
  type: "bar" | "line";
  label: string;
  orientation?: ChartOrientation;
}) {
  const ariaLabel = type === "bar" && orientation === "horizontal" ? "가로 막대 차트" : label;

  return (
    <section className="panel chart-panel" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height={320}>
        {type === "line" ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#2d6f65" strokeWidth={2} dot />
          </LineChart>
        ) : orientation === "horizontal" ? (
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="label" type="category" width={90} />
            <Tooltip />
            <Bar dataKey="value" fill="#2d6f65" />
          </BarChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#2d6f65" />
          </BarChart>
        )}
      </ResponsiveContainer>
    </section>
  );
}

function PieLikeChart({ data }: { data: { label: string; value: number }[] }) {
  return (
    <section className="panel chart-panel" aria-label="파이 차트">
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Tooltip />
          <Pie data={data} dataKey="value" nameKey="label" outerRadius={110} label>
            {data.map((entry, index) => (
              <Cell key={entry.label} fill={colors[index % colors.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </section>
  );
}

export function ChartPanel({
  stats,
  chartType = "bar",
  groupedMetric = "mean",
  chartOrientation = "vertical",
}: ChartPanelProps) {
  if (!stats) {
    return (
      <section className="panel chart-panel">
        차트를 표시할 분석 결과가 없습니다.
      </section>
    );
  }

  if (stats.kind === "numeric-relationship") {
    if (chartType === "line") {
      const data = [...stats.points]
        .sort((left, right) => left.x - right.x)
        .map((point) => ({ label: String(point.x), value: point.y }));
      return <BarLikeChart data={data} type="line" label="라인 차트" />;
    }

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
    const chartData = buildTwoColumnChartData(stats, groupedMetric) as { label: string; value: number }[];
    if (chartType === "pie") {
      return <PieLikeChart data={chartData} />;
    }
    return (
      <BarLikeChart
        data={chartData}
        type={chartType === "line" ? "line" : "bar"}
        label={chartType === "line" ? "라인 차트" : "그룹 차트"}
        orientation={chartOrientation}
      />
    );
  }

  if (stats.kind === "numeric" && chartType === "histogram") {
    return (
      <BarLikeChart
        data={buildHistogramData(stats)}
        type="bar"
        label="히스토그램 차트"
        orientation={chartOrientation}
      />
    );
  }

  const data = buildSingleColumnChartData(stats) as { label: string; value: number }[];
  if (chartType === "pie" && stats.kind === "category") {
    return <PieLikeChart data={data} />;
  }

  return (
    <BarLikeChart
      data={data}
      type={chartType === "line" ? "line" : "bar"}
      label={chartType === "line" ? "라인 차트" : "단일 컬럼 차트"}
      orientation={chartOrientation}
    />
  );
}
