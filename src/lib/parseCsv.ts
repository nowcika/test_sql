import Papa from "papaparse";

import type { RawCell, RawTable } from "./normalizeTable";

function normalizeCsvCell(value: unknown): RawCell {
  return value === "" ? null : (value as RawCell);
}

function normalizeCsvRows(rows: unknown[][]): RawTable {
  return rows.map((row) => row.map(normalizeCsvCell));
}

export function parseCsvText(text: string): RawTable {
  const result = Papa.parse<unknown[]>(text, {
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    throw new Error(result.errors[0].message);
  }

  return normalizeCsvRows(result.data);
}

export async function parseCsvFile(file: File): Promise<RawTable> {
  return parseCsvText(await file.text());
}
