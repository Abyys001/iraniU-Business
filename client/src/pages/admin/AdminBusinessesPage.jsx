import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet, apiPost } from "../../api.js";

export default function AdminBusinessesPage() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingSlug, setSendingSlug] = useState(null);
  const [toast, setToast] = useState(null);

  const sendToTelegram = async (slug) => {
    setToast(null);
    setSendingSlug(slug);
    try {
      await apiPost(`/api/admin/businesses/${encodeURIComponent(slug)}/send-to-telegram-channel`, {});
      setToast({ type: "ok", text: "آگهی در کانال دایرکتوری منتشر شد." });
    } catch (e) {
      setToast({ type: "err", text: e.message || String(e) });
    } finally {
      setSendingSlug(null);
    }
  };

  useEffect(() => {
    setErr(null);
    setLoading(true);
    apiGet("/api/businesses")
      .then(setRows)
      .catch(() => setErr("بارگذاری فهرست ناموفق بود. سرور را بررسی کنید."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <p className="field-hint" style={{ marginTop: 0, marginBottom: "var(--space-md)" }}>
        <Link to="/admin">← داشبورد</Link>
        {" · "}
        <Link to="/admin-edit">ویرایش آگهی</Link>
      </p>
      <section className="dashboard-panel">
        <h2>همه آگهی‌ها</h2>
        {loading && <p className="field-hint">در حال بارگذاری…</p>}
        {err && <p className="field-hint">{err}</p>}
        {toast && (
          <p
            className="field-hint"
            style={{
              color: toast.type === "ok" ? "var(--color-success, #2e7d32)" : "#b71c1c",
              marginBottom: "var(--space-sm)",
            }}
          >
            {toast.text}
          </p>
        )}
        {!loading && !err && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>نام</th>
                  <th>نامک</th>
                  <th>دسته</th>
                  <th>وضعیت</th>
                  <th>پیش‌نمایش</th>
                  <th>کانال تلگرام</th>
                  <th>اقدام</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.slug}>
                    <td>{r.name_fa}</td>
                    <td>
                      <span lang="en" dir="ltr">
                        {r.slug}
                      </span>
                    </td>
                    <td>{r.category}</td>
                    <td>
                      <span
                        className={
                          r.status === "active"
                            ? "status-pill status-pill--claimed"
                            : "status-pill"
                        }
                      >
                        {r.status === "active" ? "فعال" : "غیرفعال"}
                      </span>
                    </td>
                    <td>
                      <Link
                        className="btn btn--ghost"
                        to={`/business?slug=${encodeURIComponent(r.slug)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        صفحهٔ عمومی
                      </Link>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn--accent"
                        disabled={sendingSlug === r.slug}
                        onClick={() => sendToTelegram(r.slug)}
                        title="ارسال به کانال دایرکتوری ایرانیو (نیاز به تنظیم ربات و کانال در سرور)"
                      >
                        {sendingSlug === r.slug ? "در حال ارسال…" : "ارسال به کانال"}
                      </button>
                    </td>
                    <td>
                      <Link
                        className="btn btn--primary"
                        to={`/admin-edit?slug=${encodeURIComponent(r.slug)}`}
                      >
                        ویرایش
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
