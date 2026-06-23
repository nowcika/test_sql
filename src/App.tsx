import { useEffect, useMemo, useRef, useState } from "react";

import "./styles.css";
import { AnalysisControls } from "./components/AnalysisControls";
import { ChartPanel } from "./components/ChartPanel";
import { ChartOptions } from "./components/ChartOptions";
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
import { loadDefaultDatasets } from "./lib/defaultDatasets";
import { normalizeChartType } from "./lib/analysisOptions";
import { transposeTable } from "./lib/transposeTable";
import type {
  AnalysisMode,
  ChartOrientation,
  ChartType,
  DataOrientation,
  GroupedMetricKey,
  MetricKey,
  TableData,
} from "./types";

type AnalysisSettings = {
  mode: AnalysisMode;
  xKey: string;
  yKey: string;
  chartType: ChartType;
  visibleMetrics: MetricKey[];
  groupedMetric: GroupedMetricKey;
  dataOrientation: DataOrientation;
  chartOrientation: ChartOrientation;
};

const allMetricKeys: MetricKey[] = [
  "count",
  "missing",
  "sum",
  "mean",
  "median",
  "variance",
  "standardDeviation",
  "min",
  "max",
  "unique",
  "topValues",
  "pairedCount",
  "missingPairCount",
];

function makeTab(id: string, table: TableData): DatasetTab {
  return { id, table };
}

function initialSettings(table: TableData): AnalysisSettings {
  return {
    mode: "single",
    xKey: table.columns[0]?.key ?? "",
    yKey: table.columns[1]?.key ?? table.columns[0]?.key ?? "",
    chartType: "bar",
    visibleMetrics: allMetricKeys,
    groupedMetric: "mean",
    dataOrientation: "original",
    chartOrientation: "vertical",
  };
}

export default function App() {
  const [tabs, setTabs] = useState<DatasetTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [settingsByTabId, setSettingsByTabId] = useState<Record<string, AnalysisSettings>>({});
  const [error, setError] = useState<string | null>(null);
  const nextTabId = useRef(1);
  const defaultDatasetsLoaded = useRef(false);

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? null;
  const table = activeTab?.table ?? null;
  const settings = activeTabId ? settingsByTabId[activeTabId] : null;
  const mode = settings?.mode ?? "single";
  const xKey = settings?.xKey ?? "";
  const yKey = settings?.yKey ?? "";
  const groupedMetric = settings?.groupedMetric ?? "mean";
  const dataOrientation = settings?.dataOrientation ?? "original";
  const chartOrientation = settings?.chartOrientation ?? "vertical";

  function updateActiveSettings(update: (settings: AnalysisSettings) => AnalysisSettings) {
    if (!activeTabId || !settings) {
      return;
    }

    setSettingsByTabId((currentSettings) => ({
      ...currentSettings,
      [activeTabId]: update(settings),
    }));
  }


  function handleDataOrientationChange(nextOrientation: DataOrientation) {
    if (!activeTabId || !activeTab || !settings) {
      return;
    }

    const nextTable = nextOrientation === "transposed"
      ? transposeTable(activeTab.table)
      : activeTab.table;
    const nextColumnKeys = new Set(nextTable.columns.map((column) => column.key));

    setSettingsByTabId((currentSettings) => ({
      ...currentSettings,
      [activeTabId]: {
        ...settings,
        dataOrientation: nextOrientation,
        xKey: nextColumnKeys.has(settings.xKey)
          ? settings.xKey
          : nextTable.columns[0]?.key ?? "",
        yKey: nextColumnKeys.has(settings.yKey)
          ? settings.yKey
          : nextTable.columns[1]?.key ?? nextTable.columns[0]?.key ?? "",
      },
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

  useEffect(() => {
    if (defaultDatasetsLoaded.current) {
      return;
    }

    defaultDatasetsLoaded.current = true;
    void loadDefaultDatasets()
      .then((defaultTables) => {
        handleLoad(defaultTables);
      })
      .catch(() => {
        setError("기본 CSV 데이터를 불러오지 못했습니다.");
      });
  }, []);

  const effectiveTable = useMemo(() => {
    if (!table) {
      return null;
    }

    return dataOrientation === "transposed" ? transposeTable(table) : table;
  }, [dataOrientation, table]);

  const stats = useMemo(() => {
    if (!effectiveTable || !xKey) {
      return null;
    }

    try {
      if (mode === "single") {
        return calculateSingleColumnStats(effectiveTable, xKey);
      }

      if (!yKey) {
        return null;
      }

      return calculateTwoColumnStats(effectiveTable, xKey, yKey);
    } catch {
      return null;
    }
  }, [effectiveTable, mode, xKey, yKey]);

  const chartType = stats ? normalizeChartType(stats, settings?.chartType ?? "bar") : "bar";
  const visibleMetrics = settings?.visibleMetrics ?? allMetricKeys;

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

        {effectiveTable ? (
          <>
            <DatasetSummary table={effectiveTable} />
            <AnalysisControls
              columns={effectiveTable.columns}
              mode={mode}
              xKey={xKey}
              yKey={yKey}
              dataOrientation={dataOrientation}
              onDataOrientationChange={handleDataOrientationChange}
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
            <ChartOptions
              stats={stats}
              chartType={chartType}
              visibleMetrics={visibleMetrics}
              groupedMetric={groupedMetric}
              chartOrientation={chartOrientation}
              onChartOrientationChange={(nextChartOrientation) =>
                updateActiveSettings((currentSettings) => ({
                  ...currentSettings,
                  chartOrientation: nextChartOrientation,
                }))
              }
              onChartTypeChange={(nextChartType) =>
                updateActiveSettings((currentSettings) => ({
                  ...currentSettings,
                  chartType: nextChartType,
                }))
              }
              onVisibleMetricsChange={(nextVisibleMetrics) =>
                updateActiveSettings((currentSettings) => ({
                  ...currentSettings,
                  visibleMetrics: nextVisibleMetrics,
                }))
              }
              onGroupedMetricChange={(nextGroupedMetric) =>
                updateActiveSettings((currentSettings) => ({
                  ...currentSettings,
                  groupedMetric: nextGroupedMetric,
                }))
              }
            />
            <section className="analysis-grid">
              <StatsPanel stats={stats} visibleMetrics={visibleMetrics} />
              <ChartPanel
                stats={stats}
                chartType={chartType}
                groupedMetric={groupedMetric}
                chartOrientation={chartOrientation}
              />
            </section>
            <DataPreview table={effectiveTable} />
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
