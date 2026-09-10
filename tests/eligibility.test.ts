import { describe, it, expect } from "vitest";
import { evaluateRole, evaluateAllRoles } from "../src/domain/eligibility";
import { roles } from "../src/data/roles";
import type { Student } from "../src/types";

const baseStudent: Student = {
  branch: "CSE",
  cgpa: 8.1,
  graduationYear: 2027,
  activeBacklogs: 1,
  skills: "Git, Python, SQL",
};

const byId = (id: string) => roles.find((r) => r.id === id)!;

describe("evaluateRole", () => {
  it("CF01 is eligible for the built-in profile", () => {
    const result = evaluateRole(baseStudent, byId("CF01"));
    expect(result.status).toBe("ELIGIBLE");
    expect(result.failures).toEqual([]);
  });

  it("CF02 is eligible for the built-in profile", () => {
    const result = evaluateRole(baseStudent, byId("CF02"));
    expect(result.status).toBe("ELIGIBLE");
  });

  it("CF03 fails only on branch", () => {
    const result = evaluateRole(baseStudent, byId("CF03"));
    expect(result.status).toBe("INELIGIBLE");
    expect(result.failures).toEqual(["BRANCH_NOT_ALLOWED"]);
  });

  it("CF04 fails only on CGPA", () => {
    const result = evaluateRole(baseStudent, byId("CF04"));
    expect(result.failures).toEqual(["CGPA_BELOW_MINIMUM"]);
  });

  it("CF05 fails on year, backlogs, and missing Docker, in that order", () => {
    const result = evaluateRole(baseStudent, byId("CF05"));
    expect(result.failures).toEqual([
      "GRADUATION_YEAR_NOT_ALLOWED",
      "TOO_MANY_ACTIVE_BACKLOGS",
      "MISSING_SKILL: Docker",
    ]);
  });

  it("CF04 becomes eligible at CGPA 8.5", () => {
    const student = { ...baseStudent, cgpa: 8.5 };
    const result = evaluateRole(student, byId("CF04"));
    expect(result.status).toBe("ELIGIBLE");
  });

  it("reports multiple missing skills alphabetically, case-insensitive", () => {
    const student = { ...baseStudent, skills: "git" };
    const result = evaluateRole(student, byId("CF05"));
    expect(result.failures).toContain("MISSING_SKILL: Docker");
    expect(result.failures).not.toContain("MISSING_SKILL: Git");
  });

  it("branch comparison is case-insensitive", () => {
    const student = { ...baseStudent, branch: " cse " };
    const result = evaluateRole(student, byId("CF01"));
    expect(result.failures).not.toContain("BRANCH_NOT_ALLOWED");
  });
});

describe("evaluateAllRoles", () => {
  it("returns 5 results for the built-in profile with 2 eligible", () => {
    const results = evaluateAllRoles(baseStudent, roles);
    expect(results).toHaveLength(5);
    const eligible = results.filter((r) => r.status === "ELIGIBLE");
    expect(eligible).toHaveLength(2);
    expect(eligible.map((r) => r.role.id).sort()).toEqual(["CF01", "CF02"]);
  });
});