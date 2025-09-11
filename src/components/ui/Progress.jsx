export function Progress({ value = 0 }) {
  return (
    <div className="progress-wrap">
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
