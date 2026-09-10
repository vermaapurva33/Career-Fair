import { describe, it, expect } from "vitest";
import { validateStudent } from "../src/domain/validation";
import type { Student } from "../src/types";

const baseStudent: Student = {
  branch: "CSE",
  cgpa: 8.1,
  graduationYear: 2027,
  activeBacklogs: 1,
  skills: "Git, Python, SQL",
};

describe("validateStudent", () => {
  it("accepts the built-in profile", () => {
    const result = validateStudent(baseStudent);
    expect(result).toEqual({ valid: true, errors: [] });
  });

  it("rejects a blank branch", () => {
    const result = validateStudent({ ...baseStudent, branch: "" });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("INVALID_BRANCH");
  });

  it("rejects a whitespace-only branch", () => {
    const result = validateStudent({ ...baseStudent, branch: "   " });
    expect(result.errors).toContain("INVALID_BRANCH");
  });

  it.each([0, 10])("accepts CGPA boundary %d", (cgpa) => {
    const result = validateStudent({ ...baseStudent, cgpa });
    expect(result.errors).not.toContain("INVALID_CGPA");
  });

  it.each([-0.1, 10.1, 10.5])("rejects out-of-range CGPA %d", (cgpa) => {
    const result = validateStudent({ ...baseStudent, cgpa });
    expect(result.errors).toContain("INVALID_CGPA");
  });

  it("rejects non-numeric CGPA", () => {
    const result = validateStudent({ ...baseStudent, cgpa: "abc" });
    expect(result.errors).toContain("INVALID_CGPA");
  });

  it.each([1999, 2101, 2027.5])(
    "rejects invalid graduation year %d",
    (graduationYear) => {
      const result = validateStudent({ ...baseStudent, graduationYear });
      expect(result.errors).toContain("INVALID_GRADUATION_YEAR");
    }
  );

  it.each([-1, 1.5])("rejects invalid backlog count %d", (activeBacklogs) => {
    const result = validateStudent({ ...baseStudent, activeBacklogs });
    expect(result.errors).toContain("INVALID_BACKLOG_COUNT");
  });

  it("accepts zero backlogs", () => {
    const result = validateStudent({ ...baseStudent, activeBacklogs: 0 });
    expect(result.errors).not.toContain("INVALID_BACKLOG_COUNT");
  });
});