import type { CellValue, TableData } from "../types";
import { inferColumnTypes } from "./statistics";

function valueLabel(value: CellValue, rowIndex: number): string {
  if (value == null || String(value).trim() === "") {
    return `Row ${rowIndex + 2}`;
  }

  return String(value);
}

function slugify(label: string, index: number): string {
  const key = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");

  return key || `column_${index + 1}`;
}

function dedupeKeys(keys: string[]): string[] {
  const seen = new Map<string, number>();

  return keys.map((key) => {
    const count = seen.get(key) ?? 0;
    seen.set(key, count + 1);

    return count === 0 ? key : `${key}_${count + 1}`;
  });
}

export function transposeTable(table: TableData): TableData {
  const firstColumn = table.columns[0];
  if (!firstColumn) {
    return table;
  }

  const labels = [
    firstColumn.label,
    ...table.rows.map((row, rowIndex) => valueLabel(row[firstColumn.key], rowIndex)),
  ];
  const keys = dedupeKeys(labels.map((label, index) => slugify(label, index)));
  const [labelKey, ...valueKeys] = keys;

  const transposed: TableData = {
    sourceName: `${table.sourceName} (transposed)`,
    columns: labels.map((label, index) => ({
      key: keys[index],
      label,
      inferredType: "empty",
      missingCount: 0,
      uniqueCount: 0,
    })),
    rows: table.columns.slice(1).map((column) => ({
      [labelKey]: column.label,
      ...Object.fromEntries(
        table.rows.map((row, rowIndex) => [valueKeys[rowIndex], row[column.key] ?? null]),
      ),
    })),
  };

  return inferColumnTypes(transposed);
}
