# Table Orientation Design

## Goal

Support both data transposition and chart direction switching so users can analyze tables whose meaningful series are laid out horizontally or vertically.

## Scope

Each dataset tab stores its own data orientation and chart orientation. Data orientation can be original or transposed. Chart orientation can be vertical or horizontal and applies to bar-style charts.

## Data Flow

The uploaded or pasted table remains unchanged. A `transposeTable(table)` helper builds a derived `TableData` for analysis and preview when the active tab is in transposed mode. The first source column is used as transposed column labels when possible. Empty or duplicate labels receive stable fallback names. Existing type inference, statistics, chart data, and preview components then operate on the effective table.

## UI

The analysis controls include a data orientation segmented control with `원본` and `전치`. The chart options include a chart orientation segmented control with `세로` and `가로`. Chart orientation is shown for bar-compatible charts and passed into `ChartPanel`.

## Testing

Tests cover the transpose helper, App-level tab-scoped orientation changes, and horizontal bar rendering in ChartPanel. Existing tests and production build must continue to pass.
