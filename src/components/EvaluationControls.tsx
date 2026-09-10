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