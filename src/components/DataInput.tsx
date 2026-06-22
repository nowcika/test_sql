import { Upload } from "lucide-react";

import type { RawTable } from "../lib/normalizeTable";
import { normalizeTable } from "../lib/normalizeTable";
import { parseCsvFile } from "../lib/parseCsv";
import { parseExcelFile } from "../lib/parseExcel";
import { parsePastedTable } from "../lib/parsePaste";
import { inferColumnTypes } from "../lib/statistics";
import type { TableData } from "../types";

type DataInputProps = {
  onLoad: (table: TableData) => void;
  onError: (message: string) => void;
};

const unsupportedFileMessage = "CSV 또는 Excel(.xlsx) 파일만 업로드할 수 있습니다.";
const fileFallbackMessage = "파일을 읽는 중 문제가 발생했습니다. 파일 형식을 확인해 주세요.";
const pasteFallbackMessage = "붙여넣은 데이터를 읽는 중 문제가 발생했습니다. 표 형식을 확인해 주세요.";

async function parseFile(file: File): Promise<RawTable> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".csv")) {
    return parseCsvFile(file);
  }

  if (fileName.endsWith(".xlsx")) {
    return parseExcelFile(file);
  }

  throw new Error(unsupportedFileMessage);
}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message === unsupportedFileMessage) {
    return unsupportedFileMessage;
  }

  return fallback;
}

export function DataInput({ onLoad, onError }: DataInputProps) {
  async function handleFile(file: File) {
    try {
      const rawRows = await parseFile(file);
      const table = inferColumnTypes(normalizeTable(rawRows, file.name));
      onLoad(table);
    } catch (error) {
      onError(errorMessage(error, fileFallbackMessage));
    }
  }

  function handlePaste(text: string) {
    try {
      const table = inferColumnTypes(
        normalizeTable(parsePastedTable(text), "Pasted table"),
      );
      onLoad(table);
    } catch (error) {
      onError(errorMessage(error, pasteFallbackMessage));
    }
  }

  return (
    <section className="input-panel">
      <label className="file-drop">
        <Upload aria-hidden="true" size={22} />
        <span>CSV 또는 Excel 파일 선택</span>
        <input
          aria-label="데이터 파일 업로드"
          type="file"
          accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void handleFile(file);
            }
            event.currentTarget.value = "";
          }}
        />
      </label>
      <textarea
        aria-label="표 데이터 붙여넣기"
        className="paste-target"
        placeholder="Excel, Google Sheets, 웹 표에서 복사한 데이터를 Ctrl+V로 붙여넣으세요."
        onPaste={(event) => {
          const text = event.clipboardData.getData("text/plain");
          if (text.trim().length > 0) {
            event.preventDefault();
            handlePaste(text);
          }
        }}
      />
    </section>
  );
}
