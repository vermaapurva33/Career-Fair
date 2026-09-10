import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "../src/App";

function getInput(labelText: string) {
  return screen.getByLabelText(new RegExp(labelText, "i"));
}

describe("App integration", () => {
  it("evaluates the built-in profile as 2 eligible, 3 ineligible", () => {
    render(<App />);
    fireEvent.click(screen.getByText("Evaluate"));

    expect(screen.getByText(/Eligible: 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Ineligible: 3/i)).toBeInTheDocument();
  });

  it("makes CF04 eligible at CGPA 8.5 and orders eligible results CF01, CF04, CF02", () => {
    render(<App />);

    fireEvent.change(getInput("CGPA"), { target: { value: "8.5" } });
    fireEvent.click(screen.getByText("Evaluate"));

    expect(screen.getByText(/Eligible: 3/i)).toBeInTheDocument();
    expect(screen.getByText(/Ineligible: 2/i)).toBeInTheDocument();

    const listItems = screen.getAllByRole("listitem");
    const eligibleTitles = listItems
      .map((el) => el.textContent ?? "")
      .filter((text) => text.includes("ELIGIBLE") && !text.includes("INELIGIBLE"));

    expect(eligibleTitles[0]).toContain("CF01");
    expect(eligibleTitles[1]).toContain("CF04");
    expect(eligibleTitles[2]).toContain("CF02");
  });

  it("shows INVALID_CGPA and clears results for an out-of-range CGPA", () => {
    render(<App />);

    fireEvent.change(getInput("CGPA"), { target: { value: "10.5" } });
    fireEvent.click(screen.getByText("Evaluate"));

    expect(screen.getByText("INVALID_CGPA")).toBeInTheDocument();
    expect(screen.queryByText(/Eligible: \d/i)).not.toBeInTheDocument();
  });

  it("reset restores the default profile and clears results", () => {
    render(<App />);

    fireEvent.change(getInput("Branch"), { target: { value: "ECE" } });
    fireEvent.click(screen.getByText("Evaluate"));
    fireEvent.click(screen.getByText("Reset"));

    expect(getInput("Branch")).toHaveValue("CSE");
    expect(screen.queryByText(/Eligible: \d/i)).not.toBeInTheDocument();
  });

  it("sample loads the default profile without auto-evaluating", () => {
    render(<App />);

    fireEvent.change(getInput("Branch"), { target: { value: "ECE" } });
    fireEvent.click(screen.getByText("Sample"));

    expect(getInput("Branch")).toHaveValue("CSE");
    expect(screen.queryByText(/Eligible: \d/i)).not.toBeInTheDocument();
  });
});