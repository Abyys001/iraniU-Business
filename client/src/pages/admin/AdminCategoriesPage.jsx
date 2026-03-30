import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet, apiPost, apiPatchJson } from "../../api.js";

export default function AdminCategoriesPage() {
  const [rows, setRows] = useState([]);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => {
    apiGet("/api/admin/categories")
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .catch(() => setRows([]));
  };

  useEffect(() => {
    load();
  }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setMsg("");
    try {
      await apiPost("/api/admin/categories", { name: name.trim() });
      setName("");
      setMsg("دسته جدید اضافه شد.");
      load();
    } catch (err) {
      setMsg(err.message || "خطا در افزودن دسته");
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (row) => {
    try {
      const next = await apiPatchJson(`/api/admin/categories/${row.id}`, { is_active: !row.is_active });
      setRows((prev) => prev.map((r) => (r.id === next.id ? next : r)));
    } catch (e) {
      setMsg(e.message || "خطا در تغییر وضعیت");
    }
  };

  return (
    <>
      <p className="field-hint" style={{ marginTop: 0, marginBottom: "var(--space-md)" }}>
        <Link to="/admin">← داشبورد</Link>
      </p>
      <section className="dashboard-panel">
        <h2>دسته‌بندی‌ها</h2>
        <p className="field-hint">دسته‌های فعال در فرم مدیر کسب‌وکار به صورت Dropdown نمایش داده می‌شوند.</p>
        <form onSubmit={add} className="form-grid" style={{ maxWidth: "24rem" }}>
          <div className="field field--block">
            <label htmlFor="cat-name">نام دسته</label>
            <input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="dashboard-actions dashboard-actions--inline">
            <button className="btn btn--primary" disabled={busy}>
              {busy ? "در حال افزودن…" : "افزودن دسته"}
            </button>
          </div>
        </form>
        {!!msg && <p className="field-hint">{msg}</p>}
        <div className="table-wrap" style={{ marginTop: "1rem" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>نام</th>
                <th>وضعیت</th>
                <th>اقدام</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.is_active ? "فعال" : "غیرفعال"}</td>
                  <td>
                    <button type="button" className="btn btn--ghost" onClick={() => toggle(r)}>
                      {r.is_active ? "غیرفعال کردن" : "فعال کردن"}
                    </button>
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
