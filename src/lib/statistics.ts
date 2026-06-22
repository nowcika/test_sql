import type {
  CellValue,
  ColumnMeta,
  ColumnType,
  GroupedNumericStats,
  NumericRelationshipStats,
  NumericStats,
  SingleColumnStats,
  TableData,
  TwoColumnStats,
} from "../types";

const isMissing = (value: CellValue): boolean =>
  value === null || (typeof value === "string" && value.trim() === "");

const asNumber = (value: CellValue): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const parsed = Number(value.replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : null;
};

const variance = (values: number[], mean: number): number =>
  values.reduce((total, value) => total + (value - mean) ** 2, 0) / values.length;

const buildHistogramBins = (values: number[], min: number, max: number) => {
  if (min === max) {
    return [{ label: String(min), count: values.length }];
  }

  const bucketCount = Math.min(10, Math.ceil(Math.sqrt(values.length)));
  const width = (max - min) / bucketCount;
  const buckets = Array.from({ length: bucketCount }, (_, index) => ({
    start: min + width * index,
    end: min + width * (index + 1),
    count: 0,
  }));

  for (const value of values) {
    const bucketIndex = Math.min(bucketCount - 1, Math.floor((value - min) / width));
    buckets[bucketIndex].count += 1;
  }

  return buckets.map((bucket) => ({
    label: `${bucket.start.toLocaleString(undefined, { maximumFractionDigits: 2 })}-${bucket.end.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
    count: bucket.count,
  }));
};

const median = (values: number[]): number => {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 1) {
    return sorted[middle];
  }

  return (sorted[middle - 1] + sorted[middle]) / 2;
};

const findColumn = (table: TableData, key: string): ColumnMeta => {
  const column = table.columns.find((candidate) => candidate.key === key);
  if (!column) {
    throw new Error(`Column not found: ${key}`);
  }
  return column;
};

const valueLabel = (value: CellValue): string => String(value);

export const inferColumnTypes = (table: TableData): TableData => ({
  ...table,
  columns: table.columns.map((column) => {
    const values = table.rows.map((row) => row[column.key]);
    const nonMissing = values.filter((value) => !isMissing(value));
    const missingCount = values.length - nonMissing.length;
    const uniqueCount = new Set(nonMissing.map(valueLabel)).size;
    const inferredType: ColumnType =
      nonMissing.length === 0
        ? "empty"
        : nonMissing.every((value) => asNumber(value) !== null)
          ? "number"
          : uniqueCount <= Math.max(20, nonMissing.length * 0.5)
            ? "category"
            : "text";

    return {
      ...column,
      inferredType,
      missingCount,
      uniqueCount,
    };
  }),
});

export const calculateSingleColumnStats = (
  table: TableData,
  columnKey: string,
): SingleColumnStats => {
  const column = findColumn(table, columnKey);
  const values = table.rows.map((row) => row[column.key]);
  const missingCount = values.filter(isMissing).length;

  if (column.inferredType === "number") {
    const numericValues = values
      .map((value) => asNumber(value))
      .filter((value): value is number => value !== null);

    if (numericValues.length === 0) {
      throw new Error(`No numeric values in column: ${columnKey}`);
    }

    let sum = 0;
    let min = numericValues[0];
    let max = numericValues[0];

    for (const value of numericValues) {
      sum += value;
      if (value < min) {
        min = value;
      }
      if (value > max) {
        max = value;
      }
    }

    const mean = sum / numericValues.length;
    const valueVariance = variance(numericValues, mean);

    const stats: NumericStats = {
      kind: "numeric",
      count: numericValues.length,
      missingCount,
      sum,
      mean,
      median: median(numericValues),
      variance: valueVariance,
      standardDeviation: Math.sqrt(valueVariance),
      min,
      max,
      histogramBins: buildHistogramBins(numericValues, min, max),
    };
    return stats;
  }

  const counts = new Map<string, number>();
  for (const value of values) {
    if (!isMissing(value)) {
      const label = valueLabel(value);
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
  }

  const topValues = [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((left, right) => right.count - left.count || left.value.localeCompare(right.value))
    .slice(0, 10);

  return {
    kind: "category",
    count: values.length - missingCount,
    missingCount,
    uniqueCount: counts.size,
    topValues,
  };
};

export const calculateTwoColumnStats = (
  table: TableData,
  firstColumnKey: string,
  secondColumnKey: string,
): TwoColumnStats => {
  const firstColumn = findColumn(table, firstColumnKey);
  const secondColumn = findColumn(table, secondColumnKey);

  if (firstColumn.inferredType === "number" && secondColumn.inferredType === "number") {
    const points: NumericRelationshipStats["points"] = [];
    let missingPairCount = 0;

    for (const row of table.rows) {
      const x = asNumber(row[firstColumn.key]);
      const y = asNumber(row[secondColumn.key]);

      if (x === null || y === null) {
        missingPairCount += 1;
      } else {
        points.push({ x, y });
      }
    }

    return {
      kind: "numeric-relationship",
      pairedCount: points.length,
      missingPairCount,
      points,
    };
  }

  const categoryColumn = firstColumn.inferredType === "number" ? secondColumn : firstColumn;
  const numericColumn = firstColumn.inferredType === "number" ? firstColumn : secondColumn;
  const groups = new Map<string, { label: string; values: number[] }>();

  for (const row of table.rows) {
    const categoryValue = row[categoryColumn.key];
    const numericValue = asNumber(row[numericColumn.key]);

    if (isMissing(categoryValue) || numericValue === null) {
      continue;
    }

    const label = valueLabel(categoryValue);
    const group = groups.get(label) ?? { label, values: [] };
    group.values.push(numericValue);
    groups.set(label, group);
  }

  const groupedStats: GroupedNumericStats = {
    kind: "grouped-numeric",
    groups: [...groups.values()]
      .map((group) => {
        const sum = group.values.reduce((total, value) => total + value, 0);
        const mean = sum / group.values.length;
        const valueVariance = variance(group.values, mean);

        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;
        for (const value of group.values) {
          min = Math.min(min, value);
          max = Math.max(max, value);
        }

        return {
          label: group.label,
          count: group.values.length,
          sum,
          mean,
          min,
          max,
          variance: valueVariance,
          standardDeviation: Math.sqrt(valueVariance),
        };
      })
      .sort((left, right) => right.mean - left.mean || left.label.localeCompare(right.label))
      .slice(0, 20),
  };

  return groupedStats;
};
