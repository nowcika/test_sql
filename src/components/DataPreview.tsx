import type { TableData } from "../types";

type DataPreviewProps = {
  table: TableData;
};

export function DataPreview({ table }: DataPreviewProps) {
  const rows = table.rows.slice(0, 100);

  return (
    <section className="preview panel">
      <h2>Preview</h2>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {table.columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {table.columns.map((column) => (
                  <td key={column.key}>{row[column.key] ?? ""}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
