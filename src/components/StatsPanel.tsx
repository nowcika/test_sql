import type { SingleColumnStats, TwoColumnStats } from "../types";

type StatsPanelProps = {
  stats: SingleColumnStats | TwoColumnStats | null;
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

export function StatsPanel({ stats }: StatsPanelProps) {
  if (!stats) {
    return <section className="panel">분석할 컬럼을 선택하세요.</section>;
  }

  if (stats.kind === "numeric") {
    return (
      <section className="panel stats-grid" aria-label="숫자 통계">
        <StatItem label="Count" value={stats.count} />
        <StatItem label="Missing" value={stats.missingCount} />
        <StatItem label="Sum" value={stats.sum} />
        <StatItem label="Mean" value={stats.mean} />
        <StatItem label="Median" value={stats.median} />
        <StatItem label="Min" value={stats.min} />
        <StatItem label="Max" value={stats.max} />
      </section>
    );
  }

  if (stats.kind === "category") {
    return (
      <section className="panel" aria-label="범주 통계">
        <div className="stats-grid">
          <StatItem label="Count" value={stats.count} />
          <StatItem label="Missing" value={stats.missingCount} />
          <StatItem label="Unique" value={stats.uniqueCount} />
        </div>
        <ul className="rank-list">
          {stats.topValues.map((entry) => (
            <li key={entry.value}>
              <span>{entry.value}</span>
              <strong>{formatNumber(entry.count)}</strong>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (stats.kind === "numeric-relationship") {
    return (
      <section className="panel stats-grid" aria-label="숫자 관계 통계">
        <StatItem label="Pairs" value={stats.pairedCount} />
        <StatItem label="Missing pairs" value={stats.missingPairCount} />
      </section>
    );
  }

  return (
    <section className="panel" aria-label="그룹별 숫자 통계">
      <ul className="rank-list">
        {stats.groups.map((group) => (
          <li key={group.label}>
            <span>{group.label}</span>
            <strong>{formatNumber(group.mean)}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
