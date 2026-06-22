export type CellValue = string | number | null;

export type ColumnType = "number" | "category" | "date" | "text" | "empty";

export type ColumnMeta = {
  key: string;
  label: string;
  inferredType: ColumnType;
  missingCount: number;
  uniqueCount: number;
};

export type TableData = {
  sourceName: string;
  columns: ColumnMeta[];
  rows: Record<string, CellValue>[];
};

export type AnalysisMode = "single" | "relationship";

export type NumericStats = {
  kind: "numeric";
  count: number;
  missingCount: number;
  sum: number;
  mean: number;
  median: number;
  min: number;
  max: number;
};

export type CategoryStats = {
  kind: "category";
  count: number;
  missingCount: number;
  uniqueCount: number;
  topValues: { value: string; count: number }[];
};

export type SingleColumnStats = NumericStats | CategoryStats;

export type NumericRelationshipStats = {
  kind: "numeric-relationship";
  pairedCount: number;
  missingPairCount: number;
  points: { x: number; y: number }[];
};

export type GroupedNumericStats = {
  kind: "grouped-numeric";
  groups: { label: string; count: number; sum: number; mean: number }[];
};

export type TwoColumnStats = NumericRelationshipStats | GroupedNumericStats;
