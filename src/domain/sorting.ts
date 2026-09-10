import type { EvaluationResult } from "../types";

function compareRoles(a: EvaluationResult, b: EvaluationResult): number {
  const titleCompare = a.role.title.localeCompare(b.role.title, undefined, {
    sensitivity: "base",
  });

  if (titleCompare !== 0) {
    return titleCompare;
  }

  return a.role.id.localeCompare(b.role.id);
}

export function sortResults(results: EvaluationResult[]): EvaluationResult[] {
  const eligible = results
    .filter((result) => result.status === "ELIGIBLE")
    .sort(compareRoles);

  const ineligible = results
    .filter((result) => result.status === "INELIGIBLE")
    .sort(compareRoles);

  return [...eligible, ...ineligible];
}