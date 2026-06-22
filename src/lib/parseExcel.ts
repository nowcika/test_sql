import * as XLSX from "xlsx";

import type { RawTable } from "./normalizeTable";

export type ExcelSheetTable = {
  sheetName: string;
  rows: RawTable;
};

function sheetToRows(sheet: XLSX.WorkSheet): RawTable {
  return XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: null,
  });
}

export function parseExcelArrayBuffer(buffer: ArrayBuffer): RawTable {
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];

  if (firstSheetName == null) {
    throw new Error("Excel file has no sheets.");
  }

  return sheetToRows(workbook.Sheets[firstSheetName]);
}

export function parseExcelSheetsFromArrayBuffer(buffer: ArrayBuffer): ExcelSheetTable[] {
  const workbook = XLSX.read(buffer, { type: "array" });

  if (workbook.SheetNames.length === 0) {
    throw new Error("Excel file has no sheets.");
  }

  return workbook.SheetNames.map((sheetName) => ({
    sheetName,
    rows: sheetToRows(workbook.Sheets[sheetName]),
  }));
}

export async function parseExcelFile(file: File): Promise<RawTable> {
  return parseExcelArrayBuffer(await file.arrayBuffer());
}

export async function parseExcelSheets(file: File): Promise<ExcelSheetTable[]> {
  return parseExcelSheetsFromArrayBuffer(await file.arrayBuffer());
}
