import { useMemo, useState } from "react";

import "./styles.css";
import { AnalysisControls } from "./components/AnalysisControls";
import { ChartPanel } from "./components/ChartPanel";
import { DataInput } from "./components/DataInput";
import { DataPreview } from "./components/DataPreview";
import { DatasetSummary } from "./components/DatasetSummary";
import { ErrorMessage } from "./components/ErrorMessage";
import { StatsPanel } from "./components/StatsPanel";
import {
  calculateSingleColumnStats,
  calculateTwoColumnStats,
} from "./lib/statistics";
import type { AnalysisMode, TableData } from "./types";

export default function App() {
  const [table, setTable] = useState<TableData | null>(null);
  const [mode, setMode] = useState<AnalysisMode>("single");
  const [xKey, setXKey] = useState("");
  const [yKey, setYKey] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleLoad(nextTable: TableData) {
    setTable(nextTable);
    setError(null);
    setXKey(nextTable.columns[0]?.key ?? "");
    setYKey(nextTable.columns[1]?.key ?? nextTable.columns[0]?.key ?? "");
  }

  const stats = useMemo(() => {
    if (!table || !xKey) {
      return null;
    }

    try {
      if (mode === "single") {
        return calculateSingleColumnStats(table, xKey);
      }

      if (!yKey) {
        return null;
      }

      return calculateTwoColumnStats(table, xKey, yKey);
    } catch {
      return null;
    }
  }, [mode, table, xKey, yKey]);

  return (
    <main className="app-shell">
      <section className="workspace">
        <header className="top-bar">
          <div>
            <h1>Data Dashboard</h1>
            <p>CSV, Excel, Ctrl+V로 붙여넣은 데이터를 빠르게 분석하세요.</p>
          </div>
        </header>

        <DataInput onLoad={handleLoad} onError={setError} />
        <ErrorMessage message={error} />

        {table ? (
          <>
            <DatasetSummary table={table} />
            <AnalysisControls
              columns={table.columns}
              mode={mode}
              xKey={xKey}
              yKey={yKey}
              onModeChange={setMode}
              onXKeyChange={setXKey}
              onYKeyChange={setYKey}
            />
            <section className="analysis-grid">
              <StatsPanel stats={stats} />
              <ChartPanel stats={stats} />
            </section>
            <DataPreview table={table} />
          </>
        ) : (
          <section className="panel empty-state">
            CSV, Excel 파일을 업로드하거나 표 데이터를 붙여넣으면 대시보드가 표시됩니다.
          </section>
        )}
      </section>
    </main>
  );
}
