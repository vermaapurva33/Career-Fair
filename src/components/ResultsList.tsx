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