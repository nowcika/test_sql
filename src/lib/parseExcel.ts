import * as XLSX from "xlsx";

import type { RawTable } from "./normalizeTable";

export function parseExcelArrayBuffer(buffer: ArrayBuffer): RawTable {
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];

  if (firstSheetName == null) {
    throw new Error("Excel file has no sheets.");
  }

  return XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], {
    header: 1,
    defval: null,
  });
}

export async function parseExcelFile(file: File): Promise<RawTable> {
  return parseExcelArrayBuffer(await file.arrayBuffer());
}
