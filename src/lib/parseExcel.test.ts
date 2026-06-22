import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";

import { parseExcelArrayBuffer } from "./parseExcel";

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
});
