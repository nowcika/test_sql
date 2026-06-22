# Tabbed Datasets And GitHub Pages Design

## Goal

Extend the data dashboard so multiple datasets can be open at the same time and selected through tabs. Also configure the app to deploy as a static GitHub Pages site at `https://nowcika.github.io/test_sql/`.

## Dataset Tabs

The app will replace the single `TableData | null` state with a list of dataset tabs and an active tab id.

Input behavior:

- Selecting multiple CSV files creates one tab per CSV file.
- Uploading an Excel `.xlsx` file creates one tab per worksheet.
- Uploading multiple files can create multiple tabs in one action.
- Pasting data with `Ctrl+V` creates one new tab each time.
- Pasted tabs are named `Pasted table 1`, `Pasted table 2`, and so on.

Tab behavior:

- The newest loaded tab becomes active.
- Clicking a tab switches the active dataset.
- Each tab has a close button.
- Closing the active tab activates the nearest remaining tab.
- Closing the last tab returns the app to the empty state.

The existing summary, controls, statistics, chart, and preview panels will continue to operate on only the active tab's `TableData`.

## Parsing Changes

CSV parsing remains one table per file.

Excel parsing will add `parseExcelSheets(file)`, which returns all sheets as `{ sheetName, rows }[]`. The existing first-sheet parser can remain for compatibility and tests.

## UI Changes

Add `DatasetTabs` as a focused component for rendering tab buttons and close controls. It receives tabs, the active tab id, and callbacks for selection and close.

The file picker will allow multiple files. `DataInput` will change from `onLoad(table)` to `onLoad(tables)`.

## GitHub Pages

Vite will set `base: "/test_sql/"` so asset URLs work under the repository Pages path. GitHub Pages deployment will be handled by `.github/workflows/deploy.yml` on pushes to `main`.

The workflow will:

- Check out the repository.
- Set up Node with npm cache.
- Run `npm ci`.
- Run `npm run build`.
- Upload `dist`.
- Deploy through GitHub Pages.

The repository Settings -> Pages source must use GitHub Actions. Private repository Pages availability depends on the GitHub account/plan.

## Testing

Tests will cover:

- Excel multi-sheet parsing.
- Two paste operations creating two tabs.
- Closing a tab.
- Existing pasted data analysis flow still working.
- Production build still succeeds with the Pages base path.
