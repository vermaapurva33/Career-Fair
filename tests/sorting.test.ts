import { describe, it, expect } from "vitest";
import { sortResults } from "../src/domain/sorting";
import { evaluateAllRoles } from "../src/domain/eligibility";
import { roles } from "../src/data/roles";
import type { Student } from "../src/types";

const baseStudent: Student = {
  branch: "CSE",
  cgpa: 8.1,
  graduationYear: 2027,
  activeBacklogs: 1,
  skills: "Git, Python, SQL",
};

describe("sortResults", () => {
  it("puts all eligible results before ineligible results", () => {
    const results = evaluateAllRoles(baseStudent, roles);
    const sorted = sortResults(results);

    const statuses = sorted.map((r) => r.status);
    const firstIneligible = statuses.indexOf("INELIGIBLE");
    const lastEligible = statuses.lastIndexOf("ELIGIBLE");
    expect(firstIneligible).toBeGreaterThan(lastEligible);
  });

  it("orders the 8.5 CGPA acceptance case as CF01, CF04, CF02 within eligible", () => {
    const student = { ...baseStudent, cgpa: 8.5 };
    const results = evaluateAllRoles(student, roles);
    const sorted = sortResults(results);

    const eligibleIds = sorted
      .filter((r) => r.status === "ELIGIBLE")
      .map((r) => r.role.id);

    expect(eligibleIds).toEqual(["CF01", "CF04", "CF02"]);
  });

  it("sorts title case-insensitively with id as tie-breaker", () => {
    const results = evaluateAllRoles(baseStudent, roles);
    const sorted = sortResults(results);

    const titles = sorted.map((r) => r.role.title.toLowerCase());
    const eligibleCount = sorted.filter((r) => r.status === "ELIGIBLE").length;
    const ineligibleCount = sorted.filter(
      (r) => r.status === "INELIGIBLE"
    ).length;

    const eligibleTitles = titles.slice(0, eligibleCount);
    const ineligibleTitles = titles.slice(eligibleCount);

    expect(eligibleTitles).toEqual([...eligibleTitles].sort());
    expect(ineligibleTitles).toEqual([...ineligibleTitles].sort());
    expect(eligibleCount + ineligibleCount).toBe(5);
  });
});