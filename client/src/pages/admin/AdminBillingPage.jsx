import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet, apiPost } from "../../api.js";

export default function AdminBillingPage() {
  const [rows, setRows] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [business_slug, setBusinessSlug] = useState("");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("pending");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState(null);

  const load = () => {
    apiGet("/api/admin/billing").then(setRows).catch(() => setRows([]));
  };

  useEffect(() => {
    load();
    apiGet("/api/businesses").then(setBusinesses).catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      await apiPost("/api/admin/billing", { business_slug, title, amount, status, note });
      setTitle("");
      setAmount("");
      setNote("");
      load();
      setMsg("ثبت شد.");
    } catch (err) {
      setMsg(err.message || String(err));
    }
  };

  return (
    <>
      <p className="field-hint" style={{ marginTop: 0, marginBottom: "var(--space-md)" }}>
        <Link to="/admin">← داشبورد</Link>
      </p>
      <section className="dashboard-panel">
        <h2>صورت‌حساب</h2>
        <form onSubmit={submit} style={{ marginBottom: "1.5rem" }}>
          <div className="form-grid">
            <div className="field field--block">
              <label htmlFor="bill-slug">آگهی</label>
              <select
                id="bill-slug"
                value={business_slug}
                onChange={(e) => setBusinessSlug(e.target.value)}
                required
              >
                <option value="">— انتخاب —</option>
                {businesses.map((b) => (
                  <option key={b.slug} value={b.slug}>
                    {b.name_fa}
                  </option>
                ))}
              </select>
            </div>
            <div className="field field--block">
              <label htmlFor="bill-title">عنوان</label>
              <input id="bill-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="bill-amount">مبلغ (متن)</label>
              <input id="bill-amount" value={amount} onChange={(e) => setAmount(e.target.value)} dir="ltr" />
            </div>
            <div className="field">
              <label htmlFor="bill-status">وضعیت</label>
              <select id="bill-status" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="pending">در انتظار</option>
                <option value="paid">پرداخت شده</option>
                <option value="cancelled">لغو</option>
              </select>
            </div>
            <div className="field field--block">
              <label htmlFor="bill-note">یادداشت</label>
              <input id="bill-note" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn btn--primary">
            افزودن رکورد
          </button>
          {msg && <p className="field-hint">{msg}</p>}
        </form>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>تاریخ</th>
                <th>آگهی</th>
                <th>عنوان</th>
                <th>مبلغ</th>
                <th>وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td dir="ltr">{r.created_at}</td>
                  <td dir="ltr">{r.business_slug}</td>
                  <td>{r.title}</td>
                  <td dir="ltr">{r.amount}</td>
                  <td>{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
