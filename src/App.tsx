import { useState } from "react";
import type { EvaluationResult, Student, ValidationErrorCode } from "./types";
import { defaultStudent } from "./data/defaultStudent";
import { roles } from "./data/roles";
import { validateStudent } from "./domain/validation";
import { evaluateAllRoles } from "./domain/eligibility";
import { sortResults } from "./domain/sorting";

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

      <div>
        <label>
          Branch:{" "}
          <input
            value={state.student.branch}
            onChange={(e) =>
              handleStudentChange({ ...state.student, branch: e.target.value })
            }
          />
        </label>
      </div>

      <div>
        <label>
          CGPA:{" "}
          <input
            value={state.student.cgpa}
            onChange={(e) =>
              handleStudentChange({ ...state.student, cgpa: e.target.value })
            }
          />
        </label>
      </div>

      <div>
        <label>
          Graduation Year:{" "}
          <input
            value={state.student.graduationYear}
            onChange={(e) =>
              handleStudentChange({
                ...state.student,
                graduationYear: e.target.value,
              })
            }
          />
        </label>
      </div>

      <div>
        <label>
          Active Backlogs:{" "}
          <input
            value={state.student.activeBacklogs}
            onChange={(e) =>
              handleStudentChange({
                ...state.student,
                activeBacklogs: e.target.value,
              })
            }
          />
        </label>
      </div>

      <div>
        <label>
          Skills:{" "}
          <input
            value={state.student.skills}
            onChange={(e) =>
              handleStudentChange({ ...state.student, skills: e.target.value })
            }
          />
        </label>
      </div>

      <div>
        <button onClick={handleSample}>Sample</button>
        <button onClick={handleReset}>Reset</button>
        <button onClick={handleEvaluate}>Evaluate</button>
      </div>

      {state.validationErrors.length > 0 && (
        <ul>
          {state.validationErrors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      )}

      {state.hasEvaluated && state.validationErrors.length === 0 && (
        <div>
          <p>
            Eligible: {state.eligibleCount} | Ineligible:{" "}
            {state.ineligibleCount}
          </p>
          <ul>
            {state.results.map((result) => (
              <li key={result.role.id}>
                {result.role.title} ({result.role.id}) — {result.status}
                {result.failures.length > 0 && (
                  <ul>
                    {result.failures.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;