import type { CellValue, MatrixStats, TableData } from "../types";
import { inferColumnTypes } from "./statistics";

function labelFor(value: CellValue, fallback: string): string {
  if (value == null || String(value).trim() === "") {
    return fallback;
  }

  return String(value);
}

function numericValue(value: CellValue): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const parsed = Number(value.replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

export function matrixToLongTable(table: TableData): TableData {
  const seriesColumn = table.columns[0];
  const xColumns = table.columns.slice(1);

  const longTable: TableData = {
    sourceName: `${table.sourceName} (matrix)`,
    columns: [
      { key: "x", label: "X", inferredType: "empty", missingCount: 0, uniqueCount: 0 },
      { key: "series", label: "Series", inferredType: "empty", missingCount: 0, uniqueCount: 0 },
      { key: "value", label: "Value", inferredType: "empty", missingCount: 0, uniqueCount: 0 },
    ],
    rows: table.rows.flatMap((row, rowIndex) => {
      const series = seriesColumn
        ? labelFor(row[seriesColumn.key], `Series ${rowIndex + 1}`)
        : `Series ${rowIndex + 1}`;

      return xColumns.map((column) => ({
        x: column.label,
        series,
        value: numericValue(row[column.key]),
      }));
    }),
  };

  return inferColumnTypes(longTable);
}

export function calculateMatrixStats(table: TableData): MatrixStats {
  const seriesColumn = table.columns[0];
  const xColumns = table.columns.slice(1);
  let valueCount = 0;
  let missingCount = 0;

  const series = table.rows.map((row, rowIndex) => {
    const label = seriesColumn
      ? labelFor(row[seriesColumn.key], `Series ${rowIndex + 1}`)
      : `Series ${rowIndex + 1}`;

    const values = xColumns.map((column) => {
      const value = numericValue(row[column.key]);
      if (value == null) {
        missingCount += 1;
      } else {
        valueCount += 1;
      }

      return { x: column.label, value };
    });

    return { label, values };
  });

  return {
    kind: "matrix",
    xLabels: xColumns.map((column) => column.label),
    series,
    valueCount,
    missingCount,
  };
}
