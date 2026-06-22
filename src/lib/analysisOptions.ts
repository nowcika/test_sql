import type { ChartType, GroupedMetricKey, MetricKey, SingleColumnStats, TwoColumnStats } from "../types";

export type MetricOption = { key: MetricKey; label: string };
export type ChartTypeOption = { key: ChartType; label: string };

export const groupedMetricOptions: { key: GroupedMetricKey; label: string }[] = [
  { key: "mean", label: "Mean" },
  { key: "sum", label: "Sum" },
  { key: "count", label: "Count" },
  { key: "min", label: "Min" },
  { key: "max", label: "Max" },
  { key: "variance", label: "Variance" },
  { key: "standardDeviation", label: "Std dev" },
];

export function metricOptionsForStats(stats: SingleColumnStats | TwoColumnStats | null): MetricOption[] {
  if (!stats) {
    return [];
  }

  if (stats.kind === "numeric") {
    return [
      { key: "count", label: "Count" },
      { key: "missing", label: "Missing" },
      { key: "sum", label: "Sum" },
      { key: "mean", label: "Mean" },
      { key: "median", label: "Median" },
      { key: "variance", label: "Variance" },
      { key: "standardDeviation", label: "Std dev" },
      { key: "min", label: "Min" },
      { key: "max", label: "Max" },
    ];
  }

  if (stats.kind === "category") {
    return [
      { key: "count", label: "Count" },
      { key: "missing", label: "Missing" },
      { key: "unique", label: "Unique" },
      { key: "topValues", label: "Top values" },
    ];
  }

  if (stats.kind === "numeric-relationship") {
    return [
      { key: "pairedCount", label: "Pairs" },
      { key: "missingPairCount", label: "Missing pairs" },
    ];
  }

  return groupedMetricOptions.map((option) => option as MetricOption);
}

export function defaultMetricKeys(stats: SingleColumnStats | TwoColumnStats | null): MetricKey[] {
  return metricOptionsForStats(stats).map((option) => option.key);
}

export function chartTypeOptionsForStats(stats: SingleColumnStats | TwoColumnStats | null): ChartTypeOption[] {
  if (!stats) {
    return [{ key: "bar", label: "Bar" }];
  }

  if (stats.kind === "numeric") {
    return [
      { key: "bar", label: "Bar" },
      { key: "histogram", label: "Histogram" },
      { key: "line", label: "Line" },
    ];
  }

  if (stats.kind === "category") {
    return [
      { key: "bar", label: "Bar" },
      { key: "pie", label: "Pie" },
    ];
  }

  if (stats.kind === "numeric-relationship") {
    return [
      { key: "scatter", label: "Scatter" },
      { key: "line", label: "Line" },
    ];
  }

  return [
    { key: "bar", label: "Bar" },
    { key: "line", label: "Line" },
    { key: "pie", label: "Pie" },
  ];
}

export function normalizeChartType(
  stats: SingleColumnStats | TwoColumnStats | null,
  chartType: ChartType,
): ChartType {
  const options = chartTypeOptionsForStats(stats);
  return options.some((option) => option.key === chartType) ? chartType : options[0].key;
}
