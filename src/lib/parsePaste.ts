import type { RawTable } from "./normalizeTable";

export function parsePastedTable(text: string): RawTable {
  if (text.trim() === "") {
    throw new Error("Pasted data is empty.");
  }

  return text
    .replace(/(?:\r?\n)+$/, "")
    .split(/\r?\n/)
    .map((row) => row.split("\t"));
}
