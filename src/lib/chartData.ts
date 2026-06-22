import type { GroupedMetricKey, NumericStats, SingleColumnStats, TwoColumnStats } from "../types";

export const buildSingleColumnChartData = (stats: SingleColumnStats) => {
  if (stats.kind === "category") {
    return stats.topValues.map((item) => ({
      label: item.value,
      value: item.count,
    }));
  }

  return [
    { label: "Min", value: stats.min },
    { label: "Median", value: stats.median },
    { label: "Mean", value: stats.mean },
    { label: "Max", value: stats.max },
  ];
};

export const buildHistogramData = (stats: NumericStats) =>
  stats.histogramBins.map((bin) => ({
    label: bin.label,
    value: bin.count,
  }));

export const buildTwoColumnChartData = (
  stats: TwoColumnStats,
  groupedMetric: GroupedMetricKey = "mean",
) => {
  if (stats.kind === "numeric-relationship") {
    return stats.points;
  }

  return stats.groups.map((group) => ({
    label: group.label,
    value: group[groupedMetric],
    mean: group.mean,
    sum: group.sum,
    count: group.count,
    min: group.min,
    max: group.max,
    variance: group.variance,
    standardDeviation: group.standardDeviation,
  }));
};
