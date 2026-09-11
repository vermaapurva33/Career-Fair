# Project Context — Career Fair Eligibility Shortlist

Paste this entire file to an AI assistant before asking for any live-demo change. It contains the full spec, architecture, and current source code so the assistant has complete context without guessing at file contents.

---

## 1. Project Summary

A client-side React + TypeScript app (Vite build). A student profile (branch, CGPA, graduation year, active backlogs, skills) is validated, then evaluated against five fixed career-fair roles. Every applicable failure reason is reported per role (not just the first). Results are sorted (eligible first, then ineligible; each group alphabetical by role title, role ID as tie-breaker) and shown as a list or an optional card grid — both driven by the same computed result array. No backend, database, or API — everything is local, synchronous, and deterministic.

## 2. Core Contract / Business Rules

**Validation** (`domain/validation.ts`):
- branch: non-blank after trim → else `INVALID_BRANCH`
- cgpa: finite number, `0 <= cgpa <= 10` → else `INVALID_CGPA`
- graduationYear: whole number, `2000 <= year <= 2100` → else `INVALID_GRADUATION_YEAR`
- activeBacklogs: whole number, `>= 0` → else `INVALID_BACKLOG_COUNT`

**Eligibility** (`domain/eligibility.ts`) — every rule checked independently, no early returns, failures collected in this exact order:
1. `BRANCH_NOT_ALLOWED` (case-insensitive branch match)
2. `CGPA_BELOW_MINIMUM` (strict `<`, so meeting minimum exactly = pass)
3. `GRADUATION_YEAR_NOT_ALLOWED`
4. `TOO_MANY_ACTIVE_BACKLOGS` (strict `>`, so meeting max exactly = pass)
5. `MISSING_SKILL: <skill>` for each missing required skill, alphabetical, case-insensitive, one line per missing skill

**Normalization** (`domain/normalize.ts`):
- branch: trim + lowercase
- skills: split on comma, trim each, drop empties, lowercase, dedupe, preserve first-seen order

**Sorting** (`domain/sorting.ts`):
- Partition: all ELIGIBLE before all INELIGIBLE
- Within each group: sort by `role.title` ascending (case-insensitive), tie-break by `role.id` ascending

**Fixed roles** (`data/roles.ts`): CF01 Data Operations Intern, CF02 QA Automation Intern, CF03 Embedded Systems Intern, CF04 Machine Learning Intern, CF05 Platform Engineering Intern — full field values in the file below.

**Built-in student profile** (`data/defaultStudent.ts`): CSE, 8.1 CGPA, 2027, 1 backlog, "Git, Python, SQL".

## 3. Project Structure

    src/
    ├── components/
    │   ├── StudentProfile.tsx
    │   ├── RoleRequirements.tsx
    │   ├── EvaluationControls.tsx
    │   ├── EvaluationSummary.tsx
    │   ├── ResultsList.tsx
    │   ├── ResultItem.tsx
    │   ├── RoleCard.tsx
    │   └── RoleCardGrid.tsx
    ├── data/
    │   ├── roles.ts
    │   └── defaultStudent.ts
    ├── domain/
    │   ├── normalize.ts
    │   ├── validation.ts
    │   ├── eligibility.ts
    │   └── sorting.ts
    ├── types/
    │   └── index.ts
    ├── App.tsx
    ├── App.css
    ├── index.css
    └── setupTests.ts

    tests/
    ├── normalize.test.ts
    ├── validation.test.ts
    ├── eligibility.test.ts
    ├── sorting.test.ts
    └── app.test.tsx

## 4. Architectural Principles (do not violate these when making changes)

- **Single source of truth:** `domain/eligibility.ts` is the only place eligibility is computed. All views (`ResultsList`, `RoleCardGrid`, `EvaluationSummary`) render `state.results` from `App.tsx` — they never recompute anything themselves.
- **No early returns in `evaluateRole`:** every rule must be checked independently so every applicable failure is reported.
- **Domain layer has zero React dependency:** `normalize.ts`, `validation.ts`, `eligibility.ts`, `sorting.ts` are pure functions, framework-agnostic, independently unit-tested.
- **Components are presentational only:** no component calls into `domain/` directly; all data flows down as props from `App.tsx`.
- **Fixed data over hardcoded logic:** the five roles are data (`data/roles.ts`), not conditional branches in code — adding/editing a role should only ever require editing that one file.

---

## 5. Full Source Code

### `src/types/index.ts`

```typescript
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
```

### `src/data/defaultStudent.ts`

```typescript
import type { Student } from "../types";

export const defaultStudent: Student = {
  branch: "CSE",
  cgpa: 8.1,
  graduationYear: 2027,
  activeBacklogs: 1,
  skills: "Git, Python, SQL",
};
```

### `src/data/roles.ts`

```typescript
import type { Role } from "../types";

export const roles: Role[] = [
  {
    id: "CF01",
    title: "Data Operations Intern",
    allowedBranches: ["CSE", "IT"],
    minimumCgpa: 7.5,
    allowedGraduationYears: [2027],
    maximumActiveBacklogs: 1,
    requiredSkills: ["Python", "SQL"],
  },
  {
    id: "CF02",
    title: "QA Automation Intern",
    allowedBranches: ["CSE", "ECE", "IT"],
    minimumCgpa: 7.0,
    allowedGraduationYears: [2027, 2028],
    maximumActiveBacklogs: 1,
    requiredSkills: ["Git"],
  },
  {
    id: "CF03",
    title: "Embedded Systems Intern",
    allowedBranches: ["ECE", "EEE"],
    minimumCgpa: 7.5,
    allowedGraduationYears: [2027],
    maximumActiveBacklogs: 1,
    requiredSkills: ["Git"],
  },
  {
    id: "CF04",
    title: "Machine Learning Intern",
    allowedBranches: ["CSE", "IT"],
    minimumCgpa: 8.5,
    allowedGraduationYears: [2027],
    maximumActiveBacklogs: 1,
    requiredSkills: ["Python"],
  },
  {
    id: "CF05",
    title: "Platform Engineering Intern",
    allowedBranches: ["CSE", "ECE"],
    minimumCgpa: 7.0,
    allowedGraduationYears: [2026],
    maximumActiveBacklogs: 0,
    requiredSkills: ["Docker", "Git"],
  },
];
```

### `src/domain/normalize.ts`

```typescript
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
```

### `src/domain/validation.ts`

```typescript
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
```

### `src/domain/eligibility.ts`

```typescript
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
```

### `src/domain/sorting.ts`

```typescript
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
```

### `src/App.tsx`

```tsx
import { useState } from "react";
import type { EvaluationResult, Student, ValidationErrorCode } from "./types";
import { defaultStudent } from "./data/defaultStudent";
import { roles } from "./data/roles";
import { validateStudent } from "./domain/validation";
import { evaluateAllRoles } from "./domain/eligibility";
import { sortResults } from "./domain/sorting";
import StudentProfile from "./components/StudentProfile";
import RoleRequirements from "./components/RoleRequirements";
import EvaluationControls from "./components/EvaluationControls";
import EvaluationSummary from "./components/EvaluationSummary";
import ResultsList from "./components/ResultsList";
import RoleCardGrid from "./components/RoleCardGrid";
import "./App.css";

interface AppState {
  student: Student;
  results: EvaluationResult[];
  eligibleCount: number;
  ineligibleCount: number;
  validationErrors: ValidationErrorCode[];
  hasEvaluated: boolean;
}

const initialState: AppState = {
  student: defaultStudent,
  results: [],
  eligibleCount: 0,
  ineligibleCount: 0,
  validationErrors: [],
  hasEvaluated: false,
};

function App() {
  const [state, setState] = useState<AppState>(initialState);
  const [viewMode, setViewMode] = useState<"list" | "cards">("list");

  function handleStudentChange(next: Student) {
    setState((prev) => ({ ...prev, student: next }));
  }

  function handleEvaluate() {
    const validation = validateStudent(state.student);

    if (!validation.valid) {
      setState((prev) => ({
        ...prev,
        results: [],
        eligibleCount: 0,
        ineligibleCount: 0,
        validationErrors: validation.errors,
        hasEvaluated: true,
      }));
      return;
    }

    const evaluated = evaluateAllRoles(state.student, roles);
    const sorted = sortResults(evaluated);
    const eligibleCount = sorted.filter((r) => r.status === "ELIGIBLE").length;
    const ineligibleCount = sorted.length - eligibleCount;

    setState((prev) => ({
      ...prev,
      results: sorted,
      eligibleCount,
      ineligibleCount,
      validationErrors: [],
      hasEvaluated: true,
    }));
  }

  function handleReset() {
    setState(initialState);
  }

  function handleSample() {
    setState((prev) => ({ ...prev, student: defaultStudent }));
  }

  return (
    <div>
      <h1>Career Fair Eligibility Shortlist</h1>

      <StudentProfile student={state.student} onChange={handleStudentChange} />

      <RoleRequirements roles={roles} />

      <EvaluationControls
        onSample={handleSample}
        onReset={handleReset}
        onEvaluate={handleEvaluate}
      />

      <EvaluationSummary
        hasEvaluated={state.hasEvaluated}
        eligibleCount={state.eligibleCount}
        ineligibleCount={state.ineligibleCount}
        validationErrors={state.validationErrors}
      />

      {state.results.length > 0 && (
        <div>
          <button
            onClick={() => setViewMode("list")}
            disabled={viewMode === "list"}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode("cards")}
            disabled={viewMode === "cards"}
          >
            Card View
          </button>
        </div>
      )}

      {viewMode === "list" ? (
        <ResultsList results={state.results} />
      ) : (
        <RoleCardGrid results={state.results} />
      )}
    </div>
  );
}

export default App;
```

### `src/components/StudentProfile.tsx`

```tsx
import type { Student } from "../types";

interface StudentProfileProps {
  student: Student;
  onChange: (next: Student) => void;
}

function StudentProfile({ student, onChange }: StudentProfileProps) {
  return (
    <fieldset>
      <legend>Student Profile</legend>

      <div>
        <label>
          Branch:{" "}
          <input
            value={student.branch}
            onChange={(e) => onChange({ ...student, branch: e.target.value })}
          />
        </label>
      </div>

      <div>
        <label>
          CGPA:{" "}
          <input
            value={student.cgpa}
            onChange={(e) => onChange({ ...student, cgpa: e.target.value })}
          />
        </label>
      </div>

      <div>
        <label>
          Graduation Year:{" "}
          <input
            value={student.graduationYear}
            onChange={(e) =>
              onChange({ ...student, graduationYear: e.target.value })
            }
          />
        </label>
      </div>

      <div>
        <label>
          Active Backlogs:{" "}
          <input
            value={student.activeBacklogs}
            onChange={(e) =>
              onChange({ ...student, activeBacklogs: e.target.value })
            }
          />
        </label>
      </div>

      <div>
        <label>
          Skills:{" "}
          <input
            value={student.skills}
            onChange={(e) => onChange({ ...student, skills: e.target.value })}
          />
        </label>
      </div>
    </fieldset>
  );
}

export default StudentProfile;
```

### `src/components/RoleRequirements.tsx`

```tsx
import type { Role } from "../types";

interface RoleRequirementsProps {
  roles: Role[];
}

function RoleRequirements({ roles }: RoleRequirementsProps) {
  return (
    <fieldset>
      <legend>Role Requirements</legend>
      <table>
        <thead>
          <tr>
            <th scope="col">Role</th>
            <th scope="col">Branches</th>
            <th scope="col">Min CGPA</th>
            <th scope="col">Graduation Years</th>
            <th scope="col">Max Backlogs</th>
            <th scope="col">Required Skills</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id}>
              <th scope="row">
                {role.title} ({role.id})
              </th>
              <td>{role.allowedBranches.join(", ")}</td>
              <td>{role.minimumCgpa}</td>
              <td>{role.allowedGraduationYears.join(", ")}</td>
              <td>{role.maximumActiveBacklogs}</td>
              <td>{role.requiredSkills.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </fieldset>
  );
}

export default RoleRequirements;
```

### `src/components/EvaluationControls.tsx`

```tsx
interface EvaluationControlsProps {
  onSample: () => void;
  onReset: () => void;
  onEvaluate: () => void;
}

function EvaluationControls({
  onSample,
  onReset,
  onEvaluate,
}: EvaluationControlsProps) {
  return (
    <div>
      <button onClick={onSample}>Sample</button>
      <button onClick={onReset}>Reset</button>
      <button onClick={onEvaluate}>Evaluate</button>
    </div>
  );
}

export default EvaluationControls;
```

### `src/components/EvaluationSummary.tsx`

```tsx
import type { ValidationErrorCode } from "../types";

interface EvaluationSummaryProps {
  hasEvaluated: boolean;
  eligibleCount: number;
  ineligibleCount: number;
  validationErrors: ValidationErrorCode[];
}

function EvaluationSummary({
  hasEvaluated,
  eligibleCount,
  ineligibleCount,
  validationErrors,
}: EvaluationSummaryProps) {
  if (!hasEvaluated) {
    return null;
  }

  if (validationErrors.length > 0) {
    return (
      <div>
        <p>Please fix the following before evaluating:</p>
        <ul>
          {validationErrors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <p className="summary-line">
      Eligible: {eligibleCount} | Ineligible: {ineligibleCount}
    </p>
  );
}

export default EvaluationSummary;
```

### `src/components/ResultItem.tsx`

```tsx
import type { EvaluationResult } from "../types";

interface ResultItemProps {
  result: EvaluationResult;
}

function ResultItem({ result }: ResultItemProps) {
  return (
    <li className="result-item">
      <div className="result-item-header">
        <span>
          {result.role.title} ({result.role.id})
        </span>
        <span className={`status status-${result.status.toLowerCase()}`}>
          {result.status}
        </span>
      </div>
      {result.failures.length > 0 && (
        <ul>
          {result.failures.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      )}
    </li>
  );
}

export default ResultItem;
```

### `src/components/ResultsList.tsx`

```tsx
import type { EvaluationResult } from "../types";
import ResultItem from "./ResultItem";

interface ResultsListProps {
  results: EvaluationResult[];
}

function ResultsList({ results }: ResultsListProps) {
  if (results.length === 0) {
    return null;
  }

  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {results.map((result) => (
        <ResultItem key={result.role.id} result={result} />
      ))}
    </ul>
  );
}

export default ResultsList;
```

### `src/components/RoleCard.tsx`

```tsx
import type { EvaluationResult } from "../types";

interface RoleCardProps {
  result: EvaluationResult;
}

function RoleCard({ result }: RoleCardProps) {
  return (
    <div className="role-card">
      <h3>
        {result.role.title} <span>({result.role.id})</span>
      </h3>
      <p className={`status status-${result.status.toLowerCase()}`}>
        {result.status}
      </p>
      {result.failures.length > 0 && (
        <ul>
          {result.failures.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RoleCard;
```

### `src/components/RoleCardGrid.tsx`

```tsx
import type { EvaluationResult } from "../types";
import RoleCard from "./RoleCard";

interface RoleCardGridProps {
  results: EvaluationResult[];
}

function RoleCardGrid({ results }: RoleCardGridProps) {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="role-card-grid">
      {results.map((result) => (
        <RoleCard key={result.role.id} result={result} />
      ))}
    </div>
  );
}

export default RoleCardGrid;
```

### `src/index.css`

```css
:root {
  color-scheme: light;
  font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
  line-height: 1.5;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background-color: #f7f8fa;
  color: #1a1a1a;
}

a {
  color: #2563eb;
}
```

### `src/App.css`

```css
#root {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}

h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1.5rem;
}

fieldset {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  padding: 1.25rem 1.5rem;
}

legend {
  font-weight: 600;
  font-size: 0.95rem;
  color: #111827;
  padding: 0 0.5rem;
}

label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: #374151;
}

label:last-child {
  margin-bottom: 0;
}

input {
  flex: 1;
  max-width: 320px;
  padding: 0.45rem 0.6rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #111827;
  background: #ffffff;
}

input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

th,
td {
  border-bottom: 1px solid #e5e7eb;
  padding: 0.6rem 0.7rem;
  text-align: left;
  color: #1f2937;
}

thead th {
  background: #f9fafb;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.72rem;
  letter-spacing: 0.03em;
  border-bottom: 2px solid #e5e7eb;
}

tbody tr:hover {
  background: #f9fafb;
}

button {
  margin-right: 0.6rem;
  padding: 0.5rem 1.1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #ffffff;
  color: #111827;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}

button:hover:not(:disabled) {
  background: #f3f4f6;
}

button:disabled {
  opacity: 0.5;
  cursor: default;
}

button:nth-of-type(3) {
  background: #2563eb;
  border-color: #2563eb;
  color: #ffffff;
}

button:nth-of-type(3):hover:not(:disabled) {
  background: #1d4ed8;
}

.summary-line {
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
  margin: 1rem 0;
}

ul {
  padding-left: 1.25rem;
  margin: 0.5rem 0;
}

.result-item {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.9rem 1.1rem;
  margin-bottom: 0.6rem;
  list-style: none;
}

.result-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  font-weight: 500;
  color: #111827;
}

.result-item ul {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #6b7280;
}

.role-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}

.role-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.1rem;
}

.role-card h3 {
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.6rem;
}

.role-card h3 span {
  font-weight: 400;
  color: #9ca3af;
  font-size: 0.85rem;
}

.role-card ul {
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 0.6rem;
}

.status {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
}

.status-eligible {
  background: #dcfce7;
  color: #15803d;
}

.status-ineligible {
  background: #fee2e2;
  color: #b91c1c;
}
```

### `src/setupTests.ts`

```typescript
import "@testing-library/jest-dom";
```

### `vite.config.ts` (test block)

```typescript
/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.ts",
  },
});
```

---

## 6. Test Files

### `tests/normalize.test.ts`

```typescript
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
```

### `tests/validation.test.ts`

```typescript
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
```

### `tests/eligibility.test.ts`

```typescript
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
```

### `tests/sorting.test.ts`

```typescript
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
```

### `tests/app.test.tsx`

```tsx
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
      .filter(
        (text) => text.includes("ELIGIBLE") && !text.includes("INELIGIBLE")
      );

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
```

---

## 7. Instructions for the AI Assistant Reading This

When I paste a change request after this context:
1. Identify exactly which file(s) need to change — name them explicitly before writing code.
2. Preserve the architectural principles in section 4 — do not add business logic to components, do not bypass `domain/eligibility.ts` as the single source of truth, do not introduce state management libraries or a backend unless explicitly asked.
3. If the request is ambiguous (e.g., affects an existing rule's meaning, or touches scope not covered above), say so and ask, rather than guessing.
4. Give me the full updated content of only the files that actually changed — not the whole project — so I can apply it quickly.
5. If relevant, note which existing test(s) would need updating and what new test cases the change should add.
