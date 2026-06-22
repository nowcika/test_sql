# Tabbed Datasets And Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add multi-dataset tabs for CSV, Excel sheets, and repeated paste input, then deploy the Vite app through GitHub Pages.

**Architecture:** Keep parsing and UI concerns separate. `DataInput` emits one or more normalized `TableData` objects, `App` owns tab state and active selection, and `DatasetTabs` renders only tab controls. GitHub Pages support is static-site configuration through Vite `base` and a Pages workflow.

**Tech Stack:** React, Vite, TypeScript, Vitest, Testing Library, SheetJS, GitHub Actions, GitHub Pages.

---

## Tasks

- [ ] Add tests for Excel multi-sheet parsing and tabbed paste/close behavior.
- [ ] Extend Excel parsing with `parseExcelSheets`.
- [ ] Change `DataInput` to support multiple files and emit `TableData[]`.
- [ ] Add `DatasetTabs`.
- [ ] Refactor `App` from single table state to tab state.
- [ ] Configure Vite `base: "/test_sql/"`.
- [ ] Add `.github/workflows/deploy.yml`.
- [ ] Update README with GitHub Pages and tab behavior.
- [ ] Run `npm test` and `npm run build`.
- [ ] Commit and push to `main`.
