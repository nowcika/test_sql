import type { CellValue, TableData } from "../types";

export type RawCell = string | number | boolean | Date | null | undefined;
export type RawTable = RawCell[][];

function normalizeCell(value: RawCell): CellValue {
  if (value == null) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }

  const normalized = String(value).trim();
  return normalized === "" ? null : normalized;
}

function rowHasValue(row: RawCell[]): boolean {
  return row.some((cell) => normalizeCell(cell) !== null);
}

function labelForHeader(value: RawCell, columnIndex: number): string {
  const normalized = normalizeCell(value);
  if (normalized == null) {
    return `Column ${columnIndex + 1}`;
  }

  return String(normalized);
}

function slugify(label: string, columnIndex: number): string {
  const key = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");

  return key || `column_${columnIndex + 1}`;
}

function dedupeKeys(keys: string[]): string[] {
  const seen = new Map<string, number>();

  return keys.map((key) => {
    const count = seen.get(key) ?? 0;
    seen.set(key, count + 1);

    return count === 0 ? key : `${key}_${count + 1}`;
  });
}

export function normalizeTable(rawRows: RawTable, sourceName: string): TableData {
  const usableRows = rawRows.filter(rowHasValue);

  if (usableRows.length === 0) {
    throw new Error("No usable rows found.");
  }

  const columnCount = Math.max(...usableRows.map((row) => row.length));
  const [headerRow, ...dataRows] = usableRows;
  const labels = Array.from({ length: columnCount }, (_, index) =>
    labelForHeader(headerRow[index], index),
  );
  const keys = dedupeKeys(labels.map((label, index) => slugify(label, index)));

  return {
    sourceName,
    columns: labels.map((label, index) => ({
      key: keys[index],
      label,
      inferredType: "empty",
      missingCount: 0,
      uniqueCount: 0,
    })),
    rows: dataRows.map((row) =>
      Object.fromEntries(
        keys.map((key, index) => [key, normalizeCell(row[index])]),
      ),
    ),
  };
}
