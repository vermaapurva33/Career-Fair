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
    <p>
      Eligible: {eligibleCount} | Ineligible: {ineligibleCount}
    </p>
  );
}

export default EvaluationSummary;