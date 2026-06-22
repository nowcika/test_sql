import { useMemo, useRef, useState } from "react";

import "./styles.css";
import { AnalysisControls } from "./components/AnalysisControls";
import { ChartPanel } from "./components/ChartPanel";
import { DataInput } from "./components/DataInput";
import { DataPreview } from "./components/DataPreview";
import { DatasetSummary } from "./components/DatasetSummary";
import { DatasetTabs, type DatasetTab } from "./components/DatasetTabs";
import { ErrorMessage } from "./components/ErrorMessage";
import { StatsPanel } from "./components/StatsPanel";
import {
  calculateSingleColumnStats,
  calculateTwoColumnStats,
} from "./lib/statistics";
import type { AnalysisMode, TableData } from "./types";

type AnalysisSettings = {
  mode: AnalysisMode;
  xKey: string;
  yKey: string;
};

function makeTab(id: string, table: TableData): DatasetTab {
  return { id, table };
}

function initialSettings(table: TableData): AnalysisSettings {
  return {
    mode: "single",
    xKey: table.columns[0]?.key ?? "",
    yKey: table.columns[1]?.key ?? table.columns[0]?.key ?? "",
  };
}

export default function App() {
  const [tabs, setTabs] = useState<DatasetTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [settingsByTabId, setSettingsByTabId] = useState<Record<string, AnalysisSettings>>({});
  const [error, setError] = useState<string | null>(null);
  const nextTabId = useRef(1);

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? null;
  const table = activeTab?.table ?? null;
  const settings = activeTabId ? settingsByTabId[activeTabId] : null;
  const mode = settings?.mode ?? "single";
  const xKey = settings?.xKey ?? "";
  const yKey = settings?.yKey ?? "";

  function updateActiveSettings(update: (settings: AnalysisSettings) => AnalysisSettings) {
    if (!activeTabId || !settings) {
      return;
    }

    setSettingsByTabId((currentSettings) => ({
      ...currentSettings,
      [activeTabId]: update(settings),
    }));
  }

  function handleLoad(nextTables: TableData[]) {
    if (nextTables.length === 0) {
      return;
    }

    setError(null);
    setTabs((currentTabs) => {
      const pastedCount = currentTabs.filter((tab) =>
        tab.table.sourceName.startsWith("Pasted table"),
      ).length;
      let nextPastedNumber = pastedCount + 1;

      const newTabs = nextTables.map((tableData) => {
        const sourceName =
          tableData.sourceName === "Pasted table"
            ? `Pasted table ${nextPastedNumber++}`
            : tableData.sourceName;
        return makeTab(`tab-${nextTabId.current++}`, {
          ...tableData,
          sourceName,
        });
      });

      setSettingsByTabId((currentSettings) => {
        const nextSettings = { ...currentSettings };
        newTabs.forEach((tab) => {
          nextSettings[tab.id] = initialSettings(tab.table);
        });
        return nextSettings;
      });
      setActiveTabId(newTabs[newTabs.length - 1].id);
      return [...currentTabs, ...newTabs];
    });
  }

  function handleCloseTab(tabId: string) {
    setTabs((currentTabs) => {
      const closingIndex = currentTabs.findIndex((tab) => tab.id === tabId);
      const nextTabs = currentTabs.filter((tab) => tab.id !== tabId);

      setSettingsByTabId((currentSettings) => {
        const { [tabId]: _removed, ...nextSettings } = currentSettings;
        return nextSettings;
      });

      if (activeTabId === tabId) {
        const fallbackTab = nextTabs[Math.min(closingIndex, nextTabs.length - 1)] ?? null;
        setActiveTabId(fallbackTab?.id ?? null);
      }

      return nextTabs;
    });
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
            <p>CSV, Excel, Ctrl+V로 붙여넣은 데이터를 탭으로 열어 분석하세요.</p>
          </div>
        </header>

        <DataInput onLoad={handleLoad} onError={setError} />
        <ErrorMessage message={error} />
        <DatasetTabs
          tabs={tabs}
          activeTabId={activeTabId}
          onSelect={setActiveTabId}
          onClose={handleCloseTab}
        />

        {table ? (
          <>
            <DatasetSummary table={table} />
            <AnalysisControls
              columns={table.columns}
              mode={mode}
              xKey={xKey}
              yKey={yKey}
              onModeChange={(nextMode) =>
                updateActiveSettings((currentSettings) => ({
                  ...currentSettings,
                  mode: nextMode,
                }))
              }
              onXKeyChange={(nextXKey) =>
                updateActiveSettings((currentSettings) => ({
                  ...currentSettings,
                  xKey: nextXKey,
                }))
              }
              onYKeyChange={(nextYKey) =>
                updateActiveSettings((currentSettings) => ({
                  ...currentSettings,
                  yKey: nextYKey,
                }))
              }
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
