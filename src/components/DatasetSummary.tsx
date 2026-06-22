import type { TableData } from "../types";

type DatasetSummaryProps = {
  table: TableData;
};

export function DatasetSummary({ table }: DatasetSummaryProps) {
  const missingValues = table.columns.reduce(
    (total, column) => total + column.missingCount,
    0,
  );

  return (
    <section className="summary-grid" aria-label="데이터 요약">
      <div>
        <span>Source</span>
        <strong>{table.sourceName}</strong>
      </div>
      <div>
        <span>Rows</span>
        <strong>{table.rows.length.toLocaleString()}</strong>
      </div>
      <div>
        <span>Columns</span>
        <strong>{table.columns.length.toLocaleString()}</strong>
      </div>
      <div>
        <span>Missing</span>
        <strong>{missingValues.toLocaleString()}</strong>
      </div>
    </section>
  );
}
