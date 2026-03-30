import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPatchJson } from "../../api.js";
import DashboardMain from "../../components/DashboardMain.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

function todayMonth() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function monthOptions(centerMonth, range = 12) {
  const [y, m] = String(centerMonth || todayMonth()).split("-").map((x) => parseInt(x, 10));
  const base = new Date(y, (m || 1) - 1, 1);
  const fmt = new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "long" });
  const out = [];
  for (let i = -range; i <= range; i += 1) {
    const d = new Date(base.getFullYear(), base.getMonth() + i, 1);
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    out.push({
      value: `${yy}-${mm}`,
      label: `${fmt.format(d)} (${yy}-${mm})`,
    });
  }
  return out;
}

function toDayKey(s) {
  const t = String(s || "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(t) ? t : "";
}

export default function DashboardReservationsPage() {
  const { me } = useAuth();
  const isSuperAdmin = me?.role === "superadmin";
  const [month, setMonth] = useState(todayMonth());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const monthList = useMemo(() => monthOptions(month, 12), [month]);

  useEffect(() => {
    if (isSuperAdmin) return;
    apiGet("/api/manager/reservations")
      .then((d) => {
        const list = Array.isArray(d) ? d : [];
        if (!list.length) return;
        const last = list[list.length - 1];
        const m = String(last?.reservation_date || "").slice(0, 7);
        if (/^\d{4}-\d{2}$/.test(m)) setMonth(m);
      })
      .catch(() => {});
  }, [isSuperAdmin]);

  const load = async () => {
    if (isSuperAdmin) {
      setRows([]);
      setLoading(false);
      setMsg("برای مشاهدهٔ رزروها وارد حساب مدیر شوید یا از حالت ورود به‌جای مدیر استفاده کنید.");
      return;
    }
    setLoading(true);
    setMsg("");
    try {
      const data = await apiGet(`/api/manager/reservations?month=${encodeURIComponent(month)}`);
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setRows([]);
      setMsg(e.message || "خطا در بارگذاری رزروها");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [month, isSuperAdmin]);

  const days = useMemo(() => {
    const [y, m] = month.split("-").map((x) => parseInt(x, 10));
    const count = new Date(y, m, 0).getDate();
    const map = new Map();
    for (const r of rows) {
      const k = toDayKey(r.reservation_date);
      if (!k) continue;
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(r);
    }
    return Array.from({ length: count }, (_, i) => {
      const day = String(i + 1).padStart(2, "0");
      const key = `${month}-${day}`;
      const items = (map.get(key) || []).slice().sort((a, b) =>
        String(a.reservation_time || "").localeCompare(String(b.reservation_time || ""))
      );
      return { key, day: i + 1, items };
    });
  }, [month, rows]);

  const updateStatus = async (status) => {
    if (!selected?.id) return;
    setBusy(true);
    try {
      const updated = await apiPatchJson(`/api/manager/reservations/${selected.id}`, { status });
      setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setSelected(updated);
    } catch (e) {
      setMsg(e.message || "خطا در تغییر وضعیت");
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardMain>
      <section className="dashboard-panel">
        <h2 style={{ marginTop: 0 }}>تقویم رزروها</h2>
        <p className="field-hint">رزروهای ثبت‌شده برای آگهی‌های شما. روی هر مورد بزنید تا جزئیات در مودال باز شود.</p>
        <div className="form-grid" style={{ maxWidth: "18rem" }}>
          <div className="field field--block">
            <label htmlFor="res-month">ماه</label>
            <select id="res-month" value={month} onChange={(e) => setMonth(e.target.value)}>
              {monthList.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {loading && <p className="field-hint">در حال بارگذاری…</p>}
        {!!msg && <p className="field-hint">{msg}</p>}
        {!loading && !msg && rows.length === 0 && (
          <p className="field-hint">برای این ماه رزروی ثبت نشده است. ماه دیگری را انتخاب کنید.</p>
        )}
        {!loading && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "0.75rem",
              marginTop: "0.75rem",
            }}
          >
            {days.map((d) => (
              <div key={d.key} className="dashboard-panel" style={{ margin: 0, padding: "0.7rem" }}>
                <p style={{ margin: 0, fontWeight: 700 }}>{d.day}</p>
                <p className="field-hint" style={{ margin: "0.25rem 0 0.5rem" }}>
                  {d.items.length} رزرو
                </p>
                <div style={{ display: "grid", gap: "0.35rem" }}>
                  {d.items.slice(0, 4).map((it) => (
                    <button
                      key={it.id}
                      type="button"
                      className="btn btn--ghost"
                      style={{ textAlign: "right", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                      onClick={() => setSelected(it)}
                    >
                      {it.reservation_time} · {it.customer_name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-panel" style={{ marginTop: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>اعلان رزرو در تلگرام (مدیر)</h3>
        <ManagerNotifySettings disabled={isSuperAdmin} />
      </section>

      <div
        className="admin-detail-modal"
        hidden={!selected}
        role="dialog"
        aria-modal="true"
        aria-labelledby="res-detail-title"
      >
        <div className="admin-detail-modal__backdrop" aria-hidden="true" onClick={() => setSelected(null)} />
        <div className="admin-detail-modal__panel">
          <h3 id="res-detail-title" className="admin-detail-modal__title">
            جزئیات رزرو
          </h3>
          {selected && (
            <>
              <p className="field-hint">
                <strong>{selected.business_name || selected.business_slug}</strong>
              </p>
              <p className="field-hint">نام: {selected.customer_name}</p>
              <p className="field-hint">ایمیل: {selected.customer_email}</p>
              <p className="field-hint">تلفن: {selected.customer_phone || "—"}</p>
              <p className="field-hint">
                تاریخ/ساعت: {selected.reservation_date} - {selected.reservation_time}
              </p>
              <p className="field-hint">تعداد نفرات: {selected.party_size}</p>
              <p className="field-hint">یادداشت: {selected.notes || "—"}</p>
              <p className="field-hint">وضعیت: {selected.status}</p>
              <div className="dashboard-actions dashboard-actions--inline">
                <button className="btn btn--primary" disabled={busy} onClick={() => updateStatus("confirmed")}>
                  تایید
                </button>
                <button className="btn btn--ghost" disabled={busy} onClick={() => updateStatus("completed")}>
                  انجام شد
                </button>
                <button className="btn btn--ghost" disabled={busy} onClick={() => updateStatus("cancelled")}>
                  لغو
                </button>
                <button className="btn btn--ghost" onClick={() => setSelected(null)}>
                  بستن
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardMain>
  );
}

function ManagerNotifySettings({ disabled }) {
  const [form, setForm] = useState({ telegram_chat_id: "", telegram_bot_token: "" });
  const [tokenMasked, setTokenMasked] = useState(null);
  const [saveMsg, setSaveMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (disabled) return;
    apiGet("/api/manager/booking-notify-settings")
      .then((d) => {
        setEmail(d.email || "");
        setForm((f) => ({ ...f, telegram_chat_id: d.telegram_chat_id || "" }));
        setTokenMasked(d.telegram_bot_token_masked || null);
      })
      .catch(() => {});
  }, [disabled]);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setSaveMsg("");
    try {
      const payload = { telegram_chat_id: form.telegram_chat_id.trim() };
      if (form.telegram_bot_token.trim()) payload.telegram_bot_token = form.telegram_bot_token.trim();
      const d = await apiPatchJson("/api/manager/booking-notify-settings", payload);
      setTokenMasked(d.telegram_bot_token_masked || null);
      setEmail(d.email || email);
      setForm((f) => ({ ...f, telegram_bot_token: "" }));
      setSaveMsg("تنظیمات ذخیره شد.");
    } catch (e2) {
      setSaveMsg(e2.message || "خطا در ذخیره");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className="form-grid" style={{ maxWidth: "34rem" }}>
      {disabled && (
        <p className="field-hint">
          این بخش مخصوص مدیر آگهی است. برای تنظیم اعلان تلگرام رزرو، با حساب مدیر وارد شوید.
        </p>
      )}
      <p className="field-hint" style={{ margin: 0 }}>
        ایمیل مدیر: <span dir="ltr">{email || "—"}</span> (اعلان رزرو به این ایمیل ارسال می‌شود)
      </p>
      <div className="field field--block">
        <label htmlFor="mgr-bot">Telegram Bot Token</label>
        <input
          id="mgr-bot"
          type="password"
          value={form.telegram_bot_token}
          onChange={(e) => setForm((f) => ({ ...f, telegram_bot_token: e.target.value }))}
          placeholder={tokenMasked ? `فعلی: ${tokenMasked}` : "توکن جدید"}
          dir="ltr"
          disabled={disabled}
        />
      </div>
      <div className="field field--block">
        <label htmlFor="mgr-chat">Telegram Chat ID</label>
        <input
          id="mgr-chat"
          value={form.telegram_chat_id}
          onChange={(e) => setForm((f) => ({ ...f, telegram_chat_id: e.target.value }))}
          placeholder="-100... یا @channel"
          dir="ltr"
          disabled={disabled}
        />
      </div>
      <div className="dashboard-actions dashboard-actions--inline">
        <button className="btn btn--primary" disabled={busy || disabled}>
          {busy ? "در حال ذخیره…" : "ذخیره اعلان‌های رزرو"}
        </button>
      </div>
      {!!saveMsg && <p className="field-hint">{saveMsg}</p>}
    </form>
  );
}
