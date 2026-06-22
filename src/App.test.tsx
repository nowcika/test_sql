import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import App from "./App";

vi.mock("./components/ChartPanel", () => ({
  ChartPanel: () => <section aria-label="chart">Chart</section>,
}));

describe("App", () => {
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
});
