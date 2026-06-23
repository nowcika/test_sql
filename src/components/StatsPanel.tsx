import type { AnalysisStats, MetricKey } from "../types";

type StatsPanelProps = {
  stats: AnalysisStats | null;
  visibleMetrics?: MetricKey[];
};

function formatNumber(value: number): string {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  });
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{formatNumber(value)}</strong>
    </div>
  );
}

function isVisible(visibleMetrics: MetricKey[] | undefined, metric: MetricKey): boolean {
  return visibleMetrics == null || visibleMetrics.includes(metric);
}

export function StatsPanel({ stats, visibleMetrics }: StatsPanelProps) {
  if (!stats) {
    return <section className="panel">분석할 컬럼을 선택하세요.</section>;
  }

  if (stats.kind === "numeric") {
    return (
      <section className="panel stats-grid" aria-label="숫자 통계">
        {isVisible(visibleMetrics, "count") ? <StatItem label="Count" value={stats.count} /> : null}
        {isVisible(visibleMetrics, "missing") ? <StatItem label="Missing" value={stats.missingCount} /> : null}
        {isVisible(visibleMetrics, "sum") ? <StatItem label="Sum" value={stats.sum} /> : null}
        {isVisible(visibleMetrics, "mean") ? <StatItem label="Mean" value={stats.mean} /> : null}
        {isVisible(visibleMetrics, "median") ? <StatItem label="Median" value={stats.median} /> : null}
        {isVisible(visibleMetrics, "variance") ? <StatItem label="Variance" value={stats.variance} /> : null}
        {isVisible(visibleMetrics, "standardDeviation") ? <StatItem label="Std dev" value={stats.standardDeviation} /> : null}
        {isVisible(visibleMetrics, "min") ? <StatItem label="Min" value={stats.min} /> : null}
        {isVisible(visibleMetrics, "max") ? <StatItem label="Max" value={stats.max} /> : null}
      </section>
    );
  }

  if (stats.kind === "category") {
    return (
      <section className="panel" aria-label="범주 통계">
        <div className="stats-grid">
          {isVisible(visibleMetrics, "count") ? <StatItem label="Count" value={stats.count} /> : null}
          {isVisible(visibleMetrics, "missing") ? <StatItem label="Missing" value={stats.missingCount} /> : null}
          {isVisible(visibleMetrics, "unique") ? <StatItem label="Unique" value={stats.uniqueCount} /> : null}
        </div>
        {isVisible(visibleMetrics, "topValues") ? (
          <ul className="rank-list">
            {stats.topValues.map((entry) => (
              <li key={entry.value}>
                <span>{entry.value}</span>
                <strong>{formatNumber(entry.count)}</strong>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    );
  }

  if (stats.kind === "matrix") {
    return (
      <section className="panel stats-grid" aria-label="매트릭스 통계">
        {isVisible(visibleMetrics, "unique") ? <StatItem label="Series" value={stats.series.length} /> : null}
        {isVisible(visibleMetrics, "count") ? <StatItem label="X values" value={stats.xLabels.length} /> : null}
        {isVisible(visibleMetrics, "count") ? <StatItem label="Values" value={stats.valueCount} /> : null}
        {isVisible(visibleMetrics, "missing") ? <StatItem label="Missing" value={stats.missingCount} /> : null}
      </section>
    );
  }

  if (stats.kind === "numeric-relationship") {
    return (
      <section className="panel stats-grid" aria-label="숫자 관계 통계">
        {isVisible(visibleMetrics, "pairedCount") ? <StatItem label="Pairs" value={stats.pairedCount} /> : null}
        {isVisible(visibleMetrics, "missingPairCount") ? <StatItem label="Missing pairs" value={stats.missingPairCount} /> : null}
      </section>
    );
  }

  return (
    <section className="panel" aria-label="그룹별 숫자 통계">
      <ul className="rank-list">
        {stats.groups.map((group) => (
          <li key={group.label}>
            <span>{group.label}</span>
            <strong>
              {[
                isVisible(visibleMetrics, "mean") ? `Mean ${formatNumber(group.mean)}` : null,
                isVisible(visibleMetrics, "sum") ? `Sum ${formatNumber(group.sum)}` : null,
                isVisible(visibleMetrics, "count") ? `Count ${formatNumber(group.count)}` : null,
                isVisible(visibleMetrics, "min") ? `Min ${formatNumber(group.min)}` : null,
                isVisible(visibleMetrics, "max") ? `Max ${formatNumber(group.max)}` : null,
                isVisible(visibleMetrics, "variance") ? `Variance ${formatNumber(group.variance)}` : null,
                isVisible(visibleMetrics, "standardDeviation") ? `Std dev ${formatNumber(group.standardDeviation)}` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
