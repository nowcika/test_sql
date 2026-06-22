import type { SingleColumnStats, TwoColumnStats } from "../types";

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

export const buildTwoColumnChartData = (stats: TwoColumnStats) => {
  if (stats.kind === "numeric-relationship") {
    return stats.points;
  }

  return stats.groups.map((group) => ({
    label: group.label,
    mean: group.mean,
    sum: group.sum,
    count: group.count,
  }));
};
