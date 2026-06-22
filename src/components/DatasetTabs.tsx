import type { TableData } from "../types";

export type DatasetTab = {
  id: string;
  table: TableData;
};

type DatasetTabsProps = {
  tabs: DatasetTab[];
  activeTabId: string | null;
  onSelect: (tabId: string) => void;
  onClose: (tabId: string) => void;
};

export function DatasetTabs({ tabs, activeTabId, onSelect, onClose }: DatasetTabsProps) {
  if (tabs.length === 0) {
    return null;
  }

  return (
    <section className="dataset-tabs" aria-label="데이터 탭">
      <div className="tab-list" role="tablist" aria-label="열린 데이터셋">
        {tabs.map((tab) => {
          const selected = tab.id === activeTabId;
          return (
            <div className={selected ? "dataset-tab active" : "dataset-tab"} key={tab.id}>
              <button
                type="button"
                role="tab"
                aria-selected={selected}
                className="dataset-tab-button"
                onClick={() => onSelect(tab.id)}
              >
                {tab.table.sourceName}
              </button>
              <button
                type="button"
                className="dataset-tab-close"
                aria-label={`${tab.table.sourceName} 닫기`}
                onClick={() => onClose(tab.id)}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
