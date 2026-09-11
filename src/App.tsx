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

      <StudentProfile
        student={state.student}
        onChange={handleStudentChange}
      />

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

      {/* <ResultsList results={state.results} /> */}
      {state.results.length > 0 && (
        <div>
          <button onClick={() => setViewMode("list")} disabled={viewMode === "list"}>
            List View
          </button>
          <button onClick={() => setViewMode("cards")} disabled={viewMode === "cards"}>
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