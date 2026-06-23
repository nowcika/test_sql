import type { AnalysisMode, ColumnMeta, DataOrientation } from "../types";

type AnalysisControlsProps = {
  columns: ColumnMeta[];
  mode: AnalysisMode;
  xKey: string;
  yKey: string;
  dataOrientation: DataOrientation;
  onDataOrientationChange: (orientation: DataOrientation) => void;
  onModeChange: (mode: AnalysisMode) => void;
  onXKeyChange: (key: string) => void;
  onYKeyChange: (key: string) => void;
};

export function AnalysisControls({
  columns,
  mode,
  xKey,
  yKey,
  dataOrientation,
  onDataOrientationChange,
  onModeChange,
  onXKeyChange,
  onYKeyChange,
}: AnalysisControlsProps) {
  return (
    <section className="controls" aria-label="분석 설정">
      <div className="segmented" role="group" aria-label="데이터 방향">
        <button
          className={dataOrientation === "original" ? "active" : ""}
          type="button"
          aria-pressed={dataOrientation === "original"}
          onClick={() => onDataOrientationChange("original")}
        >
          원본
        </button>
        <button
          className={dataOrientation === "transposed" ? "active" : ""}
          type="button"
          aria-pressed={dataOrientation === "transposed"}
          onClick={() => onDataOrientationChange("transposed")}
        >
          전치
        </button>
        <button
          className={dataOrientation === "matrix" ? "active" : ""}
          type="button"
          aria-pressed={dataOrientation === "matrix"}
          onClick={() => onDataOrientationChange("matrix")}
        >
          매트릭스
        </button>
      </div>

      {dataOrientation === "matrix" ? null : (
        <>
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
            <select value={xKey} onChange={(event) => onXKeyChange(event.target.value)}>
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
              <select value={yKey} onChange={(event) => onYKeyChange(event.target.value)}>
                {columns.map((column) => (
                  <option key={column.key} value={column.key}>
                    {column.label} ({column.inferredType})
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </>
      )}
    </section>
  );
}
