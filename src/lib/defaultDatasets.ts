import { normalizeTable } from "./normalizeTable";
import { parseCsvText } from "./parseCsv";
import { inferColumnTypes } from "./statistics";
import type { TableData } from "../types";

type DefaultCsvDataset = {
  sourceName: string;
  path: string;
};

export const defaultCsvDatasets: DefaultCsvDataset[] = [
  { sourceName: "Sales sample", path: "sample-data/sales.csv" },
  { sourceName: "Inventory sample", path: "sample-data/inventory.csv" },
  { sourceName: "Customers sample", path: "sample-data/customers.csv" },
];

function defaultDatasetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path}`;
}

export async function loadDefaultDatasets(): Promise<TableData[]> {
  const tables = await Promise.all(
    defaultCsvDatasets.map(async (dataset) => {
      const response = await fetch(defaultDatasetUrl(dataset.path));

      if (!response.ok) {
        throw new Error(`Failed to load ${dataset.path}`);
      }

      const rows = parseCsvText(await response.text());
      return inferColumnTypes(normalizeTable(rows, dataset.sourceName));
    }),
  );

  return tables;
}
