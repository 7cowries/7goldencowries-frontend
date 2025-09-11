export default function Section({ title, subtitle, children, className }) {
  return (
    <section className={`section gradient-border ${className || ""}`.trim()}>
      {title && <h2>{title}</h2>}
      {subtitle && <div className="subtitle">{subtitle}</div>}
      <div style={{ marginTop: 12 }}>{children}</div>
    </section>
  );
}
