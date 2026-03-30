import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet, apiPatchUrl } from "../../api.js";

export default function AdminLinkPage() {
  const [businesses, setBusinesses] = useState([]);
  const [managers, setManagers] = useState([]);
  const [slug, setSlug] = useState("");
  const [managerId, setManagerId] = useState("");
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiGet("/api/businesses").then(setBusinesses).catch(() => {});
    apiGet("/api/managers").then(setManagers).catch(() => {});
  }, []);

  const selected = businesses.find((b) => b.slug === slug);

  useEffect(() => {
    const b = businesses.find((x) => x.slug === slug);
    if (!b) {
      setManagerId("");
      return;
    }
    setManagerId(b.manager_id != null ? String(b.manager_id) : "");
  }, [slug, businesses]);

  const save = async (e) => {
    e.preventDefault();
    if (!slug) return;
    setSaving(true);
    setMsg(null);
    try {
      const mid =
        managerId === "" ? null : parseInt(managerId, 10);
      await apiPatchUrl(`/api/admin/businesses/${encodeURIComponent(slug)}/manager`, {
        manager_id: mid,
      });
      setMsg("ذخیره شد.");
      const next = await apiGet("/api/businesses");
      setBusinesses(next);
    } catch (err) {
      setMsg(err.message || String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <p className="field-hint" style={{ marginTop: 0, marginBottom: "var(--space-md)" }}>
        <Link to="/admin">← داشبورد</Link>
        {" · "}
        <Link to="/admin-managers">حساب‌های مدیر</Link>
      </p>
      <section className="dashboard-panel">
        <h2>لینک آگهی ↔ مدیر</h2>
        <p className="field-hint">یک مدیر را به آگهی وصل کنید (یا خالی کنید).</p>
        <form onSubmit={save}>
          <div className="form-grid">
            <div className="field field--block">
              <label htmlFor="link-slug">آگهی</label>
              <select id="link-slug" value={slug} onChange={(e) => setSlug(e.target.value)} required>
                <option value="">— انتخاب —</option>
                {businesses.map((b) => (
                  <option key={b.slug} value={b.slug}>
                    {b.name_fa} ({b.slug})
                  </option>
                ))}
              </select>
            </div>
            <div className="field field--block">
              <label htmlFor="link-mgr">مدیر</label>
              <select
                id="link-mgr"
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
              >
                <option value="">— بدون مدیر —</option>
                {managers.map((m) => (
                  <option key={m.id} value={String(m.id)}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>
            </div>
          </div>
          {selected && (
            <p className="field-hint">
              manager_id فعلی در دیتابیس:{" "}
              <strong lang="en" dir="ltr">
                {selected.manager_id ?? "—"}
              </strong>
            </p>
          )}
          <div className="dashboard-actions">
            <button type="submit" className="btn btn--primary" disabled={saving || !slug}>
              {saving ? "…" : "ذخیره لینک"}
            </button>
          </div>
          {msg && <p className="field-hint">{msg}</p>}
        </form>
      </section>
    </>
  );
}
