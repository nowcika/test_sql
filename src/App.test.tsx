import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";

vi.mock("./components/ChartPanel", () => ({
  ChartPanel: ({ chartType, chartOrientation, stats }: { chartType?: string; chartOrientation?: string; stats?: { kind: string } }) => (
    <section aria-label={stats?.kind === "matrix" ? "매트릭스 차트" : chartType === "histogram" ? "히스토그램 차트" : chartOrientation === "horizontal" ? "가로 차트" : "chart"}>
      Chart
    </section>
  ),
}));

describe("App", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("default data unavailable in test"))),
    );
  });

  it("loads default CSV files as tabs on first visit", async () => {
    const responses = new Map([
      ["/test_sql/sample-data/sales.csv", "Region,Sales\nEast,10\nWest,20"],
      ["/test_sql/sample-data/inventory.csv", "Item,Stock\nA,4\nB,6"],
      ["/test_sql/sample-data/customers.csv", "Segment,Customers\nRetail,12\nEnterprise,5"],
      ["/sample-data/sales.csv", "Region,Sales\nEast,10\nWest,20"],
      ["/sample-data/inventory.csv", "Item,Stock\nA,4\nB,6"],
      ["/sample-data/customers.csv", "Segment,Customers\nRetail,12\nEnterprise,5"],
    ]);

    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) => {
        const text = responses.get(url);
        if (text == null) {
          return Promise.reject(new Error(`Unexpected URL: ${url}`));
        }

        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(text),
        });
      }),
    );

    render(<App />);

    expect(await screen.findByRole("tab", { name: "Sales sample" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Inventory sample" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Customers sample" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Customers sample" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("loads pasted table data and shows stats", async () => {
    const user = userEvent.setup();
    render(<App />);

    const pasteTarget = screen.getByLabelText("표 데이터 붙여넣기");
    await user.click(pasteTarget);
    await user.paste("Region\tSales\nEast\t10\nEast\t20\nWest\t30");

    expect(await screen.findByRole("tab", { name: /Pasted table 1/ })).toBeInTheDocument();
    expect(screen.getByText("Rows")).toBeInTheDocument();

    const summary = screen.getByLabelText("데이터 요약");
    expect(within(summary).getByText("3")).toBeInTheDocument();
    expect(screen.getAllByText("Region").length).toBeGreaterThan(0);
  });

  it("adds a new tab for each paste and closes tabs", async () => {
    const user = userEvent.setup();
    render(<App />);

    const pasteTarget = screen.getByLabelText("표 데이터 붙여넣기");
    await user.click(pasteTarget);
    await user.paste("Region\tSales\nEast\t10");
    await user.paste("Item\tStock\nA\t4");

    expect(await screen.findByRole("tab", { name: /Pasted table 1/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Pasted table 2/ })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Pasted table 2 닫기" }));

    expect(screen.queryByRole("tab", { name: /Pasted table 2/ })).not.toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Pasted table 1/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("keeps analysis settings scoped to each tab", async () => {
    const user = userEvent.setup();
    render(<App />);

    const pasteTarget = screen.getByLabelText("표 데이터 붙여넣기");
    await user.click(pasteTarget);
    await user.paste("Region\tSales\nEast\t10\nWest\t20");

    await user.selectOptions(screen.getByLabelText("컬럼"), "sales");
    expect(screen.getByLabelText("컬럼")).toHaveValue("sales");
    expect(within(screen.getByLabelText("숫자 통계")).getByText("Sum")).toBeInTheDocument();

    await user.click(pasteTarget);
    await user.paste("Item\tStock\nA\t4\nB\t6");
    expect(await screen.findByRole("tab", { name: /Pasted table 2/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByLabelText("컬럼")).toHaveValue("item");

    await user.selectOptions(screen.getByLabelText("컬럼"), "stock");
    expect(screen.getByLabelText("컬럼")).toHaveValue("stock");

    await user.click(screen.getByRole("tab", { name: /Pasted table 1/ }));
    expect(screen.getByLabelText("컬럼")).toHaveValue("sales");
  });


  it("lets users choose metrics and chart type per tab", async () => {
    const user = userEvent.setup();
    render(<App />);

    const pasteTarget = screen.getByLabelText("표 데이터 붙여넣기");
    await user.click(pasteTarget);
    await user.paste("Region\tSales\nEast\t10\nWest\t20");

    await user.selectOptions(screen.getByLabelText("컬럼"), "sales");
    let numericStats = screen.getByLabelText("숫자 통계");
    expect(within(numericStats).getByText("Variance")).toBeInTheDocument();
    expect(within(numericStats).getByText("Std dev")).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: "Variance" }));
    numericStats = screen.getByLabelText("숫자 통계");
    expect(within(numericStats).queryByText("Variance")).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("차트 타입"), "histogram");
    expect(screen.getByLabelText("차트 타입")).toHaveValue("histogram");
    expect(screen.getByLabelText("히스토그램 차트")).toBeInTheDocument();

    await user.click(pasteTarget);
    await user.paste("Item\tStock\nA\t4\nB\t6");
    expect(await screen.findByRole("tab", { name: /Pasted table 2/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByLabelText("차트 타입")).toHaveValue("bar");

    await user.click(screen.getByRole("tab", { name: /Pasted table 1/ }));
    expect(screen.getByLabelText("차트 타입")).toHaveValue("histogram");
    numericStats = screen.getByLabelText("숫자 통계");
    expect(within(numericStats).queryByText("Variance")).not.toBeInTheDocument();
  });


  it("lets users transpose table data per tab", async () => {
    const user = userEvent.setup();
    render(<App />);

    const pasteTarget = screen.getByLabelText("표 데이터 붙여넣기");
    await user.click(pasteTarget);
    await user.paste("Metric\tQ1\tQ2\nSales\t10\t20\nProfit\t1\t2");

    expect(await screen.findByRole("tab", { name: /Pasted table 1/ })).toBeInTheDocument();
    expect(screen.getByLabelText("컬럼")).toHaveValue("metric");

    await user.click(screen.getByRole("button", { name: "전치" }));
    expect(screen.getByRole("button", { name: "전치" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("컬럼")).toHaveValue("metric");

    await user.selectOptions(screen.getByLabelText("컬럼"), "sales");
    expect(within(screen.getByLabelText("숫자 통계")).getByText("Sum")).toBeInTheDocument();
    expect(within(screen.getByLabelText("숫자 통계")).getByText("30")).toBeInTheDocument();

    await user.click(pasteTarget);
    await user.paste("Item\tStock\nA\t4\nB\t6");
    expect(await screen.findByRole("tab", { name: /Pasted table 2/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("button", { name: "원본" })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("tab", { name: /Pasted table 1/ }));
    expect(screen.getByRole("button", { name: "전치" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("컬럼")).toHaveValue("sales");
  });

  it("lets users switch chart direction per tab", async () => {
    const user = userEvent.setup();
    render(<App />);

    const pasteTarget = screen.getByLabelText("표 데이터 붙여넣기");
    await user.click(pasteTarget);
    await user.paste("Region\tSales\nEast\t10\nWest\t20");

    expect(await screen.findByRole("tab", { name: /Pasted table 1/ })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "가로" }));

    expect(screen.getByRole("button", { name: "가로" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("가로 차트")).toBeInTheDocument();

    await user.click(pasteTarget);
    await user.paste("Item\tStock\nA\t4\nB\t6");
    expect(await screen.findByRole("tab", { name: /Pasted table 2/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("button", { name: "세로" })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("tab", { name: /Pasted table 1/ }));
    expect(screen.getByRole("button", { name: "가로" })).toHaveAttribute("aria-pressed", "true");
  });


  it("shows matrix tables as x, series, value charts", async () => {
    const user = userEvent.setup();
    render(<App />);

    const pasteTarget = screen.getByLabelText("표 데이터 붙여넣기");
    await user.click(pasteTarget);
    await user.paste("Metric\tJan\tFeb\nSales\t100\t120\nProfit\t20\t30");

    expect(await screen.findByRole("tab", { name: /Pasted table 1/ })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "매트릭스" }));

    expect(screen.getByRole("button", { name: "매트릭스" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("매트릭스 차트")).toBeInTheDocument();

    const stats = screen.getByLabelText("매트릭스 통계");
    expect(within(stats).getByText("X values")).toBeInTheDocument();
    expect(within(stats).getByText("Series")).toBeInTheDocument();
    expect(within(stats).getByText("Values")).toBeInTheDocument();

    expect(screen.getByRole("columnheader", { name: "X" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Series" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Value" })).toBeInTheDocument();
    expect(screen.getByRole("row", { name: "Jan Sales 100" })).toBeInTheDocument();
  });

});
