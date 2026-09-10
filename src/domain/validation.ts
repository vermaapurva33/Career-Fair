import type { Student, ValidationErrorCode, ValidationResult } from "../types";

function toFiniteNumber(value: number | string): number | null {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : null;
}

export function validateStudent(student: Student): ValidationResult {
  const errors: ValidationErrorCode[] = [];

  if (student.branch.trim() === "") {
    errors.push("INVALID_BRANCH");
  }

  const cgpa = toFiniteNumber(student.cgpa);
  if (cgpa === null || cgpa < 0 || cgpa > 10) {
    errors.push("INVALID_CGPA");
  }

  const year = toFiniteNumber(student.graduationYear);
  if (year === null || !Number.isInteger(year) || year < 2000 || year > 2100) {
    errors.push("INVALID_GRADUATION_YEAR");
  }

  const backlogs = toFiniteNumber(student.activeBacklogs);
  if (backlogs === null || !Number.isInteger(backlogs) || backlogs < 0) {
    errors.push("INVALID_BACKLOG_COUNT");
  }

  return { valid: errors.length === 0, errors };
}