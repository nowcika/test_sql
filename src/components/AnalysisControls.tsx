import type { AnalysisMode, ColumnMeta } from "../types";

type AnalysisControlsProps = {
  columns: ColumnMeta[];
  mode: AnalysisMode;
  xKey: string;
  yKey: string;
  onModeChange: (mode: AnalysisMode) => void;
  onXKeyChange: (key: string) => void;
  onYKeyChange: (key: string) => void;
};

export function AnalysisControls({
  columns,
  mode,
  xKey,
  yKey,
  onModeChange,
  onXKeyChange,
  onYKeyChange,
}: AnalysisControlsProps) {
  return (
    <section className="controls" aria-label="분석 설정">
      <div className="segmented" role="group" aria-label="분석 모드">
        <button
          className={mode === "single" ? "active" : ""}
          type="button"
          aria-pressed={mode === "single"}
          onClick={() => onModeChange("single")}
        >
          단일 컬럼
        </button>
        <button
          className={mode === "relationship" ? "active" : ""}
          type="button"
          aria-pressed={mode === "relationship"}
          onClick={() => onModeChange("relationship")}
        >
          두 컬럼 관계
        </button>
      </div>
      <label>
        <span>{mode === "single" ? "컬럼" : "첫 번째 컬럼"}</span>
        <select
          value={xKey}
          onChange={(event) => onXKeyChange(event.target.value)}
        >
          {columns.map((column) => (
            <option key={column.key} value={column.key}>
              {column.label} ({column.inferredType})
            </option>
          ))}
        </select>
      </label>
      {mode === "relationship" ? (
        <label>
          <span>두 번째 컬럼</span>
          <select
            value={yKey}
            onChange={(event) => onYKeyChange(event.target.value)}
          >
            {columns.map((column) => (
              <option key={column.key} value={column.key}>
                {column.label} ({column.inferredType})
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </section>
  );
}
