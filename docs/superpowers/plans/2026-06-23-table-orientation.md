# Table Orientation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add per-tab data transposition and bar chart direction controls.

**Architecture:** Keep source tables immutable and derive an effective table via `transposeTable` when requested. Store `dataOrientation` and `chartOrientation` in `AnalysisSettings`, then pass the effective table and chart orientation through existing controls, stats, preview, and chart components.

**Tech Stack:** React, TypeScript, Vitest, Testing Library, Recharts.

---

### Task 1: Transpose Helper

**Files:**
- Create: `src/lib/transposeTable.ts`
- Test: `src/lib/transposeTable.test.ts`

- [ ] Write failing tests for transposed columns, rows, duplicate labels, and type inference.
- [ ] Run `npm test -- src/lib/transposeTable.test.ts` and confirm failure.
- [ ] Implement `transposeTable(table: TableData): TableData`.
- [ ] Re-run the transpose tests and confirm pass.

### Task 2: App State And UI

**Files:**
- Modify: `src/types.ts`
- Modify: `src/App.tsx`
- Modify: `src/components/AnalysisControls.tsx`
- Modify: `src/components/ChartOptions.tsx`
- Modify: `src/styles.css`
- Test: `src/App.test.tsx`

- [ ] Add failing App test for tab-scoped original/transposed data orientation.
- [ ] Add failing App test for tab-scoped chart orientation.
- [ ] Add `DataOrientation` and `ChartOrientation` types.
- [ ] Store both orientation values per tab.
- [ ] Use effective table for summary, controls, stats, preview, and chart.
- [ ] Add controls for data and chart orientation.
- [ ] Re-run App tests and confirm pass.

### Task 3: Horizontal Bar Chart

**Files:**
- Modify: `src/components/ChartPanel.tsx`
- Test: `src/components/ChartPanel.test.tsx`

- [ ] Add failing test that horizontal bar charts render with horizontal aria label.
- [ ] Pass chart orientation into bar-style chart rendering.
- [ ] Use Recharts vertical layout for horizontal bars.
- [ ] Re-run ChartPanel tests and confirm pass.

### Task 4: Docs And Release

**Files:**
- Modify: `README.md`

- [ ] Document data transposition and chart direction.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Commit, push, and verify GitHub Pages deploy.
