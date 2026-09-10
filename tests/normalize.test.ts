import { describe, it, expect } from "vitest";
import { normalizeBranch, normalizeSkills } from "../src/domain/normalize";

describe("normalizeBranch", () => {
  it("trims and lowercases", () => {
    expect(normalizeBranch(" CSE ")).toBe("cse");
    expect(normalizeBranch("cse")).toBe("cse");
    expect(normalizeBranch("CSE")).toBe("cse");
  });
});

describe("normalizeSkills", () => {
  it("splits, trims, lowercases, drops empties, dedupes", () => {
    const input = " Git, Python, python, SQL, , Git ";
    const result = normalizeSkills(input);
    expect(result).toEqual(["git", "python", "sql"]);
  });

  it("returns an empty array for an empty string", () => {
    expect(normalizeSkills("")).toEqual([]);
  });

  it("preserves first-seen order after dedupe", () => {
    expect(normalizeSkills("SQL, Git, sql")).toEqual(["sql", "git"]);
  });
});