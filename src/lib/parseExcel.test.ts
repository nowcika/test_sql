import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";

import { parseExcelArrayBuffer, parseExcelSheetsFromArrayBuffer } from "./parseExcel";

describe("parseExcelArrayBuffer", () => {
  it("reads rows from the first worksheet", () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([
      ["Name", "Sales"],
      ["A", 10],
    ]);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

    expect(parseExcelArrayBuffer(buffer)).toEqual([
      ["Name", "Sales"],
      ["A", 10],
    ]);
  });

  it("reads every worksheet with its sheet name", () => {
    const workbook = XLSX.utils.book_new();
    const sales = XLSX.utils.aoa_to_sheet([
      ["Region", "Sales"],
      ["East", 10],
    ]);
    const inventory = XLSX.utils.aoa_to_sheet([
      ["Item", "Stock"],
      ["A", 4],
    ]);

    XLSX.utils.book_append_sheet(workbook, sales, "Sales");
    XLSX.utils.book_append_sheet(workbook, inventory, "Inventory");

    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

    expect(parseExcelSheetsFromArrayBuffer(buffer)).toEqual([
      {
        sheetName: "Sales",
        rows: [
          ["Region", "Sales"],
          ["East", 10],
        ],
      },
      {
        sheetName: "Inventory",
        rows: [
          ["Item", "Stock"],
          ["A", 4],
        ],
      },
    ]);
  });
});
