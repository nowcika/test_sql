import { chartTypeOptionsForStats, groupedMetricOptions, metricOptionsForStats } from "../lib/analysisOptions";
import type { ChartOrientation, ChartType, GroupedMetricKey, MetricKey, SingleColumnStats, TwoColumnStats } from "../types";

type ChartOptionsProps = {
  stats: SingleColumnStats | TwoColumnStats | null;
  chartType: ChartType;
  visibleMetrics: MetricKey[];
  groupedMetric: GroupedMetricKey;
  chartOrientation: ChartOrientation;
  onChartOrientationChange: (orientation: ChartOrientation) => void;
  onChartTypeChange: (chartType: ChartType) => void;
  onVisibleMetricsChange: (metrics: MetricKey[]) => void;
  onGroupedMetricChange: (metric: GroupedMetricKey) => void;
};

export function ChartOptions({
  stats,
  chartType,
  visibleMetrics,
  groupedMetric,
  chartOrientation,
  onChartOrientationChange,
  onChartTypeChange,
  onVisibleMetricsChange,
  onGroupedMetricChange,
}: ChartOptionsProps) {
  const chartOptions = chartTypeOptionsForStats(stats);
  const metricOptions = metricOptionsForStats(stats);
  const supportsChartOrientation = chartType === "bar" || chartType === "histogram";

  function toggleMetric(metric: MetricKey) {
    if (visibleMetrics.includes(metric)) {
      onVisibleMetricsChange(visibleMetrics.filter((candidate) => candidate !== metric));
      return;
    }

    onVisibleMetricsChange([...visibleMetrics, metric]);
  }

  if (!stats) {
    return null;
  }

  return (
    <section className="chart-options panel" aria-label="차트 및 지표 설정">
      <label>
        <span>차트 타입</span>
        <select
          aria-label="차트 타입"
          value={chartType}
          onChange={(event) => onChartTypeChange(event.target.value as ChartType)}
        >
          {chartOptions.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
      </label>


      {supportsChartOrientation ? (
        <div>
          <span className="control-label">차트 방향</span>
          <div className="segmented" role="group" aria-label="차트 방향">
            <button
              className={chartOrientation === "vertical" ? "active" : ""}
              type="button"
              aria-pressed={chartOrientation === "vertical"}
              onClick={() => onChartOrientationChange("vertical")}
            >
              세로
            </button>
            <button
              className={chartOrientation === "horizontal" ? "active" : ""}
              type="button"
              aria-pressed={chartOrientation === "horizontal"}
              onClick={() => onChartOrientationChange("horizontal")}
            >
              가로
            </button>
          </div>
        </div>
      ) : null}

      {stats.kind === "grouped-numeric" ? (
        <label>
          <span>그래프 지표</span>
          <select
            aria-label="그래프 지표"
            value={groupedMetric}
            onChange={(event) => onGroupedMetricChange(event.target.value as GroupedMetricKey)}
          >
            {groupedMetricOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <fieldset>
        <legend>표시 지표</legend>
        <div className="metric-options">
          {metricOptions.map((option) => (
            <label key={option.key} className="metric-option">
              <input
                type="checkbox"
                checked={visibleMetrics.includes(option.key)}
                onChange={() => toggleMetric(option.key)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </section>
  );
}
