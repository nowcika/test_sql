# Default Sample Data Design

## Goal

Commit multiple sample CSV files to the repository and load them automatically when the dashboard opens, so GitHub Pages visitors immediately see populated tabs without uploading data.

## Design

Sample CSV files live under `public/sample-data/` so Vite serves them in both local development and GitHub Pages builds. The app fetches a fixed list of CSV paths on first mount, parses each CSV through the existing `parseCsvText -> normalizeTable -> inferColumnTypes` pipeline, and appends the resulting tables through the existing tab loading path.

The default samples are:

- `Sales sample` from `public/sample-data/sales.csv`
- `Inventory sample` from `public/sample-data/inventory.csv`
- `Customers sample` from `public/sample-data/customers.csv`

If default loading fails, the app shows a visible error but still allows manual upload and paste input. User-added files and pasted data continue to append as tabs.

## Verification

A UI test mocks the sample CSV fetches and confirms that the three default tabs appear on first render. Existing paste, close-tab, and per-tab settings tests continue to pass.
