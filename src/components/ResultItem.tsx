import type { EvaluationResult } from "../types";

interface ResultItemProps {
  result: EvaluationResult;
}

function ResultItem({ result }: ResultItemProps) {
  return (
    <li>
      {result.role.title} ({result.role.id}) — {result.status}
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