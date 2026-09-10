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