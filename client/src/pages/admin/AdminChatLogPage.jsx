import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../../api.js";

export default function AdminChatLogPage() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState(null);

  const load = () => {
    setErr(null);
    apiGet("/api/admin/site-chat?limit=200")
      .then(setRows)
      .catch(() => setErr("بارگذاری ناموفق"));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <p className="field-hint" style={{ marginTop: 0, marginBottom: "var(--space-md)" }}>
        <Link to="/admin">← داشبورد</Link>
        <button type="button" className="btn btn--ghost" style={{ marginInlineStart: "0.5rem" }} onClick={load}>
          تازه‌سازی
        </button>
      </p>
      <section className="dashboard-panel">
        <h2>گفتگو و لاگ سایت</h2>
        <p className="field-hint">رکوردهای ذخیره‌شده در سرور (ویجت گفتگو از سایت حذف شده است).</p>
        {err && <p className="field-hint">{err}</p>}
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>زمان</th>
                <th>نام</th>
                <th>پیام</th>
                <th>مسیر</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td dir="ltr" style={{ whiteSpace: "nowrap" }}>
                    {r.created_at}
                  </td>
                  <td>{r.visitor_name || "—"}</td>
                  <td style={{ maxWidth: "20rem", wordBreak: "break-word" }}>{r.message}</td>
                  <td dir="ltr" style={{ fontSize: "0.8rem", maxWidth: "12rem", wordBreak: "break-all" }}>
                    {r.path || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
