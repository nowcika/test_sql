# Data Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React/Vite browser app that loads CSV, Excel `.xlsx`, or Ctrl+V pasted table data and shows selectable statistics, charts, and a data preview.

**Architecture:** The app is a client-only single-page React app. Input parsing, table normalization, statistics, and chart-data generation live in focused utility modules so the UI does not depend on the source of the data. The first version stores loaded data only in browser memory and leaves backend or MySQL integration as future work.

**Tech Stack:** React, Vite, TypeScript, Vitest, Testing Library, Papa Parse, SheetJS `xlsx`, Recharts, CSS modules or plain CSS.

---

## File Structure

- Create `package.json`: project scripts and dependencies.
- Create `index.html`: Vite app shell.
- Create `vite.config.ts`: Vite and Vitest configuration.
- Create `tsconfig.json`: TypeScript configuration.
- Create `src/main.tsx`: React entry point.
- Create `src/App.tsx`: top-level state and screen composition.
- Create `src/styles.css`: global layout and component styling.
- Create `src/types.ts`: shared table, stats, and chart types.
- Create `src/lib/normalizeTable.ts`: normalize raw matrix rows into stable columns and row objects.
- Create `src/lib/parseCsv.ts`: parse CSV files with Papa Parse.
- Create `src/lib/parseExcel.ts`: parse first Excel sheet with SheetJS.
- Create `src/lib/parsePaste.ts`: parse Ctrl+V tab/newline-delimited table text.
- Create `src/lib/statistics.ts`: infer column metadata and calculate single/two-column stats.
- Create `src/lib/chartData.ts`: convert stats into chart-ready data.
- Create `src/components/DataInput.tsx`: file upload and paste target.
- Create `src/components/DatasetSummary.tsx`: dataset overview.
- Create `src/components/AnalysisControls.tsx`: mode and column selectors.
- Create `src/components/StatsPanel.tsx`: statistics display.
- Create `src/components/ChartPanel.tsx`: Recharts visualizations.
- Create `src/components/DataPreview.tsx`: first 100 rows table.
- Create `src/components/ErrorMessage.tsx`: visible error rendering.
- Create `src/lib/*.test.ts`: focused unit tests for parsing, normalization, statistics, and chart data.
- Create `src/App.test.tsx`: integration tests for main UI flow.

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Create: `src/types.ts`

- [ ] **Step 1: Create project configuration**

Write `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "preview": "vite preview"
  },
  "dependencies": {
    "@vitejs/plugin-react": "latest",
    "vite": "latest",
    "typescript": "latest",
    "react": "latest",
    "react-dom": "latest",
    "papaparse": "latest",
    "xlsx": "latest",
    "recharts": "latest",
    "lucide-react": "latest"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "latest",
    "@testing-library/react": "latest",
    "@testing-library/user-event": "latest",
    "@types/papaparse": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "jsdom": "latest",
    "vitest": "latest"
  }
}
```

Write `index.html`:

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Data Dashboard</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Write `vite.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
```

Write `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": []
}
```

- [ ] **Step 2: Create shared types and placeholder app**

Write `src/types.ts`:

```ts
export type CellValue = string | number | null;

export type ColumnType = "number" | "category" | "date" | "text" | "empty";

export type ColumnMeta = {
  key: string;
  label: string;
  inferredType: ColumnType;
  missingCount: number;
  uniqueCount: number;
};

export type TableData = {
  sourceName: string;
  columns: ColumnMeta[];
  rows: Record<string, CellValue>[];
};

export type AnalysisMode = "single" | "relationship";
```

Write `src/App.tsx`:

```tsx
import "./styles.css";

export default function App() {
  return (
    <main className="app-shell">
      <section className="workspace">
        <h1>Data Dashboard</h1>
        <p>CSV, Excel, or pasted table data will appear here.</p>
      </section>
    </main>
  );
}
```

Write `src/main.tsx`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

Write `src/styles.css`:

```css
:root {
  color: #172026;
  background: #f4f7f6;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

button,
input,
select,
textarea {
  font: inherit;
}

.app-shell {
  min-height: 100vh;
  padding: 24px;
}

.workspace {
  max-width: 1280px;
  margin: 0 auto;
}
```

- [ ] **Step 3: Install dependencies**

Run: `npm install`

Expected: dependencies install and `package-lock.json` is created.

- [ ] **Step 4: Build scaffold**

Run: `npm run build`

Expected: TypeScript and Vite build complete successfully.

- [ ] **Step 5: Commit scaffold if git is initialized**

Run only if `git status --short` succeeds:

```bash
git add package.json package-lock.json index.html vite.config.ts tsconfig.json src
git commit -m "chore: scaffold data dashboard app"
```

Expected: scaffold commit is created. If this directory is not a git repository, skip this step and note it in the handoff.

## Task 2: Table Normalization

**Files:**
- Create: `src/lib/normalizeTable.ts`
- Create: `src/lib/normalizeTable.test.ts`
- Modify: `src/types.ts`

- [ ] **Step 1: Write failing normalization tests**

Write `src/lib/normalizeTable.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { normalizeTable } from "./normalizeTable";

describe("normalizeTable", () => {
  it("uses the first row as headers and creates row objects", () => {
    const table = normalizeTable(
      [
        ["Name", "Sales"],
        ["A", "10"],
        ["B", "20"],
      ],
      "sample.csv",
    );

    expect(table.sourceName).toBe("sample.csv");
    expect(table.columns.map((column) => column.label)).toEqual(["Name", "Sales"]);
    expect(table.rows).toEqual([
      { name: "A", sales: "10" },
      { name: "B", sales: "20" },
    ]);
  });

  it("deduplicates duplicate headers", () => {
    const table = normalizeTable(
      [
        ["Name", "Name", ""],
        ["A", "B", "C"],
      ],
      "duplicates",
    );

    expect(table.columns.map((column) => column.key)).toEqual([
      "name",
      "name_2",
      "column_3",
    ]);
    expect(table.rows[0]).toEqual({ name: "A", name_2: "B", column_3: "C" });
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- src/lib/normalizeTable.test.ts`

Expected: FAIL because `src/lib/normalizeTable.ts` does not exist.

- [ ] **Step 3: Implement normalization**

Write `src/lib/normalizeTable.ts`:

```ts
import type { CellValue, ColumnMeta, TableData } from "../types";

type RawCell = string | number | boolean | Date | null | undefined;

export type RawTable = RawCell[][];

function toLabel(value: RawCell, index: number): string {
  const label = String(value ?? "").trim();
  return label.length > 0 ? label : `Column ${index + 1}`;
}

function slugify(label: string, index: number): string {
  const base = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return base.length > 0 ? base : `column_${index + 1}`;
}

function uniqueKey(label: string, index: number, used: Map<string, number>): string {
  const base = slugify(label, index);
  const nextCount = (used.get(base) ?? 0) + 1;
  used.set(base, nextCount);
  return nextCount === 1 ? base : `${base}_${nextCount}`;
}

function normalizeCell(value: RawCell): CellValue {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

export function normalizeTable(rawRows: RawTable, sourceName: string): TableData {
  const nonEmptyRows = rawRows.filter((row) =>
    row.some((cell) => String(cell ?? "").trim().length > 0),
  );

  if (nonEmptyRows.length === 0) {
    throw new Error("No usable rows found.");
  }

  const headerRow = nonEmptyRows[0];
  const maxColumns = Math.max(...nonEmptyRows.map((row) => row.length));
  const usedKeys = new Map<string, number>();

  const columns: ColumnMeta[] = Array.from({ length: maxColumns }, (_, index) => {
    const label = toLabel(headerRow[index], index);
    return {
      key: uniqueKey(label, index, usedKeys),
      label,
      inferredType: "empty",
      missingCount: 0,
      uniqueCount: 0,
    };
  });

  const rows = nonEmptyRows.slice(1).map((row) => {
    return columns.reduce<Record<string, CellValue>>((record, column, index) => {
      record[column.key] = normalizeCell(row[index]);
      return record;
    }, {});
  });

  return { sourceName, columns, rows };
}
```

- [ ] **Step 4: Run normalization tests**

Run: `npm test -- src/lib/normalizeTable.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit normalization if git is initialized**

```bash
git add src/types.ts src/lib/normalizeTable.ts src/lib/normalizeTable.test.ts
git commit -m "feat: normalize tabular data"
```

Expected: normalization commit is created, or skipped if not a git repository.

## Task 3: Input Parsers

**Files:**
- Create: `src/lib/parsePaste.ts`
- Create: `src/lib/parsePaste.test.ts`
- Create: `src/lib/parseCsv.ts`
- Create: `src/lib/parseCsv.test.ts`
- Create: `src/lib/parseExcel.ts`
- Create: `src/lib/parseExcel.test.ts`

- [ ] **Step 1: Write paste parser tests**

Write `src/lib/parsePaste.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { parsePastedTable } from "./parsePaste";

describe("parsePastedTable", () => {
  it("parses tab and newline delimited table text", () => {
    expect(parsePastedTable("Name\tSales\nA\t10\nB\t20")).toEqual([
      ["Name", "Sales"],
      ["A", "10"],
      ["B", "20"],
    ]);
  });

  it("throws for empty pasted input", () => {
    expect(() => parsePastedTable("   \n  ")).toThrow("Pasted data is empty.");
  });
});
```

- [ ] **Step 2: Implement paste parser**

Write `src/lib/parsePaste.ts`:

```ts
import type { RawTable } from "./normalizeTable";

export function parsePastedTable(text: string): RawTable {
  const trimmed = text.trim();

  if (trimmed.length === 0) {
    throw new Error("Pasted data is empty.");
  }

  return trimmed.split(/\r?\n/).map((line) => line.split("\t"));
}
```

- [ ] **Step 3: Write CSV parser tests**

Write `src/lib/parseCsv.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { parseCsvText } from "./parseCsv";

describe("parseCsvText", () => {
  it("parses quoted values, commas, and empty cells", () => {
    const rows = parseCsvText('Name,Notes,Sales\nA,"hello, world",10\nB,,20');
    expect(rows).toEqual([
      ["Name", "Notes", "Sales"],
      ["A", "hello, world", "10"],
      ["B", null, "20"],
    ]);
  });
});
```

- [ ] **Step 4: Implement CSV parser**

Write `src/lib/parseCsv.ts`:

```ts
import Papa from "papaparse";
import type { RawTable } from "./normalizeTable";

export function parseCsvText(text: string): RawTable {
  const result = Papa.parse<string[]>(text, {
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    throw new Error(result.errors[0].message);
  }

  return result.data.map((row) => row.map((cell) => (cell === "" ? null : cell)));
}

export async function parseCsvFile(file: File): Promise<RawTable> {
  const text = await file.text();
  return parseCsvText(text);
}
```

- [ ] **Step 5: Write Excel parser tests**

Write `src/lib/parseExcel.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { parseExcelArrayBuffer } from "./parseExcel";

describe("parseExcelArrayBuffer", () => {
  it("reads the first sheet into raw rows", () => {
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet([
      ["Name", "Sales"],
      ["A", 10],
    ]);
    XLSX.utils.book_append_sheet(workbook, sheet, "Sheet1");

    const buffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });

    expect(parseExcelArrayBuffer(buffer)).toEqual([
      ["Name", "Sales"],
      ["A", 10],
    ]);
  });
});
```

- [ ] **Step 6: Implement Excel parser**

Write `src/lib/parseExcel.ts`:

```ts
import * as XLSX from "xlsx";
import type { RawTable } from "./normalizeTable";

export function parseExcelArrayBuffer(buffer: ArrayBuffer): RawTable {
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error("Excel file has no sheets.");
  }

  const sheet = workbook.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null }) as RawTable;
}

export async function parseExcelFile(file: File): Promise<RawTable> {
  return parseExcelArrayBuffer(await file.arrayBuffer());
}
```

- [ ] **Step 7: Run parser tests**

Run: `npm test -- src/lib/parsePaste.test.ts src/lib/parseCsv.test.ts src/lib/parseExcel.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit parsers if git is initialized**

```bash
git add src/lib/parsePaste.ts src/lib/parsePaste.test.ts src/lib/parseCsv.ts src/lib/parseCsv.test.ts src/lib/parseExcel.ts src/lib/parseExcel.test.ts
git commit -m "feat: parse uploaded and pasted tables"
```

Expected: parser commit is created, or skipped if not a git repository.

## Task 4: Statistics And Chart Data

**Files:**
- Create: `src/lib/statistics.ts`
- Create: `src/lib/statistics.test.ts`
- Create: `src/lib/chartData.ts`
- Create: `src/lib/chartData.test.ts`
- Modify: `src/types.ts`

- [ ] **Step 1: Extend shared types**

Append to `src/types.ts`:

```ts
export type NumericStats = {
  kind: "numeric";
  count: number;
  missingCount: number;
  sum: number;
  mean: number;
  median: number;
  min: number;
  max: number;
};

export type CategoryStats = {
  kind: "category";
  count: number;
  missingCount: number;
  uniqueCount: number;
  topValues: { value: string; count: number }[];
};

export type SingleColumnStats = NumericStats | CategoryStats;

export type NumericRelationshipStats = {
  kind: "numeric-relationship";
  pairedCount: number;
  missingPairCount: number;
  points: { x: number; y: number }[];
};

export type GroupedNumericStats = {
  kind: "grouped-numeric";
  groups: { label: string; count: number; sum: number; mean: number }[];
};

export type TwoColumnStats = NumericRelationshipStats | GroupedNumericStats;
```

- [ ] **Step 2: Write statistics tests**

Write `src/lib/statistics.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { TableData } from "../types";
import {
  calculateSingleColumnStats,
  calculateTwoColumnStats,
  inferColumnTypes,
} from "./statistics";

const table: TableData = {
  sourceName: "test",
  columns: [
    { key: "region", label: "Region", inferredType: "empty", missingCount: 0, uniqueCount: 0 },
    { key: "sales", label: "Sales", inferredType: "empty", missingCount: 0, uniqueCount: 0 },
    { key: "profit", label: "Profit", inferredType: "empty", missingCount: 0, uniqueCount: 0 },
  ],
  rows: [
    { region: "East", sales: "10", profit: "1" },
    { region: "East", sales: "20", profit: "2" },
    { region: "West", sales: "30", profit: "5" },
    { region: null, sales: null, profit: "9" },
  ],
};

describe("statistics", () => {
  it("infers numeric and category columns", () => {
    const inferred = inferColumnTypes(table);
    expect(inferred.columns.map((column) => [column.key, column.inferredType])).toEqual([
      ["region", "category"],
      ["sales", "number"],
      ["profit", "number"],
    ]);
  });

  it("calculates numeric stats", () => {
    expect(calculateSingleColumnStats(inferColumnTypes(table), "sales")).toEqual({
      kind: "numeric",
      count: 3,
      missingCount: 1,
      sum: 60,
      mean: 20,
      median: 20,
      min: 10,
      max: 30,
    });
  });

  it("calculates category stats", () => {
    expect(calculateSingleColumnStats(inferColumnTypes(table), "region")).toEqual({
      kind: "category",
      count: 3,
      missingCount: 1,
      uniqueCount: 2,
      topValues: [
        { value: "East", count: 2 },
        { value: "West", count: 1 },
      ],
    });
  });

  it("calculates numeric relationships", () => {
    expect(calculateTwoColumnStats(inferColumnTypes(table), "sales", "profit")).toEqual({
      kind: "numeric-relationship",
      pairedCount: 3,
      missingPairCount: 1,
      points: [
        { x: 10, y: 1 },
        { x: 20, y: 2 },
        { x: 30, y: 5 },
      ],
    });
  });

  it("calculates category plus numeric groups", () => {
    expect(calculateTwoColumnStats(inferColumnTypes(table), "region", "sales")).toEqual({
      kind: "grouped-numeric",
      groups: [
        { label: "East", count: 2, sum: 30, mean: 15 },
        { label: "West", count: 1, sum: 30, mean: 30 },
      ],
    });
  });
});
```

- [ ] **Step 3: Implement statistics**

Write `src/lib/statistics.ts`:

```ts
import type {
  CellValue,
  CategoryStats,
  ColumnMeta,
  NumericRelationshipStats,
  NumericStats,
  SingleColumnStats,
  TableData,
  TwoColumnStats,
} from "../types";

function asNumber(value: CellValue): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.replace(/,/g, "").trim();
  if (normalized.length === 0) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function isMissing(value: CellValue): boolean {
  return value === null || String(value).trim().length === 0;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

export function inferColumnTypes(table: TableData): TableData {
  const columns = table.columns.map<ColumnMeta>((column) => {
    const values = table.rows.map((row) => row[column.key]);
    const nonMissing = values.filter((value) => !isMissing(value));
    const numericValues = nonMissing.map(asNumber).filter((value): value is number => value !== null);
    const uniqueCount = new Set(nonMissing.map((value) => String(value))).size;
    const inferredType =
      nonMissing.length === 0
        ? "empty"
        : numericValues.length === nonMissing.length
          ? "number"
          : uniqueCount <= Math.max(20, nonMissing.length * 0.5)
            ? "category"
            : "text";

    return {
      ...column,
      inferredType,
      missingCount: values.length - nonMissing.length,
      uniqueCount,
    };
  });

  return { ...table, columns };
}

export function calculateSingleColumnStats(table: TableData, columnKey: string): SingleColumnStats {
  const column = table.columns.find((candidate) => candidate.key === columnKey);
  if (!column) {
    throw new Error("Selected column was not found.");
  }

  const values = table.rows.map((row) => row[columnKey]);
  const missingCount = values.filter(isMissing).length;

  if (column.inferredType === "number") {
    const numbers = values.map(asNumber).filter((value): value is number => value !== null);
    if (numbers.length === 0) {
      throw new Error("Selected column has no numeric values.");
    }

    const sum = numbers.reduce((total, value) => total + value, 0);
    return {
      kind: "numeric",
      count: numbers.length,
      missingCount,
      sum,
      mean: sum / numbers.length,
      median: median(numbers),
      min: Math.min(...numbers),
      max: Math.max(...numbers),
    } satisfies NumericStats;
  }

  const counts = new Map<string, number>();
  values.forEach((value) => {
    if (!isMissing(value)) {
      const key = String(value);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  });

  return {
    kind: "category",
    count: values.length - missingCount,
    missingCount,
    uniqueCount: counts.size,
    topValues: [...counts.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
      .slice(0, 10),
  } satisfies CategoryStats;
}

export function calculateTwoColumnStats(table: TableData, xKey: string, yKey: string): TwoColumnStats {
  const xColumn = table.columns.find((column) => column.key === xKey);
  const yColumn = table.columns.find((column) => column.key === yKey);

  if (!xColumn || !yColumn) {
    throw new Error("Selected columns were not found.");
  }

  if (xColumn.inferredType === "number" && yColumn.inferredType === "number") {
    const points = table.rows
      .map((row) => ({ x: asNumber(row[xKey]), y: asNumber(row[yKey]) }))
      .filter((point): point is { x: number; y: number } => point.x !== null && point.y !== null);

    return {
      kind: "numeric-relationship",
      pairedCount: points.length,
      missingPairCount: table.rows.length - points.length,
      points,
    } satisfies NumericRelationshipStats;
  }

  const categoryKey = xColumn.inferredType === "number" ? yKey : xKey;
  const numericKey = xColumn.inferredType === "number" ? xKey : yKey;
  const groups = new Map<string, { count: number; sum: number }>();

  table.rows.forEach((row) => {
    const labelValue = row[categoryKey];
    const numericValue = asNumber(row[numericKey]);
    if (isMissing(labelValue) || numericValue === null) {
      return;
    }

    const label = String(labelValue);
    const current = groups.get(label) ?? { count: 0, sum: 0 };
    groups.set(label, { count: current.count + 1, sum: current.sum + numericValue });
  });

  return {
    kind: "grouped-numeric",
    groups: [...groups.entries()]
      .map(([label, group]) => ({
        label,
        count: group.count,
        sum: group.sum,
        mean: group.sum / group.count,
      }))
      .sort((a, b) => b.mean - a.mean)
      .slice(0, 20),
  };
}
```

- [ ] **Step 4: Write chart data tests**

Write `src/lib/chartData.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildSingleColumnChartData, buildTwoColumnChartData } from "./chartData";

describe("chartData", () => {
  it("uses top values for category charts", () => {
    expect(
      buildSingleColumnChartData({
        kind: "category",
        count: 3,
        missingCount: 0,
        uniqueCount: 2,
        topValues: [
          { value: "A", count: 2 },
          { value: "B", count: 1 },
        ],
      }),
    ).toEqual([
      { label: "A", value: 2 },
      { label: "B", value: 1 },
    ]);
  });

  it("passes numeric relationship points through", () => {
    expect(
      buildTwoColumnChartData({
        kind: "numeric-relationship",
        pairedCount: 1,
        missingPairCount: 0,
        points: [{ x: 1, y: 2 }],
      }),
    ).toEqual([{ x: 1, y: 2 }]);
  });
});
```

- [ ] **Step 5: Implement chart data helpers**

Write `src/lib/chartData.ts`:

```ts
import type { SingleColumnStats, TwoColumnStats } from "../types";

export function buildSingleColumnChartData(stats: SingleColumnStats) {
  if (stats.kind === "category") {
    return stats.topValues.map((entry) => ({ label: entry.value, value: entry.count }));
  }

  return [
    { label: "Min", value: stats.min },
    { label: "Median", value: stats.median },
    { label: "Mean", value: stats.mean },
    { label: "Max", value: stats.max },
  ];
}

export function buildTwoColumnChartData(stats: TwoColumnStats) {
  if (stats.kind === "numeric-relationship") {
    return stats.points;
  }

  return stats.groups.map((group) => ({
    label: group.label,
    mean: group.mean,
    sum: group.sum,
    count: group.count,
  }));
}
```

- [ ] **Step 6: Run statistics tests**

Run: `npm test -- src/lib/statistics.test.ts src/lib/chartData.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit statistics if git is initialized**

```bash
git add src/types.ts src/lib/statistics.ts src/lib/statistics.test.ts src/lib/chartData.ts src/lib/chartData.test.ts
git commit -m "feat: calculate dashboard statistics"
```

Expected: statistics commit is created, or skipped if not a git repository.

## Task 5: Core UI Components

**Files:**
- Create: `src/components/ErrorMessage.tsx`
- Create: `src/components/DataInput.tsx`
- Create: `src/components/DatasetSummary.tsx`
- Create: `src/components/AnalysisControls.tsx`
- Create: `src/components/StatsPanel.tsx`
- Create: `src/components/DataPreview.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Write component files**

Write `src/components/ErrorMessage.tsx`:

```tsx
type ErrorMessageProps = {
  message: string | null;
};

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) {
    return null;
  }

  return <div className="error-message">{message}</div>;
}
```

Write `src/components/DataInput.tsx`:

```tsx
import { Upload } from "lucide-react";
import type { RawTable } from "../lib/normalizeTable";
import { normalizeTable } from "../lib/normalizeTable";
import { parseCsvFile } from "../lib/parseCsv";
import { parseExcelFile } from "../lib/parseExcel";
import { parsePastedTable } from "../lib/parsePaste";
import { inferColumnTypes } from "../lib/statistics";
import type { TableData } from "../types";

type DataInputProps = {
  onLoad: (table: TableData) => void;
  onError: (message: string) => void;
};

async function parseFile(file: File): Promise<RawTable> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".csv")) {
    return parseCsvFile(file);
  }

  if (name.endsWith(".xlsx")) {
    return parseExcelFile(file);
  }

  throw new Error("CSV 또는 Excel(.xlsx) 파일만 지원합니다.");
}

export function DataInput({ onLoad, onError }: DataInputProps) {
  async function handleFile(file: File) {
    try {
      const rawRows = await parseFile(file);
      onLoad(inferColumnTypes(normalizeTable(rawRows, file.name)));
    } catch (error) {
      onError(error instanceof Error ? error.message : "파일을 처리하지 못했습니다.");
    }
  }

  function handlePaste(text: string) {
    try {
      onLoad(inferColumnTypes(normalizeTable(parsePastedTable(text), "Pasted table")));
    } catch (error) {
      onError(error instanceof Error ? error.message : "붙여넣은 데이터를 처리하지 못했습니다.");
    }
  }

  return (
    <section className="input-panel">
      <label className="file-drop">
        <Upload aria-hidden="true" size={20} />
        <span>CSV 또는 Excel 파일 선택</span>
        <input
          aria-label="데이터 파일 업로드"
          type="file"
          accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void handleFile(file);
            }
          }}
        />
      </label>
      <textarea
        aria-label="표 데이터 붙여넣기"
        className="paste-target"
        placeholder="Excel, Google Sheets, 웹 표에서 복사한 데이터를 Ctrl+V로 붙여넣으세요."
        onPaste={(event) => {
          const text = event.clipboardData.getData("text/plain");
          if (text.trim().length > 0) {
            event.preventDefault();
            handlePaste(text);
          }
        }}
      />
    </section>
  );
}
```

Write `src/components/DatasetSummary.tsx`:

```tsx
import type { TableData } from "../types";

type DatasetSummaryProps = {
  table: TableData;
};

export function DatasetSummary({ table }: DatasetSummaryProps) {
  const missingValues = table.columns.reduce((total, column) => total + column.missingCount, 0);

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
```

Write `src/components/AnalysisControls.tsx`:

```tsx
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
      <div className="segmented">
        <button className={mode === "single" ? "active" : ""} onClick={() => onModeChange("single")}>
          단일 컬럼
        </button>
        <button
          className={mode === "relationship" ? "active" : ""}
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
    </section>
  );
}
```

Write `src/components/StatsPanel.tsx`:

```tsx
import type { SingleColumnStats, TwoColumnStats } from "../types";

type StatsPanelProps = {
  stats: SingleColumnStats | TwoColumnStats | null;
};

function format(value: number): string {
  return Number.isInteger(value) ? value.toLocaleString() : value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function StatsPanel({ stats }: StatsPanelProps) {
  if (!stats) {
    return <section className="panel">분석할 컬럼을 선택하세요.</section>;
  }

  if (stats.kind === "numeric") {
    return (
      <section className="panel stats-grid">
        <div><span>Count</span><strong>{format(stats.count)}</strong></div>
        <div><span>Missing</span><strong>{format(stats.missingCount)}</strong></div>
        <div><span>Sum</span><strong>{format(stats.sum)}</strong></div>
        <div><span>Mean</span><strong>{format(stats.mean)}</strong></div>
        <div><span>Median</span><strong>{format(stats.median)}</strong></div>
        <div><span>Min</span><strong>{format(stats.min)}</strong></div>
        <div><span>Max</span><strong>{format(stats.max)}</strong></div>
      </section>
    );
  }

  if (stats.kind === "category") {
    return (
      <section className="panel">
        <div className="stats-grid">
          <div><span>Count</span><strong>{format(stats.count)}</strong></div>
          <div><span>Missing</span><strong>{format(stats.missingCount)}</strong></div>
          <div><span>Unique</span><strong>{format(stats.uniqueCount)}</strong></div>
        </div>
        <ul className="rank-list">
          {stats.topValues.map((entry) => (
            <li key={entry.value}><span>{entry.value}</span><strong>{entry.count}</strong></li>
          ))}
        </ul>
      </section>
    );
  }

  if (stats.kind === "numeric-relationship") {
    return (
      <section className="panel stats-grid">
        <div><span>Pairs</span><strong>{format(stats.pairedCount)}</strong></div>
        <div><span>Missing pairs</span><strong>{format(stats.missingPairCount)}</strong></div>
      </section>
    );
  }

  return (
    <section className="panel">
      <ul className="rank-list">
        {stats.groups.map((group) => (
          <li key={group.label}>
            <span>{group.label}</span>
            <strong>{format(group.mean)}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

Write `src/components/DataPreview.tsx`:

```tsx
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
            {rows.map((row, index) => (
              <tr key={index}>
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
```

- [ ] **Step 2: Append component styling**

Append to `src/styles.css`:

```css
h1,
h2,
p {
  margin-top: 0;
}

.top-bar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.input-panel,
.controls,
.summary-grid,
.analysis-grid {
  display: grid;
  gap: 12px;
}

.input-panel {
  grid-template-columns: minmax(220px, 320px) 1fr;
  margin-bottom: 16px;
}

.file-drop,
.paste-target,
.panel,
.summary-grid > div {
  border: 1px solid #d6dedb;
  border-radius: 8px;
  background: #ffffff;
}

.file-drop {
  min-height: 132px;
  display: grid;
  place-items: center;
  gap: 8px;
  cursor: pointer;
  color: #31514a;
}

.file-drop input {
  display: none;
}

.paste-target {
  width: 100%;
  min-height: 132px;
  padding: 14px;
  resize: vertical;
}

.error-message {
  margin-bottom: 16px;
  padding: 12px 14px;
  border: 1px solid #d28b8b;
  border-radius: 8px;
  background: #fff3f3;
  color: #8f2424;
}

.summary-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-bottom: 16px;
}

.summary-grid > div,
.stats-grid > div {
  padding: 14px;
}

.summary-grid span,
.stats-grid span {
  display: block;
  color: #65736f;
  font-size: 0.84rem;
}

.summary-grid strong,
.stats-grid strong {
  display: block;
  margin-top: 4px;
  font-size: 1.1rem;
}

.controls {
  grid-template-columns: auto minmax(180px, 1fr) minmax(180px, 1fr);
  align-items: end;
  margin-bottom: 16px;
}

.controls label {
  display: grid;
  gap: 6px;
}

.controls select {
  min-height: 40px;
  border: 1px solid #cbd6d2;
  border-radius: 6px;
  padding: 0 10px;
  background: white;
}

.segmented {
  display: inline-grid;
  grid-auto-flow: column;
  border: 1px solid #cbd6d2;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.segmented button {
  min-height: 40px;
  border: 0;
  padding: 0 14px;
  background: transparent;
  cursor: pointer;
}

.segmented button.active {
  background: #244c45;
  color: white;
}

.analysis-grid {
  grid-template-columns: minmax(280px, 380px) 1fr;
  align-items: start;
  margin-bottom: 16px;
}

.panel {
  padding: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.rank-list {
  list-style: none;
  padding: 0;
  margin: 12px 0 0;
  display: grid;
  gap: 8px;
}

.rank-list li {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid #edf1ef;
  padding-bottom: 8px;
}

.table-scroll {
  overflow: auto;
  max-height: 380px;
}

table {
  border-collapse: collapse;
  width: 100%;
  min-width: 640px;
}

th,
td {
  border-bottom: 1px solid #e6ece9;
  padding: 8px 10px;
  text-align: left;
  white-space: nowrap;
}

th {
  position: sticky;
  top: 0;
  background: #f9fbfa;
}

@media (max-width: 820px) {
  .app-shell {
    padding: 14px;
  }

  .input-panel,
  .summary-grid,
  .controls,
  .analysis-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Commit components if git is initialized**

```bash
git add src/components src/styles.css
git commit -m "feat: add dashboard UI components"
```

Expected: component commit is created, or skipped if not a git repository.

## Task 6: Charts And App Integration

**Files:**
- Create: `src/components/ChartPanel.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Write ChartPanel**

Write `src/components/ChartPanel.tsx`:

```tsx
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { buildSingleColumnChartData, buildTwoColumnChartData } from "../lib/chartData";
import type { SingleColumnStats, TwoColumnStats } from "../types";

type ChartPanelProps = {
  stats: SingleColumnStats | TwoColumnStats | null;
};

export function ChartPanel({ stats }: ChartPanelProps) {
  if (!stats) {
    return <section className="panel chart-panel">그래프를 표시할 데이터가 없습니다.</section>;
  }

  if (stats.kind === "numeric-relationship") {
    return (
      <section className="panel chart-panel">
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart>
            <CartesianGrid />
            <XAxis dataKey="x" type="number" name="X" />
            <YAxis dataKey="y" type="number" name="Y" />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter data={buildTwoColumnChartData(stats)} fill="#2d6f65" />
          </ScatterChart>
        </ResponsiveContainer>
      </section>
    );
  }

  const data = stats.kind === "grouped-numeric" ? buildTwoColumnChartData(stats) : buildSingleColumnChartData(stats);
  const valueKey = stats.kind === "grouped-numeric" ? "mean" : "value";

  return (
    <section className="panel chart-panel">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={0} angle={-20} height={70} />
          <YAxis />
          <Tooltip />
          <Bar dataKey={valueKey} fill="#2d6f65" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
```

- [ ] **Step 2: Integrate app state**

Replace `src/App.tsx` with:

```tsx
import { useMemo, useState } from "react";
import { AnalysisControls } from "./components/AnalysisControls";
import { ChartPanel } from "./components/ChartPanel";
import { DataInput } from "./components/DataInput";
import { DataPreview } from "./components/DataPreview";
import { DatasetSummary } from "./components/DatasetSummary";
import { ErrorMessage } from "./components/ErrorMessage";
import { StatsPanel } from "./components/StatsPanel";
import { calculateSingleColumnStats, calculateTwoColumnStats } from "./lib/statistics";
import type { AnalysisMode, TableData } from "./types";
import "./styles.css";

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
      return mode === "single"
        ? calculateSingleColumnStats(table, xKey)
        : calculateTwoColumnStats(table, xKey, yKey);
    } catch (caught) {
      return null;
    }
  }, [mode, table, xKey, yKey]);

  return (
    <main className="app-shell">
      <section className="workspace">
        <header className="top-bar">
          <div>
            <h1>Data Dashboard</h1>
            <p>CSV, Excel, Ctrl+V 데이터를 올려 통계와 그래프를 확인하세요.</p>
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
            파일을 업로드하거나 표 데이터를 붙여넣으면 분석 화면이 표시됩니다.
          </section>
        )}
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Append chart styles**

Append to `src/styles.css`:

```css
.chart-panel {
  min-height: 354px;
}

.empty-state {
  min-height: 160px;
  display: grid;
  place-items: center;
  color: #65736f;
}
```

- [ ] **Step 4: Build integrated app**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 5: Commit integration if git is initialized**

```bash
git add src/App.tsx src/components/ChartPanel.tsx src/styles.css
git commit -m "feat: integrate dashboard analysis flow"
```

Expected: integration commit is created, or skipped if not a git repository.

## Task 7: UI Integration Tests And Final Verification

**Files:**
- Create: `src/test/setup.ts`
- Create: `src/App.test.tsx`

- [ ] **Step 1: Add test setup**

Write `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 2: Write UI tests**

Write `src/App.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("loads pasted table data and shows stats", async () => {
    const user = userEvent.setup();
    render(<App />);

    const pasteTarget = screen.getByLabelText("표 데이터 붙여넣기");
    await user.click(pasteTarget);
    await user.paste("Region\tSales\nEast\t10\nEast\t20\nWest\t30");

    expect(await screen.findByText("Pasted table")).toBeInTheDocument();
    expect(screen.getByText("Rows")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Region")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run all tests**

Run: `npm test`

Expected: PASS.

- [ ] **Step 4: Run production build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 5: Start dev server for user verification**

Run: `npm run dev -- --host 0.0.0.0`

Expected: Vite prints a local URL, usually `http://localhost:5173/`. Leave the server running and provide the URL to the user.

- [ ] **Step 6: Commit tests if git is initialized**

```bash
git add src/test/setup.ts src/App.test.tsx
git commit -m "test: cover pasted data dashboard flow"
```

Expected: test commit is created, or skipped if not a git repository.

## Self-Review

- Spec coverage: The plan covers CSV upload, Excel upload, Ctrl+V paste, normalized table data, column metadata inference, single-column stats, two-column stats, charts, preview table, visible errors, and future backend-friendly module boundaries.
- Placeholder scan: No `TBD`, `TODO`, or unspecified implementation steps remain.
- Type consistency: `TableData`, `ColumnMeta`, `CellValue`, `AnalysisMode`, stats types, parser signatures, and component props are defined before use and used consistently across tasks.
- Known execution note: The current directory may not be a git repository. Commit steps are conditional and should be skipped unless `git status --short` succeeds.
