import { Link } from "react-router-dom";

export default function AdminPlaceholderPage({ title }) {
  return (
    <>
      <p className="field-hint" style={{ marginTop: 0, marginBottom: "var(--space-md)" }}>
        <Link to="/admin">← داشبورد</Link>
      </p>
      <section className="dashboard-panel">
        <h2>{title}</h2>
        <p className="field-hint">صفحهٔ مدیریتی؛ فرم کامل در فاز بعدی.</p>
      </section>
    </>
  );
}
