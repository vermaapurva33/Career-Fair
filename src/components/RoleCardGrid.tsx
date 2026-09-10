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