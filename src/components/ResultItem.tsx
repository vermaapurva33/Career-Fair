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