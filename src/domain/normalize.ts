export function normalizeBranch(branch: string): string {
  return branch.trim().toLowerCase();
}

export function normalizeSkills(input: string): string[] {
  return [
    ...new Set(
      input
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
        .map((skill) => skill.toLowerCase())
    ),
  ];
}