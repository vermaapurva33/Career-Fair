import type { EvaluationResult, Role, Student } from "../types";
import { normalizeBranch, normalizeSkills } from "./normalize";

export function evaluateRole(student: Student, role: Role): EvaluationResult {
  const failures: string[] = [];

  const studentBranch = normalizeBranch(student.branch);
  const branchAllowed = role.allowedBranches.some(
    (b) => normalizeBranch(b) === studentBranch
  );
  if (!branchAllowed) {
    failures.push("BRANCH_NOT_ALLOWED");
  }

  const cgpa = Number(student.cgpa);
  if (cgpa < role.minimumCgpa) {
    failures.push("CGPA_BELOW_MINIMUM");
  }

  const year = Number(student.graduationYear);
  if (!role.allowedGraduationYears.includes(year)) {
    failures.push("GRADUATION_YEAR_NOT_ALLOWED");
  }

  const backlogs = Number(student.activeBacklogs);
  if (backlogs > role.maximumActiveBacklogs) {
    failures.push("TOO_MANY_ACTIVE_BACKLOGS");
  }

  const studentSkills = normalizeSkills(student.skills);
  const missingSkills = role.requiredSkills
    .filter((skill) => !studentSkills.includes(skill.toLowerCase()))
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

  for (const skill of missingSkills) {
    failures.push(`MISSING_SKILL: ${skill}`);
  }

  return {
    role,
    status: failures.length === 0 ? "ELIGIBLE" : "INELIGIBLE",
    failures,
  };
}

export function evaluateAllRoles(
  student: Student,
  roles: Role[]
): EvaluationResult[] {
  return roles.map((role) => evaluateRole(student, role));
}