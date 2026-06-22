# Data Dashboard Design

## Goal

Build a browser-based web app that lets a user load tabular data and inspect it like a lightweight database table. The app should support CSV files, Excel `.xlsx` files, and table data pasted with Ctrl+V. After data is loaded, the user can select columns to view related statistics and charts.

The first version focuses on fast local analysis in the browser. It does not include login, persistent storage, server-side processing, or a real MySQL connection. The internal structure should still keep parsing, statistics, and chart preparation separate so a backend or MySQL source can be added later.

## Users And Workflow

The user starts on the working screen, not a marketing page. The first visible task is loading data.

Main workflow:

1. User uploads a CSV file, uploads an Excel `.xlsx` file, or pastes tabular data with Ctrl+V.
2. The app parses the input into a common table structure.
3. The app infers column names, row count, column count, data types, missing values, and basic metadata.
4. The user chooses one of two analysis modes:
   - Single column analysis
   - Two column relationship analysis
5. The user selects the relevant column or columns.
6. Statistics and charts update immediately.
7. A preview table shows the first rows of the loaded data.

## Input Sources

### CSV Upload

CSV files are parsed in the browser. The parser should support headers, quoted values, commas inside quoted cells, and empty values.

### Excel Upload

Excel `.xlsx` files are parsed in the browser. The first sheet is used as the default analysis target for the first version. Multi-sheet selection is out of scope for the first version, but the parser boundary should make it possible later.

### Ctrl+V Paste

The app includes a paste target that accepts copied table data from Excel, Google Sheets, web tables, and similar sources. Pasted data is parsed as tab- and newline-delimited text.

The first row is treated as the header row by default. If headers cannot be inferred reliably, the app generates column names such as `Column 1`, `Column 2`, and keeps all rows as data. A future option can expose a "first row is header" toggle, but the first version can apply a simple default.

All input sources must produce the same normalized table model so statistics and charts do not depend on how the data was loaded.

## Data Model

Use a normalized in-memory table shape:

```ts
type TableData = {
  sourceName: string;
  columns: ColumnMeta[];
  rows: Record<string, CellValue>[];
};

type ColumnMeta = {
  key: string;
  label: string;
  inferredType: "number" | "category" | "date" | "text" | "empty";
  missingCount: number;
  uniqueCount: number;
};

type CellValue = string | number | null;
```

Dates may be detected for metadata, but first-version chart behavior can treat them as category or text unless a date chart is explicitly added.

## UI Structure

Use a React/Vite single-page app with these main components:

- `App`: owns loaded table state, selected mode, selected columns, and derived results.
- `DataInput`: combines file upload and paste input.
- `DatasetSummary`: shows source name, row count, column count, missing values, and inferred type counts.
- `AnalysisControls`: lets the user choose single-column or two-column mode and select columns.
- `StatsPanel`: renders statistics for the selected analysis.
- `ChartPanel`: renders charts based on selected columns and inferred types.
- `DataPreview`: shows the first 100 rows in a table.
- `EmptyState`: shown before data is loaded.
- `ErrorMessage`: shows parse errors and unsupported input errors.

The interface should be work-focused and compact. It should avoid a landing page and avoid decorative sections that slow down the core task.

## Statistics

Single numeric column:

- Non-empty count
- Missing count
- Sum
- Mean
- Median
- Minimum
- Maximum

Single category or text column:

- Non-empty count
- Missing count
- Unique value count
- Top values by frequency

Two numeric columns:

- Paired non-empty count
- Missing pair count
- Basic relationship summary
- Scatter plot data

Category plus numeric column:

- Group count
- Per-group count
- Per-group sum
- Per-group mean
- Bar chart data for grouped mean by default

Text plus text relationship analysis is out of scope for the first version except for showing value counts if one column is selected as a category.

## Charts

Use a React-compatible chart library. The chart layer receives precomputed chart data instead of reading raw rows directly.

Initial chart behavior:

- Single numeric column: histogram-style distribution.
- Single category or text column: bar chart of top values.
- Numeric plus numeric: scatter plot.
- Category plus numeric: grouped bar chart, defaulting to mean by category.

Charts should handle empty or invalid selections with clear empty states.

## Parsing And Analysis Modules

Keep non-UI logic in small modules:

- `parseCsvFile(file)`: returns raw rows and source metadata.
- `parseExcelFile(file)`: reads the first sheet and returns raw rows and source metadata.
- `parsePastedTable(text)`: parses tab/newline-delimited text into raw rows.
- `normalizeTable(rawRows, sourceName)`: creates stable column keys and normalized row objects.
- `inferColumnTypes(table)`: infers type and metadata.
- `calculateSingleColumnStats(table, columnKey)`: returns statistics for one column.
- `calculateTwoColumnStats(table, xKey, yKey)`: returns relationship statistics.
- `buildChartData(stats, analysisContext)`: prepares chart-ready data.

These module boundaries support a later backend migration because parsing and statistics can be replaced by API calls while the UI stays mostly unchanged.

## Error Handling

The app should report:

- Unsupported file type
- Empty file or empty pasted input
- File parse failure
- No usable columns found
- Selected columns with no analyzable values

Errors should be visible near the input area or relevant panel. The app should not crash on malformed rows, missing cells, duplicate headers, or mixed-type columns.

Duplicate column labels should be converted into unique internal keys while keeping user-facing labels readable.

## Testing Criteria

Core behavior should be covered by focused tests for non-UI modules:

- CSV parsing with quoted values and empty cells
- Excel first-sheet parsing
- Paste parsing from tab/newline-delimited input
- Header normalization and duplicate header handling
- Numeric statistics
- Category frequency statistics
- Two-column numeric relationship preparation
- Category plus numeric grouped aggregation

UI verification should confirm:

- Data can be loaded through each input path.
- Column selectors populate after loading data.
- Stats and charts update when selections change.
- Data preview renders the expected rows.

## Out Of Scope For First Version

- Real MySQL server connection
- Backend API
- User accounts
- Saving uploaded datasets permanently
- Multi-sheet Excel selection
- SQL query editor
- Exporting charts or reports
- Very large file streaming

## Future Extension Points

Later versions can add:

- Backend parsing and statistics for large files
- MySQL/PostgreSQL connection
- SQL-like filtering and grouping
- Multi-sheet Excel selection
- Saved datasets
- Export to CSV, PNG, or PDF
- Date-aware time series charts
