export default function Card({ children, className, onClick }) {
  return (
    <div className={`card ${className || ""}`.trim()} onClick={onClick}>
      {children}
    </div>
  );
}
