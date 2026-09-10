// src/types/index.ts

// ---------- Student ----------
export interface Student {
  branch: string;
  cgpa: number | string;
  graduationYear: number | string;
  activeBacklogs: number | string;
  skills: string;
}

// ---------- Role ----------
export interface Role {
  id: string;
  title: string;
  allowedBranches: string[];
  minimumCgpa: number;
  allowedGraduationYears: number[];
  maximumActiveBacklogs: number;
  requiredSkills: string[];
}

// ---------- Evaluation ----------
export type RoleStatus = "ELIGIBLE" | "INELIGIBLE";

export interface EvaluationResult {
  role: Role;
  status: RoleStatus;
  failures: string[];
}

// ---------- Validation ----------
export type ValidationErrorCode =
  | "INVALID_BRANCH"
  | "INVALID_CGPA"
  | "INVALID_GRADUATION_YEAR"
  | "INVALID_BACKLOG_COUNT";

export interface ValidationResult {
  valid: boolean;
  errors: ValidationErrorCode[];
}